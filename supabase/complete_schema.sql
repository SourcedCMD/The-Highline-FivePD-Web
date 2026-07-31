-- =============================================
-- The Highline - Complete SQL (Paste into Supabase SQL Editor)
-- =============================================
-- Creates:
--  - users
--  - applications
--  - indexes
--  - RLS enabled (service role bypasses RLS)
-- =============================================

-- Extensions (gen_random_uuid)
create extension if not exists pgcrypto;

-- Create users table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  discord_id varchar(255) unique not null,
  username varchar(255) not null,
  email varchar(255),
  avatar text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create applications table
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  department_id varchar(255) not null,
  department_name varchar(255) not null,
  user_id varchar(255) not null,
  user_email varchar(255) not null,
  username varchar(255) not null,
  age integer not null,
  experience text not null,
  why_join text not null,
  what_can_you_bring text not null,
  availability text not null,
  previous_experience text,
  submitted_at timestamptz default now(),
  status varchar(50) default 'pending',
  reviewed_by varchar(255),
  reviewed_at timestamptz,
  notes text
);

-- Indexes
create index if not exists idx_users_discord_id on public.users(discord_id);
create index if not exists idx_applications_user_id on public.applications(user_id);
create index if not exists idx_applications_department_id on public.applications(department_id);
create index if not exists idx_applications_status on public.applications(status);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.applications enable row level security;

-- Profile bio
alter table public.users add column if not exists bio text;

-- Department application status (staff can open/close applications per department)
create table if not exists public.department_status (
  department_id varchar(255) primary key,
  is_open boolean not null default true,
  updated_at timestamptz default now(),
  updated_by varchar(255)
);

alter table public.department_status enable row level security;

-- Links each application to the Discord message posted about it (for two-way sync
-- between the Discord embed's Accept/Deny buttons and the staff panel)
alter table public.applications add column if not exists discord_message_id varchar(255);
alter table public.applications add column if not exists discord_channel_id varchar(255);

-- IMPORTANT:
-- This project currently writes/reads with the Supabase service role key on the server,
-- which bypasses RLS. If you later move to user-scoped access, you'll need policies.

