import { create } from 'zustand';
import confetti from 'canvas-confetti';
import {
  Mission,
  Agent,
  Task,
  Approval,
  Memory,
  Decision,
  TelemetryEvent,
  WebSocketMessage,
} from '../types';
import { api } from '../lib/api';

interface MissionState {
  // Data
  missions: Mission[];
  currentMission: Mission | null;
  agents: Agent[];
  tasks: Task[];
  approvals: Approval[];
  memories: Memory[];
  decisions: Decision[];
  telemetry: TelemetryEvent[];

  // App UI state
  isLoading: boolean;
  isWsConnected: boolean;
  selectedTaskId: string | null;
  selectedAgentId: string | null;
  isFailureModalOpen: boolean;
  model: string;
  isDemoMode: boolean;

  // Replay scrubber
  isReplaying: boolean;
  replayStep: number;
  replaySpeed: number;

  // Actions
  fetchMissions: () => Promise<void>;
  selectMission: (id: string) => Promise<void>;
  loadDemoMission: () => Promise<void>;
  createMission: (data: {
    title: string;
    goal: string;
    domain: string;
    autonomy_level: 'supervised' | 'autonomous';
    model?: string;
    is_demo?: boolean;
  }) => Promise<Mission>;
  stepCurrentMission: () => Promise<void>;
  togglePauseMission: () => Promise<void>;
  triggerFailureSimulation: (
    scenario: 'venue_cancelled' | 'budget_overrun' | 'api_outage' | 'custom',
    description?: string,
    affectedTaskId?: string
  ) => Promise<void>;
  resolveApproval: (id: string, status: 'approved' | 'rejected', feedback?: string) => Promise<void>;
  addCustomMemory: (key: string, value: Record<string, any>, category: any) => Promise<void>;
  setSelectedTaskId: (id: string | null) => void;
  setSelectedAgentId: (id: string | null) => void;
  setFailureModalOpen: (open: boolean) => void;
  setModel: (model: string) => void;
  setDemoMode: (isDemo: boolean) => void;
  startReplay: () => void;
  pauseReplay: () => void;
  setReplayStep: (step: number) => void;
  setReplaySpeed: (speed: number) => void;

  // WebSocket
  initWebSocket: () => void;
  handleWsMessage: (msg: WebSocketMessage) => void;
}

let wsInstance: WebSocket | null = null;
let replayTimer: any = null;

