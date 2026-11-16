begin;

-- Run as the Neon database owner. These roles have no login privileges.
create role anon nologin;
create role authenticated nologin;
grant anon, authenticated to current_user;
grant usage on schema public to anon, authenticated;

create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Admin membership can only be changed from SQL/the trusted project backend.
create table private.site_admins (
 user_id text primary key references public."user"(id) on delete cascade
);
alter table private.site_admins enable row level security;
create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists(select 1 from private.site_admins where user_id = (select nullif(current_setting('app.user_id', true), ''))) $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create table public.poems (
 id uuid primary key default gen_random_uuid(),
 owner_id text references public."user"(id) on delete cascade,
 slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{0,119}$'),
 title text not null check (char_length(btrim(title)) between 1 and 200),
 khmer text not null check (char_length(btrim(khmer)) between 1 and 200),
 author text not null check (char_length(btrim(author)) between 1 and 120),
 author_khmer text not null default '' check (char_length(author_khmer) <= 120),
 theme text not null check (char_length(btrim(theme)) between 1 and 60),
 description text not null default '' check (char_length(description) <= 1000),
 lines text[] not null default '{}',
 khmer_lines text[] not null default '{}',
 year_label text not null default '',
 form text not null default '',
 is_sample boolean not null default false,
 is_excerpt boolean not null default false,
 -- Source citations, rights, dates, and editorial notes from the original collection.
 -- Users cannot write this column or mark their work as a historical source/sample.
 details jsonb not null default '{}' check (jsonb_typeof(details) = 'object'),
 status text not null default 'draft' check (status in ('draft', 'pending', 'published', 'rejected')),
 search_text text not null default '',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check (char_length(btrim(array_to_string(lines, E'\n') || array_to_string(khmer_lines, E'\n'))) between 1 and 50000),
 check (cardinality(lines) + cardinality(khmer_lines) <= 10000)
);

create function public.normalize_poem_search(value text) returns text
language sql immutable strict set search_path = ''
as $$ select translate(lower(replace(normalize(value, NFC), U&'\200B', '')), '០១២៣៤៥៦៧៨៩', '0123456789') $$;

create function private.prepare_poem() returns trigger
language plpgsql security definer set search_path = '' as $$
declare theme_km text;
begin
 if TG_OP = 'INSERT' and new.owner_id is not null then
  -- Serialize inserts for this author so parallel requests cannot bypass the limit.
  perform pg_advisory_xact_lock(hashtextextended(new.owner_id::text, 0));
  if (select count(*) from public.poems where owner_id = new.owner_id and created_at > now() - interval '1 day') >= 10 then
   raise exception 'Daily limit reached. Please try again tomorrow.' using errcode = 'P0001';
  end if;
 end if;
 theme_km := case new.theme
  when 'Society' then 'សង្គម' when 'Wisdom' then 'គតិបណ្ឌិត' when 'Buddhism' then 'ព្រះពុទ្ធសាសនា'
  when 'Education' then 'ការអប់រំ' when 'Family' then 'គ្រួសារ' when 'Heritage' then 'បេតិកភណ្ឌ'
  when 'Memory' then 'ការចងចាំ' when 'Home' then 'ផ្ទះ' when 'Nature' then 'ធម្មជាតិ'
  when 'Identity' then 'អត្តសញ្ញាណ' when 'Love' then 'សេចក្ដីស្រឡាញ់' else 'ផ្សេងៗ' end;
 new.search_text := public.normalize_poem_search(concat_ws(' ', new.title, new.khmer, new.author, new.author_khmer, new.theme, theme_km, new.year_label, new.form, array_to_string(new.lines, ' '), array_to_string(new.khmer_lines, ' ')));
 new.updated_at := clock_timestamp();
 return new;
end;
$$;
create trigger prepare_poem before insert or update on public.poems
for each row execute function private.prepare_poem();

create index poems_published_title on public.poems (title, slug) where status = 'published';
create index poems_published_khmer on public.poems (khmer, slug) where status = 'published';
create index poems_published_theme on public.poems (theme) where status = 'published';
create index poems_search on public.poems using gin (search_text extensions.gin_trgm_ops) where status = 'published';
create index poems_owner_created on public.poems (owner_id, created_at desc);
create index poems_review_queue on public.poems (created_at, id) where status = 'pending';

alter table public.poems enable row level security;
revoke all on public.poems from anon, authenticated;
grant select on public.poems to anon, authenticated;
grant insert (owner_id, slug, title, khmer, author, author_khmer, theme, description, lines, khmer_lines, status) on public.poems to authenticated;
grant update (title, khmer, author, author_khmer, theme, description, lines, khmer_lines, status) on public.poems to authenticated;

create policy published_poems on public.poems for select to anon, authenticated using (status = 'published');
create policy own_submissions on public.poems for select to authenticated using (owner_id = (select nullif(current_setting('app.user_id', true), '')));
create policy admin_reads on public.poems for select to authenticated using ((select public.is_admin()));
create policy submit_own_poems on public.poems for insert to authenticated
with check (owner_id = (select nullif(current_setting('app.user_id', true), '')) and status in ('draft', 'pending'));
create policy edit_own_drafts on public.poems for update to authenticated
using (owner_id = (select nullif(current_setting('app.user_id', true), '')) and status in ('draft', 'rejected'))
with check (owner_id = (select nullif(current_setting('app.user_id', true), '')) and status in ('draft', 'pending'));
create policy admin_moderation on public.poems for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));

create function public.collection_stats() returns jsonb
language sql stable security invoker set search_path = '' as $$
 select jsonb_build_object(
  'total', count(*),
  'sourcedCount', count(*) filter (where details ? 'source'),
  'sampleCount', count(*) filter (where is_sample),
  'communityCount', count(*) filter (where owner_id is not null),
  'themes', coalesce(jsonb_agg(distinct theme order by theme), '[]'::jsonb)
 ) from public.poems where status = 'published';
$$;
revoke all on function public.collection_stats() from public;
grant execute on function public.collection_stats() to anon, authenticated;
revoke all on function private.prepare_poem() from public;

commit;
