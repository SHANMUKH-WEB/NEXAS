import { v4 as uuidv4 } from 'uuid';
import { db, localStore } from '../db.js';
import { broadcastEvent } from '../websocket.js';
import { generateAgentPlan, generateDecisionReasoning } from './gemini.js';
import { Mission, Agent, Task, Approval, AgentRole } from '../types.js';

interface MissionRuntime {
  timer: NodeJS.Timeout | null;
  isRunning: boolean;
}

const missionRuntimes: Map<string, MissionRuntime> = new Map();

export async function initializeMission(params: {
  title: string;
  goal: string;
  domain: string;
  autonomy_level: 'supervised' | 'autonomous';
  model?: string;
  is_demo?: boolean;
}): Promise<Mission> {
  const missionId = uuidv4();
  const now = new Date().toISOString();

  // 1. Create Mission
  const mission = await db.createMission({
    id: missionId,
    title: params.title,
    goal: params.goal,
    domain: params.domain,
    autonomy_level: params.autonomy_level,
    status: 'planning',
  });

  broadcastEvent('mission_created', missionId, mission);

  // 2. Instantiate all 8 Specialized Agents
  const agentDefs: Array<{ name: string; role: AgentRole; initialStatus: Agent['status']; confidence: number; msg: string }> = [
    { name: 'Aether (Lead Planner)', role: 'planner', initialStatus: 'thinking', confidence: 0.98, msg: 'Decomposing high-level mission goal into structured phases and DAG nodes.' },
    { name: 'Scout (Deep Research)', role: 'research', initialStatus: 'idle', confidence: 0.95, msg: 'Calibrating domain ontology and knowledge bases.' },
    { name: 'Arbiter (Decision Engine)', role: 'decision', initialStatus: 'idle', confidence: 0.94, msg: 'Initializing trade-off evaluation matrices.' },
    { name: 'Forge (Task Execution)', role: 'execution', initialStatus: 'idle', confidence: 0.92, msg: 'Executor sandbox initialized and armed.' },
    { name: 'Sentinel (Real-Time Monitor)', role: 'monitoring', initialStatus: 'executing', confidence: 0.99, msg: 'Telemetry stream active; monitoring SLA & anomaly signals.' },
    { name: 'Aegis (Safety & Guardrails)', role: 'safety', initialStatus: 'idle', confidence: 0.97, msg: 'Autonomous policy enforcement gates active.' },
    { name: 'Phoenix (Autonomous Replan)', role: 'replanning', initialStatus: 'idle', confidence: 0.96, msg: 'Replanning heuristic engine online; listening for fault interrupts.' },
    { name: 'Chronicle (Persistent Memory)', role: 'memory', initialStatus: 'idle', confidence: 0.99, msg: 'Indexed mission context, constraints, and audit ledger.' },
  ];

  const createdAgents: Agent[] = [];
  for (const def of agentDefs) {
    const agent = await db.createAgent({
      id: uuidv4(),
      mission_id: missionId,
      name: def.name,
      role: def.role,
      status: def.initialStatus,
      current_task_id: null,
      confidence: def.confidence,
      activity_log: [
        {
          time: new Date().toLocaleTimeString(),
          message: def.msg,
          type: 'info',
        },
      ],
    });
    createdAgents.push(agent);
  }

  // 3. Store Context in Memory
  await db.createMemory({
    mission_id: missionId,
    key: 'mission_objective',
    value: { goal: params.goal, domain: params.domain, autonomy_level: params.autonomy_level },
    category: 'context',
  });

  // 4. Log Telemetry
  await db.logTelemetry({
    mission_id: missionId,
    event_type: 'mission_created',
    payload: { title: params.title, domain: params.domain, autonomy: params.autonomy_level },
  });

  // 5. Planner Agent decomposes goal into tasks via Gemini SDK or deterministic engine
  const generatedPlan = await generateAgentPlan(
    params.goal,
    params.domain,
    params.model || 'gemini-2.5-flash',
    params.is_demo || false
  );

  // Store planner insights in memory
  if (generatedPlan.context_insights && generatedPlan.context_insights.length > 0) {
    await db.createMemory({
      mission_id: missionId,
      key: 'planner_insights',
      value: { insights: generatedPlan.context_insights, phases: generatedPlan.phases },
      category: 'constraint',
    });
  }

  // Map generated tasks into DB tasks with mapped UUIDs for dependencies
  const idMap: Record<string, string> = {};
  for (const t of generatedPlan.tasks) {
    idMap[t.id] = uuidv4();
  }

  const createdTasks: Task[] = [];
  for (let i = 0; i < generatedPlan.tasks.length; i++) {
    const t = generatedPlan.tasks[i];
    const taskId = idMap[t.id];
    const mappedDeps = t.dependencies.map((d) => idMap[d] || d).filter((d) => !!d);

    const assignedAgent = createdAgents.find((a) => a.role === t.suggested_agent) || createdAgents.find((a) => a.role === 'execution');

    const createdTask = await db.createTask({
      id: taskId,
      mission_id: missionId,
      title: t.title,
      description: t.description,
      status: i === 0 && mappedDeps.length === 0 ? 'in_progress' : 'pending',
      assigned_agent_id: assignedAgent?.id || null,
      dependencies: mappedDeps,
      output_data: {},
      phase: t.phase || 'Phase 1: Execution',
    });
    createdTasks.push(createdTask);
  }

  // Update Planner agent to idle, Execution or Research agent to executing
  const plannerAgent = createdAgents.find((a) => a.role === 'planner');
  if (plannerAgent) {
    await db.updateAgent(plannerAgent.id, {
      status: 'idle',
      activity_log: [
        ...plannerAgent.activity_log,
        {
          time: new Date().toLocaleTimeString(),
          message: `Decomposition complete: generated ${createdTasks.length} tasks across ${generatedPlan.phases?.length || 3} phases. Handing over to executor pipeline.`,
          type: 'success',
        },
      ],
    });
  }

  const firstTask = createdTasks.find((t) => t.status === 'in_progress');
  if (firstTask && firstTask.assigned_agent_id) {
    const agent = createdAgents.find((a) => a.id === firstTask.assigned_agent_id);
    if (agent) {
      await db.updateAgent(agent.id, {
        status: 'executing',
        current_task_id: firstTask.id,
        activity_log: [
          ...agent.activity_log,
          {
            time: new Date().toLocaleTimeString(),
            message: `Claimed task: "${firstTask.title}". Starting autonomous execution.`,
            type: 'action',
          },
        ],
      });
    }
  }

  // Update Mission to 'executing'
  await db.updateMission(missionId, { status: 'executing' });
  broadcastEvent('mission_status_changed', missionId, { status: 'executing' });
  broadcastEvent('plan_updated', missionId, { tasks_count: createdTasks.length });

  // If autonomy_level is 'autonomous', kick off automated step runner
  if (params.autonomy_level === 'autonomous') {
    startAutonomousLoop(missionId);
  }

  return mission;
}

