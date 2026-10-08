import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('⚠️ WARNING: GEMINI_API_KEY is not set. NEXUS AI will use deterministic Agent Engine mode.');
}

let ai: GoogleGenAI | null = null;
try {
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  console.warn('Failed to initialize GoogleGenAI client, using fallback engine:', e);
}

export interface GeneratedTask {
  id: string;
  title: string;
  description: string;
  phase: string;
  dependencies: string[];
  suggested_agent: 'planner' | 'research' | 'decision' | 'execution' | 'monitoring' | 'safety' | 'replanning' | 'memory';
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
}

export interface GeneratedPlan {
  phases: string[];
  tasks: GeneratedTask[];
  context_insights: string[];
}

export async function generateAgentPlan(
  goal: string,
  domain: string,
  modelName: string = 'gemini-2.5-flash',
  forceDemo: boolean = false
): Promise<GeneratedPlan> {
  if (!forceDemo && ai && apiKey) {
    try {
      const prompt = `You are NEXUS AI, an elite autonomous multi-agent orchestration engine.
Analyze the user's high-level goal in the specified domain:
Goal: "${goal}"
Domain: "${domain}"

Decompose this into 5 to 7 sequential and parallel executable tasks. Include clear dependency links (e.g. referencing other task IDs).
Return STRICT JSON ONLY conforming to this schema:
{
  "phases": ["Phase 1: Discovery & Strategy", "Phase 2: Execution", "Phase 3: Verification & Launch"],
  "tasks": [
    {
      "id": "t1",
      "title": "Task title",
      "description": "Concrete technical description",
      "phase": "Phase 1: Discovery & Strategy",
      "dependencies": [],
      "suggested_agent": "planner|research|decision|execution|monitoring|safety|replanning|memory",
      "risk_level": "low|medium|high|critical"
    }
  ],
  "context_insights": ["Key risk or requirement 1", "Key constraint 2"]
}`;

      const response = await ai.models.generateContent({
        model: modelName.includes('pro') ? 'gemini-2.5-pro' : 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.tasks && Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
          return parsed as GeneratedPlan;
        }
      }
    } catch (err: any) {
      console.warn('Gemini API call encountered error, activating deterministic Agent Planner:', err.message || err);
    }
  }

  return getDeterministicPlan(goal, domain);
}

export interface ReplanResult {
  root_cause: string;
  impact_assessment: string;
  mitigation_strategy: string;
  patch_tasks: GeneratedTask[];
  rewired_dependencies: Record<string, string[]>;
}

export async function generateReplanPatch(
  goal: string,
  failureDescription: string,
  currentTasks: Array<{ id: string; title: string; status: string }>,
  modelName: string = 'gemini-2.5-flash'
): Promise<ReplanResult> {
  if (ai && apiKey) {
    try {
      const prompt = `You are Phoenix, the Autonomous Replanning Agent of NEXUS AI.
Current Mission Goal: "${goal}"
Environmental Failure / Anomaly Detected: "${failureDescription}"
Current Tasks State:
${JSON.stringify(currentTasks, null, 2)}

Perform root cause analysis, assess blast radius, and generate 2-3 recovery patch tasks to circumvent or repair this failure.
Return STRICT JSON ONLY adhering to:
{
  "root_cause": "Detailed summary of why this occurred",
  "impact_assessment": "Blast radius on downstream milestones",
  "mitigation_strategy": "Concrete pivot action",
  "patch_tasks": [
    {
      "id": "patch_1",
      "title": "Recovery Task title",
      "description": "Specific action to mitigate failure",
      "phase": "Recovery & Adaptation",
      "dependencies": [],
      "suggested_agent": "replanning|decision|execution|safety",
      "risk_level": "high"
    }
  ],
  "rewired_dependencies": {}
}`;

      const response = await ai.models.generateContent({
        model: modelName.includes('pro') ? 'gemini-2.5-pro' : 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const text = response.text?.trim() || '';
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.patch_tasks && Array.isArray(parsed.patch_tasks)) {
          return parsed as ReplanResult;
        }
      }
    } catch (err: any) {
      console.warn('Gemini Replan error, falling back to deterministic replanning engine:', err.message || err);
    }
  }

  return getDeterministicReplan(goal, failureDescription);
}

