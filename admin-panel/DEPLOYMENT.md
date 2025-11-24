# GigHub Admin Panel - Deployment Guide

## ✅ Pre-Deployment Checklist

The following are already configured:
- [x] Next.js production build tested successfully
- [x] Environment variables documented in `.env.example`
- [x] Supabase RLS policies for admin access
- [x] Storage policies for document access
- [x] Real-time enabled for verification_requests
- [x] TypeScript configured and compiling
- [x] Tailwind CSS configured
- [x] Middleware for route protection

## 🚀 Deploy to Vercel

### Option 1: Vercel Dashboard (Recommended)

1. **Push your code to GitHub** (if not already done):
   ```bash
   cd /path/to/gig-watch
   git add .
   git commit -m "Add admin panel"
   git push
   ```

2. **Import to Vercel**:
   - Go to https://vercel.com/new
   - Click "Import Project"
   - Select your repository: `gig-watch` or `watch-gig`
   - Configure project settings:
     - **Framework Preset**: Next.js
     - **Root Directory**: `admin-panel` ⚠️ (Important!)
     - **Build Command**: `npm run build` (auto-detected)
     - **Output Directory**: `.next` (auto-detected)
     - **Install Command**: `npm install` (auto-detected)

3. **Add Environment Variables**:
   Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://lhcqmeudptjasfduucmd.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [your anon key from Supabase]
   SUPABASE_SERVICE_ROLE_KEY = [your service role key from Supabase]
   ```

4. **Deploy**: Click "Deploy" and wait for build to complete

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Navigate to admin-panel directory
cd admin-panel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

When prompted:
- Set up and deploy? `Y`
- Which scope? Select your account
- Link to existing project? `N` (first time) or `Y` (subsequent deploys)
- Project name: `gighub-admin-panel` (or your choice)
- Directory: `./` (you're already in admin-panel)
- Override settings? `N`

Then add environment variables:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

Redeploy after adding env vars:
```bash
vercel --prod
```

## 🔐 Environment Variables

Get these from your Supabase project dashboard:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Go to: Supabase Dashboard → Settings → API
   - Copy: "Project URL"
   - Example: `https://lhcqmeudptjasfduucmd.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Go to: Supabase Dashboard → Settings → API
   - Copy: "Project API keys" → "anon" → "public"
   - This is safe to expose in the browser

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Go to: Supabase Dashboard → Settings → API
   - Copy: "Project API keys" → "service_role" → "secret"
   - ⚠️ Keep this secret! Only use in server-side code

## 🔧 Post-Deployment Configuration

### 1. Set Vercel Domain in Supabase

Add your Vercel domain to Supabase allowed redirects:

1. Go to: Supabase Dashboard → Authentication → URL Configuration
2. Add to "Redirect URLs":
   ```
   https://your-app.vercel.app/**
   https://your-custom-domain.com/**
   ```

### 2. Verify Admin User

Make sure at least one admin user exists:

```sql
-- Check admin users
SELECT id, email, role 
FROM profiles 
WHERE role = 'admin';
```

If none exist, create one:
```sql
-- Set existing user as admin
UPDATE profiles 
SET role = 'admin' 
WHERE id = '[user-id-from-auth-users]';
```

### 3. Test Deployment

1. Visit your deployed URL
2. Navigate to `/login`
3. Login with admin credentials
4. Verify:
   - Dashboard loads with stats
   - Can view pending applications
   - Can see document images
   - Can approve/reject applications
   - Real-time updates work

## 🐛 Troubleshooting

### Build Fails on Vercel

**Issue**: Build errors
**Solution**: 
- Check build logs in Vercel dashboard
- Verify environment variables are set correctly
- Ensure Root Directory is set to `admin-panel`

### Images Not Loading

**Issue**: Document images show "Loading..." forever
**Solution**:
- Verify storage policies are in place
- Check Supabase storage bucket is named `verification-documents`
- Ensure admin user has `role = 'admin'` in profiles table

### "Could not find a relationship" Error

**Issue**: No data showing on dashboard
**Solution**:
- Verify RLS policies for admin access are created
- Check admin user role in profiles table
- Review Supabase logs for policy errors

### Middleware Redirect Loop

**Issue**: Infinite redirects between /login and /dashboard
**Solution**:
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Check Supabase Auth is enabled
- Clear browser cookies and try again

## 📊 Monitoring

### Vercel Analytics
- Automatic in Vercel deployment
- View: Vercel Dashboard → Your Project → Analytics

### Supabase Logs
- Real-time logs: Supabase Dashboard → Logs
- Monitor auth attempts, database queries, and storage access

## 🔄 Updates and Redeployment

Vercel automatically redeploys on git push to main branch.

Manual redeploy:
```bash
cd admin-panel
vercel --prod
```

Or trigger from Vercel dashboard:
- Go to your project → Deployments
- Click "..." → "Redeploy"

## 📝 Custom Domain (Optional)

1. Go to: Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Add domain to Supabase Auth redirect URLs

## ✅ Success Checklist

After deployment, verify:
- [ ] App loads at Vercel URL
- [ ] Login page accessible at `/login`
- [ ] Can login with admin credentials
- [ ] Dashboard shows correct stats (6 pending, 4 approved, 2 rejected)
- [ ] Can view pending applications list
- [ ] Can open application details
- [ ] Document images load correctly
- [ ] Can approve an application
- [ ] Can reject an application with reason
- [ ] Real-time updates work (stats update after approval/rejection)
- [ ] Approved/Rejected lists update automatically

## 🆘 Support

If you encounter issues:
1. Check Vercel build logs
2. Check Supabase logs
3. Verify environment variables
4. Review this checklist

---

**Deployment Time**: ~5-10 minutes
**Cost**: Free tier available on both Vercel and Supabase
