-- Add additive R2 video asset/upload-session state.
-- Episodes keep their existing youtube|facebook provider contract until Phase 7.

create table public.video_assets (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.episodes(id) on delete cascade,
  status varchar(20) not null default 'PENDING'
    check (status in ('PENDING','UPLOADING','UPLOADED','VERIFYING','READY','FAILED','CANCELLED','REPLACED')),
  object_key text not null unique,
  mime_type varchar(100) not null check (mime_type = 'video/mp4'),
  expected_size_bytes bigint not null check (expected_size_bytes > 0),
  actual_size_bytes bigint check (actual_size_bytes is null or actual_size_bytes > 0),
  etag text,
  checksum_sha256 varchar(64)
    check (checksum_sha256 is null or checksum_sha256 ~ '^[0-9a-f]{64}$'),
  created_by uuid not null references auth.users(id) on delete restrict,
  ready_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_video_assets_episode_status
  on public.video_assets (episode_id, status, created_at desc);

create table public.video_upload_sessions (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null unique references public.video_assets(id) on delete cascade,
  mode varchar(20) not null check (mode in ('SINGLE','MULTIPART')),
  status varchar(20) not null default 'CREATED'
    check (status in ('CREATED','UPLOADING','COMPLETING','UPLOADED','VERIFYING','READY','CANCELLED','FAILED','EXPIRED')),
  r2_upload_id text,
  part_size_bytes integer check (part_size_bytes is null or part_size_bytes >= 5242880),
  part_count integer check (part_count is null or part_count between 1 and 10000),
  expires_at timestamptz not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint video_upload_multipart_fields_check check (
    (mode = 'SINGLE' and r2_upload_id is null and part_size_bytes is null and part_count is null)
    or
    (mode = 'MULTIPART' and part_size_bytes is not null and part_count is not null)
  )
);

create index idx_video_upload_sessions_expiry
  on public.video_upload_sessions (status, expires_at);

alter table public.video_assets enable row level security;
alter table public.video_upload_sessions enable row level security;

create policy "admin manage video assets"
  on public.video_assets for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin manage video upload sessions"
  on public.video_upload_sessions for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create trigger trg_video_assets_updated_at
  before update on public.video_assets
  for each row execute function public.set_updated_at();

create trigger trg_video_upload_sessions_updated_at
  before update on public.video_upload_sessions
  for each row execute function public.set_updated_at();
