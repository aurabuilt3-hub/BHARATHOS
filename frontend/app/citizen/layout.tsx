'use client'

import React, { createContext, useState, useContext } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShieldAlert, AlertTriangle, BookOpen, Layers } from 'lucide-react'
import BrandLogo from '../../components/ui/BrandLogo'

type Language = 'en' | 'te' | 'hi'

interface LanguageContextType {
  lang: Language
  setLang: (l: Language) => void
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {}
})

export const useLanguage = () => useContext(LanguageContext)

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en')
  const pathname = usePathname()

  const navItems = [
    { label: { en: 'Home', te: 'హోమ్', hi: 'होम' }, path: '/citizen', icon: Home },
    { label: { en: 'Risk', te: 'రిస్క్', hi: 'जोखिम' }, path: '/citizen/risk', icon: Layers },
    { label: { en: 'Alerts', te: 'అలర్ట్‌లు', hi: 'अलर्ट' }, path: '/citizen/alerts', icon: ShieldAlert },
    { label: { en: 'Report', te: 'రిపోర్ట్', hi: 'रिपोर्ट' }, path: '/citizen/report', icon: AlertTriangle },
    { label: { en: 'Safety', te: 'భద్రత', hi: 'सुरक्षा' }, path: '/citizen/safety', icon: BookOpen }
  ]

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col relative pb-20 select-none">
        
        {/* Top Header */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-[#030712]/90 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
          <BrandLogo size="sm" />
          
          {/* Language Selector */}
          <div className="flex border border-slate-800 rounded-lg p-0.5 bg-slate-950 text-[10px] font-mono">
            {(['en', 'te', 'hi'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  lang === l
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {l === 'en' ? 'EN' : l === 'te' ? 'తెలుగు' : 'हिन्दी'}
              </button>
            ))}
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 space-y-6">
          {children}
        </main>

        {/* Bottom Mobile Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-900 bg-[#030712]/95 backdrop-blur-xl max-w-lg mx-auto w-full flex justify-around py-2 px-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-all ${
                  isActive
                    ? 'text-blue-500 font-extrabold scale-105'
                    : 'text-slate-500 hover:text-slate-350'
                }`}
              >
                <Icon className={`h-5 w-5 mb-0.5 ${isActive ? 'text-blue-500' : 'text-slate-500'}`} />
                <span>{item.label[lang]}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </LanguageContext.Provider>
  )
}
