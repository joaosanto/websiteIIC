-- IIC Website v2 – esquema Supabase
-- Conteúdo editável + histórico de versões + lista de editores autorizados.

create table if not exists public.site_editors (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

insert into public.site_editors (email) values
  ('dantas@iindustrialconsulting.com'),
  ('general@iindustrialconsulting.com'),
  ('fausto@iindustrialconsulting.com')
on conflict do nothing;

create table if not exists public.site_content (
  slug text primary key,                 -- ex.: 'home'
  sections jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists public.site_content_history (
  id bigint generated always as identity primary key,
  slug text not null,
  sections jsonb not null,
  updated_at timestamptz not null,
  updated_by text
);
create index if not exists site_content_history_slug_idx
  on public.site_content_history (slug, updated_at desc);

-- É editor? (security definer para poder ler site_editors sem expor a tabela)
create or replace function public.is_site_editor()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.site_editors e
    where e.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.is_site_editor() from public;
grant execute on function public.is_site_editor() to anon, authenticated;

-- Carimbo de autor/data + cópia para o histórico em cada gravação
create or replace function public.site_content_stamp()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := lower(coalesce(auth.jwt() ->> 'email', new.updated_by));
  insert into public.site_content_history (slug, sections, updated_at, updated_by)
  values (new.slug, new.sections, new.updated_at, new.updated_by);
  return new;
end;
$$;
revoke all on function public.site_content_stamp() from public, anon, authenticated;

drop trigger if exists site_content_stamp on public.site_content;
create trigger site_content_stamp
  before insert or update on public.site_content
  for each row execute function public.site_content_stamp();

-- RLS
alter table public.site_editors enable row level security;
alter table public.site_content enable row level security;
alter table public.site_content_history enable row level security;

drop policy if exists "conteudo publico" on public.site_content;
create policy "conteudo publico" on public.site_content
  for select to anon, authenticated using (true);

drop policy if exists "editores inserem" on public.site_content;
create policy "editores inserem" on public.site_content
  for insert to authenticated with check ((select public.is_site_editor()));

drop policy if exists "editores atualizam" on public.site_content;
create policy "editores atualizam" on public.site_content
  for update to authenticated
  using ((select public.is_site_editor())) with check ((select public.is_site_editor()));

drop policy if exists "editores leem historico" on public.site_content_history;
create policy "editores leem historico" on public.site_content_history
  for select to authenticated using ((select public.is_site_editor()));

drop policy if exists "editor ve-se a si" on public.site_editors;
create policy "editor ve-se a si" on public.site_editors
  for select to authenticated
  using (email = lower(coalesce((select auth.jwt()) ->> 'email', '')));

grant select on public.site_content to anon, authenticated;
grant insert, update on public.site_content to authenticated;
grant select on public.site_content_history to authenticated;
grant select on public.site_editors to authenticated;