export async function generateDecisionReasoning(
  taskTitle: string,
  domain: string
): Promise<{
  options: Array<{ name: string; pros: string; cons: string; score: number }>;
  selected: string;
  reasoning: string;
}> {
  if (ai && apiKey) {
    try {
      const prompt = `You are Arbiter, the Decision Agent of NEXUS AI.
Evaluate choices for task: "${taskTitle}" in domain "${domain}".
Provide 3 distinct options, weigh pros and cons, assign quantitative scores (0-100), select the optimal path, and state autonomous rationale.
Return STRICT JSON:
{
  "options": [
    { "name": "Option A", "pros": "...", "cons": "...", "score": 92 },
    { "name": "Option B", "pros": "...", "cons": "...", "score": 78 },
    { "name": "Option C", "pros": "...", "cons": "...", "score": 64 }
  ],
  "selected": "Option A",
  "reasoning": "In-depth rationale..."
}`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const text = response.text?.trim() || '';
      if (text) {
        return JSON.parse(text);
      }
    } catch (e) {
      // fallback
    }
  }

  return {
    options: [
      { name: 'Redundant High-Throughput Strategy', pros: 'Zero single-point-of-failure, highest safety score', cons: 'Slightly higher latency', score: 95 },
      { name: 'Direct Monolithic Execution', pros: 'Fast immediate dispatch', cons: 'High vulnerability to environmental disruptions', score: 72 },
      { name: 'Deferred Batch Processing', pros: 'Lowest compute consumption', cons: 'Unacceptable delivery lag', score: 58 },
    ],
    selected: 'Redundant High-Throughput Strategy',
    reasoning: 'Selected due to 99.8% resilience score, built-in fallback triggers, and alignment with safety guardrail thresholds.',
  };
}

