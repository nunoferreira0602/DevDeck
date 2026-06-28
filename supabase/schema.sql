-- Enable the uuid extension if not already enabled
create extension if not exists "uuid-ossp";

-- Run this first to remove the old articles table:
-- drop table if exists articles;

create table if not exists saved_articles (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  url         text not null,
  source      text,
  published_at timestamptz,
  raw_content text,
  saved_at    timestamptz not null default now()
);

create unique index if not exists saved_articles_url_idx on saved_articles (url);

-- Run this if the table already exists:
-- alter table saved_articles add column if not exists read boolean not null default false;
