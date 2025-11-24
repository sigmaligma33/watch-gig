'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { FileText, Calendar, Building, Phone } from 'lucide-react'
import { useRealtimeVerifications } from '@/hooks/useRealtimeVerifications'

interface Profile {
  full_name?: string
  first_name?: string
  last_name?: string
  phone_number?: string
  business_name?: string
}

interface Application {
  id: string
  status: string
  created_at: string
  reviewed_at?: string
  rejection_reason?: string
  profiles?: Profile
}

interface ApplicationsListClientProps {
  applications: Application[]
  title: string
}

export default function ApplicationsListClient({ applications, title }: ApplicationsListClientProps) {
  const router = useRouter()
  const version = useRealtimeVerifications()

  useEffect(() => {
    // Refresh data when real-time changes occur
    if (version > 0) {
      router.refresh()
    }
  }, [version, router])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
          Review and manage verification requests
        </p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <FileText className="w-12 md:w-16 h-12 md:h-16 mx-auto mb-4 opacity-50" />
              <p className="text-base md:text-lg font-medium">No applications found</p>
              <p className="text-xs md:text-sm mt-1">There are no {title.toLowerCase()} at the moment</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {applications.map((app) => {
            const displayName = app.profiles?.full_name || 
                              `${app.profiles?.first_name || ''} ${app.profiles?.last_name || ''}`.trim() ||
                              app.profiles?.phone_number || 
                              'Unknown User'

            return (
              <Link key={app.id} href={`/dashboard/applications/${app.id}`}>
                <Card hover className="cursor-pointer active:scale-[0.98] transition-transform">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                            {displayName}
                          </h3>
                          <Badge
                            variant={
                              app.status === 'pending'
                                ? 'warning'
                                : app.status === 'verified'
                                ? 'success'
                                : 'danger'
                            }
                          >
                            {app.status}
                          </Badge>
                        </div>
                        
                        {app.profiles?.business_name && (
                          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                            <Building className="w-3 md:w-4 h-3 md:h-4 flex-shrink-0" />
                            <span className="truncate">{app.profiles.business_name}</span>
                          </p>
                        )}
                        
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <Phone className="w-3 md:w-4 h-3 md:h-4 flex-shrink-0" />
                          <span>{app.profiles?.phone_number || 'N/A'}</span>
                        </p>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 text-xs text-gray-500 dark:text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            Submitted: {new Date(app.created_at).toLocaleDateString()}
                          </span>
                          {app.reviewed_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              Reviewed: {new Date(app.reviewed_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {app.rejection_reason && (
                          <div className="mt-3 p-2 md:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <p className="text-xs md:text-sm text-red-800 dark:text-red-300 break-words">
                              <strong>Rejection Reason:</strong> {app.rejection_reason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
