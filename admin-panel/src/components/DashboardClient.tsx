'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { useRealtimeVerifications } from '@/hooks/useRealtimeVerifications'

interface Stats {
  pending: number
  approved: number
  rejected: number
}

interface Application {
  id: string
  status: string
  created_at: string
  user_id: string
  profiles?: {
    full_name?: string
    phone_number?: string
    business_name?: string
  }
}

interface DashboardClientProps {
  initialStats: Stats
  initialApplications: Application[]
}

export default function DashboardClient({ initialStats, initialApplications }: DashboardClientProps) {
  const [stats, setStats] = useState(initialStats)
  const [applications, setApplications] = useState(initialApplications)
  const router = useRouter()
  const version = useRealtimeVerifications()

  useEffect(() => {
    // Refresh data when real-time changes occur
    if (version > 0) {
      router.refresh()
    }
  }, [version, router])

  const statCards = [
    {
      title: 'Pending Applications',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      href: '/dashboard/pending',
    },
    {
      title: 'Approved',
      value: stats.approved,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      href: '/dashboard/approved',
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      href: '/dashboard/rejected',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitor and manage service provider verifications
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card hover className="cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Applications
            </h3>
            <Link
              href="/dashboard/pending"
              className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 font-medium"
            >
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No applications yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <Link
                  key={app.id}
                  href={`/dashboard/applications/${app.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {app.profiles?.full_name || app.profiles?.phone_number || 'Unknown User'}
                      </p>
                      {app.profiles?.business_name && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {app.profiles.business_name}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
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
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
