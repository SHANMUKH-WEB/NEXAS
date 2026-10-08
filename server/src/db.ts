import 'dotenv/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import {
  Mission,
  Agent,
  Task,
  Approval,
  Memory,
  Decision,
  TelemetryEvent,
} from './types.js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://csdusdduodzbehqxffly.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-key';

import { WebSocket } from 'ws';

let supabaseClient: SupabaseClient | null = null;
let useCloudSupabase = true;

try {
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && SUPABASE_SERVICE_ROLE_KEY !== 'mock-key') {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
      realtime: { transport: WebSocket as any },
    });
  }
} catch (e) {
  console.warn('Supabase initialization fallback:', e);
  useCloudSupabase = false;
}

// In-Memory & Local Fallback Store
class LocalStore {
  missions: Map<string, Mission> = new Map();
  agents: Map<string, Agent> = new Map();
  tasks: Map<string, Task> = new Map();
  approvals: Map<string, Approval> = new Map();
  memories: Map<string, Memory> = new Map();
  decisions: Map<string, Decision> = new Map();
  telemetry: Map<string, TelemetryEvent> = new Map();

  constructor() {
    this.seedDemoMission();
  }

  seedDemoMission() {
    const missionId = '00000000-0000-0000-0000-000000000001';
    const now = new Date().toISOString();

    const demoMission: Mission = {
      id: missionId,
      title: 'Organize College Technical Festival 2026',
      goal: 'Organize a college technical festival for 500 students with hackathons, workshops, keynote speakers, and vendor sponsorships within a $15,000 budget.',
      status: 'executing',
      domain: 'Event Management',
      autonomy_level: 'supervised',
      created_at: now,
      updated_at: now,
    };
    this.missions.set(missionId, demoMission);

    // 8 Specialized Agents
    const agentsList: Agent[] = [
      {
        id: '10000000-0000-0000-0000-000000000001',
        mission_id: missionId,
        name: 'Aether (Lead Planner)',
        role: 'planner',
        status: 'thinking',
        current_task_id: null,
        confidence: 0.98,
        activity_log: [
          { time: '09:00:01', message: 'Mission initialized and decomposed into 6 critical path stages.', type: 'info' },
          { time: '09:00:10', message: 'Synthesized parallel work streams: Facilities & Financial Caps.', type: 'action' },
        ],
        created_at: now,
      },
      {
        id: '10000000-0000-0000-0000-000000000002',
        mission_id: missionId,
        name: 'Scout (Deep Research)',
        role: 'research',
        status: 'executing',
        current_task_id: '20000000-0000-0000-0000-000000000005',
        confidence: 0.95,
        activity_log: [
          { time: '09:00:15', message: 'Evaluated 4 university auditorium spaces for 500+ participant capacity.', type: 'info' },
          { time: '09:01:20', message: 'Benchmarking AI speakers and developer advocates for keynote tracks.', type: 'action' },
        ],
        created_at: now,
      },
      {
        id: '10000000-0000-0000-0000-000000000003',
        mission_id: missionId,
        name: 'Arbiter (Decision Engine)',
        role: 'decision',
        status: 'idle',
        current_task_id: null,
        confidence: 0.94,
        activity_log: [
          { time: '09:00:30', message: 'Selected Main Auditorium over Sports Complex due to AV/Power redundancy.', type: 'action' },
        ],
        created_at: now,
      },
      {
        id: '10000000-0000-0000-0000-000000000004',
        mission_id: missionId,
        name: 'Forge (Task Execution)',
        role: 'execution',
        status: 'executing',
        current_task_id: '20000000-0000-0000-0000-000000000003',
        confidence: 0.91,
        activity_log: [
          { time: '09:01:00', message: 'Configuring QR badge issuance & attendee registration flow.', type: 'action' },
        ],
        created_at: now,
      },
      {
        id: '10000000-0000-0000-0000-000000000005',
        mission_id: missionId,
        name: 'Sentinel (Real-Time Monitor)',
        role: 'monitoring',
        status: 'executing',
        current_task_id: null,
        confidence: 0.99,
        activity_log: [
          { time: '09:01:10', message: 'Tracking telemetry, latency, and environmental anomaly sensors.', type: 'info' },
          { time: '09:02:00', message: 'All telemetry pipelines nominal. Zero bottlenecks detected.', type: 'success' },
        ],
        created_at: now,
      },
      {
        id: '10000000-0000-0000-0000-000000000006',
        mission_id: missionId,
        name: 'Aegis (Safety & Guardrails)',
        role: 'safety',
        status: 'waiting_approval',
        current_task_id: '20000000-0000-0000-0000-000000000004',
        confidence: 0.97,
        activity_log: [
          { time: '09:01:25', message: 'Flagged vendor contract ($4,850) exceeding autonomous spend threshold.', type: 'warning' },
          { time: '09:01:26', message: 'Dispatched vendor contract authorization to Human Approval Center.', type: 'action' },
        ],
        created_at: now,
      },
      {
        id: '10000000-0000-0000-0000-000000000007',
        mission_id: missionId,
        name: 'Phoenix (Autonomous Replan)',
        role: 'replanning',
        status: 'idle',
        current_task_id: null,
        confidence: 0.96,
        activity_log: [
          { time: '09:00:00', message: 'Standby ready for failure recovery and DAG hot-patching.', type: 'info' },
        ],
        created_at: now,
      },
      {
        id: '10000000-0000-0000-0000-000000000008',
        mission_id: missionId,
        name: 'Chronicle (Persistent Memory)',
        role: 'memory',
        status: 'idle',
        current_task_id: null,
        confidence: 0.99,
        activity_log: [
          { time: '09:01:30', message: 'Synchronized 4 contextual parameters, constraints, and venue specs.', type: 'info' },
        ],
        created_at: now,
      },
    ];

    agentsList.forEach((a) => this.agents.set(a.id, a));

    // Tasks List
    const tasksList: Task[] = [
      {
        id: '20000000-0000-0000-0000-000000000001',
        mission_id: missionId,
        title: 'Venue Sourcing & Space Reservation',
        description: 'Audit campus halls, assess 500 seat acoustics, secure Main Auditorium reservation.',
        status: 'completed',
        assigned_agent_id: '10000000-0000-0000-0000-000000000002',
        dependencies: [],
        output_data: { selected_venue: 'Main Campus Auditorium A', capacity: 550, av_ready: true, cost: 0 },
        phase: 'Phase 1: Foundation',
        created_at: now,
        updated_at: now,
      },
      {
        id: '20000000-0000-0000-0000-000000000002',
        mission_id: missionId,
        title: 'Budget Cap & Department Allocation',
        description: 'Allocate $15,000 budget across AV ($4k), Catering ($5k), Prizes ($4k), Contingency ($2k).',
        status: 'completed',
        assigned_agent_id: '10000000-0000-0000-0000-000000000003',
        dependencies: [],
        output_data: { budget_total: 15000, catering: 5000, prizes: 4000, contingency: 2000 },
        phase: 'Phase 1: Foundation',
        created_at: now,
        updated_at: now,
      },
      {
        id: '20000000-0000-0000-0000-000000000003',
        mission_id: missionId,
        title: 'Registration Portal & Ticket Tiering',
        description: 'Deploy self-service attendee signup portal with QR code badge issuance and waitlist.',
        status: 'in_progress',
        assigned_agent_id: '10000000-0000-0000-0000-000000000004',
        dependencies: ['20000000-0000-0000-0000-000000000001'],
        output_data: { portal_url: 'https://techfest2026.campus.edu', capacity_limit: 500, registered_count: 214 },
        phase: 'Phase 2: Operations',
        created_at: now,
        updated_at: now,
      },
      {
        id: '20000000-0000-0000-0000-000000000004',
        mission_id: missionId,
        title: 'Vendor Contracts & Catering Agreements',
        description: 'Execute contract with preferred catering supplier for 500 student meal packs.',
        status: 'pending',
        assigned_agent_id: '10000000-0000-0000-0000-000000000006',
        dependencies: ['20000000-0000-0000-0000-000000000002'],
        output_data: { vendor: 'Campus Gourmet LLC', quote_amount: 4850, meals: 500 },
        phase: 'Phase 2: Operations',
        created_at: now,
        updated_at: now,
      },
      {
        id: '20000000-0000-0000-0000-000000000005',
        mission_id: missionId,
        title: 'Keynote Speaker & Hackathon Mentors',
        description: 'Invite 3 industry tech leads and onboard 10 workshop mentors for hands-on sessions.',
        status: 'pending',
        assigned_agent_id: '10000000-0000-0000-0000-000000000002',
        dependencies: ['20000000-0000-0000-0000-000000000003'],
        output_data: { confirmed_speakers: ['Dr. Elena Rostova (AI Robotics)', 'Marcus Vance (Cloud Arch)'] },
        phase: 'Phase 3: Programming',
        created_at: now,
        updated_at: now,
      },
      {
        id: '20000000-0000-0000-0000-000000000006',
        mission_id: missionId,
        title: 'Emergency Protocols & Crowd Safety',
        description: 'Establish first-aid stations, emergency exits, and campus security liaison for 500 people.',
        status: 'pending',
        assigned_agent_id: '10000000-0000-0000-0000-000000000006',
        dependencies: ['20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002'],
        output_data: {},
        phase: 'Phase 3: Programming',
        created_at: now,
        updated_at: now,
      },
    ];

    tasksList.forEach((t) => this.tasks.set(t.id, t));

    // Approvals
    const demoApproval: Approval = {
      id: '30000000-0000-0000-0000-000000000001',
      mission_id: missionId,
      task_id: '20000000-0000-0000-0000-000000000004',
      agent_id: '10000000-0000-0000-0000-000000000006',
      action_description: 'Execute Binding Vendor Contract with Campus Gourmet LLC for $4,850.00 catering package',
      risk_level: 'high',
      status: 'pending',
      payload: {
        vendor_name: 'Campus Gourmet LLC',
        liability_deposit: 500,
        total_cost: 4850,
        delivery_window: '08:00 AM - 12:30 PM',
        cancellation_penalty: '50% within 48h',
      },
      created_at: now,
    };
    this.approvals.set(demoApproval.id, demoApproval);

    // Memories
    const memoriesList: Memory[] = [
      {
        id: uuidv4(),
        mission_id: missionId,
        key: 'financial_limit',
        value: { max_budget: 15000, currency: 'USD', flexible_margin: 0.05 },
        category: 'constraint',
        created_at: now,
      },
      {
        id: uuidv4(),
        mission_id: missionId,
        key: 'venue_specifications',
        value: { primary: 'Main Auditorium A', backup: 'North Engineering Quad', seats: 550, wifi_tier: 'Gigabit' },
        category: 'context',
        created_at: now,
      },
      {
        id: uuidv4(),
        mission_id: missionId,
        key: 'target_audience',
        value: { count: 500, departments: ['Computer Science', 'Electrical', 'Data Science', 'Design'] },
        category: 'context',
        created_at: now,
      },
      {
        id: uuidv4(),
        mission_id: missionId,
        key: 'key_milestones',
        value: { registration_launch: 'T-14 days', vendor_lock: 'T-7 days', rehearsal: 'T-1 day' },
        category: 'artifact',
        created_at: now,
      },
    ];
    memoriesList.forEach((m) => this.memories.set(m.id, m));

    // Decisions
    const demoDecision: Decision = {
      id: uuidv4(),
      mission_id: missionId,
      task_id: '20000000-0000-0000-0000-000000000001',
      agent_id: '10000000-0000-0000-0000-000000000003',
      options_considered: [
        { name: 'Sports Complex Arena', pros: 'Huge 800 capacity', cons: 'Poor acoustics, high heating/rental costs ($3k)' },
        { name: 'Main Auditorium A', pros: 'Full AV & audio system included, zero rental charge, 550 capacity', cons: 'Strict food policy inside hall' },
        { name: 'Student Union Ballroom', pros: 'Central location', cons: 'Capacity capped at 320' },
      ],
      selected_option: 'Main Auditorium A',
      reasoning: 'Minimizes financial overhead to $0 venue charge while comfortably seating 500 attendees with built-in theater acoustics and projector matrix.',
      created_at: now,
    };
    this.decisions.set(demoDecision.id, demoDecision);

    // Telemetry Events
    const events: TelemetryEvent[] = [
      {
        id: uuidv4(),
        mission_id: missionId,
        event_type: 'mission_created',
        payload: { title: 'Organize College Technical Festival 2026', initiator: 'Command Center', autonomy: 'supervised' },
        timestamp: new Date(Date.now() - 600000).toISOString(),
      },
      {
        id: uuidv4(),
        mission_id: missionId,
        event_type: 'plan_generated',
        payload: { tasks_count: 6, phases: 3, critical_path_length: 4 },
        timestamp: new Date(Date.now() - 550000).toISOString(),
      },
      {
        id: uuidv4(),
        mission_id: missionId,
        event_type: 'task_completed',
        payload: { task_id: '20000000-0000-0000-0000-000000000001', title: 'Venue Sourcing & Space Reservation' },
        timestamp: new Date(Date.now() - 400000).toISOString(),
      },
      {
        id: uuidv4(),
        mission_id: missionId,
        event_type: 'task_completed',
        payload: { task_id: '20000000-0000-0000-0000-000000000002', title: 'Budget Cap & Department Allocation' },
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: uuidv4(),
        mission_id: missionId,
        event_type: 'approval_requested',
        payload: { approval_id: '30000000-0000-0000-0000-000000000001', risk: 'high', action: 'Vendor Contract Execution' },
        timestamp: new Date(Date.now() - 120000).toISOString(),
      },
    ];
    events.forEach((e) => this.telemetry.set(e.id, e));
  }
}

