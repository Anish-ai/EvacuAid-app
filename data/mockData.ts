import {
    Contact,
    Incident,
    MapMarkerData,
    RouteSuggestion,
    SafetyTip,
} from "../types";

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: "INC-2041",
    type: "Fire",
    severity: "critical",
    status: "In Progress",
    time: "10:42 AM",
    location: "Sector 3, Floor 2",
    team: "Fire Dept",
    mapLinked: false,
    description:
      "Multiple sensors triggered in Floor 2 server room. Auto-suppression disabled.",
  },
  {
    id: "INC-2042",
    type: "Medical",
    severity: "high",
    status: "Acknowledged",
    time: "10:45 AM",
    location: "Lobby Area",
    team: "Medical Staff",
    mapLinked: false,
    description:
      "Employee reported chest pain in Lobby Area. Response team dispatched.",
  },
];

export const MOCK_CONTACTS: Contact[] = [
  {
    id: "1",
    role: "Security Desk",
    name: "Main Security",
    phone: "555-0101",
    iconName: "shield",
    priority: "high",
  },
  {
    id: "2",
    role: "Medical Team",
    name: "On-Call Nurse",
    phone: "555-0102",
    iconName: "activity",
    priority: "high",
  },
  {
    id: "3",
    role: "Front Desk",
    name: "Reception",
    phone: "555-0103",
    iconName: "bell",
    priority: "medium",
  },
  {
    id: "4",
    role: "Fire Safety",
    name: "Building Control",
    phone: "555-0104",
    iconName: "flame",
    priority: "high",
  },
  {
    id: "5",
    role: "Maintenance",
    name: "Facility Operations",
    phone: "555-0105",
    iconName: "wrench",
    priority: "low",
  },
];

export const DEFAULT_SAFETY_TIPS: SafetyTip[] = [
  {
    id: "tip-1",
    title: "Fire Safety",
    description:
      "Crawl low under smoke, do not use elevators, test doors for heat before opening.",
    iconName: "flame",
  },
  {
    id: "tip-2",
    title: "Medical Emergency",
    description:
      "Do not move an injured person unless they are in immediate danger. Call for help immediately.",
    iconName: "cross",
  },
  {
    id: "tip-3",
    title: "Suspicious Activity",
    description: "Do not confront. Note description and report to security.",
    iconName: "eye",
  },
  {
    id: "tip-4",
    title: "Crowd Panic",
    description:
      "Stay calm, move with the flow but angle towards exits, keep hands up to protect chest.",
    iconName: "users",
  },
];

// Rough coordinates for a stylized map (percentage based layout later)
export const MOCK_MAP_MARKERS: MapMarkerData[] = [
  {
    id: "mk-1",
    type: "exit",
    label: "Main Exit",
    coordinates: { x: 10, y: 90 },
    floor: "G",
  },
  {
    id: "mk-2",
    type: "exit",
    label: "East Exit",
    coordinates: { x: 90, y: 50 },
    floor: "G",
  },
  {
    id: "mk-3",
    type: "extinguisher",
    label: "Corridor A Ext",
    coordinates: { x: 30, y: 30 },
    floor: "1",
  },
  {
    id: "mk-4",
    type: "first_aid",
    label: "Dispensary",
    coordinates: { x: 50, y: 80 },
    floor: "1",
  },
  {
    id: "mk-5",
    type: "stairs",
    label: "West Stairs",
    coordinates: { x: 10, y: 10 },
    floor: "1",
  },
];

export const EMERGENCY_ROUTE: RouteSuggestion = {
  id: "rt-1",
  title: "Safe Evacuation Route",
  instructions: [
    "Exit current room and turn left.",
    "Proceed down the hall to the West Stairs.",
    "Descend to Ground Floor.",
    "Use the Main Exit to reach Assembly Point Alpha.",
  ],
  safeDistance: "120 meters",
};
