'use client'

import React from 'react'
import BharatOSShell from '../../components/citizen/BharatOSShell'
import { useCitizenStore } from '../../store/useCitizenStore'

export const useLanguage = () => {
  const { profile, setLanguage } = useCitizenStore()
  return {
    lang: profile.language || 'en',
    setLang: setLanguage
  }
}

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <BharatOSShell>
      {children}
    </BharatOSShell>
  )
}
