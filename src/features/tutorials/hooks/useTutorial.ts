import { useContext } from "react"
import { TutorialContext } from "../context/tutorialContextValue"

export const useTutorial = () => {
  const context = useContext(TutorialContext)
  if (!context) {
    throw new Error("useTutorial must be used within a TutorialProvider")
  }
  return context
}

export type { TutorialContextValue } from "../context/tutorialContextValue"
