import {
  Mission,
  Agent,
  Task,
  Approval,
  Memory,
  Decision,
  TelemetryEvent,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  const res = await fetch(fullUrl, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errData = await res.json();
      errorMsg = errData.error || errData.message || errorMsg;
    } catch (e) {}
    throw new Error(errorMsg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  getMissions: () => fetchJson<Mission[]>('/api/missions'),
  
  getMission: (id: string) =>
    fetchJson<{ mission: Mission; agents: Agent[]; tasks: Task[] }>(`/api/missions/${id}`),

  createMission: (data: {
    title: string;
    goal: string;
    domain: string;
    autonomy_level: 'supervised' | 'autonomous';
    model?: string;
    is_demo?: boolean;
  }) =>
    fetchJson<Mission>('/api/missions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  loadDemoMission: () =>
    fetchJson<{ success: boolean; missionId: string; mission: Mission }>('/api/missions/demo', {
      method: 'POST',
    }),

  stepMission: (id: string) =>
    fetchJson<{ success: boolean; continued: boolean; tasks: Task[]; agents: Agent[] }>(
      `/api/missions/${id}/step`,
      { method: 'POST' }
    ),

  pauseMission: (id: string) =>
    fetchJson<{ success: boolean; status: string }>(`/api/missions/${id}/pause`, {
      method: 'POST',
    }),

  simulateFailure: (
    missionId: string,
    scenario: 'venue_cancelled' | 'budget_overrun' | 'api_outage' | 'custom',
    description?: string,
    affectedTaskId?: string
  ) =>
    fetchJson<{ success: boolean; replanResult: any; patchTasks: Task[] }>(
      `/api/missions/${missionId}/simulate-failure`,
      {
        method: 'POST',
        body: JSON.stringify({
          scenario,
          description: description || 'Simulated failure injection',
          affected_task_id: affectedTaskId,
        }),
      }
    ),

  getTasks: (missionId: string) => fetchJson<Task[]>(`/api/missions/${missionId}/tasks`),

  getAgents: (missionId: string) => fetchJson<Agent[]>(`/api/missions/${missionId}/agents`),

  getApprovals: (missionId: string) =>
    fetchJson<Approval[]>(`/api/missions/${missionId}/approvals`),

  resolveApproval: (id: string, status: 'approved' | 'rejected', feedback?: string) =>
    fetchJson<Approval>(`/api/approvals/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ status, feedback }),
    }),

  getMemories: (missionId: string) => fetchJson<Memory[]>(`/api/missions/${missionId}/memory`),

  addMemory: (
    missionId: string,
    key: string,
    value: Record<string, any>,
    category: 'context' | 'decision' | 'constraint' | 'artifact'
  ) =>
    fetchJson<Memory>(`/api/missions/${missionId}/memory`, {
      method: 'POST',
      body: JSON.stringify({ key, value, category }),
    }),

  getDecisions: (missionId: string) =>
    fetchJson<Decision[]>(`/api/missions/${missionId}/decisions`),

  getTelemetry: (missionId: string) =>
    fetchJson<TelemetryEvent[]>(`/api/missions/${missionId}/telemetry`),
};
