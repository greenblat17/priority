# Supabase Realtime Setup Guide

## Overview
This guide explains how to enable realtime subscriptions for the TaskPriority AI application.

## Current Status
- **Issue**: Real-time subscriptions are failing with "CHANNEL_ERROR"
- **Workaround**: The app falls back to polling mechanism which works correctly
- **Solution**: Enable realtime in Supabase dashboard

## Steps to Enable Realtime

### 1. Run the Migration
First, ensure the migration has been applied:
```bash
npx supabase migration up
```

### 2. Enable Realtime in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database** → **Replication**
3. Find the following tables and enable realtime for each:
   - `tasks`
   - `task_analyses`
   - `task_groups`

4. For each table, click the toggle to enable "Realtime"

### 3. Verify Realtime is Working

After enabling realtime:
1. Refresh your application
2. Open browser console
3. Look for: `[Real-time] Successfully subscribed to task updates`
4. Add a new task and verify it appears without page refresh

## Troubleshooting

### If Realtime Still Fails

1. **Check RLS Policies**: Ensure Row Level Security policies allow SELECT for authenticated users
2. **Check Quotas**: Free tier has limits on concurrent realtime connections
3. **Disable Realtime**: Set `ENABLE_REALTIME = false` in `/src/hooks/use-tasks.ts` to rely only on polling

### Current Fallback Mechanism

The app has a robust fallback:
- Polling runs every 2 seconds when tasks are in "analyzing" state
- React Query handles cache updates
- Users see updates without manual refresh

## Notes

- The migration (`003_enable_realtime.sql`) sets up the database-level configuration
- Actual realtime enabling must be done through Supabase dashboard
- The app works correctly even without realtime due to the polling fallback