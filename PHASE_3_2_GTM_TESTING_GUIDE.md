# Phase 3.2 - GTM Manifest Setup Testing Guide

## Overview
The GTM (Go-To-Market) Manifest setup helps the AI understand your business context to make better task prioritization decisions. This guide covers testing all aspects of the GTM manifest feature.

## Components Implemented

1. **Onboarding Flow** (`/onboarding`)
   - Welcome page with benefits explanation
   - Auto-redirect for new users
   - Skip option available

2. **GTM Setup Form** (`/onboarding/gtm-setup`)
   - Multi-field form with validation
   - Progress tracking
   - Tech stack management
   - Auto-save functionality

3. **Settings Page** (`/settings/gtm`)
   - Update existing GTM context
   - Pre-filled with current values
   - Same form component in settings mode

4. **Dashboard Integration**
   - Alert notification for users without GTM
   - Quick link to GTM settings
   - Auto-redirect new users to onboarding

5. **AI Analysis Enhancement**
   - GTM context included in prompts
   - Better prioritization based on:
     - Current product stage
     - Target audience
     - Business model
     - Value proposition

## Testing Scenarios

### 1. New User Flow
1. **Sign up as a new user**
2. **After authentication**, you should be redirected to `/onboarding`
3. **Welcome page** should show:
   - Welcome message
   - Three benefit cards
   - "Get Started" and "Skip for Now" buttons
   - 0% progress

4. **Click "Get Started"**
5. **GTM Setup form** should appear with:
   - Product Name (required)
   - Product Description
   - Target Audience
   - Value Proposition
   - Current Stage dropdown
   - Business Model
   - Tech Stack sections

6. **Fill out the form**:
   - Progress bar should update as you fill fields
   - Tech stack: Type technology name and press Enter or click +
   - Remove tech items with X button
   - All fields except Product Name are optional

7. **Submit the form**
8. **Should redirect to dashboard** with success toast

### 2. Existing User Without GTM
1. **Log in as existing user** without GTM manifest
2. **Dashboard** should show:
   - Yellow alert box about improving AI prioritization
   - "Set Up Now" button in alert
   - GTM Settings quick action button

3. **Click "Set Up Now"**
4. **Should go to** `/onboarding` page

### 3. Skip Onboarding Flow
1. **On onboarding page**, click "Skip for Now"
2. **Should redirect to dashboard**
3. **Dashboard should show** GTM setup alert
4. **Toast message** about setting up later in Settings

### 4. Update GTM Settings
1. **Navigate to** `/settings/gtm`
2. **If no GTM exists**:
   - Empty form with helper message
   - Link to complete setup

3. **If GTM exists**:
   - Form pre-filled with current values
   - Can update any field
   - Save Changes button

4. **Make changes and save**
5. **Success toast** should appear

### 5. Tech Stack Management
1. **In GTM form**, go to Tech Stack section
2. **Add items**:
   - Type "React" in Frontend field
   - Press Enter or click +
   - Should appear as badge below

3. **Add multiple items**:
   - Add "Next.js", "TypeScript" to Frontend
   - Add "Node.js", "Express" to Backend
   - Add "PostgreSQL" to Database
   - Add "Vercel" to Infrastructure

4. **Remove items**:
   - Click X on any badge
   - Should be removed immediately

5. **Duplicate prevention**:
   - Try adding "React" again
   - Should not create duplicate

### 6. Form Validation
1. **Try submitting empty form**
   - Should show "Product name is required" error

2. **Fill only Product Name**
   - Form should submit successfully
   - All other fields are optional

3. **Character limits**:
   - Product Name: 100 chars max
   - Other text fields: 500 chars max

### 7. AI Analysis Integration
1. **Set up GTM manifest** with specific values:
   - Product Name: "TaskPriority AI"
   - Current Stage: "MVP"
   - Target Audience: "Solo founders"
   - Business Model: "B2B SaaS"

2. **Create a new task**
3. **AI analysis should**:
   - Consider your product stage (MVP = focus on core features)
   - Align with target audience needs
   - Factor in business model for ROI

4. **Compare prioritization**:
   - Tasks should be scored considering your GTM context
   - Business-critical features should score higher
   - Features for your target audience should be prioritized

### 8. Progress Tracking
1. **In onboarding GTM setup**
2. **Progress bar should update**:
   - Empty form: 0%
   - Product Name only: ~17%
   - Half fields filled: ~50%
   - All fields: 100%

3. **Progress is visual only** - not blocking submission

## API Testing

### GET /api/gtm-manifest
- Should return user's manifest or null
- Requires authentication

### POST /api/gtm-manifest
- Creates or updates manifest (upsert)
- Validates user ownership
- Returns created manifest

### PUT /api/gtm-manifest
- Updates existing manifest
- Requires authentication
- Returns updated manifest

## Expected Behaviors

1. **Auto-redirect**: New users → Onboarding after auth
2. **Skip option**: Always available, can set up later
3. **Dashboard alert**: Shows for users without GTM
4. **Form persistence**: Tech stack badges remain after save
5. **AI improvement**: Better prioritization with GTM context

## Common Issues & Solutions

1. **Not redirected to onboarding**:
   - Check if user already has GTM manifest
   - Clear browser cache and try again

2. **Tech stack not saving**:
   - Ensure you're not trying to add empty strings
   - Check browser console for errors

3. **Form not pre-filling**:
   - Refresh the page
   - Check if GTM data exists in Supabase

4. **Progress bar not updating**:
   - Progress only counts main fields, not tech stack
   - Ensure form values are actually changing

## Success Criteria

✅ New users are guided through onboarding
✅ Existing users see prompt to set up GTM
✅ Form validates and saves correctly
✅ Settings page allows updates
✅ AI uses GTM context for better prioritization
✅ Tech stack management works smoothly
✅ Skip option is always available
✅ Progress tracking provides visual feedback