import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Clock,
  ShieldCheck,
  Bot,
  Zap,
} from 'lucide-react';
import { useMissionStore } from '../store/missionStore';

export const AnalyticsView: React.FC = () => {
  const { currentMission, tasks, agents, telemetry, decisions, approvals } = useMissionStore();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const failedTasks = tasks.filter((t) => t.status === 'failed').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;

  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const avgConfidence =
    agents.length > 0
      ? Math.round((agents.reduce((acc, a) => acc + a.confidence, 0) / agents.length) * 100)
      : 100;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <h1 className="text-2xl font-bold text-white font-['Outfit']">
            Real-Time Telemetry & Agent Analytics
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Mission telemetry streams, task completion velocities, agent confidence metrics, and self-healing recovery audit
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-mono block">DAG Completion</span>
            <span className="text-3xl font-extrabold text-cyan-400 font-['Outfit'] mt-1 block">
              {completionPct}%
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {completedTasks} / {totalTasks} finished
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-mono block">Swarm Confidence</span>
            <span className="text-3xl font-extrabold text-emerald-400 font-['Outfit'] mt-1 block">
              {avgConfidence}%
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Across 8 active roles
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-mono block">Recovery Success</span>
            <span className="text-3xl font-extrabold text-rose-400 font-['Outfit'] mt-1 block">
              100%
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Self-healing replan rate
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-mono block">Telemetry Events</span>
            <span className="text-3xl font-extrabold text-indigo-400 font-['Outfit'] mt-1 block">
              {telemetry.length}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Real-time audit log
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Task Status Distribution & Agent Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Task Execution Breakdown
          </h2>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-emerald-400">Completed ({completedTasks})</span>
                <span className="text-slate-400">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${(completedTasks / (totalTasks || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-cyan-400">In Progress ({inProgressTasks})</span>
                <span className="text-slate-400">
                  {totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${(inProgressTasks / (totalTasks || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Pending Prerequisites ({pendingTasks})</span>
                <span className="text-slate-400">
                  {totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-slate-700 rounded-full"
                  style={{ width: `${(pendingTasks / (totalTasks || 1)) * 100}%` }}
                />
              </div>
            </div>

            {failedTasks > 0 && (
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-rose-400">Failed / Replaced ({failedTasks})</span>
                  <span className="text-slate-400">
                    {Math.round((failedTasks / totalTasks) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-rose-400 rounded-full"
                    style={{ width: `${(failedTasks / (totalTasks || 1)) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Agent Confidence & Workload */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-400" />
            Agent Confidence & Health
          </h2>

          <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-850 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white truncate max-w-[110px]">
                    {agent.name.split(' (')[0]}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">
                    {Math.round(agent.confidence * 100)}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                    style={{ width: `${agent.confidence * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Telemetry Stream Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Live Telemetry Event Ledger ({telemetry.length})
          </h2>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {telemetry.slice().reverse().map((event) => (
            <div
              key={event.id}
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shrink-0">
                  {event.event_type}
                </span>
                <span className="text-slate-300 truncate font-mono text-[11px]">
                  {JSON.stringify(event.payload)}
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[10px] shrink-0">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
