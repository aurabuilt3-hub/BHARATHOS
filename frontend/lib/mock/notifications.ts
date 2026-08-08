export interface NotificationMockItem {
  id: string
  title: string
  body: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  read: boolean
  timestamp: string
}

export const mockNotificationsList: NotificationMockItem[] = [
  { id: 'notif-1', title: 'Water Level Alert', body: 'Gauges in Ward 12 reached critical threshold (4.2m).', priority: 'critical', read: false, timestamp: '2 mins ago' },
  { id: 'notif-2', title: 'Traffic Congestion', body: 'NH16 beach bypass blocked due to a waterlogging incident.', priority: 'high', read: false, timestamp: '15 mins ago' },
  { id: 'notif-3', title: 'Department Signoff', body: 'Ambulance dispatch plan approved by Emergency Health services.', priority: 'low', read: true, timestamp: '1 hour ago' }
]
