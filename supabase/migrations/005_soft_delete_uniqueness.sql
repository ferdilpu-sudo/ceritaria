-- Soft-deleted content must not reserve public identifiers forever.
-- Keep history rows, but enforce uniqueness only among active rows.

alter table public.episodes
  drop constraint if exists uq_episode_number;

alter table public.episodes
  drop constraint if exists uq_episode_slug;

alter table public.series
  drop constraint if exists series_slug_key;

create unique index if not exists uq_episode_number_active
  on public.episodes (series_id, episode_number)
  where deleted_at is null;

create unique index if not exists uq_episode_slug_active
  on public.episodes (series_id, slug)
  where deleted_at is null;

create unique index if not exists uq_series_slug_active
  on public.series (slug)
  where deleted_at is null;
