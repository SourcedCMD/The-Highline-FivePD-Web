# FiveMForums

A forums application for the FiveMForums community, built with Next.js, Supabase, and Discord OAuth integration.

## Features

- ✅ Discord OAuth authentication
- ✅ Supabase database integration
- ✅ Department application system
- ✅ Webhook notifications for applications (Discord embeds)
- ✅ Responsive design matching the SASRP forums style

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
NEXT_PUBLIC_DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/callback/discord
DISCORD_WEBHOOK_URL=your_webhook_url_for_applications
```

### 3. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Run the migration file located in `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor
3. This will create the necessary tables:
   - `users` - stores user information from Discord
   - `applications` - stores department applications

### 4. Discord OAuth Setup

1. Go to https://discord.com/developers/applications
2. Create a new application
3. Navigate to OAuth2 section
4. Add redirect URI: `http://localhost:3000/api/auth/callback/discord` (and your production URL)
5. Copy the Client ID and Client Secret to your `.env.local` file
6. Enable the following scopes: `identify`, `email`

### 5. Discord Webhook Setup

1. Go to your Discord server settings
2. Navigate to Integrations → Webhooks
3. Create a new webhook for your applications channel
4. Copy the webhook URL to your `.env.local` file

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts          # Discord OAuth login
│   │   │   └── callback/discord/route.ts # Discord OAuth callback
│   │   └── applications/
│   │       └── submit/route.ts         # Application submission API
│   ├── forums/
│   │   └── page.tsx                    # Forums listing page
│   ├── layout.tsx                      # Root layout
│   ├── page.tsx                        # Homepage
│   └── globals.css                     # Global styles
├── components/
│   ├── ApplicationForm.tsx             # Department application form
│   ├── DepartmentCard.tsx              # Department card component
│   ├── Footer.tsx                      # Footer component
│   └── Navigation.tsx                  # Navigation bar
├── lib/
│   ├── supabase.ts                     # Supabase client (client-side)
│   └── supabase-server.ts              # Supabase client (server-side)
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql      # Database schema
```

## Usage

1. **Homepage**: View the community information and pictures
2. **Forums Page**: Browse available departments and staff positions
3. **Application**: Users must sign in with Discord to apply to departments
4. **Applications**: Submitted applications are saved to Supabase and sent to Discord webhook

## Technologies Used

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Supabase (Database & Auth)
- Discord OAuth2

## License

This project is created for FiveMForums community.
