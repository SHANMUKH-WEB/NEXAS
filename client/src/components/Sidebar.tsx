import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  ListTodo,
  Network,
  ShieldAlert,
  Database,
  Scale,
  BarChart3,
  RotateCcw,
  Cpu,
} from 'lucide-react';
import { useMissionStore } from '../store/missionStore';

export const Sidebar: React.FC = () => {
  const { approvals } = useMissionStore();
  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;

  const navItems = [
    { to: '/', label: 'Command Center', icon: LayoutDashboard },
    { to: '/dashboard', label: 'Agent Dashboard', icon: Bot },
    { to: '/planner', label: 'Mission Planner', icon: ListTodo },
    { to: '/graph', label: 'Task DAG Graph', icon: Network },
    {
      to: '/approvals',
      label: 'Approval Center',
      icon: ShieldAlert,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { to: '/memory', label: 'Memory Explorer', icon: Database },
    { to: '/decisions', label: 'Decision History', icon: Scale },
    { to: '/analytics', label: 'Telemetry & Analytics', icon: BarChart3 },
    { to: '/replay', label: 'Mission Replay', icon: RotateCcw },
  ];

  return (
    <aside className="w-64 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 to-indigo-950/40">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold">
            <Cpu className="w-5 h-5 text-cyan-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-wider text-white font-['Outfit']">NEXUS</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono font-semibold border border-cyan-500/30">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Autonomous Engine</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 text-xs text-slate-400">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono text-slate-400">Orchestrator v1.0</span>
          <span className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Online
          </span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
          8 Autonomous Agents • Real-time DAG • Self-Healing Replan
        </p>
      </div>
    </aside>
  );
};
