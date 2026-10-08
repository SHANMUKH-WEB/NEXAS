-- =========================================================================
-- NEXUS AI — Autonomous Problem-Solving Intelligence
-- Supabase PostgreSQL Migration 001: Initial Schema, RLS, and Seed Data
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing tables if re-running
drop table if exists telemetry_events cascade;
drop table if exists decisions cascade;
drop table if exists memories cascade;
drop table if exists approvals cascade;
drop table if exists tasks cascade;
drop table if exists agents cascade;
drop table if exists missions cascade;

-- =========================================================================
-- 1. Missions Table
-- =========================================================================
create table missions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  goal text not null,
  status text not null default 'initializing', -- initializing, planning, executing, paused, recovering, completed, failed
  domain text not null, -- event_management, software_engineering, supply_chain, compliance
  autonomy_level text not null default 'supervised', -- supervised, autonomous
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- 2. Agents Table
-- =========================================================================
create table agents (
  id uuid primary key default uuid_generate_v4(),
  mission_id uuid references missions(id) on delete cascade not null,
  name text not null,
  role text not null, -- planner, research, decision, execution, monitoring, safety, replanning, memory
  status text not null default 'idle', -- idle, thinking, executing, waiting_approval, error
  current_task_id uuid,
  confidence float default 1.0,
  activity_log jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- 3. Tasks Table
-- =========================================================================
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  mission_id uuid references missions(id) on delete cascade not null,
  title text not null,
  description text not null,
  status text not null default 'pending', -- pending, in_progress, completed, failed, blocked, replanning
  assigned_agent_id uuid references agents(id),
  dependencies uuid[] default '{}',
  output_data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- 4. Approvals Table
-- =========================================================================
create table approvals (
  id uuid primary key default uuid_generate_v4(),
  mission_id uuid references missions(id) on delete cascade not null,
  task_id uuid references tasks(id),
  agent_id uuid references agents(id),
  action_description text not null,
  risk_level text not null default 'medium', -- low, medium, high, critical
  status text not null default 'pending', -- pending, approved, rejected
  payload jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- 5. Memory Table
-- =========================================================================
create table memories (
  id uuid primary key default uuid_generate_v4(),
  mission_id uuid references missions(id) on delete cascade not null,
  key text not null,
  value jsonb not null,
  category text not null, -- context, decision, constraint, artifact
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- 6. Decisions Table
-- =========================================================================
create table decisions (
  id uuid primary key default uuid_generate_v4(),
  mission_id uuid references missions(id) on delete cascade not null,
  task_id uuid references tasks(id),
  agent_id uuid references agents(id),
  options_considered jsonb not null,
  selected_option text not null,
  reasoning text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- 7. Telemetry Table
-- =========================================================================
create table telemetry_events (
  id uuid primary key default uuid_generate_v4(),
  mission_id uuid references missions(id) on delete cascade not null,
  event_type text not null,
  payload jsonb not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- Indexes for High Performance
-- =========================================================================
create index idx_agents_mission on agents(mission_id);
create index idx_tasks_mission on tasks(mission_id);
create index idx_approvals_mission on approvals(mission_id);
create index idx_memories_mission on memories(mission_id);
create index idx_decisions_mission on decisions(mission_id);
create index idx_telemetry_mission on telemetry_events(mission_id);

-- =========================================================================
-- Row Level Security (RLS) Policies
-- =========================================================================
alter table missions enable row level security;
alter table agents enable row level security;
alter table tasks enable row level security;
alter table approvals enable row level security;
alter table memories enable row level security;
alter table decisions enable row level security;
alter table telemetry_events enable row level security;

-- Public / Anonymous access policies
create policy "Allow public access to missions" on missions for all using (true) with check (true);
create policy "Allow public access to agents" on agents for all using (true) with check (true);
create policy "Allow public access to tasks" on tasks for all using (true) with check (true);
create policy "Allow public access to approvals" on approvals for all using (true) with check (true);
create policy "Allow public access to memories" on memories for all using (true) with check (true);
create policy "Allow public access to decisions" on decisions for all using (true) with check (true);
create policy "Allow public access to telemetry" on telemetry_events for all using (true) with check (true);

-- =========================================================================
-- Seed Data: Demo Mission (College Technical Festival)
-- =========================================================================
do $$
declare
  v_mission_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
  v_agent_planner uuid := '10000000-0000-0000-0000-000000000001'::uuid;
  v_agent_research uuid := '10000000-0000-0000-0000-000000000002'::uuid;
  v_agent_decision uuid := '10000000-0000-0000-0000-000000000003'::uuid;
  v_agent_exec uuid := '10000000-0000-0000-0000-000000000004'::uuid;
  v_agent_monitor uuid := '10000000-0000-0000-0000-000000000005'::uuid;
  v_agent_safety uuid := '10000000-0000-0000-0000-000000000006'::uuid;
  v_agent_replan uuid := '10000000-0000-0000-0000-000000000007'::uuid;
  v_agent_memory uuid := '10000000-0000-0000-0000-000000000008'::uuid;

  v_task_1 uuid := '20000000-0000-0000-0000-000000000001'::uuid;
  v_task_2 uuid := '20000000-0000-0000-0000-000000000002'::uuid;
  v_task_3 uuid := '20000000-0000-0000-0000-000000000003'::uuid;
  v_task_4 uuid := '20000000-0000-0000-0000-000000000004'::uuid;
  v_task_5 uuid := '20000000-0000-0000-0000-000000000005'::uuid;
  v_task_6 uuid := '20000000-0000-0000-0000-000000000006'::uuid;
begin
  -- Insert Mission
  insert into missions (id, title, goal, status, domain, autonomy_level)
  values (
    v_mission_id,
    'Organize College Technical Festival 2026',
    'Organize a college technical festival for 500 students with hackathons, workshops, keynote speakers, and vendor sponsorships within a $15,000 budget.',
    'executing',
    'Event Management',
    'supervised'
  );

  -- Insert 8 Specialized Agents
  insert into agents (id, mission_id, name, role, status, confidence, activity_log) values
    (v_agent_planner, v_mission_id, 'Aether (Lead Planner)', 'planner', 'thinking', 0.98, '[{"time": "09:00:01", "message": "Mission initialized and decomposed into 6 critical path stages."}]'),
    (v_agent_research, v_mission_id, 'Scout (Deep Research)', 'research', 'executing', 0.95, '[{"time": "09:00:15", "message": "Evaluated 4 university auditorium spaces for 500+ participant capacity."}]'),
    (v_agent_decision, v_mission_id, 'Arbiter (Decision Engine)', 'decision', 'idle', 0.94, '[{"time": "09:00:30", "message": "Selected Main Auditorium over Sports Complex due to AV/Power redundancy."}]'),
    (v_agent_exec, v_mission_id, 'Forge (Task Execution)', 'execution', 'executing', 0.91, '[{"time": "09:01:00", "message": "Drafting catering & equipment vendor service agreements."}]'),
    (v_agent_monitor, v_mission_id, 'Sentinel (Real-Time Monitor)', 'monitoring', 'executing', 0.99, '[{"time": "09:01:10", "message": "Tracking telemetry, latency, and environmental anomaly sensors."}]'),
    (v_agent_safety, v_mission_id, 'Aegis (Safety & Guardrails)', 'safety', 'waiting_approval', 0.97, '[{"time": "09:01:25", "message": "Dispatched vendor contract authorization to Human Approval Center."}]'),
    (v_agent_replan, v_mission_id, 'Phoenix (Autonomous Replan)', 'replanning', 'idle', 0.96, '[{"time": "09:00:00", "message": "Standby ready for failure recovery and DAG hot-patching."}]'),
    (v_agent_memory, v_mission_id, 'Chronicle (Persistent Memory)', 'memory', 'idle', 0.99, '[{"time": "09:01:30", "message": "Synchronized 5 contextual parameters and financial constraints."}]');

  -- Insert Tasks
  insert into tasks (id, mission_id, title, description, status, assigned_agent_id, dependencies, output_data) values
    (v_task_1, v_mission_id, 'Venue Sourcing & Space Reservation', 'Audit campus halls, assess 500 seat acoustics, secure Main Auditorium reservation.', 'completed', v_agent_research, '{}', '{"selected_venue": "Main Campus Auditorium A", "capacity": 550, "av_ready": true}'),
    (v_task_2, v_mission_id, 'Budget Cap & Department Allocation', 'Allocate $15,000 budget across AV ($4k), Catering ($5k), Prizes ($4k), Contingency ($2k).', 'completed', v_agent_decision, '{}', '{"budget_total": 15000, "contingency": 2000}'),
    (v_task_3, v_mission_id, 'Registration Portal & Ticket Tiering', 'Deploy self-service attendee signup portal with QR code badge issuance and waitlist.', 'in_progress', v_agent_exec, array[v_task_1], '{"portal_url": "https://techfest2026.campus.edu", "capacity_limit": 500}'),
    (v_task_4, v_mission_id, 'Vendor Contracts & Catering Agreements', 'Execute contract with preferred catering supplier for 500 student meal packs.', 'pending', v_agent_exec, array[v_task_2], '{"vendor": "Campus Gourmet LLC", "quote_amount": 4850}'),
    (v_task_5, v_mission_id, 'Keynote Speaker & Hackathon Mentors', 'Invite 3 industry tech leads and onboard 10 workshop mentors.', 'pending', v_agent_research, array[v_task_3], '{}'),
    (v_task_6, v_mission_id, 'Emergency Protocols & Crowd Safety', 'Establish first-aid stations, emergency exits, and campus security liaison.', 'pending', v_agent_safety, array[v_task_1, v_task_2], '{}');

  -- Update Agents with current task IDs
  update agents set current_task_id = v_task_3 where id = v_agent_exec;
  update agents set current_task_id = v_task_5 where id = v_agent_research;

  -- Insert Pending Approval
  insert into approvals (id, mission_id, task_id, agent_id, action_description, risk_level, status, payload) values
    (
      '30000000-0000-0000-0000-000000000001'::uuid,
      v_mission_id,
      v_task_4,
      v_agent_safety,
      'Execute Binding Vendor Contract with Campus Gourmet LLC for $4,850.00 catering package',
      'high',
      'pending',
      '{"vendor_name": "Campus Gourmet LLC", "liability_deposit": 500, "total_cost": 4850, "refund_cutoff_days": 7}'
    );

  -- Insert Memories
  insert into memories (mission_id, key, value, category) values
    (v_mission_id, 'financial_limit', '{"max_budget": 15000, "currency": "USD", "flexible_margin": 0.05}', 'constraint'),
    (v_mission_id, 'venue_specifications', '{"primary": "Main Auditorium A", "backup": "North Engineering Quad", "seats": 550}', 'context'),
    (v_mission_id, 'target_audience', '{"count": 500, "departments": ["CS", "ECE", "Data Science", "Design"]}', 'context'),
    (v_mission_id, 'key_milestones', '{"registration_launch": "T-14 days", "vendor_lock": "T-7 days", "rehearsal": "T-1 day"}', 'artifact');

  -- Insert Decisions
  insert into decisions (mission_id, task_id, agent_id, options_considered, selected_option, reasoning) values
    (
      v_mission_id,
      v_task_1,
      v_agent_decision,
      '[{"name": "Sports Complex Arena", "pros": "Huge 800 cap", "cons": "Echo acoustics, high rental"}, {"name": "Main Auditorium A", "pros": "Full AV & lighting included, zero rental fee", "cons": "Exact 550 capacity"}]',
      'Main Auditorium A',
      'Minimizes cost to $0 venue charge while satisfying acoustic and seating requirements for 500 attendees.'
    );

  -- Insert Telemetry Events
  insert into telemetry_events (mission_id, event_type, payload, timestamp) values
    (v_mission_id, 'mission_created', '{"title": "Organize College Technical Festival 2026", "initiator": "Command Center"}', now() - interval '10 minutes'),
    (v_mission_id, 'task_completed', '{"task_id": "20000000-0000-0000-0000-000000000001", "task_title": "Venue Sourcing & Space Reservation"}', now() - interval '8 minutes'),
    (v_mission_id, 'task_completed', '{"task_id": "20000000-0000-0000-0000-000000000002", "task_title": "Budget Cap & Department Allocation"}', now() - interval '6 minutes'),
    (v_mission_id, 'approval_requested', '{"approval_id": "30000000-0000-0000-0000-000000000001", "action": "Vendor Contract Execution", "risk": "high"}', now() - interval '2 minutes');

end $$;
