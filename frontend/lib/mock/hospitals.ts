export interface HospitalAsset {
  id: string
  name: string
  coordinates: [number, number]
  totalBeds: number
  availableBeds: number
  icuBedsAvailable: number
  ambulancesAvailable: number
  contactPhone: string
  status: 'operational' | 'busy' | 'full'
}

export const visakhapatnamHospitalsData: HospitalAsset[] = [
  {
    id: 'hosp-01',
    name: 'King George Hospital (KGH)',
    coordinates: [17.7088, 83.3032],
    totalBeds: 1200,
    availableBeds: 142,
    icuBedsAvailable: 8,
    ambulancesAvailable: 12,
    contactPhone: '+91-891-2564891',
    status: 'busy'
  },
  {
    id: 'hosp-02',
    name: 'VIMS Super Specialty Hospital',
    coordinates: [17.7654, 83.3321],
    totalBeds: 500,
    availableBeds: 94,
    icuBedsAvailable: 15,
    ambulancesAvailable: 6,
    contactPhone: '+91-891-2856000',
    status: 'operational'
  },
  {
    id: 'hosp-03',
    name: 'Apollo Hospital Arilova',
    coordinates: [17.7712, 83.3389],
    totalBeds: 350,
    availableBeds: 45,
    icuBedsAvailable: 4,
    ambulancesAvailable: 5,
    contactPhone: '+91-891-2727272',
    status: 'operational'
  }
]
