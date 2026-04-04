export type UserRole = 'Guest' | 'Patient' | 'Staff';

export type IncidentType = 'fire' | 'medical' | 'smoke' | 'suspicious_activity' | 'crowd_congestion' | 'blocked_exit' | 'water_leakage' | 'power_outage' | 'other';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus = 'active' | 'resolved' | 'under_review';

export interface LocationCoordinates {
  x: number;
  y: number;
}

export interface Incident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  timestamp: string; // ISO string
  location: string;
  floor: string;
  zone?: string;
  description: string;
  aiSummary?: string;
  recommendedActions?: string[];
  affectedAreas?: string[];
}

export interface Contact {
  id: string;
  role: string;
  name: string;
  phone: string;
  iconName: string;
  priority: 'low' | 'medium' | 'high';
}

export interface MapMarkerData {
  id: string;
  type: 'exit' | 'extinguisher' | 'first_aid' | 'security' | 'stairs' | 'elevator' | 'safe_zone' | 'incident' | 'user';
  label: string;
  coordinates: LocationCoordinates;
  floor: string;
}

export interface SafetyTip {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface RouteSuggestion {
  id: string;
  title: string;
  instructions: string[];
  safeDistance: string;
}
