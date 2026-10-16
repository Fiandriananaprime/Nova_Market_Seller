import { useContext } from "react"
import { I18nContext } from "./langContextValue"

export const useLang = () => {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error("useLang must be used inside I18nProvider")
  }

  return context
}
