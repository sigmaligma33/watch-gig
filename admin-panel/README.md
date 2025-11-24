# GigHub Admin Panel

Admin panel for reviewing and verifying service provider applications.

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
