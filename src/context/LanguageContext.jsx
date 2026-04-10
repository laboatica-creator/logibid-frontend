import { createContext, useState, useContext, useEffect } from 'react'
import es from '../locales/es.json'
import en from '../locales/en.json'
import pt from '../locales/pt.json'
import fr from '../locales/fr.json'
import de from '../locales/de.json'

const translations = { es, en, pt, fr, de }

const LanguageContext = createContext()

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('locale') || 'es'
  })

  // Permitr refresco automático al cambiar idioma
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (path) => {
    const keys = path.split('.')
    let value = translations[locale]
    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key]
      } else {
        return path
      }
    }
    return value || path
  }

  const changeLanguage = (newLocale) => {
    setLocale(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  return (
    <LanguageContext.Provider value={{ locale, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
