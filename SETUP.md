# LACRP Forums Setup Guide

This guide will walk you through setting up the FiveMForums application.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier works)
- A Discord Application with OAuth2 enabled
- A Discord webhook URL for application notifications

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Supabase Setup

1. Go to https://supabase.com and create a new project
2. Once your project is created, go to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql` into the SQL Editor
4. Click **Run** to execute the migration
5. This will create:
   - `users` table - stores Discord user information
   - `applications` table - stores department applications

6. Go to **Settings** → **API** to get your Supabase credentials:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon/public key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **service_role key** (SUPABASE_SERVICE_ROLE_KEY) - Keep this secret!

## Step 3: Discord OAuth Setup

1. Go to https://discord.com/developers/applications
2. Click **New Application** and give it a name (e.g., "LACRP Forums")
3. Go to **OAuth2** section
4. Copy your **Client ID** and **Client Secret**
5. Under **Redirects**, add:
   - For development: `http://localhost:3000/api/auth/callback/discord`
   - For production: `https://yourdomain.com/api/auth/callback/discord`
6. Under **Scopes**, select:
   - `identify`
   - `email`
7. Save changes

## Step 4: Discord Webhook Setup

1. In your Discord server, go to **Server Settings** → **Integrations** → **Webhooks**
2. Click **New Webhook** or **Create Webhook**
3. Choose the channel where you want application notifications (recommended: a private channel for staff)
4. Copy the **Webhook URL**

## Step 5: Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Discord OAuth
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
NEXT_PUBLIC_DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/callback/discord

# Discord Webhook (for application notifications)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
```

**Important:** Never commit `.env.local` to version control!

## Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 7: Production Deployment

### For Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add all environment variables from `.env.local` in Vercel's project settings
4. Update `NEXT_PUBLIC_DISCORD_REDIRECT_URI` in both:
   - Vercel environment variables
   - Discord OAuth2 redirect URIs (add your production URL)

### For Other Platforms

Make sure to:
- Set all environment variables
- Update `NEXT_PUBLIC_DISCORD_REDIRECT_URI` to your production URL
- Update Discord OAuth2 redirect URIs

## Features

- ✅ Discord OAuth login
- ✅ User sessions stored in cookies
- ✅ Supabase database for user and application storage
- ✅ Department application forms
- ✅ Discord webhook notifications with embeds
- ✅ Responsive design matching SASRP forums style

## Troubleshooting

### "Failed to exchange code for token"
- Check that your Discord Client ID and Secret are correct
- Verify the redirect URI matches exactly in Discord OAuth2 settings

### "Authentication required" when submitting applications
- Make sure you're logged in with Discord
- Clear cookies and try logging in again

### Webhook not sending
- Verify the webhook URL is correct
- Check that the webhook hasn't been deleted in Discord
- Application will still save to database even if webhook fails

### Database errors
- Verify Supabase credentials are correct
- Check that the migration has been run successfully
- Ensure Row Level Security policies allow necessary operations

## Support

For issues or questions, please check the README.md file or contact the development team.
