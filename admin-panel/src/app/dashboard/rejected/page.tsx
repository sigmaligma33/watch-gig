import { createClient } from '@/lib/supabase/server'
import ApplicationsListClient from '@/components/ApplicationsListClient'

async function getApplications() {
  const supabase = await createClient()
  
  const { data: applications, error } = await supabase
    .from('verification_requests')
    .select('*')
    .eq('status', 'denied')
    .order('reviewed_at', { ascending: false })

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
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, phone_number, business_name, first_name, last_name')
    .in('id', userIds)

  // Merge profiles with applications
  const applicationsWithProfiles = applications.map(app => ({
    ...app,
    profiles: profiles?.find(p => p.id === app.user_id)
  }))

  return applicationsWithProfiles
}

export default async function RejectedApplicationsPage() {
  const applications = await getApplications()

  return <ApplicationsListClient applications={applications} title="Rejected Applications" />
}
