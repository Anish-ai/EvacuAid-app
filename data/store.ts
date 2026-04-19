import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware.js";
import {
    acknowledgeNotification,
    createIncident,
    createNotification,
    createTask,
    getDevices,
    getSharedState,
    markNotificationRead,
    updateDeviceStatus,
    updateIncidentStatus,
    updateTaskStatus,
} from "../services/appApi";
import {
    Device,
    DeviceStatus,
    Incident,
    IncidentSeverity,
    IncidentStatus,
    Notification,
    Task,
    TaskStatus,
    UserRole,
} from "../types";
import { INITIAL_INCIDENTS } from "./mockData";

interface CreateIncidentInput {
  type: string;
  severity: IncidentSeverity;
  location: string;
  team: string;
  description?: string;
  nodeId?: string;
  floorId?: number;
  mapLinked?: boolean;
}

interface AppState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  hasHydrated: boolean;

  incidents: Incident[];
  tasks: Task[];
  notifications: Notification[];
  devices: Device[];
  hydrated: boolean;
  isSyncing: boolean;
  syncError: string | null;

  initializeData: () => Promise<void>;
  refreshData: () => Promise<void>;

  addIncident: (input: CreateIncidentInput) => Promise<Incident>;
  updateIncidentStatus: (id: string, status: IncidentStatus) => Promise<void>;

  addTask: (task: Omit<Task, "id"> & { id?: string }) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;

  addNotification: (
    notification: Omit<Notification, "id"> & { id?: string },
  ) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  acknowledgeNotification: (id: string) => Promise<void>;

  setDeviceStatus: (
    id: string,
    status: DeviceStatus,
    battery?: number,
  ) => Promise<void>;

  emergencyMode: boolean;
  setEmergencyMode: (active: boolean) => void;

  activeIncidentId: string | null;
  setActiveIncidentId: (id: string | null) => void;
}

let incidentCounter = 3000;
let taskCounter = 2000;
let notifCounter = 5000;
let markHydrated: (() => void) | null = null;

const noopStorage = {
  getItem: async (_name: string) => null,
  setItem: async (_name: string, _value: string) => {},
  removeItem: async (_name: string) => {},
};

const persistStorage = createJSONStorage(() =>
  typeof window === "undefined" ? noopStorage : AsyncStorage,
);

function nowStr() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function nextId(prefix: "INC" | "TSK" | "NTF") {
  if (prefix === "INC") {
    incidentCounter += 1;
    return `${prefix}-${incidentCounter}`;
  }
  if (prefix === "TSK") {
    taskCounter += 1;
    return `${prefix}-${taskCounter}`;
  }
  notifCounter += 1;
  return `${prefix}-${notifCounter}`;
}

function syncCounters(
  incidents: Incident[],
  tasks: Task[],
  notifications: Notification[],
) {
  const parse = (id: string, prefix: string) => {
    if (!id.startsWith(`${prefix}-`)) return 0;
    const value = Number.parseInt(id.slice(prefix.length + 1), 10);
    return Number.isFinite(value) ? value : 0;
  };

  incidentCounter = Math.max(
    incidentCounter,
    ...incidents.map((item) => parse(item.id, "INC")),
  );
  taskCounter = Math.max(
    taskCounter,
    ...tasks.map((item) => parse(item.id, "TSK")),
  );
  notifCounter = Math.max(
    notifCounter,
    ...notifications.map((item) => parse(item.id, "NTF")),
  );
}

const fallbackTasks: Task[] = [];
const fallbackNotifications: Notification[] = [];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown sync error";
}

