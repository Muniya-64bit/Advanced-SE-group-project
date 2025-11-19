# Supabase Authentication Setup Guide

This application now uses Supabase for authentication. Follow these steps to set it up:

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - Name: Your project name
   - Database Password: Choose a strong password
   - Region: Select closest to your users
   - Pricing Plan: Free tier works great for development

## 2. Get Your API Credentials

1. Once your project is created, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## 3. Configure Environment Variables

1. Create a `.env` file in the `frontend` directory (copy from `.env.example`)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Enable Google OAuth (Optional)

If you want to use Google Sign-In:

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and toggle it on
3. You'll need to:
   - Create a Google Cloud Project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs (Supabase provides these)
4. Enter your Google OAuth credentials in Supabase

## 5. Set Up Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add your site URL:
   - Development: `http://localhost:5173`
   - Production: Your production URL
3. Add redirect URLs (IMPORTANT - use the callback route):
   - `http://localhost:5173/auth/callback`
   - `your-production-url/auth/callback`

**Note**: The callback URL must match exactly what's configured in your app. After OAuth authentication, users will be redirected to `/auth/callback` which handles the session and redirects to the dashboard.

## 6. Create User Accounts (For Email/Password Auth)

### Option A: Sign Up via UI

Users can sign up through your application's sign-up form (if implemented).

### Option B: Create Test Users Manually

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Click "Add User" → "Create new user"
3. Enter email and password
4. User will receive confirmation email (or auto-confirm in dashboard)

## 7. Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Try logging in with:
   - Google OAuth (if configured)
   - Email/Password (if you created a test user)
   - Demo User (no Supabase required)

## Available Authentication Methods

### 1. **Google OAuth**

- Requires Supabase Google provider setup
- Seamless sign-in with Google account

### 2. **Email/Password**

- Traditional email and password authentication
- Requires user to be created in Supabase

### 3. **Demo Mode**

- No authentication required
- Great for testing and demos
- Data stored locally only

## Supabase Features Used

- **Authentication**: User sign-in/sign-out
- **Session Management**: Automatic token refresh
- **OAuth Providers**: Google OAuth integration
- **Real-time Auth State**: Automatic UI updates on auth changes

## Security Notes

- Never commit your `.env` file to git
- The anon key is safe to use in frontend (it's public)
- Use Row Level Security (RLS) policies in Supabase for data protection
- For production, enable email confirmation and additional security features

## Troubleshooting

### "Invalid API key" error

- Check that your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Make sure `.env` file is in the `frontend` directory
- Restart your dev server after changing `.env`

### Google OAuth not working

- Verify redirect URLs are configured correctly (must be `/auth/callback`)
- Check Google Cloud Console credentials
- Ensure Google provider is enabled in Supabase
- Make sure the redirect URL in Supabase matches: `http://localhost:5173/auth/callback`

### Login with Google stays on login page / Keys appear and disappear

This is usually a redirect URL mismatch:

1. Check Supabase dashboard → **Authentication** → **URL Configuration**
2. Ensure redirect URL is exactly: `http://localhost:5173/auth/callback`
3. NOT `/dashboard` or any other path
4. The app uses a dedicated callback handler at `/auth/callback`
5. Clear browser cache and localStorage, then try again
6. Check browser console for "Auth state changed" logs

### User can't log in

- Check if email confirmation is required (disable for testing)
- Verify user exists in Supabase dashboard
- Check browser console for detailed error messages

### Session not persisting after OAuth

- Ensure you're using the correct redirect URL (`/auth/callback`)
- Check that `onAuthStateChange` listener is working (check console logs)
- Verify Supabase URL and keys are correct in `.env`
- Try clearing browser storage and cookies

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
