import { createContext } from "react"
import type { TourDefinition, TourId } from "../types"

export interface TutorialContextValue {
  isTourActive: boolean
  activeTourId: TourId | null
  startTour: (tour: TourDefinition, onComplete?: () => void) => Promise<void>
  replayTour: (tourId: TourId) => Promise<void>
  stopTour: () => void
}

export const TutorialContext = createContext<TutorialContextValue | null>(null)
