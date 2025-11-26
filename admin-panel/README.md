# GigHub Admin Panel

Admin panel for reviewing and verifying service provider applications.

## ⚠️ IMPORTANT: Recent Bug Fix

**A critical bug affecting profile updates has been fixed!** If you approved applications before this fix, user roles may not have been updated. See [QUICK_FIX_SUMMARY.md](./QUICK_FIX_SUMMARY.md) for details and migration steps.

## Features

- Admin authentication
- View pending verification applications
- View application details and documents
- Approve or reject applications
- View history of approved and rejected applications

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://lhcqmeudptjasfduucmd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the admin panel.

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Supabase
- React 19

## Database Schema

The admin panel connects to the existing GigHub Supabase database:
- `profiles` table: User profiles with role field (admin role set manually)
- `verification_requests` table: Pending/approved/rejected verification applications
- Storage buckets: Documents stored with user UUID as folder name

## 🧪 Testing & Diagnostics

### Test Profile Updates
```bash
node scripts/test-profile-update.js
```
Tests the profile update functionality to ensure users are properly promoted to provider role.

### Database Diagnostics
```bash
node scripts/diagnose-database.js
```
Comprehensive database health check:
- Verifies table access
- Checks data integrity
- Tests update permissions
- Identifies misconfigured users
- Validates storage bucket

### Check for Affected Users
If applications were approved before the bug fix, run this SQL in Supabase:
```sql
SELECT vr.user_id, p.full_name, p.role, vr.status
FROM verification_requests vr
JOIN profiles p ON p.id = vr.user_id
WHERE vr.status = 'verified' AND p.role != 'provider' AND p.role != 'admin';
```

## 📚 Documentation

- [QUICK_FIX_SUMMARY.md](./QUICK_FIX_SUMMARY.md) - Quick reference for the profile update bug fix
- [PROFILE_UPDATE_BUG_REPORT.md](./PROFILE_UPDATE_BUG_REPORT.md) - Detailed technical analysis and prevention measures
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
