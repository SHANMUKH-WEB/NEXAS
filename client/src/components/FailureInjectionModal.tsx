import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  X,
  Building2,
  DollarSign,
  ServerCrash,
  UserX,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { useMissionStore } from '../store/missionStore';

export const FailureInjectionModal: React.FC = () => {
  const {
    isFailureModalOpen,
    setFailureModalOpen,
    triggerFailureSimulation,
    tasks,
    isLoading,
  } = useMissionStore();

  const [selectedScenario, setSelectedScenario] = useState<
    'venue_cancelled' | 'budget_overrun' | 'api_outage' | 'custom'
  >('venue_cancelled');
  const [customText, setCustomText] = useState('');
  const [affectedTaskId, setAffectedTaskId] = useState('');

  const presets = [
    {
      id: 'venue_cancelled' as const,
      title: 'Venue Sourcing Failure',
      desc: 'Primary auditorium flooded / administrative booking cancelled.',
      icon: Building2,
      severity: 'Critical',
      color: 'border-rose-500/40 hover:border-rose-500 bg-rose-500/10 text-rose-300',
    },
    {
      id: 'budget_overrun' as const,
      title: 'Budget Threshold Breach',
      desc: 'Vendor quotes surge +38%, exceeding financial contingency cap.',
      icon: DollarSign,
      severity: 'High',
      color: 'border-amber-500/40 hover:border-amber-500 bg-amber-500/10 text-amber-300',
    },
    {
      id: 'api_outage' as const,
      title: 'External Service Outage',
      desc: 'Payment & registration API returns HTTP 504 Gateway Timeout.',
      icon: ServerCrash,
      severity: 'Critical',
      color: 'border-cyan-500/40 hover:border-cyan-500 bg-cyan-500/10 text-cyan-300',
    },
    {
      id: 'custom' as const,
      title: 'Custom Anomaly Injection',
      desc: 'Inject arbitrary environmental disruptor or supply constraint.',
      icon: Flame,
      severity: 'Custom',
      color: 'border-purple-500/40 hover:border-purple-500 bg-purple-500/10 text-purple-300',
    },
  ];

  const handleInject = async () => {
    await triggerFailureSimulation(
      selectedScenario,
      selectedScenario === 'custom' ? customText : undefined,
      affectedTaskId || undefined
    );
  };

  if (!isFailureModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-[#0e1424] border border-rose-500/30 rounded-2xl w-full max-w-xl shadow-2xl shadow-rose-950/40 overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Simulate Failure & Autonomous Recovery
                </h3>
                <p className="text-xs text-slate-400">
                  Tests multi-agent anomaly detection & self-healing replanning
                </p>
              </div>
            </div>
            <button
              onClick={() => setFailureModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2 font-mono">
                Select Disruption Scenario
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {presets.map((p) => {
                  const Icon = p.icon;
                  const isSelected = selectedScenario === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedScenario(p.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? `${p.color} ring-1 ring-rose-500 shadow-md`
                          : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40">
                          {p.severity}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-white">{p.title}</div>
                      <div className="text-xs text-slate-400 mt-1 leading-snug">{p.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedScenario === 'custom' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block font-mono">
                  Custom Failure Description
                </label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="e.g. Keynote speaker cancelled flight; need urgent virtual setup or backup presenter."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                />
              </motion.div>
            )}

            {/* Target Task Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2 font-mono">
                Target Node Blast Radius (Optional)
              </label>
              <select
                value={affectedTaskId}
                onChange={(e) => setAffectedTaskId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="">Auto-detect active critical path node</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.status.toUpperCase()}] {t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Explanation box */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 leading-relaxed font-mono">
              <span className="text-cyan-400 font-bold">Autonomous Protocol: </span>
              Sentinel flags anomaly → Mission enters &apos;recovering&apos; → Phoenix isolates blast radius → Arbiter evaluates alternative → Patch nodes injected into DAG.
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-3">
            <button
              onClick={() => setFailureModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleInject}
              disabled={isLoading || (selectedScenario === 'custom' && !customText.trim())}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all disabled:opacity-40"
            >
              <span>Inject & Trigger Recovery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
