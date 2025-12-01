import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/DashboardClient'

async function getStats() {
  const supabase = await createClient()
  
  const [pending, approved, rejected, pendingServices, verifiedServices] = await Promise.all([
    supabase.from('verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'verified'),
    supabase.from('verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'denied'),
    supabase.from('service_listings').select('*', { count: 'exact', head: true }).eq('is_verified', false),
    supabase.from('service_listings').select('*', { count: 'exact', head: true }).eq('is_verified', true),
  ])

  if (process.env.NODE_ENV === 'development') {
    console.log('Stats:', { 
    pending: pending.count, 
    approved: approved.count, 
    rejected: rejected.count,
    pendingServices: pendingServices.count,
    verifiedServices: verifiedServices.count,
    pendingError: pending.error,
    approvedError: approved.error,
    rejectedError: rejected.error
  })
  }

  return {
    pending: pending.count || 0,
    approved: approved.count || 0,
    rejected: rejected.count || 0,
    pendingServices: pendingServices.count || 0,
    verifiedServices: verifiedServices.count || 0,
  }
}

async function getRecentApplications() {
  const supabase = await createClient()
  
  const { data: applications, error } = await supabase
    .from('verification_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (process.env.NODE_ENV === 'development') {
    console.log('Recent applications query:', { 
    count: applications?.length, 
    error,
    firstApp: applications?.[0]
  })
  }

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching applications:', error)
    }
    return []
  }

  if (!applications || applications.length === 0) {
    return []
  }

  // Get user profiles
  const userIds = applications.map(app => app.user_id)
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, phone_number, business_name')
    .in('id', userIds)

  if (process.env.NODE_ENV === 'development') {
    console.log('Profiles query:', { 
    count: profiles?.length, 
    error: profileError,
    userIds 
  })
  }

  // Merge profiles with applications
  const applicationsWithProfiles = applications.map(app => ({
    ...app,
    profiles: profiles?.find(p => p.id === app.user_id)
  }))

  return applicationsWithProfiles
}

export default async function DashboardPage() {
  const stats = await getStats()
  const recentApplications = await getRecentApplications()

  return <DashboardClient initialStats={stats} initialApplications={recentApplications} />
}
