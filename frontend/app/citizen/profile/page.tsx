'use client'

import React, { useState } from 'react'
import { 
  User, 
  Phone, 
  MapPin, 
  Users, 
  HeartPulse, 
  ShieldCheck, 
  Volume2, 
  Eye, 
  Type, 
  Languages, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Info, 
  Save,
  Lock
} from 'lucide-react'
import { useCitizenStore } from '../../../store/useCitizenStore'
import { AppLanguage, EmergencyContact, UserProfile } from '../../../types/citizen'

const profileTranslations = {
  en: {
    title: "PROFILE & EMERGENCY INFO",
    subtitle: "Manage personal details, emergency contacts, optional medical info, and accessibility",
    personalHeader: "Personal Contact Details",
    nameLabel: "Full Name:",
    phoneLabel: "Phone Number:",
    addressLabel: "Home / Primary Address:",
    optionalMedicalHeader: "Optional Emergency Information",
    optionalConsentNotice: "Notice: You control whether blood group or medical conditions are saved. These fields are completely optional and shared only during high-priority SOS emergency dispatch.",
    bloodGroupLabel: "Blood Group (Optional):",
    medicalConditionsLabel: "Medical Conditions / Allergies (Optional):",
    contactsHeader: "Emergency Contacts (Notification Request List):",
    addContactBtn: "Add Emergency Contact",
    simulatedBadge: "SIMULATED REQUEST",
    accessibilityHeader: "Accessibility & Interface Controls",
    voiceAlertsLabel: "Voice Alerts",
    highContrastLabel: "High-Contrast Colors",
    largeTextLabel: "Large Interface Text",
    languageHeader: "Language & Regional Settings",
    saveBtn: "Save Profile Preferences",
    saveSuccess: "Profile Preferences Updated!",
    clearCacheBtn: "Clear Local IndexedDB Cache"
  },
  te: {
    title: "ప్రొఫైల్ & అత్యవసర సమాచారం",
    subtitle: "వ్యక్తిగత వివరాలు, కాంటాక్ట్‌లు మరియు ప్రాప్యత నియంత్రణలు",
    personalHeader: "వ్యక్తిగత సంప్రదింపు వివరాలు",
    nameLabel: "పూర్తి పేరు:",
    phoneLabel: "ఫోన్ నంబర్:",
    addressLabel: "చిరునామా:",
    optionalMedicalHeader: "ఐచ్ఛిక అత్యవసర సమాచారం",
    optionalConsentNotice: "గమనిక: ఈ వివరాలు పూర్తిగా ఐచ్ఛికం. అత్యవసర సమయంలో మాత్రమే పంచుకోబడతాయి.",
    bloodGroupLabel: "బ్లడ్ గ్రూప్ (ఐచ్ఛికం):",
    medicalConditionsLabel: "వైద్య పరిస్థితులు (ఐచ్ఛికం):",
    contactsHeader: "అత్యవసర కాంటాక్ట్‌లు:",
    addContactBtn: "కాంటాక్ట్ జోడించండి",
    simulatedBadge: "సిమ్యులేటెడ్ అభ్యర్థన",
    accessibilityHeader: "ప్రాప్యత నియంత్రణలు",
    voiceAlertsLabel: "వాయిస్ అలర్ట్‌లు",
    highContrastLabel: "హై-కాంట్రాస్ట్ రంగులు",
    largeTextLabel: "పెద్ద టెక్స్ట్",
    languageHeader: "భాష ఎంపిక",
    saveBtn: "వివరాలను సేవ్ చేయండి",
    saveSuccess: "ప్రొఫైల్ అప్‌డేట్ చేయబడింది!",
    clearCacheBtn: "లోకల్ క్యాష్ క్లియర్ చేయండి"
  },
  hi: {
    title: "प्रोफाइल व आपातकालीन जानकारी",
    subtitle: "व्यक्तिगत विवरण, संपर्क व पहुंच नियंत्रण प्रबंधित करें",
    personalHeader: "व्यक्तिगत संपर्क विवरण",
    nameLabel: "पूरा नाम:",
    phoneLabel: "फोन नंबर:",
    addressLabel: "पता:",
    optionalMedicalHeader: "वैकल्पिक आपातकालीन जानकारी",
    optionalConsentNotice: "नोट: ये विवरण पूरी तरह से वैकल्पिक हैं और केवल आपात स्थिति में साझा किए जाते हैं।",
    bloodGroupLabel: "रक्त समूह (वैकल्पिक):",
    medicalConditionsLabel: "चिकित्सा स्थिति (वैकल्पिक):",
    contactsHeader: "आपातकालीन संपर्क सूची:",
    addContactBtn: "संपर्क जोड़ें",
    simulatedBadge: "सिम्युलेटेड अनुरोध",
    accessibilityHeader: "पहुंच नियंत्रण",
    voiceAlertsLabel: "वॉइस अलर्ट",
    highContrastLabel: "उच्च-विपरीत रंग",
    largeTextLabel: "बड़ा टेक्स्ट",
    languageHeader: "भाषा चयन",
    saveBtn: "प्रोफाइल सहेजें",
    saveSuccess: "प्रोफाइल अपडेट की गई!",
    clearCacheBtn: "लोकल कैश साफ़ करें"
  }
}

