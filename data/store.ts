import { create } from 'zustand';
import { Incident, UserRole } from '../types';
import { INITIAL_INCIDENTS } from './mockData';

interface AppState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  
  incidents: Incident[];
  addIncident: (incident: Incident) => void;
  updateIncidentStatus: (id: string, status: Incident['status']) => void;

  emergencyMode: boolean;
  setEmergencyMode: (active: boolean) => void;

  activeIncidentId: string | null;
  setActiveIncidentId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  role: 'Guest',
  setRole: (role) => set({ role }),
  
  incidents: INITIAL_INCIDENTS,
  addIncident: (incident) => set((state) => ({ incidents: [incident, ...state.incidents] })),
  updateIncidentStatus: (id, status) => set((state) => ({
    incidents: state.incidents.map((inc) => inc.id === id ? { ...inc, status } : inc)
  })),

  // Derived or manually triggered emergency mode
  emergencyMode: false,
  setEmergencyMode: (emergencyMode) => set({ emergencyMode }),

  activeIncidentId: INITIAL_INCIDENTS[0].id,
  setActiveIncidentId: (id) => set({ activeIncidentId: id })
}));
