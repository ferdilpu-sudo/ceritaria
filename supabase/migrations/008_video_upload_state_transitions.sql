-- Atomic state transitions for server-verified video uploads.

create or replace function public.mark_video_upload_uploaded(
  p_session_id uuid,
  p_etag text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  target_asset_id uuid;
  current_status varchar;
begin
  if actor_id is null or not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select s.asset_id, s.status
  into target_asset_id, current_status
  from public.video_upload_sessions s
  where s.id = p_session_id
    and s.created_by = actor_id
  for update;

  if target_asset_id is null then
    raise exception using errcode = 'P0002', message = 'upload session not found';
  end if;

  if current_status in ('CANCELLED','FAILED','EXPIRED') then
    raise exception using errcode = '22023', message = 'upload session is terminal';
  end if;

  if current_status = 'READY' then
    return;
  end if;

  update public.video_upload_sessions
  set status = 'UPLOADED'
  where id = p_session_id;

  update public.video_assets
  set status = 'UPLOADED',
      etag = coalesce(p_etag, etag)
  where id = target_asset_id
    and status <> 'READY';
end;
$$;

create or replace function public.finalize_video_upload_records(
  p_session_id uuid,
  p_actual_size_bytes bigint,
  p_etag text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  target_asset_id uuid;
  current_status varchar;
  expected_size bigint;
begin
  if actor_id is null or not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select s.asset_id, s.status
  into target_asset_id, current_status
  from public.video_upload_sessions s
  where s.id = p_session_id
    and s.created_by = actor_id
  for update;

  if target_asset_id is null then
    raise exception using errcode = 'P0002', message = 'upload session not found';
  end if;

  if current_status in ('CANCELLED','FAILED','EXPIRED') then
    raise exception using errcode = '22023', message = 'upload session is terminal';
  end if;

  if current_status = 'READY' then
    return;
  end if;

  select a.expected_size_bytes
  into expected_size
  from public.video_assets a
  where a.id = target_asset_id
  for update;

  if expected_size is null or expected_size <> p_actual_size_bytes then
    raise exception using errcode = '22023', message = 'uploaded size mismatch';
  end if;

  update public.video_assets
  set status = 'READY',
      actual_size_bytes = p_actual_size_bytes,
      etag = coalesce(p_etag, etag),
      ready_at = now()
  where id = target_asset_id;

  update public.video_upload_sessions
  set status = 'READY'
  where id = p_session_id;
end;
$$;

create or replace function public.fail_video_upload_records(
  p_session_id uuid
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  target_asset_id uuid;
  current_status varchar;
begin
  if actor_id is null or not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select s.asset_id, s.status
  into target_asset_id, current_status
  from public.video_upload_sessions s
  where s.id = p_session_id
    and s.created_by = actor_id
  for update;

  if target_asset_id is null then
    raise exception using errcode = 'P0002', message = 'upload session not found';
  end if;

  if current_status = 'READY' then
    raise exception using errcode = '22023', message = 'ready upload cannot fail';
  end if;

  update public.video_upload_sessions
  set status = 'FAILED'
  where id = p_session_id;

  update public.video_assets
  set status = 'FAILED'
  where id = target_asset_id
    and status <> 'READY';
end;
$$;

create or replace function public.cancel_video_upload_records(
  p_session_id uuid
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  target_asset_id uuid;
  current_status varchar;
begin
  if actor_id is null or not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select s.asset_id, s.status
  into target_asset_id, current_status
  from public.video_upload_sessions s
  where s.id = p_session_id
    and s.created_by = actor_id
  for update;

  if target_asset_id is null then
    raise exception using errcode = 'P0002', message = 'upload session not found';
  end if;

  if current_status = 'READY' then
    raise exception using errcode = '22023', message = 'ready upload cannot be cancelled';
  end if;

  update public.video_upload_sessions
  set status = 'CANCELLED'
  where id = p_session_id;

  update public.video_assets
  set status = 'CANCELLED'
  where id = target_asset_id
    and status <> 'READY';
end;
$$;

revoke all on function public.mark_video_upload_uploaded(uuid, text) from public;
revoke all on function public.finalize_video_upload_records(uuid, bigint, text) from public;
revoke all on function public.fail_video_upload_records(uuid) from public;
revoke all on function public.cancel_video_upload_records(uuid) from public;

grant execute on function public.mark_video_upload_uploaded(uuid, text) to authenticated;
grant execute on function public.finalize_video_upload_records(uuid, bigint, text) to authenticated;
grant execute on function public.fail_video_upload_records(uuid) to authenticated;
grant execute on function public.cancel_video_upload_records(uuid) to authenticated;
