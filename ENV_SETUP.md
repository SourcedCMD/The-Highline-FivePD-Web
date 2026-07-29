# Environment Variables Setup

This file contains your environment variables for the FiveMForums application.

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://hvybfcfckrocyvqtycoz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2eWJmY2Zja3JvY3l2cXR5Y296Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MzM0ODYsImV4cCI6MjA4NDQwOTQ4Nn0.1iLmGb6howZ-dQ0-h8p2Mv-ySM02vtZAWOrKnHaKBNM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2eWJmY2Zja3JvY3l2cXR5Y296Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODgzMzQ4NiwiZXhwIjoyMDg0NDA5NDg2fQ.b84SGor25zEPU_JKezbmuSvCyddDwSioPG9GgI0Jpxk

# Discord OAuth Configuration
DISCORD_CLIENT_ID=1462831889340567672
DISCORD_CLIENT_SECRET=qc809hILmdWuIRgcWA8K571lhGnd6IPg
NEXT_PUBLIC_DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/callback/discord

# Discord Webhook (for application notifications)
# Add your Discord webhook URL here when ready
# DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL
```

## Important Notes

⚠️ **SECURITY WARNING**: 
- The `.env.local` file is already in `.gitignore` and will NOT be committed to git
- Never share your `SUPABASE_SERVICE_ROLE_KEY` publicly
- Never commit `.env.local` to version control
- The service role key has admin access to your Supabase database

## What Each Variable Does

- **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL (publicly accessible)
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Public anonymous key for client-side Supabase operations
- **SUPABASE_SERVICE_ROLE_KEY**: Service role key for server-side admin operations (keep secret!)
- **DISCORD_CLIENT_ID**: Your Discord application client ID
- **DISCORD_CLIENT_SECRET**: Your Discord application client secret (keep secret!)
- **NEXT_PUBLIC_DISCORD_REDIRECT_URI**: The callback URL for Discord OAuth
- **DISCORD_WEBHOOK_URL**: Webhook URL for sending application notifications to Discord

## Next Steps

1. Copy the template above into a `.env.local` file
2. Replace `DISCORD_WEBHOOK_URL` with your actual Discord webhook URL
3. For production, update `NEXT_PUBLIC_DISCORD_REDIRECT_URI` to your production URL
4. Run `npm run dev` to start the development server
