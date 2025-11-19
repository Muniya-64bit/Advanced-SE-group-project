# Google OAuth Flow - Quick Fix Guide

## The Problem

When clicking "Continue with Google", users stay on the login page and the authentication token appears in localStorage then disappears.

## The Root Cause

This happens when the OAuth redirect URL is not properly configured or doesn't match between:

1. Your Supabase dashboard settings
2. The code configuration
3. Google Cloud Console (if applicable)

## The Solution

### Step 1: Update Supabase Redirect URL

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Under "Redirect URLs", add:
   ```
   http://localhost:5173/auth/callback
   ```
4. For production, also add:
   ```
   https://yourdomain.com/auth/callback
   ```

### Step 2: Verify the Code (Already Fixed)

The following files have been updated:

#### `src/contexts/AuthContext.jsx`

```javascript
const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`, // ✅ Correct
    },
  });
  if (error) throw error;
  return data;
};
```

#### `src/components/Auth/AuthCallback.jsx` (New Component)

A dedicated callback handler that:

- Waits for Supabase to process the OAuth response
- Checks if user is authenticated
- Redirects to dashboard on success
- Redirects to login on failure

#### `src/App.jsx`

```javascript
<Route path="/auth/callback" element={<AuthCallback />} />
```

### Step 3: Test the Flow

1. **Clear browser storage** (important!):

   - Open DevTools (F12)
   - Go to Application/Storage tab
   - Clear localStorage
   - Clear cookies for your domain

2. **Start fresh**:

   ```bash
   npm run dev
   ```

3. **Click "Continue with Google"**:
   - You'll be redirected to Google login
   - After authentication, redirected back to `/auth/callback`
   - The callback page shows "Completing sign in..."
   - Then automatically redirects to `/dashboard`

## How OAuth Flow Works Now

```
User clicks "Continue with Google"
    ↓
Supabase redirects to Google OAuth
    ↓
User logs in with Google
    ↓
Google redirects back to: /auth/callback
    ↓
AuthCallback component loads
    ↓
onAuthStateChange fires with session
    ↓
User state is set in AuthContext
    ↓
Redirect to /dashboard
```

## Common Issues & Fixes

### Issue 1: Still stuck on login page

**Fix**: Clear browser cache and localStorage completely, then retry

### Issue 2: "Invalid redirect URL" error

**Fix**: Ensure the URL in Supabase dashboard exactly matches: `http://localhost:5173/auth/callback`

### Issue 3: Works locally but not in production

**Fix**: Add your production URL to Supabase redirect URLs: `https://yourdomain.com/auth/callback`

### Issue 4: Console shows "Auth state changed" but no redirect

**Fix**: Check the AuthCallback component is properly mounted at `/auth/callback` route

## Demo Mode Still Works!

If you don't want to set up Google OAuth, just click "Continue as Demo User" - it works without any Supabase configuration.

## Verification Checklist

✅ Supabase redirect URL is `/auth/callback` (not `/dashboard`)  
✅ Browser storage is cleared before testing  
✅ `.env` file has correct Supabase credentials  
✅ Dev server restarted after changing `.env`  
✅ Google provider is enabled in Supabase dashboard  
✅ AuthCallback route exists in App.jsx

## Debug Mode

Add this to your browser console to see auth events:

```javascript
localStorage.debug = "supabase:*";
```

Then refresh and watch the console for OAuth flow details.
