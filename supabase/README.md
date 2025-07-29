# Supabase Database Setup

This folder contains the database schema and migrations for TaskPriority AI.

## Setup Instructions

1. **Login to Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Navigate to your project: `iwpwczyxvetyfqsivths`

2. **Run the Migration**
   - Go to the SQL Editor in your Supabase dashboard
   - Copy the entire contents of `migrations/001_initial_schema.sql`
   - Paste and run the SQL script
   - You should see "Success. No rows returned" message

3. **Verify Tables Created**
   - Go to the Table Editor
   - You should see these tables:
     - `profiles`
     - `tasks`
     - `task_analyses`
     - `gtm_manifests`

4. **Verify RLS Policies**
   - Click on each table
   - Go to the "RLS" tab
   - Confirm that RLS is enabled and policies are created

## Database Schema

### Tables

1. **profiles** - Extended user information
   - Links to Supabase auth.users
   - Stores additional user metadata

2. **tasks** - Main task storage
   - User's tasks with descriptions
   - Status tracking (pending, in_progress, completed, blocked)
   - Source and customer info

3. **task_analyses** - AI analysis results
   - Category classification (bug, feature, improvement, etc.)
   - Priority scoring (1-10)
   - Complexity estimation
   - Implementation specifications

4. **gtm_manifests** - Go-to-Market context
   - Product information
   - Target audience
   - Business model
   - Used for AI context

### Security

All tables have Row Level Security (RLS) enabled:
- Users can only access their own data
- Service role has full access for backend operations
- Automatic profile creation on user signup

### Triggers

- `handle_new_user` - Creates profile when user signs up
- `handle_updated_at` - Updates timestamp on record changes