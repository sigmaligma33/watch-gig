import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ApplicationDetailClient } from '@/components/ApplicationDetailClient'

async function getApplication(id: string) {
  const supabase = await createClient()
  
  const { data: application, error } = await supabase
    .from('verification_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !application) {
    return null
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', application.user_id)
    .single()

  return {
    ...application,
    profiles: profile
  }
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const application = await getApplication(id)

  if (!application) {
    notFound()
  }

  return <ApplicationDetailClient application={application} profile={application.profiles} />
}
