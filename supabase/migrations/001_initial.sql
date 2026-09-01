create extension if not exists pgcrypto;

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.series (
  id uuid primary key default gen_random_uuid(),
  slug varchar(160) not null unique,
  title varchar(200) not null,
  short_synopsis varchar(320),
  synopsis text,
  genres text[] not null default '{}',
  cover_url text,
  hero_url text,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  published_at timestamptz,
  seo_title varchar(200),
  seo_description varchar(320),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint series_publish_time_check check (is_published = false or published_at is not null)
);

create table public.episodes (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade,
  episode_number integer not null check (episode_number > 0),
  slug varchar(160) not null,
  title varchar(200) not null,
  short_synopsis varchar(320),
  recap text,
  highlights text[] not null default '{}',
  video_provider varchar(30) not null default 'facebook',
  video_url text not null,
  thumbnail_url text,
  duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  is_published boolean not null default false,
  published_at timestamptz,
  seo_title varchar(200),
  seo_description varchar(320),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint uq_episode_number unique (series_id, episode_number),
  constraint uq_episode_slug unique (series_id, slug),
  constraint episode_provider_check check (video_provider = 'facebook'),
  constraint episode_publish_time_check check (is_published = false or published_at is not null)
);

create index idx_series_public_feed on public.series (published_at desc)
  where is_published = true and deleted_at is null;
create index idx_series_featured on public.series (is_featured, published_at desc)
  where is_published = true and deleted_at is null;
create index idx_episodes_series_order on public.episodes (series_id, episode_number)
  where deleted_at is null;
create index idx_episodes_public_feed on public.episodes (published_at desc)
  where is_published = true and deleted_at is null;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_users au where au.user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.soft_delete_series(target_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  update public.episodes set deleted_at = now(), is_published = false where series_id = target_id and deleted_at is null;
  update public.series set deleted_at = now(), is_published = false where id = target_id and deleted_at is null;
end;
$$;
revoke all on function public.soft_delete_series(uuid) from public;
grant execute on function public.soft_delete_series(uuid) to authenticated;

alter table public.admin_users enable row level security;
alter table public.series enable row level security;
alter table public.episodes enable row level security;

create policy "admin read own membership" on public.admin_users for select to authenticated
  using (user_id = auth.uid());
create policy "public read published series" on public.series for select to anon, authenticated
  using (is_published = true and published_at <= now() and deleted_at is null);
create policy "public read published episodes" on public.episodes for select to anon, authenticated
  using (is_published = true and published_at <= now() and deleted_at is null and exists (
    select 1 from public.series s where s.id = series_id and s.is_published = true and s.published_at <= now() and s.deleted_at is null
  ));
create policy "admin manage series" on public.series for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admin manage episodes" on public.episodes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger trg_series_updated_at before update on public.series
  for each row execute function public.set_updated_at();
create trigger trg_episodes_updated_at before update on public.episodes
  for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('series-media', 'series-media', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('episode-media', 'episode-media', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "admin upload storia media" on storage.objects for insert to authenticated
  with check (bucket_id in ('series-media','episode-media') and public.is_admin());
create policy "admin update storia media" on storage.objects for update to authenticated
  using (bucket_id in ('series-media','episode-media') and public.is_admin())
  with check (bucket_id in ('series-media','episode-media') and public.is_admin());
create policy "admin delete storia media" on storage.objects for delete to authenticated
  using (bucket_id in ('series-media','episode-media') and public.is_admin());
