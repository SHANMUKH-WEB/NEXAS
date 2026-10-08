import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCw,
  Ban,
  Bot,
  Layers,
  ArrowRight,
  Shield,
  FileCode,
} from 'lucide-react';
import { useMissionStore } from '../store/missionStore';

export const TaskDetailDrawer: React.FC = () => {
  const {
    selectedTaskId,
    setSelectedTaskId,
    tasks,
    agents,
    triggerFailureSimulation,
  } = useMissionStore();

  const task = tasks.find((t) => t.id === selectedTaskId);
  if (!task) return null;

  const assignedAgent = agents.find((a) => a.id === task.assigned_agent_id);
  const dependentTasks = tasks.filter((t) => task.dependencies.includes(t.id));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <RotateCw className="w-3.5 h-3.5 animate-spin" />
            In Progress
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            Failed / Anomaly
          </span>
        );
      case 'blocked':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Ban className="w-3.5 h-3.5" />
            Blocked
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-xs pointer-events-auto"
          onClick={() => setSelectedTaskId(null)}
        />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute inset-y-0 right-0 max-w-lg w-full bg-[#0a0f1d] border-l border-slate-800 shadow-2xl flex flex-col pointer-events-auto"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Task Node Inspector
              </span>
            </div>
            <button
              onClick={() => setSelectedTaskId(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {getStatusBadge(task.status)}
                {task.phase && (
                  <span className="text-xs px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono border border-indigo-500/20">
                    {task.phase}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] leading-snug">
                {task.title}
              </h2>
            </div>

            {/* Description */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-400 block mb-1 uppercase tracking-wider">
                Specification
              </span>
              <p className="text-sm text-slate-300 leading-relaxed">{task.description}</p>
            </div>

            {/* Assigned Agent */}
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-2 uppercase tracking-wider">
                Assigned Intelligence Agent
              </span>
              {assignedAgent ? (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-bold">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{assignedAgent.name}</div>
                      <div className="text-xs text-slate-400 font-mono capitalize">
                        Role: {assignedAgent.role} • Status: {assignedAgent.status}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {Math.round(assignedAgent.confidence * 100)}%
                  </span>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic p-3 rounded-lg bg-slate-900/40">
                  Autonomous pool dispatch pending
                </div>
              )}
            </div>

            {/* Dependencies */}
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-2 uppercase tracking-wider">
                Upstream Prerequisites ({task.dependencies.length})
              </span>
              {dependentTasks.length > 0 ? (
                <div className="space-y-2">
                  {dependentTasks.map((dep) => (
                    <div
                      key={dep.id}
                      onClick={() => setSelectedTaskId(dep.id)}
                      className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="text-xs font-medium text-slate-300 truncate">
                          {dep.title}
                        </span>
                      </div>
                      {getStatusBadge(dep.status)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic p-3 rounded-lg bg-slate-900/40">
                  Root node — No preceding dependencies
                </div>
              )}
            </div>

            {/* Output Data */}
            {task.output_data && Object.keys(task.output_data).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    Execution Output & Artifacts
                  </span>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto max-h-48">
                  <pre>{JSON.stringify(task.output_data, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                triggerFailureSimulation(
                  'custom',
                  `Simulated disruption on node: "${task.title}"`,
                  task.id
                );
                setSelectedTaskId(null);
              }}
              className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Inject Anomaly Here</span>
            </button>
            <button
              onClick={() => setSelectedTaskId(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
