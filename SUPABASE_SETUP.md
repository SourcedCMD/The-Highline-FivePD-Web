# Supabase Database Setup Guide

This guide will help you set up the database for the LACRP Forums application in Supabase.

## Quick Setup (Copy & Paste)

1. **Open Supabase SQL Editor**
   - Go to your Supabase project: https://supabase.com/dashboard/project/dgulbgnksglcvuubdwwd
   - Click on **SQL Editor** in the left sidebar
   - Click **New Query**

2. **Copy the complete SQL script**
   - Open `supabase/schema.sql` in this repository
   - Copy **ALL** the contents
   - Paste into the Supabase SQL Editor

3. **Run the script**
   - Click **Run** (or press Ctrl+Enter / Cmd+Enter)
   - You should see "Success. No rows returned" or similar

4. **Verify tables were created**
   - Go to **Table Editor** in Supabase dashboard
   - You should see two tables: `users` and `applications`

## What the Schema Creates

### Tables

#### `users`
Stores Discord user information:
- `id` - UUID primary key
- `discord_id` - Discord user ID (unique)
- `username` - Discord username
- `email` - Discord email
- `avatar` - Discord avatar URL
- `created_at` - Timestamp when user was created
- `updated_at` - Auto-updated timestamp

#### `applications`
Stores all department and staff job applications:
- `id` - UUID primary key
- `department_id` - Department/staff ID (e.g., "lspd", "sast")
- `department_name` - Full department name
- `user_id` - Discord user ID of applicant
- `user_email` - Applicant email
- `username` - Applicant username
- `age` - Applicant age
- `experience` - Roleplay experience text
- `why_join` - Why they want to join text
- `what_can_you_bring` - What they can bring text
- `availability` - Availability text
- `previous_experience` - Previous experience (optional)
- `submitted_at` - When application was submitted
- `status` - Application status (pending, approved, rejected, withdrawn)
- `reviewed_by` - Who reviewed it (Discord ID)
- `reviewed_at` - When it was reviewed
- `notes` - Admin notes

### Indexes

Created for better query performance:
- Users: discord_id, email, created_at
- Applications: user_id, department_id, status, submitted_at, combined user+department

### Views

Helpful views for easy querying:
- `recent_applications` - Shows recent applications with user info
- `applications_by_status` - Counts applications by status

### Triggers

- Auto-updates `updated_at` timestamp on users table when records are modified

## Verifying the Setup

After running the SQL script, you can verify everything worked:

### Check Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'applications');
```

### Check Indexes
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'applications');
```

### Check Row Counts
```sql
SELECT 'users' as table_name, COUNT(*) as rows FROM users
UNION ALL
SELECT 'applications' as table_name, COUNT(*) as rows FROM applications;
```

## Important Notes

1. **Row Level Security (RLS)**: RLS is enabled but the application uses service role key which bypasses it. The policies are there for future use if you switch to user-level access.

2. **Service Role Key**: The application uses `SUPABASE_SERVICE_ROLE_KEY` for all database operations, which has full access and bypasses RLS.

3. **Discord ID as User ID**: User authentication is handled via Discord OAuth, and we store the Discord ID as the primary user identifier.

4. **No Data Loss**: The script uses `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`, so running it multiple times is safe.

## Troubleshooting

### "relation already exists" errors
- This is normal if tables already exist
- The script uses `IF NOT EXISTS` clauses to prevent errors
- If you want to reset, uncomment the `DROP TABLE` statements at the top of the schema.sql file

### "permission denied"
- Make sure you're using the SQL Editor in Supabase dashboard
- You need to be the project owner or have proper permissions

### Tables not appearing
- Refresh the Table Editor page
- Check the SQL Editor output for any errors
- Verify you're in the correct project

## Next Steps

Once the database is set up:

1. ✅ Your application will automatically connect to these tables
2. ✅ Users will be created automatically when they sign in with Discord
3. ✅ Applications will be saved automatically when submitted
4. ✅ You can view applications in Supabase Table Editor or query them via SQL

## Using the Database

### View all applications
```sql
SELECT * FROM applications ORDER BY submitted_at DESC;
```

### View applications by status
```sql
SELECT * FROM applications WHERE status = 'pending' ORDER BY submitted_at DESC;
```

### View users
```sql
SELECT * FROM users ORDER BY created_at DESC;
```

### View recent applications with user info (using the view)
```sql
SELECT * FROM recent_applications LIMIT 10;
```

### Update application status (example)
```sql
UPDATE applications 
SET status = 'approved', 
    reviewed_by = 'YOUR_DISCORD_ID',
    reviewed_at = NOW(),
    notes = 'Approved - great experience'
WHERE id = 'application-uuid-here';
```

## Support

If you encounter any issues:
1. Check the SQL Editor output for specific error messages
2. Verify your Supabase project URL and keys are correct
3. Ensure you have the correct permissions in Supabase
