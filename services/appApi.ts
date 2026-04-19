import { Building } from "../lib/graph/types";
import {
    Device,
    Incident,
    IncidentStatus,
    Notification,
    OpsState,
    Task,
    TaskStatus,
} from "../types";
import { apiRequest } from "./apiClient";

export async function getSharedState(): Promise<OpsState> {
  return apiRequest<OpsState>("/api/state");
}

export async function createIncident(incident: Incident): Promise<Incident> {
  return apiRequest<Incident>("/api/incidents", {
    method: "POST",
    body: incident,
  });
}

export async function updateIncidentStatus(
  id: string,
  status: IncidentStatus,
): Promise<Incident> {
  return apiRequest<Incident>(`/api/incidents/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export async function createTask(task: Task): Promise<Task> {
  return apiRequest<Task>("/api/tasks", { method: "POST", body: task });
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus,
): Promise<Task> {
  return apiRequest<Task>(`/api/tasks/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export async function createNotification(
  notification: Notification,
): Promise<Notification> {
  return apiRequest<Notification>("/api/notifications", {
    method: "POST",
    body: notification,
  });
}

export async function markNotificationRead(id: string): Promise<Notification> {
  return apiRequest<Notification>(`/api/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function acknowledgeNotification(
  id: string,
): Promise<Notification> {
  return apiRequest<Notification>(`/api/notifications/${id}/ack`, {
    method: "PATCH",
  });
}

export async function getDevices(): Promise<Device[]> {
  return apiRequest<Device[]>("/api/devices");
}

export async function updateDeviceStatus(
  id: string,
  status: Device["status"],
  battery?: number,
): Promise<Device> {
  return apiRequest<Device>(`/api/devices/${id}/status`, {
    method: "PATCH",
    body: battery === undefined ? { status } : { status, battery },
  });
}

export async function getBuildingMap(): Promise<Building> {
  return apiRequest<Building>("/api/map");
}

export async function saveBuildingMap(
  building: Building,
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>("/api/map", {
    method: "POST",
    body: building,
  });
}

export async function sendAiChat(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
): Promise<string> {
  const result = await apiRequest<{ response: string }>("/api/chat", {
    method: "POST",
    body: { messages },
  });

  return result.response;
}
