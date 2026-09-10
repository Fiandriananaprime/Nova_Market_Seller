import { createContext, useContext, useEffect, useState } from "react"
import i18n from "../i18n"

type Language = "fr" | "en"

interface I18nContextType {
  language: Language
  setLanguage: (language: Language) => void
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(
    (i18n.language as Language) || "fr"
  )

  const setLanguage = (language: Language) => {
    i18n.changeLanguage(language)
    setLanguageState(language)
  }

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setLanguageState(lng as Language)
    }

    i18n.on("languageChanged", handleLanguageChanged)

    return () => {
      i18n.off("languageChanged", handleLanguageChanged)
    }
  }, [])

  return (
    <I18nContext.Provider value={{ language, setLanguage }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useLang() {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error("useLang must be used inside I18nProvider")
  }

  return context
}