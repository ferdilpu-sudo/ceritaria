alter table public.community_profiles
  add constraint community_profiles_avatar_url_ceritaria
  check (
    avatar_url is null
    or avatar_url like 'https://img.ceritaria.site/community/avatar/%'
  );
