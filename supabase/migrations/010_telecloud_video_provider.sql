-- Add TeleCloud as the preferred video provider while keeping legacy providers editable.

alter table public.episodes
  drop constraint if exists episode_provider_check;

alter table public.episodes
  alter column video_provider set default 'telecloud';

alter table public.episodes
  add constraint episode_provider_check
  check (video_provider in ('telecloud', 'youtube', 'facebook'));

comment on column public.episodes.video_provider is
  'Video source. New episodes default to TeleCloud; YouTube and Facebook remain valid for legacy rows.';
