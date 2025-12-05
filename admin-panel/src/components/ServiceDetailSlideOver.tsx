'use client'

import { useState, useEffect, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { 
  X, 
  User, 
  Phone, 
  Building, 
  Calendar, 
  Tag, 
  MapPin, 
  Clock, 
  Mail, 
  FileText, 
  DollarSign,
  CheckCircle,
  XCircle,
  ChevronRight,
  ArrowLeft,
  Star,
  Shield
} from 'lucide-react'
import Image from 'next/image'
import { ServiceListingWithProfile, Profile } from '@/lib/types/database.types'

interface ServiceDetailSlideOverProps {
  service: ServiceListingWithProfile | null
  isOpen: boolean
  onClose: () => void
}

export default function ServiceDetailSlideOver({ service, isOpen, onClose }: ServiceDetailSlideOverProps) {
  const [loading, setLoading] = useState(false)
  const [showProviderProfile, setShowProviderProfile] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Reset provider profile view when service changes
  useEffect(() => {
    setShowProviderProfile(false)
  }, [service?.id])

  if (!service) return null

  const handleToggleVerification = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const newVerifiedStatus = !service.is_verified
      
      const { error } = await supabase
        .from('service_listings')
        .update({
          is_verified: newVerifiedStatus,
          is_active: newVerifiedStatus ? true : service.is_active, // Activate service when verified
          verified_by: newVerifiedStatus ? user?.id : null,
          verified_at: newVerifiedStatus ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', service.id)

      if (error) throw error

      router.refresh()
      onClose()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error toggling verification:', error)
      }
      alert('Failed to update verification status')
    } finally {
      setLoading(false)
    }
  }

  const getDisplayName = (profile: Profile | null) => {
    if (!profile) return 'Unknown Provider'
    return profile.full_name || 
           `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
           profile.phone_number || 
           'Unknown Provider'
  }

  const formatAvailability = () => {
    if (!service.availability_start_day || !service.availability_end_day) return null
    const days = `${service.availability_start_day} - ${service.availability_end_day}`
    const time = service.availability_start_time && service.availability_end_time 
      ? `${service.availability_start_time} - ${service.availability_end_time}`
      : ''
    return `${days}${time ? `, ${time}` : ''}`
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Slide Over Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] md:w-[540px] bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800">
            {showProviderProfile ? (
              <button
                onClick={() => setShowProviderProfile(false)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Service</span>
              </button>
            ) : (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Service Details</h2>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {showProviderProfile ? (
              // Provider Profile View
              <ProviderProfileView profile={service.profile} />
            ) : (
              // Service Details View
              <>
                {/* Service Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {service.service_name || 'Unnamed Service'}
                    </h3>
                    <div className="flex gap-2 flex-shrink-0">
                      <Badge variant={service.is_verified ? 'success' : 'warning'}>
                        {service.is_verified ? 'Verified' : 'Pending'}
                      </Badge>
                      {service.is_active === false && (
                        <Badge variant="default">Inactive</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Tag className="w-4 h-4" />
                    <span>{service.service_category}</span>
                  </div>
                </div>

                {/* Service Images */}
                {service.image_urls && service.image_urls.length > 0 && (
                  <Card>
                    <CardHeader>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Service Images</h4>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="grid grid-cols-2 gap-2">
                        {service.image_urls.slice(0, 4).map((url, index) => (
                          <div 
                            key={index}
                            className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
                          >
                            <Image
                              src={url}
                              alt={`Service image ${index + 1}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>
                      {service.image_urls.length > 4 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                          +{service.image_urls.length - 4} more images
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Provider Info - Clickable */}
                <Card 
                  hover 
                  className="cursor-pointer"
                  onClick={() => setShowProviderProfile(true)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                          {service.profile?.avatar_url ? (
                            <Image
                              src={service.profile.avatar_url}
                              alt="Provider"
                              width={48}
                              height={48}
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {getDisplayName(service.profile)}
                          </p>
                          {service.profile?.business_name && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {service.profile.business_name}
                            </p>
                          )}
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Tap to view profile
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>

                {/* Service Details */}
                <Card>
                  <CardHeader>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Service Information</h4>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {service.description && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
                        <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                          {service.description}
                        </p>
                      </div>
                    )}

                    {service.price_estimate && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Price Estimate</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {service.price_estimate}
                          </p>
                        </div>
                      </div>
                    )}

                    {service.service_areas && service.service_areas.length > 0 && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Service Areas</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {service.service_areas.map((area, index) => (
                              <span 
                                key={index}
                                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 rounded-full"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {formatAvailability() && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Availability</p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {formatAvailability()}
                          </p>
                        </div>
                      </div>
                    )}

                    {service.contacts && service.contacts.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Contact Numbers</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {service.contacts.map((contact, index) => (
                              <span key={index} className="text-sm text-gray-900 dark:text-white">
                                {contact}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {service.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                          <p className="text-sm text-gray-900 dark:text-white">{service.email}</p>
                        </div>
                      </div>
                    )}

                    {service.ratings !== null && service.ratings !== undefined && (
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                          <p className="text-sm text-gray-900 dark:text-white">{service.ratings}/5</p>
                        </div>
                      </div>
                    )}

                    {service.service_terms && (
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Terms & Conditions</p>
                          <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                            {service.service_terms}
                          </p>
                        </div>
                      </div>
                    )}

                    {service.created_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Created At</p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {new Date(service.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {service.verified_at && (
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Verified At</p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {new Date(service.verified_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Footer with Toggle */}
          {!showProviderProfile && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  variant={service.is_verified ? 'danger' : 'success'}
                  className="flex-1"
                  onClick={handleToggleVerification}
                  loading={loading}
                >
                  {service.is_verified ? (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Revoke Verification
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify Service
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Provider Profile Component
function ProviderProfileView({ profile }: { profile: Profile | null }) {
  if (!profile) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>Provider information not available</p>
      </div>
    )
  }

  const displayName = profile.full_name || 
                      `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
                      'Unknown'

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="text-center py-4">
        <div className="w-24 h-24 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden mb-4">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt="Provider"
              width={96}
              height={96}
              className="object-cover"
              unoptimized
            />
          ) : (
            <User className="w-12 h-12 text-gray-500 dark:text-gray-400" />
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{displayName}</h3>
        {profile.business_name && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{profile.business_name}</p>
        )}
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant={profile.role === 'provider' ? 'info' : 'default'}>
            {profile.role}
          </Badge>
          {profile.national_id_verified && (
            <Badge variant="success">
              <Shield className="w-3 h-3 mr-1" />
              ID Verified
            </Badge>
          )}
        </div>
      </div>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Information</h4>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Phone Number</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {profile.phone_number || 'N/A'}
              </p>
            </div>
          </div>

          {profile.business_name && (
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Business Name</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {profile.business_name}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {profile.bio && (
        <Card>
          <CardHeader>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</h4>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
              {profile.bio}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Verification Status</h4>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className={`w-5 h-5 ${profile.national_id_verified ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="text-sm text-gray-900 dark:text-white">National ID</span>
            </div>
            <Badge variant={profile.national_id_verified ? 'success' : 'warning'}>
              {profile.national_id_verified ? 'Verified' : 'Not Verified'}
            </Badge>
          </div>

          {profile.national_id_number && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">ID Number</p>
              <p className="text-sm font-mono text-gray-900 dark:text-white">
                {profile.national_id_number}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Info</h4>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p>
              <p className="text-sm text-gray-900 dark:text-white">
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {profile.updated_at && (
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(profile.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
