-- Projetos do site (CMS em /painel).
-- Rode uma vez no Supabase: painel do projeto → SQL Editor → cole este arquivo → Run.
-- Pode rodar de novo sem perder dados.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  client text not null default '',
  type text not null default '',
  year text not null default '',
  summary text not null default '',
  description text not null default '',
  challenge text not null default '',
  solution text not null default '',
  stack text[] not null default '{}',
  results text[] not null default '{}',
  url text,
  video_desktop text not null default '',
  video_mobile text not null default '',
  poster_desktop text not null default '',
  poster_mobile text not null default '',
  aspect_desktop text not null default '1600 / 912',
  aspect_mobile text not null default '540 / 1150',
  cover text not null default '',
  -- [{ "src": "...", "caption": "...", "width": 1600, "height": 912 }]
  gallery jsonb not null default '[]'::jsonb,
  position integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_published_position on public.projects (published, position);

-- Segurança: RLS ligado e nenhuma política. Ninguém lê nem escreve pela chave pública (anon);
-- só o servidor do site, com a chave de serviço, acessa a tabela. Rascunhos ficam privados.
alter table public.projects enable row level security;

-- Arquivos (vídeos, capas e telas). O bucket é público para leitura, porque o site exibe os arquivos;
-- os nomes levam um identificador aleatório, e enviar arquivos só é possível com URL assinada
-- gerada pelo servidor depois do login no painel. Limite de 50 MB por arquivo.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'projetos',
  'projetos',
  true,
  52428800,
  array['video/mp4', 'video/webm', 'image/webp', 'image/jpeg', 'image/png', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Tentativas de login erradas no painel (limite de tentativas que vale para todas as instâncias da Vercel).
-- Guarda só um hash do IP (com segredo), nunca o IP em si. Linhas com mais de 1 dia são apagadas sozinhas pelo site.
create table if not exists public.login_failures (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists login_failures_ip_time on public.login_failures (ip_hash, created_at desc);
create index if not exists login_failures_time on public.login_failures (created_at desc);

alter table public.login_failures enable row level security;
