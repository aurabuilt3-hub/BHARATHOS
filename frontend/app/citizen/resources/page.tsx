'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  MapPin, 
  PhoneCall, 
  Navigation, 
  LifeBuoy, 
  Shield, 
  Flame, 
  Home, 
  Sparkles, 
  CheckCircle2, 
  Filter,
  Bot
} from 'lucide-react'
import { useCitizenStore } from '../../../store/useCitizenStore'
import { IndexedDbService } from '../../../services/offline/indexedDbService'
import { EmergencyResource, AppLanguage } from '../../../types/citizen'

const resourceTranslations = {
  en: {
    title: "FIND EMERGENCY RESOURCES",
    subtitle: "Location-aware emergency hospitals, police stations, fire units, and shelters",
    searchPlaceholder: "Search hospital, police, or shelter name...",
    tabAll: "All Facilities",
    tabHospitals: "Hospitals",
    tabPolice: "Police Stations",
    tabFire: "Fire Units",
    tabShelters: "Relief Shelters",
    callBtn: "Direct Call",
    directionsBtn: "Map Directions",
    availableBedsLabel: "Available ICU/Emergency Beds:",
    availableUnitsLabel: "Active Response Units:",
    statusAvailable: "AVAILABLE",
    statusBusy: "HIGH OCCUPANCY",
    statusFull: "AT CAPACITY",
    aiAdvisorTitle: "AI RESOURCE ADVISOR RECOMMENDATION",
    aiAdvisorText: "Based on your location in MVP Colony (Visakhapatnam), King George Hospital (KGH) has the highest available trauma capacity within 3.2km."
  },
  te: {
    title: "అత్యవసర వనరులను కనుగొనండి",
    subtitle: "సమీపంలోని ఆసుపత్రులు, పోలీస్ స్టేషన్లు మరియు విపత్తు పునరావాస కేంద్రాలు",
    searchPlaceholder: "ఆసుపత్రి లేదా పోలీస్ స్టేషన్ పేరు శోధించండి...",
    tabAll: "అన్ని కేంద్రాలు",
    tabHospitals: "ఆసుపత్రులు",
    tabPolice: "పోలీస్ స్టేషన్లు",
    tabFire: "ఫైర్ స్టేషన్లు",
    tabShelters: "పునరావాస కేంద్రాలు",
    callBtn: "నేరుగా కాల్ చేయండి",
    directionsBtn: "మ్యాప్ నావిగేషన్",
    availableBedsLabel: "లభ్యమయ్యే బెడ్‌ల సంఖ్య:",
    availableUnitsLabel: "క్రియాశీల యూనిట్లు:",
    statusAvailable: "అందుబాటులో ఉంది",
    statusBusy: "ఎక్కువ రద్దీ",
    statusFull: "పూర్తిగా నిండింది",
    aiAdvisorTitle: "AI రెస్సోర్స్ అడ్వైజర్ సిఫార్సు",
    aiAdvisorText: "మీ ప్రస్తుత లొకేషన్ ఆధారంగా కింగ్ జార్జ్ హాస్పిటల్ (KGH) గరిష్ట చికిత్స సామర్థ్యాన్ని కలిగి ఉంది."
  },
  hi: {
    title: "आपातकालीन संसाधन खोजें",
    subtitle: "आसपास के अस्पताल, पुलिस स्टेशन, अग्निशमन केंद्र व राहत शिविर",
    searchPlaceholder: "अस्पताल या पुलिस स्टेशन खोजें...",
    tabAll: "सभी केंद्र",
    tabHospitals: "अस्पताल",
    tabPolice: "पुलिस स्टेशन",
    tabFire: "अग्निशमन केंद्र",
    tabShelters: "राहत शिविर",
    callBtn: "डायरेक्ट कॉल",
    directionsBtn: "दिशा-निर्देश",
    availableBedsLabel: "उपलब्ध बेड:",
    availableUnitsLabel: "सक्रिय इकाइयां:",
    statusAvailable: "उपलब्ध",
    statusBusy: "उच्च व्यस्तता",
    statusFull: "पूर्ण क्षमता",
    aiAdvisorTitle: "एआई संसाधन सलाहकार सिफारिश",
    aiAdvisorText: "आपके स्थान के आधार पर किंग जॉर्ज अस्पताल (KGH) में 3.2 किमी के भीतर उच्चतम आपातकालीन क्षमता है।"
  }
}

