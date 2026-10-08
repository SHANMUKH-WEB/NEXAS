import { z } from 'zod';

export type MissionStatus =
  | 'initializing'
  | 'planning'
  | 'executing'
  | 'paused'
  | 'recovering'
  | 'completed'
  | 'failed';

export type AgentRole =
  | 'planner'
  | 'research'
  | 'decision'
  | 'execution'
  | 'monitoring'
  | 'safety'
  | 'replanning'
  | 'memory';

export type AgentStatus =
  | 'idle'
  | 'thinking'
  | 'executing'
  | 'waiting_approval'
  | 'error';

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'blocked'
  | 'replanning';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type MemoryCategory = 'context' | 'decision' | 'constraint' | 'artifact';

export interface Mission {
  id: string;
  title: string;
  goal: string;
  status: MissionStatus;
  domain: string;
  autonomy_level: 'supervised' | 'autonomous';
  created_at: string;
  updated_at: string;
}

export interface AgentActivity {
  id?: string;
  time: string;
  message: string;
  type?: 'info' | 'action' | 'warning' | 'success';
}

export interface Agent {
  id: string;
  mission_id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  current_task_id: string | null;
  confidence: number;
  activity_log: AgentActivity[];
  created_at: string;
}

export interface Task {
  id: string;
  mission_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigned_agent_id: string | null;
  dependencies: string[];
  output_data: Record<string, any>;
  phase?: string;
  created_at: string;
  updated_at: string;
}

export interface Approval {
  id: string;
  mission_id: string;
  task_id: string | null;
  agent_id: string | null;
  action_description: string;
  risk_level: RiskLevel;
  status: ApprovalStatus;
  payload: Record<string, any>;
  created_at: string;
}

export interface Memory {
  id: string;
  mission_id: string;
  key: string;
  value: Record<string, any>;
  category: MemoryCategory;
  created_at: string;
}

export interface DecisionOption {
  name: string;
  pros?: string;
  cons?: string;
  score?: number;
}

export interface Decision {
  id: string;
  mission_id: string;
  task_id: string | null;
  agent_id: string | null;
  options_considered: DecisionOption[];
  selected_option: string;
  reasoning: string;
  created_at: string;
}

export interface TelemetryEvent {
  id: string;
  mission_id: string;
  event_type: string;
  payload: Record<string, any>;
  timestamp: string;
}

// Zod validation schemas
export const createMissionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  goal: z.string().min(10, 'Goal must be at least 10 characters'),
  domain: z.string().min(1, 'Domain is required'),
  autonomy_level: z.enum(['supervised', 'autonomous']).default('supervised'),
  model: z.string().optional().default('gemini-2.5-flash'),
  is_demo: z.boolean().optional().default(false),
});

export const resolveApprovalSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  feedback: z.string().optional(),
});

export const simulateFailureSchema = z.object({
  scenario: z.enum(['venue_cancelled', 'budget_overrun', 'api_outage', 'custom']),
  description: z.string().min(3),
  affected_task_id: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('high'),
});

export const addMemorySchema = z.object({
  key: z.string().min(1),
  value: z.record(z.any()),
  category: z.enum(['context', 'decision', 'constraint', 'artifact']),
});

export interface WebSocketMessage {
  type: string;
  mission_id?: string;
  data: any;
  timestamp: string;
}
