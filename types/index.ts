export type UserRole = "Guest" | "Patient" | "Staff";

export type IncidentType =
  | "Fire"
  | "Medical"
  | "Security"
  | "Smoke"
  | "Hazmat"
  | "Maintenance"
  | "IT Offline"
  | "Breach"
  | string;

export type IncidentSeverity = "low" | "medium" | "high" | "critical";

export type IncidentStatus =
  | "New"
  | "In Progress"
  | "Acknowledged"
  | "Resolved";
export type TaskStatus = "New" | "In Progress" | "Acknowledged" | "Resolved";
export type TaskPriority = "High" | "Medium" | "Low";
export type DeviceStatus = "online" | "offline" | "alert" | "maintenance";
export type DeviceType = "cctv" | "smoke" | "fire" | "door" | "access";

export interface LocationCoordinates {
  x: number;
  y: number;
}

export interface Incident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  time: string;
  location: string;
  team: string;
  nodeId?: string;
  floorId?: number;
  mapLinked: boolean;
  description?: string;
}

export interface Task {
  id: string;
  incidentId: string;
  assignee: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  description?: string;
}

export interface Notification {
  id: string;
  incidentId: string;
  user: string;
  role: string;
  time: string;
  opened: boolean;
  ack: boolean;
  escalated: boolean;
  message: string;
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  location: string;
  status: DeviceStatus;
  lastPing: string;
  battery?: number;
  feedUrl?: string;
}

export interface OpsState {
  incidents: Incident[];
  tasks: Task[];
  notifications: Notification[];
}

export interface Contact {
  id: string;
  role: string;
  name: string;
  phone: string;
  iconName: string;
  priority: "low" | "medium" | "high";
}

export interface MapMarkerData {
  id: string;
  type:
    | "exit"
    | "extinguisher"
    | "first_aid"
    | "security"
    | "stairs"
    | "elevator"
    | "safe_zone"
    | "incident"
    | "user";
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

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
}
