import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { broadcastEvent } from '../websocket.js';
import { generateReplanPatch } from './gemini.js';
import { Task, Agent } from '../types.js';

export async function simulateFailure(
  missionId: string,
  scenario: string,
  customDescription?: string,
  affectedTaskId?: string
) {
  const mission = await db.getMission(missionId);
  if (!mission) throw new Error('Mission not found');

  const agents = await db.getAgents(missionId);
  const tasks = await db.getTasks(missionId);

  const monitorAgent = agents.find((a) => a.role === 'monitoring');
  const replanAgent = agents.find((a) => a.role === 'replanning');
  const decisionAgent = agents.find((a) => a.role === 'decision');
  const execAgent = agents.find((a) => a.role === 'execution');

  let failureDescription = customDescription || '';
  if (!failureDescription) {
    switch (scenario) {
      case 'venue_cancelled':
        failureDescription = 'CRITICAL ALERT: Primary Venue (Main Auditorium A) cancelled due to emergency HVAC flood.';
        break;
      case 'budget_overrun':
        failureDescription = 'BUDGET BREACH: Vendor quotes surged by 38%, exceeding financial contingency cap.';
        break;
      case 'api_outage':
        failureDescription = 'EXTERNAL OUTAGE: Payment & Ticketing API gateway is timing out with 504 Gateway Timeout.';
        break;
      default:
        failureDescription = 'ENVIRONMENTAL DISRUPTION: High-priority constraint violation detected.';
    }
  }

  // 1. Mission enters 'recovering'
  await db.updateMission(missionId, { status: 'recovering' });
  broadcastEvent('mission_status_changed', missionId, { status: 'recovering' });

  // 2. Monitoring Agent (Sentinel) flags anomaly
  const now = new Date().toLocaleTimeString();
  if (monitorAgent) {
    const updatedLog = [
      ...monitorAgent.activity_log,
      {
        time: now,
        message: `🚨 ANOMALY FLAGGED: ${failureDescription}`,
        type: 'warning' as const,
      },
    ];
    await db.updateAgent(monitorAgent.id, {
      status: 'thinking',
      confidence: 0.72,
      activity_log: updatedLog,
    });
    broadcastEvent('agent_status_changed', missionId, {
      agent_id: monitorAgent.id,
      status: 'thinking',
      confidence: 0.72,
      log: updatedLog[updatedLog.length - 1],
    });
  }

  // 3. Mark affected task or in-progress task as failed/blocked
  let targetTask = affectedTaskId ? tasks.find((t) => t.id === affectedTaskId) : null;
  if (!targetTask) {
    targetTask = tasks.find((t) => t.status === 'in_progress') || tasks.find((t) => t.status === 'pending') || tasks[0];
  }

  if (targetTask) {
    await db.updateTask(targetTask.id, { status: 'failed' });
    broadcastEvent('task_status_changed', missionId, {
      task_id: targetTask.id,
      status: 'failed',
    });
  }

  // 4. Log Telemetry Event
  await db.logTelemetry({
    mission_id: missionId,
    event_type: 'anomaly_detected',
    payload: {
      scenario,
      description: failureDescription,
      affected_task_id: targetTask?.id,
      severity: 'critical',
    },
  });
  broadcastEvent('telemetry_event', missionId, {
    event_type: 'anomaly_detected',
    scenario,
    description: failureDescription,
  });

  // 5. Replanning Agent (Phoenix) awakens
  if (replanAgent) {
    const updatedLog = [
      ...replanAgent.activity_log,
      {
        time: now,
        message: `🔄 REPLANNING INITIATED: Computing blast radius for "${failureDescription}". Formulating patch tasks...`,
        type: 'action' as const,
      },
    ];
    await db.updateAgent(replanAgent.id, {
      status: 'executing',
      confidence: 0.94,
      activity_log: updatedLog,
    });
    broadcastEvent('agent_status_changed', missionId, {
      agent_id: replanAgent.id,
      status: 'executing',
      confidence: 0.94,
      log: updatedLog[updatedLog.length - 1],
    });
  }

  // 6. Generate Replan Patch via Gemini or deterministic engine
  const taskSummaries = tasks.map((t) => ({ id: t.id, title: t.title, status: t.status }));
  const replanResult = await generateReplanPatch(mission.goal, failureDescription, taskSummaries);

  // 7. Arbiter (Decision Agent) logs decision
  if (decisionAgent) {
    await db.createDecision({
      mission_id: missionId,
      task_id: targetTask?.id || null,
      agent_id: decisionAgent.id,
      options_considered: [
        { name: 'Abort Mission', pros: 'Zero further spend', cons: 'Total objective failure', score: 10 },
        { name: replanResult.mitigation_strategy, pros: 'Preserves timeline and attendees', cons: 'Requires dynamic DAG rewiring', score: 94 },
      ],
      selected_option: replanResult.mitigation_strategy,
      reasoning: `Root cause: ${replanResult.root_cause}. Impact: ${replanResult.impact_assessment}. Selected self-healing mitigation strategy to maintain 100% mission SLA.`,
    });
    broadcastEvent('decision_logged', missionId, {
      selected_option: replanResult.mitigation_strategy,
      reasoning: replanResult.mitigation_strategy,
    });
  }

  // 8. Inject Patch Tasks into Database
  const createdPatchTasks: Task[] = [];
  let prevPatchId = targetTask ? targetTask.id : '';

  for (let i = 0; i < replanResult.patch_tasks.length; i++) {
    const pt = replanResult.patch_tasks[i];
    const newTaskId = uuidv4();
    const assignedAgent = agents.find((a) => a.role === pt.suggested_agent) || execAgent || replanAgent;

    const patchTask = await db.createTask({
      id: newTaskId,
      mission_id: missionId,
      title: `[RECOVERY] ${pt.title}`,
      description: pt.description,
      status: i === 0 ? 'in_progress' : 'pending',
      assigned_agent_id: assignedAgent?.id || null,
      dependencies: i === 0 && targetTask ? [targetTask.id] : (prevPatchId ? [prevPatchId] : []),
      output_data: { recovery_metadata: { root_cause: replanResult.root_cause, strategy: replanResult.mitigation_strategy } },
      phase: 'Recovery & Self-Healing',
    });
    createdPatchTasks.push(patchTask);
    prevPatchId = newTaskId;
    broadcastEvent('task_created', missionId, patchTask);
  }

  // 9. Rewire any pending tasks that depended on targetTask to depend on the last patch task
  if (targetTask && createdPatchTasks.length > 0) {
    const lastPatchTask = createdPatchTasks[createdPatchTasks.length - 1];
    for (const t of tasks) {
      if (t.dependencies.includes(targetTask.id) && t.id !== targetTask.id) {
        const rewiredDeps = t.dependencies.map((d) => (d === targetTask.id ? lastPatchTask.id : d));
        await db.updateTask(t.id, { dependencies: rewiredDeps, status: 'pending' });
        broadcastEvent('task_updated', missionId, { task_id: t.id, dependencies: rewiredDeps });
      }
    }
  }

  // 10. Update Sentinel & Phoenix to nominal state
  if (replanAgent) {
    const finalLog = [
      ...replanAgent.activity_log,
      {
        time: new Date().toLocaleTimeString(),
        message: `✅ SELF-HEALING SUCCESS: Injected ${createdPatchTasks.length} recovery tasks into DAG. Dependency chain rewired.`,
        type: 'success' as const,
      },
    ];
    await db.updateAgent(replanAgent.id, {
      status: 'idle',
      confidence: 0.99,
      activity_log: finalLog,
    });
    broadcastEvent('agent_status_changed', missionId, {
      agent_id: replanAgent.id,
      status: 'idle',
      confidence: 0.99,
      log: finalLog[finalLog.length - 1],
    });
  }

  if (monitorAgent) {
    await db.updateAgent(monitorAgent.id, {
      status: 'executing',
      confidence: 0.98,
    });
    broadcastEvent('agent_status_changed', missionId, {
      agent_id: monitorAgent.id,
      status: 'executing',
      confidence: 0.98,
    });
  }

  // 11. Resume Mission Execution
  await db.updateMission(missionId, { status: 'executing' });
  broadcastEvent('mission_status_changed', missionId, { status: 'executing' });

  // 12. Telemetry Log
  await db.logTelemetry({
    mission_id: missionId,
    event_type: 'autonomous_recovery_complete',
    payload: {
      patch_count: createdPatchTasks.length,
      mitigation: replanResult.mitigation_strategy,
    },
  });
  broadcastEvent('telemetry_event', missionId, {
    event_type: 'autonomous_recovery_complete',
    patch_count: createdPatchTasks.length,
  });

  return {
    success: true,
    replanResult,
    patchTasks: createdPatchTasks,
  };
}
