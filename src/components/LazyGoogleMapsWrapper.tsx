'use client'

import { useState, useEffect, useRef, ReactNode } from 'react'
import { GoogleMapsProvider } from '@/contexts/GoogleMapsContext'
import { MapIcon } from '@heroicons/react/24/outline'

interface Props {
  children: ReactNode
  /** Clases de altura para el placeholder antes de que cargue el mapa */
  placeholderHeight?: string
}

export default function LazyGoogleMapsWrapper({
  children,
  placeholderHeight = 'h-80 lg:h-96',
}: Props) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '300px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (!shouldLoad) {
    return (
      <div
        ref={ref}
        className={`relative ${placeholderHeight} rounded-2xl overflow-hidden border border-neutral-gray shadow-sm bg-neutral-light flex items-center justify-center`}
      >
        <div className="text-center text-neutral-muted">
          <MapIcon className="h-10 w-10 text-primary-blue mx-auto mb-4" />
          <p className="text-base font-semibold">Cabo de Palos, Cartagena</p>
        </div>
      </div>
    )
  }

  return <GoogleMapsProvider>{children}</GoogleMapsProvider>
}
