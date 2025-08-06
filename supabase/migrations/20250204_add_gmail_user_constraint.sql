-- Add unique constraint on user_id for gmail_integrations
-- This allows upsert operations to work properly
alter table gmail_integrations 
add constraint gmail_integrations_user_id_key unique (user_id);