export const useMissionStore = create<MissionState>((set, get) => ({
  missions: [],
  currentMission: null,
  agents: [],
  tasks: [],
  approvals: [],
  memories: [],
  decisions: [],
  telemetry: [],

  isLoading: false,
  isWsConnected: false,
  selectedTaskId: null,
  selectedAgentId: null,
  isFailureModalOpen: false,
  model: 'gemini-2.5-flash',
  isDemoMode: false,

  isReplaying: false,
  replayStep: 0,
  replaySpeed: 1,

  fetchMissions: async () => {
    try {
      const list = await api.getMissions();
      set({ missions: list });
      if (!get().currentMission && list.length > 0) {
        await get().selectMission(list[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch missions:', err);
    }
  },

  selectMission: async (id: string) => {
    set({ isLoading: true });
    try {
      const details = await api.getMission(id);
      const [approvals, memories, decisions, telemetry] = await Promise.all([
        api.getApprovals(id),
        api.getMemories(id),
        api.getDecisions(id),
        api.getTelemetry(id),
      ]);

      set({
        currentMission: details.mission,
        agents: details.agents,
        tasks: details.tasks,
        approvals,
        memories,
        decisions,
        telemetry,
        replayStep: telemetry.length,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to select mission:', err);
      set({ isLoading: false });
    }
  },

  loadDemoMission: async () => {
    set({ isLoading: true });
    try {
      const res = await api.loadDemoMission();
      await get().selectMission(res.missionId);
      await get().fetchMissions();
    } catch (err) {
      console.error('Failed to load demo mission:', err);
      set({ isLoading: false });
    }
  },

  createMission: async (data) => {
    set({ isLoading: true });
    try {
      const mission = await api.createMission({
        ...data,
        model: get().model,
        is_demo: get().isDemoMode,
      });
      await get().fetchMissions();
      await get().selectMission(mission.id);
      return mission;
    } finally {
      set({ isLoading: false });
    }
  },

  stepCurrentMission: async () => {
    const cur = get().currentMission;
    if (!cur) return;
    try {
      const res = await api.stepMission(cur.id);
      set({ tasks: res.tasks, agents: res.agents });

      const updated = await api.getMission(cur.id);
      set({ currentMission: updated.mission });

      if (updated.mission.status === 'completed') {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#818cf8', '#34d399', '#f472b6'],
        });
      }

      // Refresh telemetry
      const tel = await api.getTelemetry(cur.id);
      set({ telemetry: tel });
    } catch (err) {
      console.error('Failed to step mission:', err);
    }
  },

  togglePauseMission: async () => {
    const cur = get().currentMission;
    if (!cur) return;
    try {
      const res = await api.pauseMission(cur.id);
      set({
        currentMission: { ...cur, status: res.status as any },
      });
    } catch (err) {
      console.error('Failed to toggle pause:', err);
    }
  },

  triggerFailureSimulation: async (scenario, description, affectedTaskId) => {
    const cur = get().currentMission;
    if (!cur) return;
    set({ isLoading: true });
    try {
      await api.simulateFailure(cur.id, scenario, description, affectedTaskId);
      await get().selectMission(cur.id);
      set({ isFailureModalOpen: false });
    } catch (err) {
      console.error('Failed to trigger failure simulation:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  resolveApproval: async (id, status, feedback) => {
    try {
      await api.resolveApproval(id, status, feedback);
      const cur = get().currentMission;
      if (cur) {
        const [appr, tasks, agents] = await Promise.all([
          api.getApprovals(cur.id),
          api.getTasks(cur.id),
          api.getAgents(cur.id),
        ]);
        set({ approvals: appr, tasks, agents });
      }
    } catch (err) {
      console.error('Failed to resolve approval:', err);
    }
  },

  addCustomMemory: async (key, value, category) => {
    const cur = get().currentMission;
    if (!cur) return;
    try {
      const mem = await api.addMemory(cur.id, key, value, category);
      set((state) => ({ memories: [mem, ...state.memories] }));
    } catch (err) {
      console.error('Failed to add memory:', err);
    }
  },

  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  setSelectedAgentId: (id) => set({ selectedAgentId: id }),
  setFailureModalOpen: (open) => set({ isFailureModalOpen: open }),
  setModel: (model) => set({ model }),
  setDemoMode: (isDemoMode) => set({ isDemoMode }),

  startReplay: () => {
    if (replayTimer) clearInterval(replayTimer);
    set({ isReplaying: true });

    const total = get().telemetry.length;
    if (get().replayStep >= total) {
      set({ replayStep: 0 });
    }

    const interval = Math.max(400, 1500 / get().replaySpeed);
    replayTimer = setInterval(() => {
      const next = get().replayStep + 1;
      const totalEvents = get().telemetry.length;
      if (next >= totalEvents) {
        clearInterval(replayTimer!);
        set({ isReplaying: false, replayStep: totalEvents });
      } else {
        set({ replayStep: next });
      }
    }, interval);
  },

  pauseReplay: () => {
    if (replayTimer) clearInterval(replayTimer);
    set({ isReplaying: false });
  },

  setReplayStep: (step) => set({ replayStep: step }),
  setReplaySpeed: (speed) => {
    set({ replaySpeed: speed });
    if (get().isReplaying) {
      get().startReplay();
    }
  },

  initWebSocket: () => {
    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl =
      import.meta.env.VITE_WS_URL ||
      `${protocol}//${window.location.hostname}:5000`;

    try {
      wsInstance = new WebSocket(wsUrl);

      wsInstance.onopen = () => {
        set({ isWsConnected: true });
        // console.log('[WS] Connected to NEXUS AI event stream');
      };

      wsInstance.onclose = () => {
        set({ isWsConnected: false });
        setTimeout(() => get().initWebSocket(), 4000);
      };

      wsInstance.onerror = () => {
        set({ isWsConnected: false });
      };

      wsInstance.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as WebSocketMessage;
          get().handleWsMessage(parsed);
        } catch (e) {}
      };
    } catch (e) {
      console.warn('WS connection initialization error:', e);
    }
  },

  handleWsMessage: (msg: WebSocketMessage) => {
    const cur = get().currentMission;
    if (!cur || (msg.mission_id && msg.mission_id !== cur.id)) {
      return;
    }

    switch (msg.type) {
      case 'mission_status_changed':
        set((state) => ({
          currentMission: state.currentMission ? { ...state.currentMission, status: msg.data.status } : null,
        }));
        if (msg.data.status === 'completed') {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
          });
        }
        break;

      case 'agent_status_changed':
        set((state) => ({
          agents: state.agents.map((a) => {
            if (a.id === msg.data.agent_id) {
              const updatedLog = msg.data.log ? [...a.activity_log, msg.data.log] : a.activity_log;
              return {
                ...a,
                status: msg.data.status || a.status,
                confidence: msg.data.confidence ?? a.confidence,
                current_task_id: msg.data.task_id !== undefined ? msg.data.task_id : a.current_task_id,
                activity_log: updatedLog,
              };
            }
            return a;
          }),
        }));
        break;

      case 'task_status_changed':
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === msg.data.task_id
              ? { ...t, status: msg.data.status, output_data: msg.data.output_data || t.output_data }
              : t
          ),
        }));
        break;

      case 'task_created':
        set((state) => {
          if (state.tasks.some((t) => t.id === msg.data.id)) return state;
          return { tasks: [...state.tasks, msg.data] };
        });
        break;

      case 'task_updated':
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === msg.data.task_id ? { ...t, dependencies: msg.data.dependencies || t.dependencies } : t
          ),
        }));
        break;

      case 'approval_requested':
        set((state) => ({
          approvals: [msg.data, ...state.approvals],
        }));
        break;

      case 'approval_resolved':
        set((state) => ({
          approvals: state.approvals.map((a) => (a.id === msg.data.id ? msg.data : a)),
        }));
        break;

      case 'decision_logged':
        // Refetch decisions
        if (cur) {
          api.getDecisions(cur.id).then((d) => set({ decisions: d }));
        }
        break;

      case 'telemetry_event':
        set((state) => ({
          telemetry: [
            ...state.telemetry,
            {
              id: String(Date.now()),
              mission_id: cur.id,
              event_type: msg.data.event_type || 'system_event',
              payload: msg.data,
              timestamp: msg.timestamp || new Date().toISOString(),
            },
          ],
        }));
        break;
    }
  },
}));
