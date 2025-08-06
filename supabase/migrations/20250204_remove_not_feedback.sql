-- Remove 'not_feedback' from feedback_type enum
-- This migration updates the constraint to exclude 'not_feedback' since non-feedback emails won't be stored

-- First, drop the existing constraint
alter table processed_emails drop constraint if exists processed_emails_feedback_type_check;

-- Add the new constraint without 'not_feedback'
alter table processed_emails 
add constraint processed_emails_feedback_type_check 
check (feedback_type in ('bug_report', 'feature_request', 'question', 'complaint', 'praise'));