export default function CitizenProfilePage() {
  const { profile, updateProfile, setLanguage } = useCitizenStore()
  const lang: AppLanguage = profile.language || 'en'
  const t = profileTranslations[lang as 'en' | 'te' | 'hi'] || profileTranslations.en

  // Form local states
  const [name, setName] = useState(profile.name || '')
  const [phone, setPhone] = useState(profile.phone || '')
  const [address, setAddress] = useState(profile.homeAddress || '')
  
  // Optional Emergency Info
  const [bloodGroup, setBloodGroup] = useState(profile.bloodGroup || '')
  const [medicalConditions, setMedicalConditions] = useState(profile.medicalConditions || '')

  // Accessibility
  const [voiceAlerts, setVoiceAlerts] = useState(profile.accessibility.voiceAlerts ?? true)
  const [highContrast, setHighContrast] = useState(profile.accessibility.highContrast ?? false)
  const [largeText, setLargeText] = useState(profile.accessibility.largeText ?? false)

  // Contacts
  const [contacts, setContacts] = useState<EmergencyContact[]>(profile.emergencyContacts || [])
  const [newContactName, setNewContactName] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')

  const [savedSuccess, setSavedSuccess] = useState(false)

  // Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()

    const updatedProfile: Partial<UserProfile> = {
      name,
      phone,
      homeAddress: address,
      bloodGroup: bloodGroup.trim() ? bloodGroup : undefined,
      medicalConditions: medicalConditions.trim() ? medicalConditions : undefined,
      emergencyContacts: contacts,
      accessibility: {
        voiceAlerts,
        highContrast,
        largeText,
        reducedMotion: false,
        largeInterface: largeText
      }
    }

    updateProfile(updatedProfile)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  // Add Contact
  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return
    const created: EmergencyContact = {
      id: `c-${Date.now()}`,
      name: newContactName,
      relationship: 'Family Contact',
      phone: newContactPhone,
      notifyOnSos: true,
      lastNotificationStatus: 'Pending'
    }
    setContacts(prev => [...prev, created])
    setNewContactName('')
    setNewContactPhone('')
  }

  // Remove Contact
  const handleRemoveContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="space-y-5 pb-8">

      {/* Header */}
      <div>
        <div className="flex items-center space-x-1.5 text-[9.5px] font-mono font-bold text-sky-400 uppercase tracking-widest">
          <User className="w-3.5 h-3.5" />
          <span>CITIZEN PREFERENCES & DATA CONTROL</span>
        </div>
        <h1 className="text-xl font-black text-white font-mono tracking-tight">{t.title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-4">

        {/* 1. Personal Details */}
        <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-3">
          <span className="text-[10.5px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
            {t.personalHeader}
          </span>

          <div className="space-y-2.5 font-mono text-xs">
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">{t.nameLabel}</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">{t.phoneLabel}</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">{t.addressLabel}</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* 2. Optional Emergency Information (Explicit Consent) */}
        <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-3">
          <div className="flex items-center space-x-1.5 text-[10.5px] font-mono font-bold text-purple-400 uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>{t.optionalMedicalHeader}</span>
          </div>

          <div className="p-3 rounded-xl border border-purple-900/60 bg-purple-950/20 text-[10px] font-mono text-purple-300 flex items-start space-x-2">
            <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{t.optionalConsentNotice}</p>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">{t.bloodGroupLabel}</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Not Specified (Keep Private)</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">{t.medicalConditionsLabel}</label>
              <textarea
                rows={2}
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                placeholder="e.g. Asthma, Diabetes, Penicillin Allergy (Optional)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Emergency Contacts Manager */}
        <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <span className="text-[10.5px] font-mono font-bold text-slate-300 uppercase tracking-wider">
              {t.contactsHeader}
            </span>
            <span className="text-[8.5px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300">
              {t.simulatedBadge}
            </span>
          </div>

          {/* Contacts List */}
          <div className="space-y-2 font-mono text-xs">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-900">
                <div>
                  <span className="font-bold text-white block">{contact.name}</span>
                  <span className="text-[10px] text-slate-400">{contact.phone}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveContact(contact.id)}
                  className="p-1.5 rounded-lg border border-red-900/60 bg-red-950 text-red-400 hover:text-white"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Contact Inputs */}
          <div className="pt-2 border-t border-slate-900 space-y-2 font-mono text-xs">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                placeholder="Contact Name"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
              <input
                type="text"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                placeholder="Phone Number"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleAddContact}
              className="w-full py-2 rounded-xl border border-sky-900/60 bg-sky-950 text-sky-300 hover:text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addContactBtn}</span>
            </button>
          </div>
        </div>

        {/* 4. Accessibility & UI Controls */}
        <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-3 font-mono text-xs">
          <span className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider block">
            {t.accessibilityHeader}
          </span>

          <div className="space-y-2">
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-900 cursor-pointer">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-sky-400" />
                <span className="text-white font-bold">{t.voiceAlertsLabel}</span>
              </div>
              <input
                type="checkbox"
                checked={voiceAlerts}
                onChange={(e) => setVoiceAlerts(e.target.checked)}
                className="h-4 w-4 rounded accent-blue-600"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-900 cursor-pointer">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span className="text-white font-bold">{t.highContrastLabel}</span>
              </div>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="h-4 w-4 rounded accent-blue-600"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-900 cursor-pointer">
              <div className="flex items-center space-x-2">
                <Type className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-bold">{t.largeTextLabel}</span>
              </div>
              <input
                type="checkbox"
                checked={largeText}
                onChange={(e) => setLargeText(e.target.checked)}
                className="h-4 w-4 rounded accent-blue-600"
              />
            </label>
          </div>
        </div>

        {/* 5. Language Switcher Card */}
        <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-2.5 font-mono text-xs">
          <span className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider block">
            {t.languageHeader}
          </span>

          <div className="grid grid-cols-3 gap-2">
            {(['en', 'te', 'hi'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l as AppLanguage)}
                className={`py-2 rounded-xl border text-center font-bold transition-all ${
                  lang === l ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {l === 'en' ? 'English' : l === 'te' ? 'తెలుగు' : 'हिन्दी'}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Save Button */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-mono font-bold text-xs tracking-wider uppercase shadow-lg shadow-blue-950/40 transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{savedSuccess ? t.saveSuccess : t.saveBtn}</span>
        </button>

      </form>

    </div>
  )
}
