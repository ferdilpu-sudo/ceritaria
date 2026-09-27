-- Add an atomic, admin-only episode reorder RPC.
-- The function preserves the existing set of active episode numbers so
-- soft-deleted rows that still own old numbers cannot collide with reorder.

create or replace function public.reorder_episodes(
  target_series_id uuid,
  ordered_episode_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  active_count integer;
  requested_count integer;
  temporary_base integer;
  original_numbers integer[];
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  requested_count := coalesce(cardinality(ordered_episode_ids), 0);

  select
    count(*)::integer,
    array_agg(e.episode_number order by e.episode_number, e.id)
  into active_count, original_numbers
  from public.episodes e
  where e.series_id = target_series_id
    and e.deleted_at is null;

  if requested_count <> active_count then
    raise exception using
      errcode = '22023',
      message = 'ordered_episode_ids must contain every active episode exactly once';
  end if;

  if active_count = 0 then
    return;
  end if;

  if exists (
    select 1
    from unnest(ordered_episode_ids) as requested(id)
    group by requested.id
    having count(*) > 1
  ) then
    raise exception using
      errcode = '22023',
      message = 'ordered_episode_ids contains duplicate episode ids';
  end if;

  if exists (
    select 1
    from unnest(ordered_episode_ids) as requested(id)
    left join public.episodes e
      on e.id = requested.id
      and e.series_id = target_series_id
      and e.deleted_at is null
    where e.id is null
  ) then
    raise exception using
      errcode = '22023',
      message = 'ordered_episode_ids contains an episode outside the active target series';
  end if;

  select coalesce(max(e.episode_number), 0) + active_count + 1000
  into temporary_base
  from public.episodes e
  where e.series_id = target_series_id;

  with ranked as (
    select
      e.id,
      row_number() over (order by e.episode_number, e.id)::integer as position
    from public.episodes e
    where e.series_id = target_series_id
      and e.deleted_at is null
  )
  update public.episodes e
  set episode_number = temporary_base + ranked.position
  from ranked
  where e.id = ranked.id;

  with requested as (
    select
      item.episode_id,
      item.position::integer as position
    from unnest(ordered_episode_ids) with ordinality
      as item(episode_id, position)
  )
  update public.episodes e
  set episode_number = original_numbers[requested.position]
  from requested
  where e.id = requested.episode_id;
end;
$$;

revoke all on function public.reorder_episodes(uuid, uuid[]) from public;
grant execute on function public.reorder_episodes(uuid, uuid[]) to authenticated;
