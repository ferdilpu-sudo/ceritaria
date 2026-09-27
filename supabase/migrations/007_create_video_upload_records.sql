-- Create asset + upload session atomically after R2 preparation.

alter table public.video_upload_sessions
  drop constraint video_upload_multipart_fields_check;

alter table public.video_upload_sessions
  add constraint video_upload_multipart_fields_check check (
    (
      mode = 'SINGLE'
      and r2_upload_id is null
      and part_size_bytes is null
      and part_count is null
    )
    or
    (
      mode = 'MULTIPART'
      and r2_upload_id is not null
      and part_size_bytes is not null
      and part_count is not null
    )
  );

create or replace function public.create_video_upload_records(
  p_asset_id uuid,
  p_session_id uuid,
  p_episode_id uuid,
  p_object_key text,
  p_mime_type text,
  p_expected_size_bytes bigint,
  p_checksum_sha256 text,
  p_mode varchar,
  p_r2_upload_id text,
  p_part_size_bytes integer,
  p_part_count integer,
  p_expires_at timestamptz
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
begin
  if actor_id is null or not public.is_admin() then
    raise exception 'not authorized';
  end if;

  if not exists (
    select 1
    from public.episodes e
    where e.id = p_episode_id
      and e.deleted_at is null
  ) then
    raise exception using
      errcode = 'P0002',
      message = 'active episode not found';
  end if;

  insert into public.video_assets (
    id,
    episode_id,
    status,
    object_key,
    mime_type,
    expected_size_bytes,
    checksum_sha256,
    created_by
  )
  values (
    p_asset_id,
    p_episode_id,
    'PENDING',
    p_object_key,
    p_mime_type,
    p_expected_size_bytes,
    p_checksum_sha256,
    actor_id
  );

  insert into public.video_upload_sessions (
    id,
    asset_id,
    mode,
    status,
    r2_upload_id,
    part_size_bytes,
    part_count,
    expires_at,
    created_by
  )
  values (
    p_session_id,
    p_asset_id,
    p_mode,
    'CREATED',
    p_r2_upload_id,
    p_part_size_bytes,
    p_part_count,
    p_expires_at,
    actor_id
  );
end;
$$;

revoke all on function public.create_video_upload_records(
  uuid, uuid, uuid, text, text, bigint, text, varchar, text, integer, integer, timestamptz
) from public;

grant execute on function public.create_video_upload_records(
  uuid, uuid, uuid, text, text, bigint, text, varchar, text, integer, integer, timestamptz
) to authenticated;
