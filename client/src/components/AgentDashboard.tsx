import React from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  Search,
  Scale,
  Hammer,
  Activity,
  ShieldCheck,
  RefreshCw,
  Database,
  Bot,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { useMissionStore } from '../store/missionStore';
import { AgentRole } from '../types';

export const AgentDashboard: React.FC = () => {
  const { currentMission, agents, tasks, setSelectedTaskId } = useMissionStore();

  const getRoleDetails = (role: AgentRole) => {
    switch (role) {
      case 'planner':
        return {
          icon: Compass,
          title: 'Lead Planner',
          badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
          accentColor: 'from-indigo-500 to-blue-600',
          desc: 'Goal decomposition, milestone phasing, and DAG generation',
        };
      case 'research':
        return {
          icon: Search,
          title: 'Deep Research',
          badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
          accentColor: 'from-cyan-500 to-teal-600',
          desc: 'External knowledge retrieval, feasibility audit, domain calibration',
        };
      case 'decision':
        return {
          icon: Scale,
          title: 'Decision Engine',
          badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          accentColor: 'from-purple-500 to-indigo-600',
          desc: 'Multi-criteria trade-off scoring, option elimination, rationale synthesis',
        };
      case 'execution':
        return {
          icon: Hammer,
          title: 'Task Execution',
          badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          accentColor: 'from-emerald-500 to-green-600',
          desc: 'Operational dispatch, API transactions, and deliverable creation',
        };
      case 'monitoring':
        return {
          icon: Activity,
          title: 'Real-Time Monitor',
          badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          accentColor: 'from-blue-500 to-sky-600',
          desc: 'Heartbeat telemetry, anomaly detection, SLA and bottleneck sentinel',
        };
      case 'safety':
        return {
          icon: ShieldCheck,
          title: 'Safety Guardrails',
          badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          accentColor: 'from-amber-500 to-orange-600',
          desc: 'Policy enforcement, blast radius control, human approval routing',
        };
      case 'replanning':
        return {
          icon: RefreshCw,
          title: 'Autonomous Replan',
          badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          accentColor: 'from-rose-500 to-red-600',
          desc: 'Blast radius isolation, patch task synthesis, and DAG hot-patching',
        };
      case 'memory':
        return {
          icon: Database,
          title: 'Persistent Memory',
          badgeColor: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
          accentColor: 'from-teal-500 to-cyan-600',
          desc: 'State persistence, semantic recall, and project decision ledger',
        };
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'executing':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Executing
          </span>
        );
      case 'thinking':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Thinking / LLM
          </span>
        );
      case 'waiting_approval':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Approval Gate
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Anomaly
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            Standby
          </span>
        );
    }
  };

  const averageConfidence =
    agents.length > 0
      ? Math.round((agents.reduce((acc, a) => acc + a.confidence, 0) / agents.length) * 100)
      : 100;

  const activeAgentsCount = agents.filter((a) => a.status === 'executing' || a.status === 'thinking').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Top Telemetry KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-800">
          <div>
            <span className="text-xs text-slate-400 font-mono block">Active Agents</span>
            <span className="text-2xl font-extrabold text-white font-['Outfit'] mt-1 block">
              {activeAgentsCount} / {agents.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-800">
          <div>
            <span className="text-xs text-slate-400 font-mono block">Mean Confidence</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-['Outfit'] mt-1 block">
              {averageConfidence}%
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-800">
          <div>
            <span className="text-xs text-slate-400 font-mono block">Autonomous State</span>
            <span className="text-base font-bold text-cyan-300 font-mono mt-1 block capitalize">
              {currentMission?.status || 'Active'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-800">
          <div>
            <span className="text-xs text-slate-400 font-mono block">Self-Healing Engine</span>
            <span className="text-base font-bold text-rose-400 font-mono mt-1 block">
              Phoenix Online
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Agents Grid (All 8 Specialized Agents) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              Specialized Multi-Agent Swarm
            </h2>
            <p className="text-xs text-slate-400">
              Live telemetry, confidence scoring, task assignments, and activity feed for all 8 agents
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {agents.map((agent) => {
            const details = getRoleDetails(agent.role);
            const Icon = details.icon;
            const currentTask = tasks.find((t) => t.id === agent.current_task_id);

            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${details.accentColor} text-white flex items-center justify-center shadow-md`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {agent.name.split(' (')[0]}
                        </h3>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${details.badgeColor}`}
                        >
                          {details.title}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Confidence */}
                  <div className="flex items-center justify-between mb-3 py-2 border-y border-slate-800/60">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">Live State</span>
                      <div className="mt-0.5">{getStatusIndicator(agent.status)}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-mono">Confidence</span>
                      <span className="text-xs font-mono font-bold text-white mt-0.5 block">
                        {Math.round(agent.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Current Task Assignment */}
                  <div className="mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                      Assigned Work Node
                    </span>
                    {currentTask ? (
                      <div
                        onClick={() => setSelectedTaskId(currentTask.id)}
                        className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-200 truncate cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <span className="truncate">{currentTask.title}</span>
                        <ArrowUpRight className="w-3 h-3 text-cyan-400 shrink-0 ml-1" />
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic p-2 rounded-lg bg-slate-900/40">
                        Autonomous standby
                      </div>
                    )}
                  </div>
                </div>

                {/* Activity Feed */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
                    Live Agent Feed
                  </span>
                  <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                    {agent.activity_log && agent.activity_log.length > 0 ? (
                      agent.activity_log.slice(-2).map((act, i) => (
                        <div
                          key={i}
                          className="text-[11px] p-2 rounded-lg bg-slate-950/60 border border-slate-850 text-slate-300 leading-snug"
                        >
                          <span className="text-[10px] font-mono text-slate-400 block">
                            {act.time}
                          </span>
                          {act.message}
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] text-slate-600 italic">No activity logged yet</div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
