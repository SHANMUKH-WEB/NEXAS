import { Router, Request, Response } from 'express';
import { db, localStore } from './db.js';
import {
  createMissionSchema,
  resolveApprovalSchema,
  simulateFailureSchema,
  addMemorySchema,
} from './types.js';
import {
  initializeMission,
  stepMission,
  togglePause,
  startAutonomousLoop,
  stopAutonomousLoop,
} from './services/agentOrchestrator.js';
import { simulateFailure } from './services/failureSimulator.js';
import { broadcastEvent } from './websocket.js';

export const apiRouter = Router();

// Health check
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    platform: 'NEXUS AI Autonomous Problem-Solving Intelligence',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// List all missions
apiRouter.get('/missions', async (_req: Request, res: Response) => {
  try {
    const missions = await db.getMissions();
    res.json(missions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reset / Load Demo Mission
apiRouter.post('/missions/demo', async (_req: Request, res: Response) => {
  try {
    localStore.seedDemoMission();
    const demoId = '00000000-0000-0000-0000-000000000001';
    const mission = await db.getMission(demoId);
    broadcastEvent('mission_created', demoId, mission);
    res.json({ success: true, missionId: demoId, mission });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create new mission
apiRouter.post('/missions', async (req: Request, res: Response) => {
  try {
    const parseResult = createMissionSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      });
    }

    const { title, goal, domain, autonomy_level, model, is_demo } = parseResult.data;
    const mission = await initializeMission({
      title,
      goal,
      domain,
      autonomy_level,
      model,
      is_demo,
    });

    res.status(201).json(mission);
  } catch (err: any) {
    console.error('Error creating mission:', err);
    res.status(500).json({ error: err.message || 'Failed to create mission' });
  }
});

// Get single mission details with agents and tasks
apiRouter.get('/missions/:id', async (req: Request, res: Response) => {
  try {
    const mission = await db.getMission(req.params.id);
    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }
    const agents = await db.getAgents(mission.id);
    const tasks = await db.getTasks(mission.id);
    res.json({ mission, agents, tasks });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Step mission manually
apiRouter.post('/missions/:id/step', async (req: Request, res: Response) => {
  try {
    const mission = await db.getMission(req.params.id);
    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }
    const continued = await stepMission(req.params.id);
    const updatedTasks = await db.getTasks(req.params.id);
    const updatedAgents = await db.getAgents(req.params.id);
    res.json({ success: true, continued, tasks: updatedTasks, agents: updatedAgents });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle pause/resume mission
apiRouter.post('/missions/:id/pause', async (req: Request, res: Response) => {
  try {
    const mission = await togglePause(req.params.id);
    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }
    res.json({ success: true, status: mission.status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Simulate failure & trigger autonomous recovery
apiRouter.post('/missions/:id/simulate-failure', async (req: Request, res: Response) => {
  try {
    const parseResult = simulateFailureSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      });
    }

    const { scenario, description, affected_task_id } = parseResult.data;
    const result = await simulateFailure(req.params.id, scenario, description, affected_task_id);
    res.json(result);
  } catch (err: any) {
    console.error('Error simulating failure:', err);
    res.status(500).json({ error: err.message || 'Failed to simulate failure' });
  }
});

// Get tasks
apiRouter.get('/missions/:id/tasks', async (req: Request, res: Response) => {
  try {
    const tasks = await db.getTasks(req.params.id);
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get agents
apiRouter.get('/missions/:id/agents', async (req: Request, res: Response) => {
  try {
    const agents = await db.getAgents(req.params.id);
    res.json(agents);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get approvals
apiRouter.get('/missions/:id/approvals', async (req: Request, res: Response) => {
  try {
    const approvals = await db.getApprovals(req.params.id);
    res.json(approvals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Resolve approval (Approve or Reject)
apiRouter.post('/approvals/:id/resolve', async (req: Request, res: Response) => {
  try {
    const parseResult = resolveApprovalSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      });
    }

    const { status, feedback } = parseResult.data;
    const approval = await db.getApproval(req.params.id);
    if (!approval) {
      return res.status(404).json({ error: 'Approval request not found' });
    }

    const updatedApproval = await db.updateApproval(approval.id, {
      status,
      payload: { ...approval.payload, feedback, resolved_at: new Date().toISOString() },
    });

    const mission = await db.getMission(approval.mission_id);
    const agents = await db.getAgents(approval.mission_id);
    const aegis = agents.find((a) => a.role === 'safety');

    if (aegis) {
      const logMsg =
        status === 'approved'
          ? `Authorization GRANTED: "${approval.action_description}". Safety lock released.`
          : `Authorization REJECTED: "${approval.action_description}". Feedback logged: "${feedback || 'None'}".`;
      await db.updateAgent(aegis.id, {
        status: 'idle',
        activity_log: [
          ...aegis.activity_log,
          {
            time: new Date().toLocaleTimeString(),
            message: logMsg,
            type: status === 'approved' ? 'success' : 'warning',
          },
        ],
      });
      broadcastEvent('agent_status_changed', approval.mission_id, {
        agent_id: aegis.id,
        status: 'idle',
        message: logMsg,
      });
    }

    // If task was associated and approved, advance task to completed or in_progress
    if (approval.task_id && status === 'approved') {
      const task = await db.getTask(approval.task_id);
      if (task) {
        await db.updateTask(task.id, {
          status: 'completed',
          output_data: { ...task.output_data, human_authorization: 'GRANTED', verified_at: new Date().toISOString() },
        });
        broadcastEvent('task_status_changed', approval.mission_id, {
          task_id: task.id,
          status: 'completed',
        });
      }
    }

    await db.logTelemetry({
      mission_id: approval.mission_id,
      event_type: `approval_${status}`,
      payload: { approval_id: approval.id, status, feedback },
    });

    broadcastEvent('approval_resolved', approval.mission_id, updatedApproval);

    // If mission was waiting, resume
    if (mission && mission.autonomy_level === 'autonomous') {
      startAutonomousLoop(mission.id);
    }

    res.json(updatedApproval);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get memories
apiRouter.get('/missions/:id/memory', async (req: Request, res: Response) => {
  try {
    const memories = await db.getMemories(req.params.id);
    res.json(memories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Add custom memory item
apiRouter.post('/missions/:id/memory', async (req: Request, res: Response) => {
  try {
    const parseResult = addMemorySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      });
    }

    const { key, value, category } = parseResult.data;
    const memory = await db.createMemory({
      mission_id: req.params.id,
      key,
      value,
      category,
    });

    broadcastEvent('memory_stored', req.params.id, memory);
    res.status(201).json(memory);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get decisions
apiRouter.get('/missions/:id/decisions', async (req: Request, res: Response) => {
  try {
    const decisions = await db.getDecisions(req.params.id);
    res.json(decisions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get telemetry events
apiRouter.get('/missions/:id/telemetry', async (req: Request, res: Response) => {
  try {
    const telemetry = await db.getTelemetry(req.params.id);
    res.json(telemetry);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
