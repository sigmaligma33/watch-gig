'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeServices() {
  const [version, setVersion] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('service_listings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_listings'
        },
        (payload) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Service listing changed:', payload)
          }
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
