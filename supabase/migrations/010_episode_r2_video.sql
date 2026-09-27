-- Phase 7: attach verified R2 assets to episodes without breaking legacy providers.

alter table public.episodes
  add column video_asset_id uuid references public.video_assets(id) on delete restrict;

alter table public.episodes
  alter column video_url drop not null;

alter table public.episodes
  drop constraint if exists episode_provider_check;

alter table public.episodes
  add constraint episode_provider_check
  check (video_provider in ('youtube', 'facebook', 'r2'));

alter table public.episodes
  add constraint episode_video_source_check
  check (
    (
      video_provider in ('youtube', 'facebook')
      and video_url is not null
      and video_asset_id is null
    )
    or
    (
      video_provider = 'r2'
      and video_url is null
      and video_asset_id is not null
    )
  );

create unique index uq_episode_active_video_asset
  on public.episodes (video_asset_id)
  where video_asset_id is not null;

create or replace function public.validate_episode_video_asset()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.video_provider = 'r2' then
    if not exists (
      select 1
      from public.video_assets va
      where va.id = new.video_asset_id
        and va.episode_id = new.id
        and va.status = 'READY'
    ) then
      raise exception 'r2 video asset must be READY and belong to the episode'
        using errcode = '22023';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_validate_episode_video_asset
  before insert or update of video_provider, video_asset_id on public.episodes
  for each row execute function public.validate_episode_video_asset();

create policy "public read attached ready video assets"
  on public.video_assets for select to anon, authenticated
  using (
    status = 'READY'
    and exists (
      select 1
      from public.episodes e
      join public.series s on s.id = e.series_id
      where e.video_asset_id = video_assets.id
        and e.is_published = true
        and e.published_at <= now()
        and e.deleted_at is null
        and s.is_published = true
        and s.published_at <= now()
        and s.deleted_at is null
    )
  );

create or replace function public.attach_ready_video_asset(
  target_episode_id uuid,
  target_asset_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  previous_asset_id uuid;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  perform 1
  from public.video_assets va
  where va.id = target_asset_id
    and va.episode_id = target_episode_id
    and va.status = 'READY'
  for update;

  if not found then
    raise exception 'video asset is not READY for this episode'
      using errcode = '22023';
  end if;

  select e.video_asset_id
  into previous_asset_id
  from public.episodes e
  where e.id = target_episode_id
    and e.deleted_at is null
  for update;

  if not found then
    raise exception 'episode not found'
      using errcode = '22023';
  end if;

  update public.episodes
  set
    video_provider = 'r2',
    video_url = null,
    video_asset_id = target_asset_id
  where id = target_episode_id;

  if previous_asset_id is not null and previous_asset_id <> target_asset_id then
    update public.video_assets
    set status = 'REPLACED'
    where id = previous_asset_id
      and status = 'READY';
  end if;

  return previous_asset_id;
end;
$$;

revoke all on function public.attach_ready_video_asset(uuid, uuid) from public;
grant execute on function public.attach_ready_video_asset(uuid, uuid) to authenticated;

comment on column public.episodes.video_asset_id is
  'Active READY R2 asset when video_provider=r2. Legacy youtube/facebook rows keep video_url.';
