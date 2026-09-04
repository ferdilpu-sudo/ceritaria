create table public.episode_reactions (
  episode_id uuid not null references public.episodes(id) on delete cascade,
  user_id uuid not null references public.community_profiles(user_id) on delete cascade,
  reaction varchar(16) not null check (reaction in ('love','shock','sad','angry')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (episode_id, user_id)
);

create table public.episode_polls (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null unique references public.episodes(id) on delete cascade,
  question varchar(160) not null check (char_length(trim(question)) between 4 and 160),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.episode_poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.episode_polls(id) on delete cascade,
  label varchar(80) not null check (char_length(trim(label)) between 1 and 80),
  sort_order smallint not null check (sort_order >= 0),
  vote_count integer not null default 0 check (vote_count >= 0),
  unique (poll_id, sort_order)
);

create table public.episode_poll_votes (
  poll_id uuid not null references public.episode_polls(id) on delete cascade,
  option_id uuid not null references public.episode_poll_options(id) on delete cascade,
  user_id uuid not null references public.community_profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (poll_id, user_id)
);

create index idx_episode_reactions_episode on public.episode_reactions (episode_id, reaction);
create index idx_poll_options_poll on public.episode_poll_options (poll_id, sort_order);
create index idx_poll_votes_option on public.episode_poll_votes (option_id);

create or replace function public.validate_poll_vote()
returns trigger language plpgsql set search_path = '' as $$
declare option_poll uuid; active_poll boolean;
begin
  select poll_id into option_poll from public.episode_poll_options where id = new.option_id;
  select is_active into active_poll from public.episode_polls where id = new.poll_id;
  if option_poll is null or option_poll <> new.poll_id or active_poll is not true then
    raise exception 'invalid poll vote';
  end if;
  return new;
end;
$$;
create trigger trg_validate_poll_vote before insert on public.episode_poll_votes
  for each row execute function public.validate_poll_vote();

create or replace function public.sync_poll_vote_count()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.episode_poll_options
  set vote_count = (select count(*) from public.episode_poll_votes where option_id = coalesce(new.option_id, old.option_id))
  where id = coalesce(new.option_id, old.option_id);
  return coalesce(new, old);
end;
$$;
create trigger trg_poll_vote_insert after insert on public.episode_poll_votes
  for each row execute function public.sync_poll_vote_count();
create trigger trg_poll_vote_delete after delete on public.episode_poll_votes
  for each row execute function public.sync_poll_vote_count();

create or replace function public.create_episode_poll(p_episode_id uuid, p_question text, p_options text[])
returns uuid language plpgsql security definer set search_path = '' as $$
declare new_poll_id uuid; option_text text; option_index integer := 0;
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  if array_length(p_options, 1) is null or array_length(p_options, 1) < 2 or array_length(p_options, 1) > 6 then
    raise exception 'poll requires 2 to 6 options';
  end if;
  insert into public.episode_polls (episode_id, question)
  values (p_episode_id, trim(p_question)) returning id into new_poll_id;
  foreach option_text in array p_options loop
    if char_length(trim(option_text)) < 1 or char_length(trim(option_text)) > 80 then raise exception 'invalid poll option'; end if;
    insert into public.episode_poll_options (poll_id, label, sort_order)
    values (new_poll_id, trim(option_text), option_index);
    option_index := option_index + 1;
  end loop;
  return new_poll_id;
end;
$$;
revoke all on function public.create_episode_poll(uuid, text, text[]) from public;
grant execute on function public.create_episode_poll(uuid, text, text[]) to authenticated;

alter table public.episode_reactions enable row level security;
alter table public.episode_polls enable row level security;
alter table public.episode_poll_options enable row level security;
alter table public.episode_poll_votes enable row level security;

create policy "public read episode reactions" on public.episode_reactions for select to anon, authenticated using (true);
create policy "user add reaction" on public.episode_reactions for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.community_profiles p where p.user_id = auth.uid() and p.is_blocked = false));
create policy "user update reaction" on public.episode_reactions for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "user remove reaction" on public.episode_reactions for delete to authenticated using (user_id = auth.uid());

create policy "public read active polls" on public.episode_polls for select to anon, authenticated
  using (exists (select 1 from public.episodes e where e.id = episode_id and e.is_published = true and e.deleted_at is null and e.published_at <= now()));
create policy "admin manage polls" on public.episode_polls for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "public read poll options" on public.episode_poll_options for select to anon, authenticated
  using (exists (select 1 from public.episode_polls p where p.id = poll_id));
create policy "admin manage poll options" on public.episode_poll_options for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "user read own poll votes" on public.episode_poll_votes for select to authenticated using (user_id = auth.uid());
create policy "user vote once" on public.episode_poll_votes for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.community_profiles p where p.user_id = auth.uid() and p.is_blocked = false));
create policy "admin read poll votes" on public.episode_poll_votes for select to authenticated using (public.is_admin());

create trigger trg_episode_reactions_updated_at before update on public.episode_reactions
  for each row execute function public.set_updated_at();
create trigger trg_episode_polls_updated_at before update on public.episode_polls
  for each row execute function public.set_updated_at();