export function startAutonomousLoop(missionId: string) {
  stopAutonomousLoop(missionId);

  const runtime: MissionRuntime = {
    isRunning: true,
    timer: setInterval(async () => {
      try {
        const canContinue = await stepMission(missionId);
        if (!canContinue) {
          stopAutonomousLoop(missionId);
        }
      } catch (e) {
        console.error('Autonomous loop error:', e);
        stopAutonomousLoop(missionId);
      }
    }, 4500),
  };
  missionRuntimes.set(missionId, runtime);
}

export function stopAutonomousLoop(missionId: string) {
  const existing = missionRuntimes.get(missionId);
  if (existing?.timer) {
    clearInterval(existing.timer);
  }
  missionRuntimes.delete(missionId);
}

export async function stepMission(missionId: string): Promise<boolean> {
  const mission = await db.getMission(missionId);
  if (!mission || mission.status === 'paused' || mission.status === 'completed' || mission.status === 'failed') {
    return false;
  }

  const tasks = await db.getTasks(missionId);
  const agents = await db.getAgents(missionId);
  const approvals = await db.getApprovals(missionId);

  // Check if there is an unresolved high/critical approval blocking execution
  const pendingApprovals = approvals.filter((a) => a.status === 'pending');
  if (pendingApprovals.length > 0 && mission.autonomy_level === 'supervised') {
    // Notify through Aegis
    const aegis = agents.find((a) => a.role === 'safety');
    if (aegis && aegis.status !== 'waiting_approval') {
      await db.updateAgent(aegis.id, {
        status: 'waiting_approval',
        activity_log: [
          ...aegis.activity_log,
          {
            time: new Date().toLocaleTimeString(),
            message: `Execution gate active: Waiting for Human Authorization on pending approval "${pendingApprovals[0].action_description}".`,
            type: 'warning',
          },
        ],
      });
      broadcastEvent('agent_status_changed', missionId, { agent_id: aegis.id, status: 'waiting_approval' });
    }
    return false; // Paused waiting for approval
  }

  // 1. Advance in-progress task to completed
  const inProgressTask = tasks.find((t) => t.status === 'in_progress');
  if (inProgressTask) {
    // Check if task needs an approval check before completion
    const requiresApproval =
      (inProgressTask.title.toLowerCase().includes('contract') ||
        inProgressTask.title.toLowerCase().includes('spend') ||
        inProgressTask.title.toLowerCase().includes('budget') ||
        inProgressTask.title.toLowerCase().includes('cutover')) &&
      !approvals.some((a) => a.task_id === inProgressTask.id);

    if (requiresApproval && mission.autonomy_level === 'supervised') {
      // Trigger approval request
      const aegis = agents.find((a) => a.role === 'safety');
      const approval = await db.createApproval({
        mission_id: missionId,
        task_id: inProgressTask.id,
        agent_id: aegis?.id || null,
        action_description: `Authorize high-impact action: "${inProgressTask.title}"`,
        risk_level: 'high',
        status: 'pending',
        payload: {
          task_title: inProgressTask.title,
          estimated_cost: inProgressTask.title.toLowerCase().includes('contract') ? '$4,850.00' : 'N/A',
          blast_radius: 'Affects external vendors and financial contingency cap.',
        },
      });

      if (aegis) {
        await db.updateAgent(aegis.id, {
          status: 'waiting_approval',
          activity_log: [
            ...aegis.activity_log,
            {
              time: new Date().toLocaleTimeString(),
              message: `Safety Protocol Triggered: Dispatched "${inProgressTask.title}" to Human Approval Center.`,
              type: 'warning',
            },
          ],
        });
        broadcastEvent('agent_status_changed', missionId, { agent_id: aegis.id, status: 'waiting_approval' });
      }

      await db.logTelemetry({
        mission_id: missionId,
        event_type: 'approval_requested',
        payload: { approval_id: approval.id, task_id: inProgressTask.id },
      });
      broadcastEvent('approval_requested', missionId, approval);
      return false;
    }

    // Arbiter decision reasoning
    const decisionAgent = agents.find((a) => a.role === 'decision');
    if (decisionAgent && Math.random() > 0.4) {
      const decisionData = await generateDecisionReasoning(inProgressTask.title, mission.domain);
      await db.createDecision({
        mission_id: missionId,
        task_id: inProgressTask.id,
        agent_id: decisionAgent.id,
        options_considered: decisionData.options,
        selected_option: decisionData.selected,
        reasoning: decisionData.reasoning,
      });
      broadcastEvent('decision_logged', missionId, {
        task_id: inProgressTask.id,
        selected_option: decisionData.selected,
        reasoning: decisionData.reasoning,
      });
    }

    // Complete current task
    const mockOutput = {
      completed_at: new Date().toISOString(),
      execution_notes: `Successfully fulfilled requirements for "${inProgressTask.title}". Verified telemetry benchmarks.`,
      result_status: 'SUCCESS_200',
    };

    await db.updateTask(inProgressTask.id, {
      status: 'completed',
      output_data: mockOutput,
    });
    broadcastEvent('task_status_changed', missionId, {
      task_id: inProgressTask.id,
      status: 'completed',
      output_data: mockOutput,
    });

    // Update assigned agent
    if (inProgressTask.assigned_agent_id) {
      const agent = agents.find((a) => a.id === inProgressTask.assigned_agent_id);
      if (agent) {
        await db.updateAgent(agent.id, {
          status: 'idle',
          current_task_id: null,
          confidence: Math.min(1.0, agent.confidence + 0.02),
          activity_log: [
            ...agent.activity_log,
            {
              time: new Date().toLocaleTimeString(),
              message: `Verified and finished "${inProgressTask.title}". Releasing resource lock.`,
              type: 'success',
            },
          ],
        });
        broadcastEvent('agent_status_changed', missionId, { agent_id: agent.id, status: 'idle' });
      }
    }

    // Save memory item
    await db.createMemory({
      mission_id: missionId,
      key: `task_output_${inProgressTask.id.slice(0, 8)}`,
      value: { title: inProgressTask.title, output: mockOutput },
      category: 'artifact',
    });

    await db.logTelemetry({
      mission_id: missionId,
      event_type: 'task_completed',
      payload: { task_id: inProgressTask.id, title: inProgressTask.title },
    });
    broadcastEvent('telemetry_event', missionId, {
      event_type: 'task_completed',
      task_id: inProgressTask.id,
      title: inProgressTask.title,
    });
  }

  // 2. Pick next pending task whose dependencies are satisfied
  const updatedTasks = await db.getTasks(missionId);
  const completedTaskIds = new Set(updatedTasks.filter((t) => t.status === 'completed').map((t) => t.id));

  const nextTask = updatedTasks.find(
    (t) =>
      t.status === 'pending' &&
      t.dependencies.every((depId) => completedTaskIds.has(depId))
  );

  if (nextTask) {
    await db.updateTask(nextTask.id, { status: 'in_progress' });
    broadcastEvent('task_status_changed', missionId, { task_id: nextTask.id, status: 'in_progress' });

    if (nextTask.assigned_agent_id) {
      const agent = agents.find((a) => a.id === nextTask.assigned_agent_id);
      if (agent) {
        await db.updateAgent(agent.id, {
          status: 'executing',
          current_task_id: nextTask.id,
          activity_log: [
            ...agent.activity_log,
            {
              time: new Date().toLocaleTimeString(),
              message: `Engaging task "${nextTask.title}". Dependencies satisfied.`,
              type: 'action',
            },
          ],
        });
        broadcastEvent('agent_status_changed', missionId, {
          agent_id: agent.id,
          status: 'executing',
          task_id: nextTask.id,
        });
      }
    }
    return true;
  }

  // Check if ALL tasks are completed
  const allCompleted = updatedTasks.length > 0 && updatedTasks.every((t) => t.status === 'completed');
  if (allCompleted) {
    await db.updateMission(missionId, { status: 'completed' });
    broadcastEvent('mission_status_changed', missionId, { status: 'completed' });

    // Set all agents to idle with celebratory log
    for (const a of agents) {
      await db.updateAgent(a.id, {
        status: 'idle',
        current_task_id: null,
        confidence: 1.0,
      });
    }

    await db.logTelemetry({
      mission_id: missionId,
      event_type: 'mission_achieved',
      payload: {
        total_tasks: updatedTasks.length,
        completion_time: new Date().toISOString(),
      },
    });
    broadcastEvent('telemetry_event', missionId, {
      event_type: 'mission_achieved',
      total_tasks: updatedTasks.length,
    });
    return false;
  }

  return true;
}

export async function togglePause(missionId: string): Promise<Mission | null> {
  const mission = await db.getMission(missionId);
  if (!mission) return null;

  const newStatus = mission.status === 'paused' ? 'executing' : 'paused';
  if (newStatus === 'paused') {
    stopAutonomousLoop(missionId);
  } else if (mission.autonomy_level === 'autonomous') {
    startAutonomousLoop(missionId);
  }

  const updated = await db.updateMission(missionId, { status: newStatus });
  broadcastEvent('mission_status_changed', missionId, { status: newStatus });
  return updated;
}
