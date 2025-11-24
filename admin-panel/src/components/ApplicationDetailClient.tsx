'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card'
import { ArrowLeft, User, Phone, Building, Calendar, FileText, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ApplicationDetailClientProps {
  application: any
  profile: any
}

export function ApplicationDetailClient({ application, profile }: ApplicationDetailClientProps) {
  const [loading, setLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleApprove = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'verified',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', application.id)

      if (error) throw error

      router.push('/dashboard/pending')
      router.refresh()
    } catch (error) {
      console.error('Error approving application:', error)
      alert('Failed to approve application')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'denied',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          rejection_reason: rejectionReason,
        })
        .eq('id', application.id)

      if (error) throw error

      router.push('/dashboard/pending')
      router.refresh()
    } catch (error) {
      console.error('Error rejecting application:', error)
      alert('Failed to reject application')
    } finally {
      setLoading(false)
    }
  }

  const displayName = profile?.full_name || 
                      `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
                      profile?.phone_number || 
                      'Unknown User'

  const getStorageUrl = (path: string | null) => {
    if (!path) return null
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    return `${supabaseUrl}/storage/v1/object/public/${path}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/pending">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Application Details</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Review application and verification documents
            </p>
          </div>
        </div>
        
        <Badge
          variant={
            application.status === 'pending'
              ? 'warning'
              : application.status === 'verified'
              ? 'success'
              : 'danger'
          }
        >
          {application.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applicant Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Applicant Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{displayName}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Phone Number</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {profile?.phone_number || 'N/A'}
                  </p>
                </div>
              </div>

              {profile?.business_name && (
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Business Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {profile.business_name}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Submitted</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(application.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {application.verification_type && (
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Verification Type</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {application.verification_type}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Verification Documents
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.front_image_url && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Front Image
                    </p>
                    <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <Image
                        src={getStorageUrl(application.front_image_url) || ''}
                        alt="Front ID"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}

                {application.back_image_url && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Back Image
                    </p>
                    <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <Image
                        src={getStorageUrl(application.back_image_url) || ''}
                        alt="Back ID"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}

                {!application.front_image_url && !application.back_image_url && (
                  <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No documents uploaded</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          {application.status === 'pending' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Actions</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="success"
                  className="w-full"
                  onClick={handleApprove}
                  loading={loading}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Application
                </Button>

                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => setShowRejectModal(true)}
                  disabled={loading}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Application
                </Button>
              </CardContent>
            </Card>
          )}

          {application.status !== 'pending' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Review Information
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <Badge
                    variant={application.status === 'verified' ? 'success' : 'danger'}
                    className="mt-1"
                  >
                    {application.status}
                  </Badge>
                </div>
                
                {application.reviewed_at && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reviewed At</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(application.reviewed_at).toLocaleString()}
                    </p>
                  </div>
                )}

                {application.rejection_reason && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Rejection Reason</p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {application.rejection_reason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Reject Application
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Please provide a reason for rejecting this application:
              </p>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
              />
            </CardContent>
            <CardFooter className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleReject}
                loading={loading}
              >
                Reject
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
