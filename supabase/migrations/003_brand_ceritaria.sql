-- Ceritaria brand data migration.
-- Only updates editable SEO fields that still contain the old public brand name.

update public.series
set
  seo_title = case when seo_title is null then null else replace(replace(seo_title, 'STORIA', 'Ceritaria'), 'Storia', 'Ceritaria') end,
  seo_description = case when seo_description is null then null else replace(replace(seo_description, 'STORIA', 'Ceritaria'), 'Storia', 'Ceritaria') end
where
  coalesce(seo_title, '') ~ '(STORIA|Storia)'
  or coalesce(seo_description, '') ~ '(STORIA|Storia)';

update public.episodes
set
  seo_title = case when seo_title is null then null else replace(replace(seo_title, 'STORIA', 'Ceritaria'), 'Storia', 'Ceritaria') end,
  seo_description = case when seo_description is null then null else replace(replace(seo_description, 'STORIA', 'Ceritaria'), 'Storia', 'Ceritaria') end
where
  coalesce(seo_title, '') ~ '(STORIA|Storia)'
  or coalesce(seo_description, '') ~ '(STORIA|Storia)';
