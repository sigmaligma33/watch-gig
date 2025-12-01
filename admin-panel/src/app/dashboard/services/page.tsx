import { createClient } from '@/lib/supabase/server'
import ServicesListClient from '@/components/ServicesListClient'

async function getServices() {
  const supabase = await createClient()
  
  const { data: services, error } = await supabase
    .from('service_listings')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching services:', error)
    }
    return []
  }

  if (!services || services.length === 0) {
    return []
  }

  // Get provider profiles
  const providerIds = [...new Set(services.map(service => service.provider_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', providerIds)

  // Merge profiles with services
  const servicesWithProfiles = services.map(service => ({
    ...service,
    profile: profiles?.find(p => p.id === service.provider_id) || null
  }))

  return servicesWithProfiles
}

export default async function ServicesPage() {
  const services = await getServices()

  return <ServicesListClient services={services} />
}