async function fetchWithRetry<T>(
  label: string,
  action: () => Promise<T>,
  attempts = 5,
): Promise<T> {
  let lastError: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      console.log(`[SYNC] ${label} attempt ${i}/${attempts}`);
      const data = await action();
      console.log(`[SYNC] ${label} success on attempt ${i}`);
      return data;
    } catch (error) {
      lastError = error;
      console.log(
        `[SYNC] ${label} failed on attempt ${i}: ${toErrorMessage(error)}`,
      );
      if (i < attempts) {
        await sleep(3500);
      }
    }
  }

  throw lastError;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      markHydrated = () => set({ hasHydrated: true });

      return {
        role: "Guest",
        setRole: (role) => set({ role }),
        hasHydrated: false,

        incidents: INITIAL_INCIDENTS,
        tasks: fallbackTasks,
        notifications: fallbackNotifications,
        devices: [],
        hydrated: false,
        isSyncing: false,
        syncError: null,

        initializeData: async () => {
          if (get().hydrated || get().isSyncing) return;
          await get().refreshData();
        },

        refreshData: async () => {
          set({ isSyncing: true, syncError: null });
          const errors: string[] = [];

          let incidents = get().incidents;
          let tasks = get().tasks;
          let notifications = get().notifications;
          let devices = get().devices;
          let stateFetched = false;
          let devicesFetched = false;

          try {
            const statePayload = await fetchWithRetry(
              "state",
              () => getSharedState(),
              5,
            );
            incidents = statePayload.incidents?.length
              ? statePayload.incidents
              : INITIAL_INCIDENTS;
            tasks = statePayload.tasks ?? [];
            notifications = statePayload.notifications ?? [];
            syncCounters(incidents, tasks, notifications);
            stateFetched = true;
          } catch (error) {
            errors.push(`state: ${toErrorMessage(error)}`);
          }

          try {
            devices = await fetchWithRetry("devices", () => getDevices(), 5);
            devicesFetched = true;
          } catch (error) {
            errors.push(`devices: ${toErrorMessage(error)}`);
          }

          const hydrated = stateFetched || devicesFetched;
          const syncError = errors.length
            ? `Sync issues -> ${errors.join(" | ")}`
            : null;

          set({
            incidents,
            tasks,
            notifications,
            devices,
            hydrated,
            isSyncing: false,
            syncError,
            activeIncidentId: incidents[0]?.id ?? null,
          });
        },

        addIncident: async ({
          type,
          severity,
          location,
          team,
          description,
          nodeId,
          floorId,
          mapLinked = false,
        }) => {
          const incident: Incident = {
            id: nextId("INC"),
            type,
            severity,
            status: "New",
            time: nowStr(),
            location,
            team,
            nodeId,
            floorId,
            mapLinked,
            description,
          };

          set((state) => ({
            incidents: [incident, ...state.incidents],
            activeIncidentId: incident.id,
          }));

          try {
            await createIncident(incident);
          } catch (error) {
            set((state) => ({
              incidents: state.incidents.filter(
                (item) => item.id !== incident.id,
              ),
            }));
            throw error;
          }

          return incident;
        },

        updateIncidentStatus: async (id, status) => {
          const previous = get().incidents;
          set((state) => ({
            incidents: state.incidents.map((item) =>
              item.id === id ? { ...item, status } : item,
            ),
          }));

          try {
            await updateIncidentStatus(id, status);
          } catch (error) {
            set({ incidents: previous });
            throw error;
          }
        },

        addTask: async (data) => {
          const task: Task = {
            ...data,
            id: data.id ?? nextId("TSK"),
          };

          set((state) => ({ tasks: [task, ...state.tasks] }));

          try {
            await createTask(task);
          } catch (error) {
            set((state) => ({
              tasks: state.tasks.filter((item) => item.id !== task.id),
            }));
            throw error;
          }
        },

        updateTaskStatus: async (id, status) => {
          const previous = get().tasks;
          set((state) => ({
            tasks: state.tasks.map((item) =>
              item.id === id ? { ...item, status } : item,
            ),
          }));

          try {
            await updateTaskStatus(id, status);
          } catch (error) {
            set({ tasks: previous });
            throw error;
          }
        },

        addNotification: async (data) => {
          const notification: Notification = {
            ...data,
            id: data.id ?? nextId("NTF"),
          };

          set((state) => ({
            notifications: [notification, ...state.notifications],
          }));

          try {
            await createNotification(notification);
          } catch (error) {
            set((state) => ({
              notifications: state.notifications.filter(
                (item) => item.id !== notification.id,
              ),
            }));
            throw error;
          }
        },

        markNotificationRead: async (id) => {
          const previous = get().notifications;
          set((state) => ({
            notifications: state.notifications.map((item) =>
              item.id === id ? { ...item, opened: true } : item,
            ),
          }));

          try {
            await markNotificationRead(id);
          } catch (error) {
            set({ notifications: previous });
            throw error;
          }
        },

        acknowledgeNotification: async (id) => {
          const previous = get().notifications;
          set((state) => ({
            notifications: state.notifications.map((item) =>
              item.id === id ? { ...item, ack: true, opened: true } : item,
            ),
          }));

          try {
            await acknowledgeNotification(id);
          } catch (error) {
            set({ notifications: previous });
            throw error;
          }
        },

        setDeviceStatus: async (id, status, battery) => {
          const previous = get().devices;
          set((state) => ({
            devices: state.devices.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status,
                    battery: battery ?? item.battery,
                    lastPing: "Just now",
                  }
                : item,
            ),
          }));

          try {
            await updateDeviceStatus(id, status, battery);
          } catch (error) {
            set({ devices: previous });
            throw error;
          }
        },

        emergencyMode: false,
        setEmergencyMode: (active) => set({ emergencyMode: active }),

        activeIncidentId: null,
        setActiveIncidentId: (id) => set({ activeIncidentId: id }),
      };
    },
    {
      name: "evacuaid-app-store",
      storage: persistStorage,
      partialize: (state) => ({ role: state.role }),
      onRehydrateStorage: () => () => {
        markHydrated?.();
      },
    },
  ),
);
