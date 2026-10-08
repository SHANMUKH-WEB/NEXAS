import React from 'react';
import { motion } from 'framer-motion';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  RotateCw,
  AlertTriangle,
  Ban,
  Bot,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useMissionStore } from '../store/missionStore';

export const MissionPlanner: React.FC = () => {
  const { currentMission, tasks, agents, setSelectedTaskId } = useMissionStore();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <RotateCw className="w-3 h-3 animate-spin" />
            In Progress
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3" />
            Failed / Anomaly
          </span>
        );
      case 'blocked':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Ban className="w-3 h-3" />
            Blocked
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  // Group tasks by phase
  const phasesMap: Record<string, typeof tasks> = {};
  tasks.forEach((t) => {
    const phase = t.phase || 'Execution Phase';
    if (!phasesMap[phase]) phasesMap[phase] = [];
    phasesMap[phase].push(t);
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header and Progress */}
      <div className="glass-panel p-6 lg:p-8 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                {currentMission?.domain || 'Event Management'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Autonomy: {currentMission?.autonomy_level}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white font-['Outfit']">
              {currentMission?.title || 'Mission Execution Plan'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {currentMission?.goal}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-mono text-slate-400 block">Overall Progress</span>
            <span className="text-3xl font-extrabold text-cyan-400 font-['Outfit']">
              {progressPct}%
            </span>
            <span className="text-xs font-mono text-slate-400 block mt-0.5">
              {completedCount} of {tasks.length} tasks finished
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Phase Groups */}
      <div className="space-y-6">
        {Object.entries(phasesMap).map(([phaseName, phaseTasks], pIdx) => (
          <div key={pIdx} className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h2 className="text-base font-bold text-slate-200 font-['Outfit'] tracking-wide">
                {phaseName}
              </h2>
              <span className="text-xs font-mono text-slate-400">
                ({phaseTasks.length} {phaseTasks.length === 1 ? 'task' : 'tasks'})
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {phaseTasks.map((task) => {
                const assignedAgent = agents.find((a) => a.id === task.assigned_agent_id);
                const isRecovery = task.title.startsWith('[RECOVERY]');

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`glass-panel p-4 lg:p-5 rounded-2xl border transition-all cursor-pointer hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/5 group ${
                      isRecovery
                        ? 'border-rose-500/40 bg-rose-950/20'
                        : 'border-slate-800/80 bg-slate-900/40'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {getStatusBadge(task.status)}
                          {isRecovery && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Autonomous Patch Node
                            </span>
                          )}
                          <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {task.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
                          {task.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {/* Agent */}
                        {assignedAgent && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-850">
                            <Bot className="w-3.5 h-3.5 text-cyan-400" />
                            <div className="text-left">
                              <span className="text-[11px] font-semibold text-slate-200 block">
                                {assignedAgent.name.split(' (')[0]}
                              </span>
                              <span className="text-[9px] font-mono text-slate-400 capitalize block">
                                {assignedAgent.role}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Dependencies count */}
                        {task.dependencies.length > 0 && (
                          <span className="text-[11px] font-mono text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/60">
                            Prereqs: {task.dependencies.length}
                          </span>
                        )}

                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
