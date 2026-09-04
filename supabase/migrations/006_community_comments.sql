create table public.community_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name varchar(32) not null check (char_length(trim(display_name)) between 2 and 32),
  avatar_url text,
  is_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.episode_comments (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.episodes(id) on delete cascade,
  user_id uuid not null references public.community_profiles(user_id) on delete cascade,
  parent_id uuid references public.episode_comments(id) on delete set null,
  body varchar(800) not null check (char_length(trim(body)) between 1 and 800),
  like_count integer not null default 0 check (like_count >= 0),
  is_hidden boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.comment_likes (
  comment_id uuid not null references public.episode_comments(id) on delete cascade,
  user_id uuid not null references public.community_profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

create table public.comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.episode_comments(id) on delete cascade,
  user_id uuid not null references public.community_profiles(user_id) on delete cascade,
  reason varchar(80) not null default 'Tidak pantas',
  created_at timestamptz not null default now(),
  unique (comment_id, user_id)
);

create index idx_episode_comments_feed on public.episode_comments (episode_id, created_at desc)
  where deleted_at is null and is_hidden = false;
create index idx_episode_comments_parent on public.episode_comments (parent_id, created_at asc)
  where deleted_at is null and is_hidden = false;
create index idx_comment_reports_comment on public.comment_reports (comment_id, created_at desc);

create or replace function public.handle_new_community_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.community_profiles (user_id, display_name)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1), 'Penonton'), 32)
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger trg_auth_user_community_profile
after insert on auth.users
for each row execute function public.handle_new_community_user();

insert into public.community_profiles (user_id, display_name)
select id, left(coalesce(nullif(trim(raw_user_meta_data ->> 'display_name'), ''), split_part(email, '@', 1), 'Penonton'), 32)
from auth.users
on conflict (user_id) do nothing;

create or replace function public.validate_comment_parent()
returns trigger language plpgsql set search_path = '' as $$
declare parent_episode uuid; parent_parent uuid;
begin
  if new.parent_id is null then return new; end if;
  select episode_id, parent_id into parent_episode, parent_parent
  from public.episode_comments where id = new.parent_id and deleted_at is null and is_hidden = false;
  if parent_episode is null or parent_episode <> new.episode_id or parent_parent is not null then
    raise exception 'invalid comment parent';
  end if;
  return new;
end;
$$;
create trigger trg_validate_comment_parent before insert on public.episode_comments
  for each row execute function public.validate_comment_parent();

create or replace function public.sync_comment_like_count()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.episode_comments
  set like_count = (select count(*) from public.comment_likes where comment_id = coalesce(new.comment_id, old.comment_id))
  where id = coalesce(new.comment_id, old.comment_id);
  return coalesce(new, old);
end;
$$;
create trigger trg_comment_like_insert after insert on public.comment_likes
  for each row execute function public.sync_comment_like_count();
create trigger trg_comment_like_delete after delete on public.comment_likes
  for each row execute function public.sync_comment_like_count();

create or replace function public.delete_own_comment(p_comment_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.episode_comments set deleted_at = now(), body = '[Komentar dihapus]'
  where id = p_comment_id and user_id = auth.uid() and deleted_at is null;
end;
$$;
revoke all on function public.delete_own_comment(uuid) from public;
grant execute on function public.delete_own_comment(uuid) to authenticated;

alter table public.community_profiles enable row level security;
alter table public.episode_comments enable row level security;
alter table public.comment_likes enable row level security;
alter table public.comment_reports enable row level security;

create policy "public read community profiles" on public.community_profiles for select to anon, authenticated using (true);
create policy "user update own profile" on public.community_profiles for update to authenticated
  using (user_id = auth.uid() and is_blocked = false)
  with check (user_id = auth.uid() and is_blocked = false);
create policy "admin manage community profiles" on public.community_profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "public read visible comments" on public.episode_comments for select to anon, authenticated
  using (is_hidden = false and deleted_at is null and exists (
    select 1 from public.episodes e where e.id = episode_id and e.is_published = true and e.deleted_at is null and e.published_at <= now()
  ));
create policy "authenticated create comments" on public.episode_comments for insert to authenticated
  with check (
    user_id = auth.uid() and is_hidden = false and deleted_at is null and like_count = 0
    and exists (select 1 from public.community_profiles p where p.user_id = auth.uid() and p.is_blocked = false)
    and exists (select 1 from public.episodes e where e.id = episode_id and e.is_published = true and e.deleted_at is null and e.published_at <= now())
  );
create policy "admin manage comments" on public.episode_comments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "public read comment likes" on public.comment_likes for select to anon, authenticated using (true);
create policy "user add own like" on public.comment_likes for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.community_profiles p where p.user_id = auth.uid() and p.is_blocked = false));
create policy "user remove own like" on public.comment_likes for delete to authenticated using (user_id = auth.uid());

create policy "user report comment" on public.comment_reports for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.community_profiles p where p.user_id = auth.uid() and p.is_blocked = false));
create policy "admin read reports" on public.comment_reports for select to authenticated using (public.is_admin());
create policy "admin delete reports" on public.comment_reports for delete to authenticated using (public.is_admin());

create trigger trg_community_profiles_updated_at before update on public.community_profiles
  for each row execute function public.set_updated_at();
create trigger trg_episode_comments_updated_at before update on public.episode_comments
  for each row execute function public.set_updated_at();