export const localStore = new LocalStore();

// Database abstraction layer
export const db = {
  // Missions
  async getMissions(): Promise<Mission[]> {
    if (useCloudSupabase && supabaseClient) {
      const { data, error } = await supabaseClient.from('missions').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as Mission[];
    }
    return Array.from(localStore.missions.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async getMission(id: string): Promise<Mission | null> {
    if (useCloudSupabase && supabaseClient) {
      const { data, error } = await supabaseClient.from('missions').select('*').eq('id', id).single();
      if (!error && data) return data as Mission;
    }
    return localStore.missions.get(id) || null;
  },

  async createMission(mission: Omit<Mission, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Mission> {
    const id = mission.id || uuidv4();
    const now = new Date().toISOString();
    const fullMission: Mission = {
      id,
      title: mission.title,
      goal: mission.goal,
      status: mission.status || 'initializing',
      domain: mission.domain,
      autonomy_level: mission.autonomy_level || 'supervised',
      created_at: now,
      updated_at: now,
    };

    localStore.missions.set(id, fullMission);

    if (useCloudSupabase && supabaseClient) {
      try {
        await supabaseClient.from('missions').insert(fullMission);
      } catch (err) {
        console.warn('Cloud mission insert fallback to memory');
      }
    }
    return fullMission;
  },

  async updateMission(id: string, updates: Partial<Mission>): Promise<Mission | null> {
    const existing = localStore.missions.get(id);
    if (!existing) return null;

    const updated: Mission = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    localStore.missions.set(id, updated);

    if (useCloudSupabase && supabaseClient) {
      try {
        await supabaseClient.from('missions').update(updates).eq('id', id);
      } catch (err) {
        // fallback
      }
    }
    return updated;
  },

  // Agents
  async getAgents(missionId: string): Promise<Agent[]> {
    if (useCloudSupabase && supabaseClient) {
      const { data, error } = await supabaseClient.from('agents').select('*').eq('mission_id', missionId);
      if (!error && data && data.length > 0) return data as Agent[];
    }
    return Array.from(localStore.agents.values()).filter((a) => a.mission_id === missionId);
  },

  async getAgent(id: string): Promise<Agent | null> {
    if (useCloudSupabase && supabaseClient) {
      const { data, error } = await supabaseClient.from('agents').select('*').eq('id', id).single();
      if (!error && data) return data as Agent;
    }
    return localStore.agents.get(id) || null;
  },

  async createAgent(agent: Omit<Agent, 'id' | 'created_at'> & { id?: string }): Promise<Agent> {
    const id = agent.id || uuidv4();
    const fullAgent: Agent = {
      id,
      mission_id: agent.mission_id,
      name: agent.name,
      role: agent.role,
      status: agent.status || 'idle',
      current_task_id: agent.current_task_id || null,
      confidence: agent.confidence ?? 1.0,
      activity_log: agent.activity_log || [],
      created_at: new Date().toISOString(),
    };
    localStore.agents.set(id, fullAgent);

    if (useCloudSupabase && supabaseClient) {
      try {
        await supabaseClient.from('agents').insert(fullAgent);
      } catch (err) {}
    }
    return fullAgent;
  },

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | null> {
    const existing = localStore.agents.get(id);
    if (!existing) return null;

    const updated: Agent = { ...existing, ...updates };
    localStore.agents.set(id, updated);

    if (useCloudSupabase && supabaseClient) {
      try {
        await supabaseClient.from('agents').update(updates).eq('id', id);
      } catch (err) {}
    }
    return updated;
  },

  // Tasks
  async getTasks(missionId: string): Promise<Task[]> {
    if (useCloudSupabase && supabaseClient) {
      const { data, error } = await supabaseClient.from('tasks').select('*').eq('mission_id', missionId).order('created_at', { ascending: true });
      if (!error && data && data.length > 0) return data as Task[];
    }
    return Array.from(localStore.tasks.values())
      .filter((t) => t.mission_id === missionId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },

  async getTask(id: string): Promise<Task | null> {
    if (useCloudSupabase && supabaseClient) {
      const { data, error } = await supabaseClient.from('tasks').select('*').eq('id', id).single();
      if (!error && data) return data as Task;
    }
    return localStore.tasks.get(id) || null;
  },

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Task> {
    const id = task.id || uuidv4();
    const now = new Date().toISOString();
    const fullTask: Task = {
      id,
      mission_id: task.mission_id,
      title: task.title,
      description: task.description,
      status: task.status || 'pending',
      assigned_agent_id: task.assigned_agent_id || null,
      dependencies: task.dependencies || [],
      output_data: task.output_data || {},
      phase: task.phase || 'Execution Phase',
      created_at: now,
      updated_at: now,
    };
    localStore.tasks.set(id, fullTask);

    if (useCloudSupabase && supabaseClient) {
      try {
        await supabaseClient.from('tasks').insert(fullTask);
      } catch (err) {}
    }
    return fullTask;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const existing = localStore.tasks.get(id);
    if (!existing) return null;

    const updated: Task = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    localStore.tasks.set(id, updated);

    if (useCloudSupabase && supabaseClient) {
      try {
        await supabaseClient.from('tasks').update(updates).eq('id', id);
      } catch (err) {}
    }
    return updated;
  },

  // Approvals
  async getApprovals(missionId: string): Promise<Approval[]> {
    if (useCloudSupabase && supabaseClient) {
      const { data, error } = await supabaseClient.from('approvals').select('*').eq('mission_id', missionId).order('created_at', { ascending: false });
      if (!error && data) return data as Approval[];
    }
    return Array.from(localStore.approvals.values())
      .filter((a) => a.mission_id === missionId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getApproval(id: string): Promise<Approval | null> {
    if (useCloudSupabase && supabaseClient) {
      const { data, error } = await supabaseClient.from('approvals').select('*').eq('id', id).single();
      if (!error && data) return data as Approval;
    }
    return localStore.approvals.get(id) || null;
  },

  async createApproval(approval: Omit<Approval, 'id' | 'created_at'> & { id?: string }): Promise<Approval> {
    const id = approval.id || uuidv4();
    const fullApproval: Approval = {
      id,
      mission_id: approval.mission_id,
      task_id: approval.task_id || null,
      agent_id: approval.agent_id || null,
      action_description: approval.action_description,
      risk_level: approval.risk_level || 'medium',
      status: approval.status || 'pending',
      payload: approval.payload || {},
      created_at: new Date().toISOString(),
    };
    localStore.approvals.set(id, fullApproval);

    if (useCloudSupabase && supabaseClient) {
      try {
        await supabaseClient.from('approvals').insert(fullApproval);
      } catch (err) {}
    }
    return fullApproval;
  },

  async updateApproval(id: string, updates: Partial<Approval>): Promise<Approval | null> {
    const existing = localStore.approvals.get(id);
    if (!existing) return null;

    const updated: Approval = { ...existing, ...updates };
    localStore.approvals.set(id, updated);

    if (useCloudSupabase && supabaseClient) {
      try {
        await supabaseClient.from('approvals').update(updates).eq('id', id);
      } catch (err) {}
    }
    return updated;
  },

  // Memories
  async getMemories(missionId: string): Promise<Memory[]> {
    if (useCloudSupabase && supabaseClient) {
      const { data, error } = await supabaseClient.from('memories').select('*').eq('mission_id', missionId).order('created_at', { ascending: false });
      if (!error && data) return data as Memory[];
    }
    return Array.from(localStore.memories.values())
      .filter((m) => m.mission_id === missionId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async createMemory(memory: Omit<Memory, 'id' | 'created_at'> & { id?: string }): Promise<Memory> {
    const id = memory.id || uuidv4();
    const fullMemory: Memory = {
      id,
      mission_id: memory.mission_id,
      key: memory.key,
      value: memory.value,
      category: memory.category,
      created_at: new Date().toISOString(),
    };
    localStore.memories.set(id, fullMemory);

    if (useCloudSupabase && supabaseClient) {
      try {
        await supabaseClient.from('memories').insert(fullMemory);
      } catch (err) {}
    }
    return fullMemory;
  },

  // Decisions
  async getDecisions(missionId: string): Promise<Decision[]> {
    if (useCloudSupabase && supabaseClient) {
      const { data, error } = await supabaseClient.from('decisions').select('*').eq('mission_id', missionId).order('created_at', { ascending: false });
      if (!error && data) return data as Decision[];
    }
    return Array.from(localStore.decisions.values())
      .filter((d) => d.mission_id === missionId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async createDecision(decision: Omit<Decision, 'id' | 'created_at'> & { id?: string }): Promise<Decision> {
    const id = decision.id || uuidv4();
    const fullDecision: Decision = {
      id,
      mission_id: decision.mission_id,
      task_id: decision.task_id || null,
      agent_id: decision.agent_id || null,
      options_considered: decision.options_considered || [],
      selected_option: decision.selected_option,
      reasoning: decision.reasoning,
      created_at: new Date().toISOString(),
    };
    localStore.decisions.set(id, fullDecision);

    if (useCloudSupabase && supabaseClient) {
      try {
        await supabaseClient.from('decisions').insert(fullDecision);
      } catch (err) {}
    }
    return fullDecision;
  },

  // Telemetry
  async getTelemetry(missionId: string): Promise<TelemetryEvent[]> {
    if (useCloudSupabase && supabaseClient) {
      const { data, error } = await supabaseClient.from('telemetry_events').select('*').eq('mission_id', missionId).order('timestamp', { ascending: true });
      if (!error && data) return data as TelemetryEvent[];
    }
    return Array.from(localStore.telemetry.values())
      .filter((t) => t.mission_id === missionId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  async logTelemetry(event: Omit<TelemetryEvent, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<TelemetryEvent> {
    const id = event.id || uuidv4();
    const fullEvent: TelemetryEvent = {
      id,
      mission_id: event.mission_id,
      event_type: event.event_type,
      payload: event.payload,
      timestamp: event.timestamp || new Date().toISOString(),
    };
    localStore.telemetry.set(id, fullEvent);

    if (useCloudSupabase && supabaseClient) {
      try {
        await supabaseClient.from('telemetry_events').insert(fullEvent);
      } catch (err) {}
    }
    return fullEvent;
  },
};