// Deterministic Domain Presets
function getDeterministicPlan(goal: string, domain: string): GeneratedPlan {
  const normDomain = domain.toLowerCase();

  if (normDomain.includes('software') || normDomain.includes('tech') || normDomain.includes('code')) {
    return {
      phases: ['Phase 1: Architecture & Specification', 'Phase 2: Service Migration', 'Phase 3: Validation & Deploy'],
      tasks: [
        {
          id: 'task_1',
          title: 'Monolith Domain Boundaries & Dependency Audit',
          description: 'Analyze codebase schemas, map shared database tables, and isolate core bounded contexts.',
          phase: 'Phase 1: Architecture & Specification',
          dependencies: [],
          suggested_agent: 'research',
          risk_level: 'low',
        },
        {
          id: 'task_2',
          title: 'Dual-Write Schema & Change Data Capture Pipeline',
          description: 'Configure Debezium and Kafka connectors for real-time replication without locking production tables.',
          phase: 'Phase 1: Architecture & Specification',
          dependencies: ['task_1'],
          suggested_agent: 'execution',
          risk_level: 'medium',
        },
        {
          id: 'task_3',
          title: 'Extract Microservice Container & GraphQL Gateway',
          description: 'Scaffold independent microservice service repo with health probes and Apollo Federation routing.',
          phase: 'Phase 2: Service Migration',
          dependencies: ['task_1'],
          suggested_agent: 'execution',
          risk_level: 'medium',
        },
        {
          id: 'task_4',
          title: 'Dark Traffic Mirroring & Shadow Validation',
          description: 'Replay 100% of live incoming read/write traffic against new service to verify 0.00% regression.',
          phase: 'Phase 2: Service Migration',
          dependencies: ['task_2', 'task_3'],
          suggested_agent: 'monitoring',
          risk_level: 'high',
        },
        {
          id: 'task_5',
          title: 'Production Cutover & Traffic Migration Gate',
          description: 'Progressive canary deployment (5% -> 25% -> 100%) with automated rollback triggers.',
          phase: 'Phase 3: Validation & Deploy',
          dependencies: ['task_4'],
          suggested_agent: 'safety',
          risk_level: 'critical',
        },
        {
          id: 'task_6',
          title: 'Legacy Endpoint Deprecation & Telemetry Signoff',
          description: 'Decommission monolith controllers and verify memory release across cluster nodes.',
          phase: 'Phase 3: Validation & Deploy',
          dependencies: ['task_5'],
          suggested_agent: 'planner',
          risk_level: 'low',
        },
      ],
      context_insights: [
        'Zero-downtime SLA requires active-active database replication.',
        'Canary routing requires 99.99% HTTP 200 health checks before stepping from 25% to 100%.',
      ],
    };
  }

  if (normDomain.includes('supply') || normDomain.includes('logistic')) {
    return {
      phases: ['Phase 1: Supply Chain Assessment', 'Phase 2: Route Optimization', 'Phase 3: Fulfillment & Tracking'],
      tasks: [
        {
          id: 'task_1',
          title: 'Global Inventory Audit & Bottleneck Heatmap',
          description: 'Ingest supplier stock records, transit manifests, and port delay forecasts.',
          phase: 'Phase 1: Supply Chain Assessment',
          dependencies: [],
          suggested_agent: 'research',
          risk_level: 'low',
        },
        {
          id: 'task_2',
          title: 'Alternative Tier-2 Supplier Vetting & Certification',
          description: 'Validate ISO compliance, lead time guarantees, and component spec sheets.',
          phase: 'Phase 1: Supply Chain Assessment',
          dependencies: ['task_1'],
          suggested_agent: 'decision',
          risk_level: 'medium',
        },
        {
          id: 'task_3',
          title: 'Dynamic Multi-Modal Transit Re-Routing',
          description: 'Synthesize ocean-to-air freight reallocations for high-margin SKU batches.',
          phase: 'Phase 2: Route Optimization',
          dependencies: ['task_1'],
          suggested_agent: 'execution',
          risk_level: 'high',
        },
        {
          id: 'task_4',
          title: 'Emergency Carrier Agreement Authorization',
          description: 'Human approval gate for charter cargo flights exceeding baseline expenditure limits.',
          phase: 'Phase 2: Route Optimization',
          dependencies: ['task_3'],
          suggested_agent: 'safety',
          risk_level: 'critical',
        },
        {
          id: 'task_5',
          title: 'Real-Time Telemetry & Shipment ETA Sentinel',
          description: 'Attach IoT GPS temperature/shock sensors and stream telemetry events to dashboard.',
          phase: 'Phase 3: Fulfillment & Tracking',
          dependencies: ['task_4'],
          suggested_agent: 'monitoring',
          risk_level: 'low',
        },
      ],
      context_insights: [
        'Semiconductor critical path has 14-day lead buffer.',
        'Air cargo charter requires immediate C-level safety authorization.',
      ],
    };
  }

  if (normDomain.includes('compliance') || normDomain.includes('audit') || normDomain.includes('business')) {
    return {
      phases: ['Phase 1: Gap Analysis', 'Phase 2: Remediation & Policy', 'Phase 3: Audit Certification'],
      tasks: [
        {
          id: 'task_1',
          title: 'HIPAA & SOC 2 Trust Services Criteria Assessment',
          description: 'Scrutinize data encryption in transit/rest, access controls, and IAM role hierarchies.',
          phase: 'Phase 1: Gap Analysis',
          dependencies: [],
          suggested_agent: 'research',
          risk_level: 'low',
        },
        {
          id: 'task_2',
          title: 'Remediate S3 Bucket Policies & KMS Key Rotation',
          description: 'Enforce AES-256 SSE-KMS customer managed keys and disable public access on all cloud storage.',
          phase: 'Phase 2: Remediation & Policy',
          dependencies: ['task_1'],
          suggested_agent: 'execution',
          risk_level: 'high',
        },
        {
          id: 'task_3',
          title: 'Automated Audit Log Aggregation & SIEM Forwarding',
          description: 'Configure centralized immutable CloudTrail logs with tamper-evident hashing.',
          phase: 'Phase 2: Remediation & Policy',
          dependencies: ['task_1'],
          suggested_agent: 'monitoring',
          risk_level: 'medium',
        },
        {
          id: 'task_4',
          title: 'Third-Party Penetration Test Execution',
          description: 'Commission white-hat ethical intrusion test across API endpoints and auth flows.',
          phase: 'Phase 3: Audit Certification',
          dependencies: ['task_2', 'task_3'],
          suggested_agent: 'safety',
          risk_level: 'high',
        },
        {
          id: 'task_5',
          title: 'Final Attestation & Auditor Evidence Dossier',
          description: 'Compile cryptographic proofs of compliance for external certified CPA auditors.',
          phase: 'Phase 3: Audit Certification',
          dependencies: ['task_4'],
          suggested_agent: 'memory',
          risk_level: 'medium',
        },
      ],
      context_insights: [
        'Audit evidence requires unalterable cryptographically signed log records.',
        'Zero high-severity vulnerabilities permitted for SOC 2 Type II attestation.',
      ],
    };
  }

  // Default Event Management
  return {
    phases: ['Phase 1: Foundation & Resourcing', 'Phase 2: Operational Infrastructure', 'Phase 3: Engagement & Delivery'],
    tasks: [
      {
        id: 'task_1',
        title: 'Venue Sourcing & Space Reservation',
        description: 'Audit campus auditoriums, verify 500+ seat acoustic capacity, and lock primary reservation.',
        phase: 'Phase 1: Foundation & Resourcing',
        dependencies: [],
        suggested_agent: 'research',
        risk_level: 'low',
      },
      {
        id: 'task_2',
        title: 'Budget Cap & Department Allocation',
        description: 'Allocate $15,000 budget across AV ($4k), Catering ($5k), Prizes ($4k), and Contingency ($2k).',
        phase: 'Phase 1: Foundation & Resourcing',
        dependencies: [],
        suggested_agent: 'decision',
        risk_level: 'low',
      },
      {
        id: 'task_3',
        title: 'Registration Portal & Attendee QR Badging',
        description: 'Deploy signup portal with tiered workshop registration and automated QR badge check-in.',
        phase: 'Phase 2: Operational Infrastructure',
        dependencies: ['task_1'],
        suggested_agent: 'execution',
        risk_level: 'medium',
      },
      {
        id: 'task_4',
        title: 'Vendor Contracts & Catering Agreements',
        description: 'Execute legally binding agreement with caterer for 500 student dietary lunch boxes.',
        phase: 'Phase 2: Operational Infrastructure',
        dependencies: ['task_2'],
        suggested_agent: 'safety',
        risk_level: 'high',
      },
      {
        id: 'task_5',
        title: 'Keynote Speaker & Hackathon Mentors',
        description: 'Secure 3 principal engineering keynotes and onboard 10 hands-on coding mentors.',
        phase: 'Phase 3: Engagement & Delivery',
        dependencies: ['task_3'],
        suggested_agent: 'research',
        risk_level: 'low',
      },
      {
        id: 'task_6',
        title: 'Emergency Protocols & Crowd Safety Plan',
        description: 'Establish certified first-aid staging, crowd flow corridors, and campus safety clearance.',
        phase: 'Phase 3: Engagement & Delivery',
        dependencies: ['task_1', 'task_2'],
        suggested_agent: 'safety',
        risk_level: 'medium',
      },
    ],
    context_insights: [
      'Auditorium requires fire marshal signoff for max density above 500.',
      'Catering deposit requires human approval before wire disbursement.',
    ],
  };
}

