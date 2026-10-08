import React from 'react';
import { motion } from 'framer-motion';
import {
  Scale,
  CheckCircle2,
  Layers,
  Sparkles,
  Bot,
  TrendingUp,
  Award,
} from 'lucide-react';
import { useMissionStore } from '../store/missionStore';

export const DecisionHistory: React.FC = () => {
  const { decisions, tasks, agents, setSelectedTaskId } = useMissionStore();

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scale className="w-5 h-5 text-purple-400" />
            <h1 className="text-2xl font-bold text-white font-['Outfit']">
              Autonomous Decision History & Ledger
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Arbiter Agent: Systematic evaluation matrices, options scored, alternatives rejected, and transparent reasoning
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            Logged Decisions: <strong className="text-purple-400">{decisions.length}</strong>
          </span>
        </div>
      </div>

      {/* Decisions List */}
      <div className="space-y-6">
        {decisions.map((dec) => {
          const task = tasks.find((t) => t.id === dec.task_id);
          const agent = agents.find((a) => a.id === dec.agent_id);

          return (
            <motion.div
              key={dec.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-6 rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-purple-950/20 shadow-xl space-y-5"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    {task ? (
                      <span
                        onClick={() => setSelectedTaskId(task.id)}
                        className="text-xs font-mono text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Layers className="w-3 h-3" />
                        Target: {task.title}
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-slate-500">Global Strategy Level</span>
                    )}
                    <h3 className="text-base font-bold text-white font-['Outfit']">
                      Selected: &quot;{dec.selected_option}&quot;
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400 block">
                    {new Date(dec.created_at).toLocaleTimeString()}
                  </span>
                  {agent && (
                    <span className="text-[10px] font-mono text-purple-400 block">
                      Evaluated by {agent.name.split(' (')[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* Options Evaluated Comparison Grid */}
              <div>
                <span className="text-[11px] font-mono text-slate-400 block mb-2 uppercase tracking-wider">
                  Options Evaluated & Scored ({dec.options_considered?.length || 0})
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {dec.options_considered?.map((opt, i) => {
                    const isSelected = opt.name === dec.selected_option;

                    return (
                      <div
                        key={i}
                        className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'bg-purple-900/20 border-purple-500/60 shadow-md ring-1 ring-purple-500/40'
                            : 'bg-slate-950/60 border-slate-850 opacity-80'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-white truncate max-w-[150px]">
                              {opt.name}
                            </span>
                            {isSelected ? (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                SELECTED
                              </span>
                            ) : (
                              opt.score !== undefined && (
                                <span className="text-[10px] font-mono text-slate-500">
                                  Score: {opt.score}
                                </span>
                              )
                            )}
                          </div>

                          {opt.pros && (
                            <p className="text-[11px] text-emerald-400/90 leading-snug mb-1">
                              <strong>Pros:</strong> {opt.pros}
                            </p>
                          )}
                          {opt.cons && (
                            <p className="text-[11px] text-rose-400/90 leading-snug">
                              <strong>Cons:</strong> {opt.cons}
                            </p>
                          )}
                        </div>

                        {opt.score !== undefined && (
                          <div className="mt-3 pt-2 border-t border-slate-800/60">
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                              <span>Quantitative Rank</span>
                              <span className="font-bold text-white">{opt.score}/100</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isSelected ? 'bg-purple-400' : 'bg-slate-700'
                                }`}
                                style={{ width: `${opt.score}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rationale */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider block font-bold">
                  Autonomous Decision Rationale
                </span>
                <p className="leading-relaxed">{dec.reasoning}</p>
              </div>
            </motion.div>
          );
        })}

        {decisions.length === 0 && (
          <div className="glass-panel p-10 rounded-2xl border border-slate-800 text-center space-y-2">
            <Scale className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No decisions logged yet</h3>
            <p className="text-xs text-slate-500">
              When tasks encounter multiple viable implementation paths, Arbiter Agent records the trade-offs and rationale here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
