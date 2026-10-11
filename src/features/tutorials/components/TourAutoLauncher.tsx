import { useEffect, useRef } from "react"
import { useLocation } from "react-router"
import { tutorialService } from "../services/tutorialService"
import { sellerOnboardingTour } from "../tours/sellerOnboarding"
import { useTutorial } from "../hooks/useTutorial"

/**
 * TourAutoLauncher:
 * Sits in the authenticated Shell and automatically triggers the onboarding tour
 * exactly once per login session upon reaching the authenticated dashboard.
 */
export function TourAutoLauncher() {
  const location = useLocation()
  const { startTour, stopTour } = useTutorial()
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    // Only attempt on the main dashboard page after login
    if (location.pathname !== "/" && location.pathname !== "/dashboard") {
      return
    }

    // Do not trigger if already triggered in this React mount or if already launched in this session
    if (hasTriggeredRef.current) return
    if (!tutorialService.isAuthenticated()) return
    if (tutorialService.hasOnboardingLaunchedInCurrentSession()) return

    hasTriggeredRef.current = true

    // Mark launched in session so repeated renders or navigation do not trigger duplicate tours
    tutorialService.markOnboardingLaunchedInCurrentSession()

    // Launch onboarding tour safely after elements are painted
    const timer = setTimeout(async () => {
      const el = await tutorialService.waitForElement('[data-tour="dashboard-overview"]', 4000)
      if (el) {
        startTour(sellerOnboardingTour)
      }
    }, 600)

    return () => {
      clearTimeout(timer)
    }
  }, [location.pathname, startTour])

  // Cleanup on unmount (e.g. if logging out while tour is active)
  useEffect(() => {
    return () => {
      stopTour()
    }
  }, [stopTour])

  return null
}
