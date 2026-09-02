create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null,
  session_id uuid not null,
  event_name varchar(80) not null,
  path varchar(512) not null,
  referrer_host varchar(255),
  device_type varchar(20) not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint analytics_device_check check (device_type in ('mobile', 'tablet', 'desktop', 'unknown')),
  constraint analytics_metadata_size_check check (octet_length(metadata::text) <= 2048)
);

create index idx_analytics_created_at on public.analytics_events (created_at desc);
create index idx_analytics_event_created on public.analytics_events (event_name, created_at desc);
create index idx_analytics_path_created on public.analytics_events (path, created_at desc);
create index idx_analytics_visitor_created on public.analytics_events (visitor_id, created_at desc);

alter table public.analytics_events enable row level security;

create policy "admin read analytics" on public.analytics_events for select to authenticated
  using (public.is_admin());

grant select on public.analytics_events to authenticated;
revoke insert, update, delete on public.analytics_events from anon, authenticated;

create or replace function public.track_analytics_event(
  p_visitor_id uuid,
  p_session_id uuid,
  p_event_name text,
  p_path text,
  p_referrer text,
  p_device_type text,
  p_metadata jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_event_name not in (
    'page_view', 'episode_view', 'play_intent', 'next_episode_click',
    'previous_episode_click', 'facebook_fallback_click', 'youtube_fallback_click'
  ) then
    raise exception 'invalid event name';
  end if;
  if p_path is null or length(p_path) < 1 or length(p_path) > 512 then
    raise exception 'invalid path';
  end if;
  if p_device_type not in ('mobile', 'tablet', 'desktop', 'unknown') then
    raise exception 'invalid device type';
  end if;
  if octet_length(coalesce(p_metadata, '{}'::jsonb)::text) > 2048 then
    raise exception 'metadata too large';
  end if;

  insert into public.analytics_events (
    visitor_id, session_id, event_name, path, referrer_host, device_type, metadata
  ) values (
    p_visitor_id,
    p_session_id,
    p_event_name,
    p_path,
    nullif(left(coalesce(p_referrer, ''), 255), ''),
    p_device_type,
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

revoke all on function public.track_analytics_event(uuid, uuid, text, text, text, text, jsonb) from public;
grant execute on function public.track_analytics_event(uuid, uuid, text, text, text, text, jsonb) to anon, authenticated;

create or replace function public.get_analytics_dashboard(
  p_days integer default 7,
  p_timezone text default 'Asia/Jakarta'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_days integer := greatest(1, least(coalesce(p_days, 7), 90));
  v_today_start timestamptz;
  v_period_start timestamptz;
  v_result jsonb;
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;

  v_today_start := date_trunc('day', timezone(p_timezone, now())) at time zone p_timezone;
  v_period_start := (date_trunc('day', timezone(p_timezone, now())) - make_interval(days => v_days - 1)) at time zone p_timezone;

  select jsonb_build_object(
    'days', v_days,
    'summary', jsonb_build_object(
      'todayPageviews', count(*) filter (where event_name = 'page_view' and created_at >= v_today_start),
      'todayVisitors', count(distinct visitor_id) filter (where created_at >= v_today_start),
      'periodPageviews', count(*) filter (where event_name = 'page_view'),
      'periodVisitors', count(distinct visitor_id),
      'periodSessions', count(distinct session_id),
      'totalEvents', count(*)
    )
  ) into v_result
  from public.analytics_events
  where created_at >= v_period_start;

  v_result := v_result || jsonb_build_object(
    'hourly', coalesce((
      select jsonb_agg(jsonb_build_object(
        'label', to_char(timezone(p_timezone, h.hour), 'HH24:00'),
        'value', coalesce(x.views, 0),
        'visitors', coalesce(x.visitors, 0)
      ) order by h.hour)
      from generate_series(date_trunc('hour', now()) - interval '23 hours', date_trunc('hour', now()), interval '1 hour') h(hour)
      left join lateral (
        select count(*) as views, count(distinct visitor_id) as visitors
        from public.analytics_events e
        where e.event_name = 'page_view' and e.created_at >= h.hour and e.created_at < h.hour + interval '1 hour'
      ) x on true
    ), '[]'::jsonb),
    'topPages', coalesce((
      select jsonb_agg(jsonb_build_object('path', path, 'views', views, 'visitors', visitors) order by views desc)
      from (
        select path, count(*) as views, count(distinct visitor_id) as visitors
        from public.analytics_events
        where created_at >= v_period_start and event_name = 'page_view'
        group by path order by views desc limit 10
      ) p
    ), '[]'::jsonb),
    'devices', coalesce((
      select jsonb_agg(jsonb_build_object('label', device_type, 'value', views) order by views desc)
      from (
        select device_type, count(*) as views from public.analytics_events
        where created_at >= v_period_start and event_name = 'page_view'
        group by device_type
      ) d
    ), '[]'::jsonb),
    'referrers', coalesce((
      select jsonb_agg(jsonb_build_object('label', referrer, 'value', views) order by views desc)
      from (
        select coalesce(referrer_host, 'direct') as referrer, count(*) as views
        from public.analytics_events
        where created_at >= v_period_start and event_name = 'page_view'
        group by coalesce(referrer_host, 'direct') order by views desc limit 8
      ) r
    ), '[]'::jsonb),
    'events', coalesce((
      select jsonb_agg(jsonb_build_object('label', event_name, 'value', total) order by total desc)
      from (
        select event_name, count(*) as total from public.analytics_events
        where created_at >= v_period_start group by event_name order by total desc
      ) ev
    ), '[]'::jsonb)
  );

  return v_result;
end;
$$;

revoke all on function public.get_analytics_dashboard(integer, text) from public;
grant execute on function public.get_analytics_dashboard(integer, text) to authenticated;
