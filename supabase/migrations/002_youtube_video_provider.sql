-- YouTube-first video provider migration.
-- Backward compatible: existing Facebook rows remain valid and editable.

alter table public.episodes
  drop constraint if exists episode_provider_check;

alter table public.episodes
  alter column video_provider set default 'youtube';

alter table public.episodes
  add constraint episode_provider_check
  check (video_provider in ('youtube', 'facebook'));

comment on column public.episodes.video_provider is
  'Video source. New episodes default to youtube; facebook is retained for legacy rows.';

-- Manual rollback (only if no youtube rows remain):
-- update public.episodes set video_provider = 'facebook' where video_provider = 'youtube';
-- alter table public.episodes drop constraint if exists episode_provider_check;
-- alter table public.episodes alter column video_provider set default 'facebook';
-- alter table public.episodes add constraint episode_provider_check check (video_provider = 'facebook');
