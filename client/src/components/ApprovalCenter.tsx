import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Bot,
  Layers,
  Clock,
  ArrowRight,
  FileCode,
} from 'lucide-react';
import { useMissionStore } from '../store/missionStore';
import { RiskLevel } from '../types';

export const ApprovalCenter: React.FC = () => {
  const { approvals, resolveApproval, tasks, agents } = useMissionStore();
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});

  const pendingApprovals = approvals.filter((a) => a.status === 'pending');
  const resolvedApprovals = approvals.filter((a) => a.status !== 'pending');

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'critical':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            CRITICAL RISK
          </span>
        );
      case 'high':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            HIGH RISK
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            MEDIUM RISK
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
            LOW RISK
          </span>
        );
    }
  };

  const handleResolve = async (id: string, status: 'approved' | 'rejected') => {
    const feedback = feedbackMap[id] || '';
    await resolveApproval(id, status, feedback);
    setFeedbackMap((prev) => ({ ...prev, [id]: '' }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h1 className="text-2xl font-bold text-white font-['Outfit']">
              Human-in-the-Loop Approval Center
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Safety protocol gatekeeper: Review, authorize, or reject critical autonomous actions before execution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            Pending Queue: <strong className="text-amber-400">{pendingApprovals.length}</strong>
          </span>
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            Total Audited: <strong className="text-cyan-400">{resolvedApprovals.length}</strong>
          </span>
        </div>
      </div>

      {/* Pending Approvals Queue */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          Pending Authorization Requests ({pendingApprovals.length})
        </h2>

        {pendingApprovals.length > 0 ? (
          <div className="space-y-4">
            {pendingApprovals.map((approval) => {
              const task = tasks.find((t) => t.id === approval.task_id);
              const agent = agents.find((a) => a.id === approval.agent_id);

              return (
                <motion.div
                  key={approval.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-gradient-to-br from-slate-900/90 to-rose-950/20 shadow-xl space-y-5"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        {getRiskBadge(approval.risk_level)}
                        <span className="text-xs font-mono text-slate-400">
                          {new Date(approval.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white font-['Outfit']">
                        {approval.action_description}
                      </h3>
                    </div>

                    {agent && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shrink-0">
                        <Bot className="w-4 h-4 text-amber-400" />
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">
                            {agent.name.split(' (')[0]}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block capitalize">
                            {agent.role} Agent Gatekeeper
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Task Context */}
                  {task && (
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-mono text-slate-400">Target Node:</span>
                        <span className="font-semibold">{task.title}</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {task.status}
                      </span>
                    </div>
                  )}

                  {/* Payload / Impact Assessment */}
                  {approval.payload && Object.keys(approval.payload).length > 0 && (
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 block mb-1.5 uppercase tracking-wider">
                        Action Payload & Impact Assessment
                      </span>
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 font-mono text-xs text-amber-200/90 overflow-x-auto">
                        <pre>{JSON.stringify(approval.payload, null, 2)}</pre>
                      </div>
                    </div>
                  )}

                  {/* Human Feedback Note & Action Buttons */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-3">
                    <input
                      type="text"
                      placeholder="Optional human reviewer feedback or constraint conditions..."
                      value={feedbackMap[approval.id] || ''}
                      onChange={(e) =>
                        setFeedbackMap({ ...feedbackMap, [approval.id]: e.target.value })
                      }
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                    />

                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleResolve(approval.id, 'rejected')}
                        className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject & Force Re-Plan</span>
                      </button>

                      <button
                        onClick={() => handleResolve(approval.id, 'approved')}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Authorize & Release Gate</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white font-['Outfit']">
              All Safety Gates Cleared
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Autonomous execution is proceeding without blockers. Any high-risk spend or external agreements will automatically pause and appear here.
            </p>
          </div>
        )}
      </div>

      {/* Resolved Approvals History */}
      {resolvedApprovals.length > 0 && (
        <div className="space-y-4 pt-6">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Authorization Audit Trail ({resolvedApprovals.length})
          </h2>

          <div className="space-y-2.5">
            {resolvedApprovals.map((appr) => (
              <div
                key={appr.id}
                className="glass-panel p-4 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                        appr.status === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {appr.status}
                    </span>
                    <span className="font-semibold text-slate-200">
                      {appr.action_description}
                    </span>
                  </div>
                  {appr.payload?.feedback && (
                    <p className="text-slate-400 italic text-[11px]">
                      &quot;{appr.payload.feedback}&quot;
                    </p>
                  )}
                </div>

                <span className="text-slate-400 font-mono text-[11px] shrink-0">
                  {new Date(appr.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
