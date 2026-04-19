import { Incident } from "../types";
import { sendAiChat } from "./appApi";

// Compatibility shim for older screens/tests that may still import this module.
export async function submitIncidentReport(): Promise<Incident> {
  throw new Error(
    "submitIncidentReport is deprecated. Use useAppStore().addIncident instead.",
  );
}

export async function fetchAiAssistantResponse(query: string): Promise<string> {
  return sendAiChat([{ role: "user", content: query }]);
}
