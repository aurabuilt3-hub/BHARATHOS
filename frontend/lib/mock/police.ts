export interface PoliceStationAsset {
  id: string
  name: string
  coordinates: [number, number]
  activeUnits: number
  inchargeOfficer: string
  phone: string
}

export const visakhapatnamPoliceData: PoliceStationAsset[] = [
  { id: 'pol-01', name: 'MVP Colony Police Station', coordinates: [17.7389, 83.3312], activeUnits: 8, inchargeOfficer: 'Ins. V. Ramana', phone: '0891-2550100' },
  { id: 'pol-02', name: 'Dwaraka Police Station', coordinates: [17.7265, 83.3089], activeUnits: 12, inchargeOfficer: 'Ins. K. Suresh', phone: '0891-2550101' },
  { id: 'pol-03', name: 'Gajuwaka Police Station', coordinates: [17.6834, 83.2145], activeUnits: 10, inchargeOfficer: 'Ins. M. Rao', phone: '0891-2550102' }
]
