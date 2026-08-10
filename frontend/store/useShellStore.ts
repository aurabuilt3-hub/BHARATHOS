import { create } from 'zustand'

export interface HierarchyState {
  country: string
  state: string
  district: string
  city: string
  ward: string
}

interface ShellState {
  currentWorkspace: string
  currentHierarchy: HierarchyState
  sidebarCollapsed: boolean
  presentationMode: boolean
  commandBarOpen: boolean
  setWorkspace: (workspace: string) => void
  setHierarchy: (hierarchy: Partial<HierarchyState>) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setPresentationMode: (enabled: boolean) => void
  setCommandBarOpen: (open: boolean) => void
}

export const useShellStore = create<ShellState>((set) => ({
  currentWorkspace: 'National Command Center',
  currentHierarchy: {
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    city: 'Visakhapatnam City',
    ward: 'Ward 12'
  },
  sidebarCollapsed: false,
  presentationMode: false,
  commandBarOpen: false,
  setWorkspace: (workspace) => set({ currentWorkspace: workspace }),
  setHierarchy: (hierarchy) => set((state) => ({
    currentHierarchy: { ...state.currentHierarchy, ...hierarchy }
  })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setPresentationMode: (enabled) => set({ presentationMode: enabled }),
  setCommandBarOpen: (open) => set({ commandBarOpen: open })
}))
