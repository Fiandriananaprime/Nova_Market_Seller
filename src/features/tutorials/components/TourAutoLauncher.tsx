import { useEffect, useRef } from "react"
import { useLocation } from "react-router"
import { tutorialService } from "../services/tutorialService"
import { sellerOnboardingTour } from "../tours/sellerOnboarding"
import { useTutorial } from "../hooks/useTutorial"

   
                    
                                                                                 
                                                                            
   
export const TourAutoLauncher = () => {
  const location = useLocation()
  const { startTour, stopTour } = useTutorial()
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
                                                          
    if (location.pathname !== "/" && location.pathname !== "/dashboard") {
      return
    }

                                                                                                     
    if (hasTriggeredRef.current) return
    if (!tutorialService.isAuthenticated()) return
    if (tutorialService.hasOnboardingLaunchedInCurrentSession()) return

    hasTriggeredRef.current = true

                                                                                                
    tutorialService.markOnboardingLaunchedInCurrentSession()

                                                               
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

                                                                  
  useEffect(() => {
    return () => {
      stopTour()
    }
  }, [stopTour])

  return null
};
