-- Adds profile bio field and per-department application open/closed toggle
-- Run this in the Supabase SQL editor after 001_initial_schema.sql / complete_schema.sql

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

-- The app reads/writes this table with the service role key (bypasses RLS),
-- same pattern as users/applications.
