'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Briefcase, Calendar, Tag, User, MapPin, CheckCircle, XCircle } from 'lucide-react'
import { useRealtimeServices } from '@/hooks/useRealtimeServices'
import { ServiceListingWithProfile } from '@/lib/types/database.types'
import ServiceDetailSlideOver from '@/components/ServiceDetailSlideOver'

type FilterType = 'pending' | 'verified' | 'all'

interface ServicesListClientProps {
  services: ServiceListingWithProfile[]
}

export default function ServicesListClient({ services }: ServicesListClientProps) {
  const router = useRouter()
  const version = useRealtimeServices()
  const [filter, setFilter] = useState<FilterType>('pending')
  const [selectedService, setSelectedService] = useState<ServiceListingWithProfile | null>(null)
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false)

  useEffect(() => {
    // Refresh data when real-time changes occur
    if (version > 0) {
      router.refresh()
    }
  }, [version, router])

  const filteredServices = services.filter(service => {
    if (filter === 'pending') return !service.is_verified
    if (filter === 'verified') return service.is_verified
    return true
  })

  const pendingCount = services.filter(s => !s.is_verified).length
  const verifiedCount = services.filter(s => s.is_verified).length

  const handleServiceClick = (service: ServiceListingWithProfile) => {
    setSelectedService(service)
    setIsSlideOverOpen(true)
  }

  const handleCloseSlideOver = () => {
    setIsSlideOverOpen(false)
    setSelectedService(null)
  }

  const getDisplayName = (service: ServiceListingWithProfile) => {
    if (!service.profile) return 'Unknown Provider'
    return service.profile.full_name || 
           `${service.profile.first_name || ''} ${service.profile.last_name || ''}`.trim() ||
           service.profile.phone_number || 
           'Unknown Provider'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Service Verification</h2>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
          Review and verify services created by providers
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            filter === 'pending'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 ring-2 ring-yellow-500'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <XCircle className="w-4 h-4" />
          Pending
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
            {pendingCount}
          </span>
        </button>
        <button
          onClick={() => setFilter('verified')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            filter === 'verified'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 ring-2 ring-green-500'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Verified
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200">
            {verifiedCount}
          </span>
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 ring-2 ring-blue-500'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          All
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
            {services.length}
          </span>
        </button>
      </div>

      {/* Services List */}
      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Briefcase className="w-12 md:w-16 h-12 md:h-16 mx-auto mb-4 opacity-50" />
              <p className="text-base md:text-lg font-medium">No services found</p>
              <p className="text-xs md:text-sm mt-1">
                {filter === 'pending' && 'There are no pending services to verify'}
                {filter === 'verified' && 'No verified services yet'}
                {filter === 'all' && 'No services have been created yet'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredServices.map((service) => (
            <Card 
              key={service.id} 
              hover 
              className="cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => handleServiceClick(service)}
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {service.service_name || 'Unnamed Service'}
                      </h3>
                      <div className="flex gap-2">
                        <Badge variant={service.is_verified ? 'success' : 'warning'}>
                          {service.is_verified ? 'Verified' : 'Pending'}
                        </Badge>
                        {service.is_active === false && (
                          <Badge variant="default">Inactive</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Tag className="w-3 md:w-4 h-3 md:h-4 flex-shrink-0" />
                        <span className="truncate">{service.service_category}</span>
                      </p>
                      
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <User className="w-3 md:w-4 h-3 md:h-4 flex-shrink-0" />
                        <span className="truncate">{getDisplayName(service)}</span>
                        {service.profile?.business_name && (
                          <span className="text-gray-400 dark:text-gray-500 truncate">
                            ({service.profile.business_name})
                          </span>
                        )}
                      </p>
                      
                      {service.service_areas && service.service_areas.length > 0 && (
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <MapPin className="w-3 md:w-4 h-3 md:h-4 flex-shrink-0" />
                          <span className="truncate">{service.service_areas.slice(0, 2).join(', ')}</span>
                          {service.service_areas.length > 2 && (
                            <span className="text-gray-400">+{service.service_areas.length - 2} more</span>
                          )}
                        </p>
                      )}
                      
                      {service.created_at && (
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-500 flex items-center gap-2">
                          <Calendar className="w-3 md:w-4 h-3 md:h-4 flex-shrink-0" />
                          <span>Created {new Date(service.created_at).toLocaleDateString()}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Price */}
                  {service.price_estimate && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {service.price_estimate}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Service Detail Slide Over */}
      <ServiceDetailSlideOver
        service={selectedService}
        isOpen={isSlideOverOpen}
        onClose={handleCloseSlideOver}
      />
    </div>
  )
}
