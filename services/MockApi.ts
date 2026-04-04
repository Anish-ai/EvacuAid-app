import { Incident, IncidentType } from '../types';

export const submitIncidentReport = async (
  type: IncidentType,
  severity: string,
  description: string,
  location: string
): Promise<Incident> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newIncident: Incident = {
        id: `INC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        type,
        severity: severity as any,
        status: 'active',
        timestamp: new Date().toISOString(),
        location,
        floor: 'TBD',
        description,
        aiSummary: `AI analyzed report: ${type} at ${location}. Escalating to security team.`,
        recommendedActions: ['Awaiting responder confirmation', 'Remain clear of the area'],
      };
      resolve(newIncident);
    }, 1500); // simulate 1.5s delay
  });
};

export const fetchAiAssistantResponse = async (query: string): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const q = query.toLowerCase();
            if (q.includes('fire') || q.includes('smoke')) {
                resolve('If you see fire or smoke, trigger the nearest alarm and evacuate immediately using the stairs. Do NOT use elevators. I can show you the nearest exit on the map.');
            } else if (q.includes('medical') || q.includes('help')) {
                resolve('For medical emergencies, please stay with the person. Do not move them unless they are in immediate physical danger. Medical team has been notified.');
            } else if (q.includes('exit') || q.includes('route')) {
                resolve('The nearest exit is 50 meters to your left down the main corridor. Proceed calmly. Is the path clear?');
            } else if (q.includes('safe')) {
                resolve('The building is currently under an alert. Please proceed to the nearest safe zone marked in Green on your map.');
            } else {
                resolve('I am the EvacuAid AI assistant. I can guide you to safety, locate emergency equipment, or help you report an incident. How can I assist you right now?');
            }
        }, 1200);
    });
};
