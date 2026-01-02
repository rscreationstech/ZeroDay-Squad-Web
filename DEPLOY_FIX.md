# Fix: "Failed to send a request to the Edge Function"

## Root Cause
The `delete-user` Edge Function exists in your code but hasn't been deployed to Supabase yet.

## Solution

### Step 1: Install Supabase CLI (if not already installed)
```bash
npm install -g supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```

### Step 3: Link Your Project
```bash
supabase link --project-ref mzoewwbisgvqlikrwnti
```

### Step 4: Deploy the Edge Function
```bash
supabase functions deploy delete-user
```

### Step 5: Verify Deployment
After deployment, you should see output like:
```
Deployed Function delete-user on project mzoewwbisgvqlikrwnti
URL: https://mzoewwbisgvqlikrwnti.supabase.co/functions/v1/delete-user
```

### Step 6: Test the Fix
1. Open your Admin Dashboard
2. Go to Members tab
3. Try deleting a test member
4. Should work without errors ✅

## Alternative: Deploy via Supabase Dashboard

If CLI doesn't work:

1. Go to https://supabase.com/dashboard/project/mzoewwbisgvqlikrwnti
2. Navigate to **Edge Functions** in the sidebar
3. Click **Deploy new function**
4. Upload the function code from `supabase/functions/delete-user/index.ts`
5. Name it `delete-user`
6. Deploy

## What Changed
- ✅ Added better error logging in frontend
- ✅ Edge Function code is ready and correct
- ✅ Cascading deletes configured properly in database
- ❌ **Function needs to be deployed to work**

## After Deployment
The delete member feature will:
- Check admin permissions
- Delete user from auth.users
- Automatically cascade delete:
  - User profile
  - User roles
  - Project memberships
  - Achievement memberships
- Show success message
- Refresh the members list
