alter table public.community_profiles
  add column bio varchar(120) not null default ''
  check (char_length(bio) <= 120);

create table public.community_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.community_profiles(user_id) on delete cascade,
  actor_user_id uuid not null references public.community_profiles(user_id) on delete cascade,
  comment_id uuid not null references public.episode_comments(id) on delete cascade,
  episode_id uuid not null references public.episodes(id) on delete cascade,
  notification_type varchar(20) not null default 'reply'
    check (notification_type = 'reply'),
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, comment_id, notification_type)
);

create index idx_community_notifications_user
  on public.community_notifications (user_id, is_read, created_at desc);

create or replace function public.notify_comment_reply()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  parent_user_id uuid;
begin
  if new.parent_id is null then return new; end if;

  select user_id into parent_user_id
  from public.episode_comments
  where id = new.parent_id and deleted_at is null;

  if parent_user_id is not null and parent_user_id <> new.user_id then
    insert into public.community_notifications (
      user_id,
      actor_user_id,
      comment_id,
      episode_id,
      notification_type
    ) values (
      parent_user_id,
      new.user_id,
      new.id,
      new.episode_id,
      'reply'
    )
    on conflict (user_id, comment_id, notification_type) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function public.notify_comment_reply() from public;

create trigger trg_notify_comment_reply
after insert on public.episode_comments
for each row execute function public.notify_comment_reply();

alter table public.community_notifications enable row level security;

create policy "user read own notifications"
on public.community_notifications for select to authenticated
using (user_id = auth.uid());

create policy "user update own notifications"
on public.community_notifications for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "admin read community notifications"
on public.community_notifications for select to authenticated
using (public.is_admin());
