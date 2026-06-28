-- Enable the uuid extension if not already enabled
create extension if not exists "uuid-ossp";

-- Articles table
create table if not exists articles (
  id               uuid primary key default uuid_generate_v4(),
  title            text not null,
  url              text not null,
  source           text not null,
  published_at     timestamptz,
  summary_ai       text,
  category         text,
  relevance_score  int check (relevance_score between 1 and 10),
  raw_content      text,
  created_at       timestamptz not null default now()
);

-- Unique index on url for idempotent upserts
create unique index if not exists articles_url_idx on articles (url);