const INITIAL_RESOURCES: EmergencyResource[] = [
  {
    id: 'res-1',
    name: 'King George Hospital (KGH) Emergency & Trauma Center',
    category: 'hospital',
    distanceKm: 3.2,
    address: 'Maharanipeta, Visakhapatnam, Andhra Pradesh',
    phone: '+91 891 2564891',
    availableBeds: 42,
    status: 'available',
    latitude: 17.7089,
    longitude: 83.3054,
    dataSource: 'OFFICIAL AUTHORITY'
  },
  {
    id: 'res-2',
    name: 'Visakhapatnam Apollo Emergency Care Unit',
    category: 'hospital',
    distanceKm: 1.8,
    address: 'Health City, Arilova, Visakhapatnam',
    phone: '+91 891 2867777',
    availableBeds: 18,
    status: 'available',
    latitude: 17.7412,
    longitude: 83.3321,
    dataSource: 'OFFICIAL AUTHORITY'
  },
  {
    id: 'res-3',
    name: 'MVP Colony Law & Order Police Station',
    category: 'police',
    distanceKm: 0.8,
    address: 'Sector 5, MVP Colony, Visakhapatnam',
    phone: '+91 891 2562233',
    availableUnits: 6,
    status: 'available',
    latitude: 17.7311,
    longitude: 83.3245,
    dataSource: 'OFFICIAL AUTHORITY'
  },
  {
    id: 'res-4',
    name: 'Suryabagh Central Fire Station & Disaster Depot',
    category: 'fire',
    distanceKm: 4.1,
    address: 'Suryabagh, Visakhapatnam',
    phone: '+91 891 2563344',
    availableUnits: 4,
    status: 'available',
    latitude: 17.7123,
    longitude: 83.3012,
    dataSource: 'OFFICIAL AUTHORITY'
  },
  {
    id: 'res-5',
    name: 'MVP High School Emergency Relief Shelter',
    category: 'shelter',
    distanceKm: 1.2,
    address: 'Sector 2, MVP Colony, Visakhapatnam',
    phone: '+91 891 2789900',
    availableBeds: 120,
    status: 'available',
    latitude: 17.7345,
    longitude: 83.3190,
    dataSource: 'OFFICIAL AUTHORITY'
  }
]

