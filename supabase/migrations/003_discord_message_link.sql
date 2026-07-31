-- Links each application row to the Discord message posted about it, so the
-- staff panel and the Discord embed's Accept/Deny buttons can stay in sync in
-- both directions.
alter table public.applications add column if not exists discord_message_id varchar(255);
alter table public.applications add column if not exists discord_channel_id varchar(255);
