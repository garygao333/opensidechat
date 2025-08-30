//simple fade in and slide up animation component

'use client'

import { useEffect, useRef, useState } from 'react'

interface FadeContentProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

export default function FadeContent({ 
  children, 
  delay = 0, 
  duration = 1000, 
  className = '' 
}: FadeContentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  //this is used to handle the intersecion observer for the fade content

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
        }
      },
      { threshold: 0.1 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [delay])

  //this is used to render the fade content

  return (
    <div
      ref={elementRef}
      className={`transition-all ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  )
}
