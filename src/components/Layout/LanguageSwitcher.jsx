import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const languages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
]

const LanguageSwitcher = () => {
  const { locale, changeLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  const activeLang = languages.find(lang => lang.code === locale)

  // Cerrar al click externo
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
      >
        <Globe className="w-5 h-5 text-gray-600" />
        <span className="text-xl leading-none" title={activeLang?.name}>{activeLang?.flag}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-[9999]"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-3 text-sm font-semibold flex items-center gap-3 transition-colors ${
                  locale === lang.code ? 'bg-primary/5 text-primary' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{lang.flag}</span> {lang.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LanguageSwitcher