function getDeterministicReplan(goal: string, failureDescription: string): ReplanResult {
  const norm = failureDescription.toLowerCase();

  if (norm.includes('venue') || norm.includes('space') || norm.includes('hall')) {
    return {
      root_cause: 'Target facility unavailable due to sudden administrative block or maintenance.',
      impact_assessment: 'Downstream registration, keynote staging, and safety layouts directly blocked.',
      mitigation_strategy: 'Pivot to secondary campus facility (North Engineering Quad + Hybrid Streaming Center) with zero rental fee penalty.',
      patch_tasks: [
        {
          id: 'patch_1',
          title: 'Secure North Engineering Quad & Indoor Hall B',
          description: 'Emergency reallocation of engineering pavilion with high-density wifi and backup indoor rain shelter.',
          phase: 'Autonomous Recovery Phase',
          dependencies: [],
          suggested_agent: 'replanning',
          risk_level: 'high',
        },
        {
          id: 'patch_2',
          title: 'Deploy High-Definition Dual-Stream Overflow Video Hub',
          description: 'Setup low-latency RTMP audio/video link between Hall B and outdoor canopy zones for 500+ participants.',
          phase: 'Autonomous Recovery Phase',
          dependencies: ['patch_1'],
          suggested_agent: 'execution',
          risk_level: 'medium',
        },
        {
          id: 'patch_3',
          title: 'Broadcast Venue Update to Registered Attendees',
          description: 'Push automated SMS/Email notification with revised GPS directions and indoor map.',
          phase: 'Autonomous Recovery Phase',
          dependencies: ['patch_2'],
          suggested_agent: 'execution',
          risk_level: 'low',
        },
      ],
      rewired_dependencies: {},
    };
  }

  if (norm.includes('budget') || norm.includes('cost') || norm.includes('spend')) {
    return {
      root_cause: 'Vendor quotes or operational expenses exceeded initial financial thresholds by >20%.',
      impact_assessment: 'Threatens overall mission viability and contingency reserve exhaustion.',
      mitigation_strategy: 'Liquidate low-impact line items, engage secondary local sponsor tier, and reallocate $2,000 contingency reserve.',
      patch_tasks: [
        {
          id: 'patch_1',
          title: 'Activate Tier-2 Fast-Track Sponsor Pipeline',
          description: 'Onboard 2 regional tech startups for $2,500 booth sponsorship to offset catering delta.',
          phase: 'Autonomous Recovery Phase',
          dependencies: [],
          suggested_agent: 'replanning',
          risk_level: 'medium',
        },
        {
          id: 'patch_2',
          title: 'Re-Negotiate Tier-A Vendor Quantities',
          description: 'Trim non-essential swag prints by 15% and rebalance catering portions.',
          phase: 'Autonomous Recovery Phase',
          dependencies: ['patch_1'],
          suggested_agent: 'decision',
          risk_level: 'low',
        },
      ],
      rewired_dependencies: {},
    };
  }

  // Default Anomaly Replan
  return {
    root_cause: `Environmental anomaly: ${failureDescription}`,
    impact_assessment: 'Disrupted active critical path tasks; downstream milestone risk elevated.',
    mitigation_strategy: 'Deploy autonomous self-healing circuit: reroute dependencies, inject compensatory micro-tasks, and restore graph momentum.',
    patch_tasks: [
      {
        id: 'patch_1',
        title: 'Emergency Dependency Isolator & Fallback Protocol',
        description: 'Isolate affected node blast radius and spin up localized containerized fallback provider.',
        phase: 'Autonomous Recovery Phase',
        dependencies: [],
        suggested_agent: 'replanning',
        risk_level: 'high',
      },
      {
        id: 'patch_2',
        title: 'Health Metric Verification & Re-synchronization',
        description: 'Validate SLA recovery and release downstream blocked tasks into execution pipeline.',
        phase: 'Autonomous Recovery Phase',
        dependencies: ['patch_1'],
        suggested_agent: 'monitoring',
        risk_level: 'low',
      },
    ],
    rewired_dependencies: {},
  };
}
