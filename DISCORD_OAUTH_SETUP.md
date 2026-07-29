# Discord OAuth Redirect URI Setup

## The Problem

If you're seeing "Invalid OAuth2 redirect_uri" error, it means the redirect URI in your Discord Developer Portal doesn't match what's being sent in the OAuth request.

## Solution Steps

### Step 1: Find Your Vercel/Production URL

1. Go to your Vercel dashboard
2. Select your project
3. Check your deployment URL (e.g., `https://lacrp-forums.vercel.app` or your custom domain)

### Step 2: Add Redirect URI to Discord

1. Go to https://discord.com/developers/applications
2. Select your application (Client ID: `1462489272253943963`)
3. Go to **OAuth2** → **General**
4. Scroll down to **Redirects**
5. Click **Add Redirect**
6. Add **BOTH** of these URIs:
   - `http://localhost:3000/api/auth/callback/discord` (for local development)
   - `https://YOUR-VERCEL-URL.vercel.app/api/auth/callback/discord` (for production)
   - OR your custom domain: `https://yourdomain.com/api/auth/callback/discord`

**Important**: The URI must match EXACTLY, including:
- Protocol (`http://` or `https://`)
- Domain name
- Path: `/api/auth/callback/discord`

### Step 3: Update Vercel Environment Variables (Optional but Recommended)

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `NEXT_PUBLIC_DISCORD_REDIRECT_URI`
3. Update it to your production URL:
   ```
   https://YOUR-VERCEL-URL.vercel.app/api/auth/callback/discord
   ```
4. Or leave it empty and the app will auto-detect it (new feature)

### Step 4: Redeploy

After updating environment variables in Vercel:
1. Go to Deployments
2. Click the three dots (⋯) on the latest deployment
3. Click **Redeploy**

## How It Works Now

The code now automatically detects the redirect URI from the request URL if `NEXT_PUBLIC_DISCORD_REDIRECT_URI` is not set. This means:

- **Local development**: Uses `http://localhost:3000/api/auth/callback/discord`
- **Production**: Automatically uses your Vercel/production URL

However, you **MUST** still add both URIs in Discord Developer Portal!

## Verification

To verify it's working:

1. Click "SIGN IN" on your website
2. You should be redirected to Discord's authorization page (not an error)
3. After authorizing, you should be redirected back to your site and logged in

## Troubleshooting

### Still getting "Invalid OAuth2 redirect_uri"?

1. **Double-check the URI in Discord** - It must match exactly, character for character
2. **Check your Vercel deployment URL** - Use the exact URL from Vercel dashboard
3. **Clear browser cache** - Old redirects might be cached
4. **Check environment variables** - Make sure `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` are set in Vercel

### For Custom Domains

If you're using a custom domain (e.g., `forums.lacrp.com`):
1. Add `https://forums.lacrp.com/api/auth/callback/discord` to Discord redirects
2. Set `NEXT_PUBLIC_DISCORD_REDIRECT_URI=https://forums.lacrp.com/api/auth/callback/discord` in Vercel
3. Redeploy