export default function FindResourcesPage() {
  const { profile, activeLocation } = useCitizenStore()
  const lang: AppLanguage = profile.language || 'en'
  const t = resourceTranslations[lang as 'en' | 'te' | 'hi'] || resourceTranslations.en

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hospital' | 'police' | 'fire' | 'shelter'>('all')
  const [resourcesList, setResourcesList] = useState<EmergencyResource[]>(INITIAL_RESOURCES)

  useEffect(() => {
    async function loadResources() {
      await IndexedDbService.saveResources(INITIAL_RESOURCES)
      const cached = await IndexedDbService.getCachedResources()
      if (cached.length > 0) {
        setResourcesList(cached)
      } else {
        setResourcesList(INITIAL_RESOURCES)
      }
    }
    loadResources()
  }, [])

  const filteredResources = resourcesList.filter(res => {
    const matchesCategory = selectedCategory === 'all' || res.category === selectedCategory
    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          res.address.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hospital': return <LifeBuoy className="w-4 h-4 text-red-400" />
      case 'police': return <Shield className="w-4 h-4 text-blue-400" />
      case 'fire': return <Flame className="w-4 h-4 text-orange-400" />
      case 'shelter': return <Home className="w-4 h-4 text-emerald-400" />
      default: return <Search className="w-4 h-4 text-slate-400" />
    }
  }

  return (
    <div className="space-y-5 pb-8">

      {/* Header */}
      <div>
        <div className="flex items-center space-x-1.5 text-[9.5px] font-mono font-bold text-sky-400 uppercase tracking-widest">
          <Search className="w-3.5 h-3.5" />
          <span>LOCATION-AWARE FACILITY LOCATOR</span>
        </div>
        <h1 className="text-xl font-black text-white font-mono tracking-tight">{t.title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{t.subtitle}</p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full bg-[#060a13] border border-slate-850 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-sky-500"
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-1.5 border border-slate-900 rounded-2xl bg-[#060a13] p-1 font-mono text-[10px] no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-2 rounded-xl font-bold transition-all shrink-0 ${
            selectedCategory === 'all' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.tabAll}
        </button>

        <button
          onClick={() => setSelectedCategory('hospital')}
          className={`px-3 py-2 rounded-xl font-bold transition-all shrink-0 ${
            selectedCategory === 'hospital' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🏥 {t.tabHospitals}
        </button>

        <button
          onClick={() => setSelectedCategory('police')}
          className={`px-3 py-2 rounded-xl font-bold transition-all shrink-0 ${
            selectedCategory === 'police' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🛡️ {t.tabPolice}
        </button>

        <button
          onClick={() => setSelectedCategory('fire')}
          className={`px-3 py-2 rounded-xl font-bold transition-all shrink-0 ${
            selectedCategory === 'fire' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🔥 {t.tabFire}
        </button>

        <button
          onClick={() => setSelectedCategory('shelter')}
          className={`px-3 py-2 rounded-xl font-bold transition-all shrink-0 ${
            selectedCategory === 'shelter' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🏠 {t.tabShelters}
        </button>
      </div>

      {/* AI Resource Advisor Banner */}
      <div className="rounded-2xl border border-sky-900/80 bg-[#040e1c] p-4 space-y-2 shadow-xl">
        <div className="flex items-center space-x-1.5 text-[9.5px] font-mono font-bold text-sky-400 uppercase tracking-widest">
          <Bot className="w-4 h-4 text-sky-400" />
          <span>{t.aiAdvisorTitle}</span>
        </div>
        <p className="text-xs text-slate-200 font-mono leading-relaxed">{t.aiAdvisorText}</p>
      </div>

      {/* Resource Cards List */}
      <div className="space-y-3.5">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-3 shadow-lg hover:border-slate-800 transition-all"
          >
            {/* Top Badge Row */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <div className="flex items-center space-x-2">
                {getCategoryIcon(res.category)}
                <span className="text-xs font-bold text-white font-mono uppercase">{res.category}</span>
                <span className="text-[9.5px] font-mono text-sky-400 font-bold">{res.distanceKm} km away</span>
              </div>

              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 uppercase">
                {t.statusAvailable}
              </span>
            </div>

            {/* Title & Address */}
            <div className="space-y-0.5">
              <h3 className="text-xs font-black text-white leading-snug">{res.name}</h3>
              <p className="text-[10.5px] text-slate-400 font-mono">📍 {res.address}</p>
            </div>

            {/* Capacity Metric */}
            {res.availableBeds !== undefined && (
              <div className="text-[10.5px] font-mono text-emerald-400 font-bold bg-emerald-950/30 p-2 rounded-xl border border-emerald-900/40">
                {t.availableBedsLabel} <strong className="text-white">{res.availableBeds} Beds</strong>
              </div>
            )}

            {res.availableUnits !== undefined && (
              <div className="text-[10.5px] font-mono text-sky-400 font-bold bg-sky-950/30 p-2 rounded-xl border border-sky-900/40">
                {t.availableUnitsLabel} <strong className="text-white">{res.availableUnits} Patrol/Fire Units</strong>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
              <a
                href={`tel:${res.phone}`}
                className="py-2.5 rounded-xl border border-red-900/60 bg-red-950/40 hover:bg-red-950 text-red-300 font-bold text-center flex items-center justify-center space-x-1.5 transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{t.callBtn}</span>
              </a>

              <a
                href={`https://maps.google.com/?q=${res.latitude},${res.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 rounded-xl border border-sky-900/60 bg-sky-950/40 hover:bg-sky-950 text-sky-300 font-bold text-center flex items-center justify-center space-x-1.5 transition-all"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{t.directionsBtn}</span>
              </a>
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}
