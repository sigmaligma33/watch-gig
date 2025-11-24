'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VerificationRequest } from '@/lib/types/database.types'

export function useRealtimeVerifications() {
  const [version, setVersion] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('verification_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'verification_requests'
        },
        (payload) => {
          console.log('Verification request changed:', payload)
          // Increment version to trigger re-fetch
          setVersion(v => v + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return version
}
