import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react"
import { useNavigate, useLocation } from "react-router"
import { useTranslation } from "react-i18next"
import type { Driver } from "driver.js"
import { createNovaDriver } from "../config/driverConfig"
import { tutorialService } from "../services/tutorialService"
import { sellerOnboardingTour } from "../tours/sellerOnboarding"
import { allTours } from "../tours/sectionTours"
import type { TourDefinition, TourId } from "../types"

export interface TutorialContextValue {
  isTourActive: boolean
  activeTourId: TourId | null
  startTour: (tour: TourDefinition, onComplete?: () => void) => Promise<void>
  replayTour: (tourId: TourId) => Promise<void>
  stopTour: () => void
}

const TutorialContext = createContext<TutorialContextValue | null>(null)

let globalDriverInstance: Driver | null = null

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const [isTourActive, setIsTourActive] = useState(false)
  const [activeTourId, setActiveTourId] = useState<TourId | null>(null)
  const isNavigatingRef = useRef(false)
  const isStartingRef = useRef(false)

  const stopTour = useCallback(() => {
    if (globalDriverInstance) {
      try {
        globalDriverInstance.destroy()
      } catch (err) {
        console.warn("Driver destroy warning:", err)
      }
      globalDriverInstance = null
    }
    setIsTourActive(false)
    setActiveTourId(null)
    isNavigatingRef.current = false
    isStartingRef.current = false
  }, [])

  const startTour = useCallback(
    async (tour: TourDefinition, onComplete?: () => void) => {
      // Prevent overlapping concurrent start calls
      if (isStartingRef.current) return
      isStartingRef.current = true

      try {
        // Destroy existing instance first
        stopTour()

        setActiveTourId(tour.id)
        setIsTourActive(true)

        // 1. Navigate if current route does not match tour entry route
        if (location.pathname !== tour.route) {
          isNavigatingRef.current = true
          navigate(tour.route)
        }

        const firstSelector = tour.steps[0]?.element
        if (!firstSelector) {
          stopTour()
          return
        }

        // 2. Wait for first element to be mounted in the DOM
        const el = await tutorialService.waitForElement(firstSelector, 5000)
        if (!el) {
          console.warn(`[Tutorial] Element ${firstSelector} not found within timeout for tour "${tour.id}".`)
          stopTour()
          return
        }

        // 3. Create driver instance with Nova Market theme and localized labels
        const driver = createNovaDriver(tour, {
          t,
          onDestroyed: () => {
            globalDriverInstance = null
            setIsTourActive(false)
            setActiveTourId(null)
            isStartingRef.current = false
            onComplete?.()
          },
        })

        globalDriverInstance = driver

        // 4. Brief delay to let the browser finalize layout before spotlighting
        setTimeout(() => {
          if (globalDriverInstance === driver) {
            try {
              driver.drive()
            } catch (err) {
              console.error("Failed to start Driver tour:", err)
              stopTour()
            }
          }
        }, 150)
      } finally {
        isStartingRef.current = false
      }
    },
    [location.pathname, navigate, stopTour, t]
  )

  const replayTour = useCallback(
    async (tourId: TourId) => {
      const tour =
        tourId === "onboarding"
          ? sellerOnboardingTour
          : allTours.find((t) => t.id === tourId)
      if (tour) {
        await startTour(tour)
      } else {
        console.warn(`[Tutorial] Tour "${tourId}" not found.`)
      }
    },
    [startTour]
  )

  // Automatic launch on login session upon reaching dashboard
  useEffect(() => {
    if (location.pathname !== "/" && location.pathname !== "/dashboard") return
    if (!tutorialService.isAuthenticated()) return
    if (tutorialService.hasOnboardingLaunchedInCurrentSession()) return
    if (isTourActive) return

    tutorialService.markOnboardingLaunchedInCurrentSession()

    const timer = setTimeout(async () => {
      const readyEl = await tutorialService.waitForElement('[data-tour="dashboard-overview"]', 4000)
      if (readyEl) {
        startTour(sellerOnboardingTour)
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [location.pathname, isTourActive, startTour])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTour()
    }
  }, [stopTour])

  return (
    <TutorialContext.Provider
      value={{
        isTourActive,
        activeTourId,
        startTour,
        replayTour,
        stopTour,
      }}
    >
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  const ctx = useContext(TutorialContext)
  if (!ctx) {
    throw new Error("useTutorial must be used within a TutorialProvider")
  }
  return ctx
}
