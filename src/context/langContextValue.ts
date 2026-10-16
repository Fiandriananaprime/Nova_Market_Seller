import { createContext } from "react"

export type Language = "fr" | "en"

export interface I18nContextType {
  language: Language
  setLanguage: (language: Language) => void
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined)
