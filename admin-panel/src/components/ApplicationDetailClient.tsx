'use client'

import { useState, useEffect } from 'react'
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
  const [frontImageUrl, setFrontImageUrl] = useState<string | null>(null)
  const [backImageUrl, setBackImageUrl] = useState<string | null>(null)
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const extractFilePath = (url: string) => {
      // If it's a full URL, extract just the file path
      if (url.startsWith('http')) {
        // Extract path after the bucket name or user ID folder
        const match = url.match(/\/([a-f0-9-]+\/[^?]+)$/i) || url.match(/public\/(.+)$/);
        return match ? match[1] : url;
      }
      // If it already starts with bucket name, remove it
      return url.replace('verification-documents/', '').replace(/^\/+/, '');
    };

    const loadImages = async () => {
      if (application.front_image_url) {
        const filePath = extractFilePath(application.front_image_url);
        const { data, error } = await supabase.storage
          .from('verification-documents')
          .createSignedUrl(filePath, 3600);
        
        if (error && process.env.NODE_ENV === 'development') {
          console.error('Error loading front image:', error, 'Path:', filePath);
        }
        if (data?.signedUrl) {
          setFrontImageUrl(data.signedUrl);
        }
      }

      if (application.back_image_url) {
        const filePath = extractFilePath(application.back_image_url);
        const { data, error } = await supabase.storage
          .from('verification-documents')
          .createSignedUrl(filePath, 3600);
        
        if (error && process.env.NODE_ENV === 'development') {
          console.error('Error loading back image:', error, 'Path:', filePath);
        }
        if (data?.signedUrl) {
          setBackImageUrl(data.signedUrl);
        }
      }
    }

    loadImages()
  }, [application.front_image_url, application.back_image_url, supabase])

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
      
      const { error: error2 } = await supabase
        .from("profiles")
        .update({
          role: "provider"
        })
        .eq('id', application.user_id) && console.log("Updated")
      console.log(application.user_id)

      if (error || error2) throw error || error2

      router.push('/dashboard/pending')
      router.refresh()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error approving application:', error)
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Error rejecting application:', error)
      }
      alert('Failed to reject application')
    } finally {
      setLoading(false)
    }
  }

  const displayName = profile?.full_name || 
                      `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
                      profile?.phone_number || 
                      'Unknown User'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <Link href="/dashboard/pending">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Application Details</h2>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {application.front_image_url && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Front Image
                    </p>
                    <div 
                      className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-green-500 active:border-green-600 transition-all duration-200 hover:shadow-lg"
                      onClick={() => frontImageUrl && setLightboxImage({ url: frontImageUrl, title: 'Front ID Image' })}
                    >
                      {frontImageUrl ? (
                        <Image
                          src={frontImageUrl}
                          alt="Front ID"
                          fill
                          className="object-contain hover:scale-105 transition-transform duration-200"
                          unoptimized
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500">Loading...</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {application.back_image_url && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Back Image
                    </p>
                    <div 
                      className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-green-500 active:border-green-600 transition-all duration-200 hover:shadow-lg"
                      onClick={() => backImageUrl && setLightboxImage({ url: backImageUrl, title: 'Back ID Image' })}
                    >
                      {backImageUrl ? (
                        <Image
                          src={backImageUrl}
                          alt="Back ID"
                          fill
                          className="object-contain hover:scale-105 transition-transform duration-200"
                          unoptimized
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500">Loading...</p>
                        </div>
                      )}
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
                  className="w-full min-h-[44px]"
                  onClick={handleApprove}
                  loading={loading}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Application
                </Button>

                <Button
                  variant="danger"
                  className="w-full min-h-[44px]"
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

      {/* Image Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                {lightboxImage.title}
              </h3>
              <button
                onClick={() => setLightboxImage(null)}
                className="text-white hover:text-gray-300 transition-colors p-2"
                aria-label="Close"
              >
                <XCircle className="w-8 h-8" />
              </button>
            </div>
            
            {/* Image Container */}
            <div 
              className="relative flex-1 rounded-lg overflow-hidden bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightboxImage.url}
                alt={lightboxImage.title}
                fill
                className="object-contain animate-in zoom-in-95 duration-300"
                unoptimized
                quality={100}
              />
            </div>

            {/* Instructions */}
            <p className="text-center text-gray-400 mt-4 text-sm">
              Click outside the image to close
            </p>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto">
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
              />
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                variant="outline"
                className="w-full sm:flex-1 min-h-[44px]"
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
                className="w-full sm:flex-1 min-h-[44px]"
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
