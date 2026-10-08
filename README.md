# NEXUS AI — Autonomous Problem-Solving Intelligence Platform

![NEXUS AI Architecture](https://img.shields.io/badge/Architecture-Multi--Agent%20Swarm-cyan?style=for-the-badge)
![Agent Loop](https://img.shields.io/badge/Engine-Goal%20%E2%86%92%20Plan%20%E2%86%92%20Execute%20%E2%86%92%20Self--Healing-indigo?style=for-the-badge)
![Gemini 2.5](https://img.shields.io/badge/AI%20SDK-Gemini%202.5%20Flash%20%2F%20Pro-blue?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-emerald?style=for-the-badge)

---

## 1. Executive Summary

**NEXUS AI** demonstrates the fundamental paradigm shift from static conversational chatbots to an **autonomous, self-directed multi-agent Agentic AI operating system**. 

Given a high-level human goal, NEXUS AI:
1. **Understands & Decomposes** the objective into hierarchical execution phases.
2. **Generates an Execution DAG** with explicit dependency constraints.
3. **Delegates Tasks to 8 Specialized Intelligence Agents** (Planner, Research, Decision, Execution, Monitoring, Safety, Replanning, Memory).
4. **Executes Autonomous Actions** while streaming real-time telemetry over WebSockets.
5. **Enforces Human-in-the-Loop Safety Gates** for high-risk financial, legal, or infrastructure commitments.
6. **Detects Environmental Disruptions (Failure Injection)** and triggers **Self-Healing Dynamic Replanning** to isolate blast radius, rewire dependencies, inject recovery patch tasks, and guarantee mission achievement.

---

## 2. The 8 Specialized Agent Swarm

| Agent Role | Codename | Primary Directive | Live States |
| :--- | :--- | :--- | :--- |
| **Planner** | **Aether** | Goal decomposition, critical path analysis, and DAG synthesis | `thinking`, `idle` |
| **Research** | **Scout** | Domain knowledge gathering, feasibility audits, vendor discovery | `executing`, `idle` |
| **Decision** | **Arbiter** | Multi-criteria scoring, option elimination, reasoning logs | `thinking`, `idle` |
| **Execution** | **Forge** | Concrete operational dispatch, scripts, and deliverable creation | `executing`, `idle` |
| **Monitoring** | **Sentinel** | Telemetry listener, SLA metrics, latency and anomaly detection | `executing`, `error` |
| **Safety** | **Aegis** | Policy enforcement, spend limits, Human-in-the-Loop gating | `waiting_approval` |
| **Replanning** | **Phoenix** | Failure blast radius analysis, patch synthesis, DAG hot-patching | `thinking`, `executing` |
| **Memory** | **Chronicle** | Contextual indexing, constraint tracking, artifact ledger | `idle`, `executing` |

---

## 3. Core Architecture & User Flow

```
[ Human Goal ]
      │
      ▼
┌──────────────┐     Decompose     ┌────────────────────────┐
│ Aether (Plan)│ ────────────────> │ Task DAG Graph (@xyflow│
└──────────────┘                   └────────────────────────┘
      │                                       │
      ▼                                       ▼
┌──────────────┐     Trade-offs    ┌────────────────────────┐
│Arbiter(Decide│ ────────────────> │ Forge (Task Execution) │
└──────────────┘                   └────────────────────────┘
      │                                       │
      ▼                                       ▼
┌──────────────┐     Gatekeeper    ┌────────────────────────┐
│Aegis (Safety)│ ────────────────> │ Approval Center        │
└──────────────┘   (Risk Review)   └────────────────────────┘
      │
   [ Failure / Anomaly Injected ]
      │
      ▼
┌──────────────┐     Isolate &     ┌────────────────────────┐
│Sentinel(Alert│ ────────────────> │ Phoenix (Replan Patch) │
└──────────────┘      Rewire       └────────────────────────┘
                                              │
                                              ▼
                                   [ Mission Achieved 100% ]
```

---

## 4. Application Pages & Routes

1. **Command Center (`/`)**: Natural language goal input, domain selectors, autonomy configuration, and quick preset launchers.
2. **Agent Dashboard (`/dashboard`)**: Live 8-agent grid with status badges, confidence meters, task claims, and activity feeds.
3. **Mission Planner (`/planner`)**: Phase-grouped task hierarchy, critical path tracking, and dependency metrics.
4. **Interactive Task DAG (`/graph`)**: `@xyflow/react` dependency visualizer with automated Dagre layout, pulse animations, and node inspectors.
5. **Approval Center (`/approvals`)**: Human authorization gate for high-risk actions with impact payload inspection and reject/approve triggers.
6. **Memory Explorer (`/memory`)**: Structured project knowledge store categorized into Context, Constraints, Decisions, and Artifacts.
7. **Decision History (`/decisions`)**: Trade-off evaluation ledger with options scored (0-100), pros/cons, and Arbiter rationales.
8. **Telemetry & Analytics (`/analytics`)**: Completion velocity, swarm confidence averages, recovery stats, and event audit stream.
9. **Mission Replay (`/replay`)**: Interactive scrubber slider to step forward/backward through historical mission execution.

---

## 5. Technology Stack

- **Frontend**: React 19 (Vite 6), TypeScript, Tailwind CSS, `@xyflow/react` (React Flow), `framer-motion`, `lucide-react`, `zustand`, `dagre`, `canvas-confetti`.
- **Backend**: Node.js, Express, TypeScript, `ws` (WebSockets), Zod runtime validation.
- **AI Integration**: `@google/genai` SDK with Gemini 2.5 Flash / Pro and deterministic offline simulation engine.
- **Database**: Supabase PostgreSQL Cloud with RLS policies and resilient persistent fallback adapter.

---

## 6. Getting Started Locally

### Prerequisites
- Node.js (v20+ recommended)
- npm (v10+)

### Quick Start
```bash
# 1. Install dependencies across root, server, and client
npm run install:all

# 2. Start both Server and Client concurrently
npm run dev
```

The application will be accessible at:
- **Frontend Command Center**: `http://localhost:5173`
- **Backend API & WebSocket Server**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

### Database Migrations (Supabase Cloud)
The database schema, RLS policies, indexes, and initial seed data are provided in:
`supabase/migrations/001_initial_schema.sql`

To verify or test Supabase connectivity:
```bash
npm run migrate
```
You can also copy the contents of `001_initial_schema.sql` directly into your [Supabase SQL Editor](https://supabase.com/dashboard/project/csdusdduodzbehqxffly/sql/new) and click **RUN**.

---

## 7. Testing Failure Simulation & Autonomous Recovery

1. Open the application at `http://localhost:5173`.
2. Click **Load Master Demo Mission (500 Student Festival)**.
3. Navigate to `/graph` to view the initial 6-node DAG.
4. Click the red **Simulate Failure** button in the header bar.
5. Select **Venue Sourcing Failure** and click **Inject & Trigger Recovery**.
6. Observe:
   - Sentinel flags the anomaly with a critical warning.
   - Mission transitions to `recovering`.
   - Downstream tasks are frozen.
   - Phoenix and Arbiter generate 3 recovery patch tasks (e.g. secondary campus facility, overflow video streaming, notification broadcast).
   - The DAG dynamically hot-patches and resumes autonomous execution!
