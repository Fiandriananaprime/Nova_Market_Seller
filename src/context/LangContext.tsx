import { useEffect, useState } from "react"
import i18n from "../i18n"
import { I18nContext, type Language } from "./langContextValue"

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
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