"use client"

import type React from "react"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
}

// Simple analytics tracking
function trackEvent(event: AnalyticsEvent) {
  // In a real app, this would send data to an analytics service
  console.log(`[Analytics] ${event.name}`, event.properties)
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Track page views
  useEffect(() => {
    const url = `${pathname}${searchParams ? `?${searchParams}` : ""}`

    trackEvent({
      name: "page_view",
      properties: {
        url,
        referrer: document.referrer,
        title: document.title,
      },
    })
  }, [pathname, searchParams])

  return children
}
