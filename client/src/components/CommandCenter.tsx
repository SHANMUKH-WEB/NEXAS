import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Rocket,
  Sparkles,
  Bot,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Calendar,
  Code2,
  Boxes,
  FileCheck,
} from 'lucide-react';
import { useMissionStore } from '../store/missionStore';

export const CommandCenter: React.FC = () => {
  const navigate = useNavigate();
  const {
    createMission,
    loadDemoMission,
    missions,
    selectMission,
    isLoading,
  } = useMissionStore();

  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [domain, setDomain] = useState('Event Management');
  const [autonomyLevel, setAutonomyLevel] = useState<'supervised' | 'autonomous'>('supervised');

  const domainOptions = [
    { id: 'Event Management', label: 'Event Management', icon: Calendar, color: 'text-pink-400' },
    { id: 'Software Engineering', label: 'Software Engineering', icon: Code2, color: 'text-cyan-400' },
    { id: 'Supply Chain & Logistics', label: 'Supply Chain & Logistics', icon: Boxes, color: 'text-amber-400' },
    { id: 'Business Strategy & Compliance', label: 'Compliance & Strategy', icon: FileCheck, color: 'text-emerald-400' },
  ];

  const presets = [
    {
      title: 'College Technical Festival 2026',
      domain: 'Event Management',
      goal: 'Organize a college technical festival for 500 students with hackathons, workshops, keynote speakers, and vendor sponsorships within a $15,000 budget.',
    },
    {
      title: 'Monolith to Microservices Cutover',
      domain: 'Software Engineering',
      goal: 'Migrate core payment and catalog monolith backend into containerized microservices with zero downtime, shadow traffic mirroring, and automated rollback.',
    },
    {
      title: 'Global Semiconductor Shortage Response',
      domain: 'Supply Chain & Logistics',
      goal: 'Re-route tier-2 supplier shipments, secure emergency air freight charters, and rebalance buffer inventories across North America assembly hubs.',
    },
    {
      title: 'HIPAA & SOC 2 Type II Audit Readiness',
      domain: 'Business Strategy & Compliance',
      goal: 'Execute automated gap analysis across AWS infrastructure, enforce customer-managed KMS encryption, and generate tamper-evident audit evidence dossier.',
    },
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setTitle(p.title);
    setDomain(p.domain);
    setGoal(p.goal);
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !goal.trim()) return;

    try {
      await createMission({
        title,
        goal,
        domain,
        autonomy_level: autonomyLevel,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Launch failed:', err);
    }
  };

  const handleQuickDemo = async () => {
    await loadDemoMission();
    navigate('/dashboard');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 lg:p-10 glass-panel-glow border border-cyan-500/30"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Autonomous Problem-Solving Intelligence Platform
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold text-white font-['Outfit'] tracking-tight leading-tight">
            NEXUS AI — Autonomous Multi-Agent Orchestration
          </h1>

          <p className="mt-3 text-slate-300 text-sm lg:text-base leading-relaxed">
            Unlike static chatbots, NEXUS AI autonomously decomposes high-level human objectives,
            delegates tasks across 8 specialized AI agents, executes critical path DAGs, enforces human safety guardrails,
            and dynamically self-heals when failures occur.
          </p>

          {/* Quick Demo Button */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              onClick={handleQuickDemo}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs lg:text-sm shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Zap className="w-4 h-4 text-cyan-100" />
              <span>Load Master Demo Mission (500 Student Festival)</span>
            </button>
            <span className="text-xs text-slate-400 font-mono">
              Pre-loaded with 8 live agents, interactive DAG & pending approval
            </span>
          </div>
        </div>
      </motion.div>

      {/* Main Mission Initialization Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit']">
                Initialize New Autonomous Mission
              </h2>
              <p className="text-xs text-slate-400">
                Define the high-level goal and execution parameters for the Planner Agent
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 text-[11px] font-mono text-cyan-400 border border-slate-700">
              <Bot className="w-3.5 h-3.5" />
              Aether Ready
            </div>
          </div>

          <form onSubmit={handleLaunch} className="space-y-6">
            {/* Domain Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 font-mono">
                1. Target Problem Domain
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {domainOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = domain === opt.id;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setDomain(opt.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/10 shadow-sm shadow-cyan-500/10'
                          : 'border-slate-800 bg-slate-900/40 hover:bg-slate-850 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-2 ${opt.color}`} />
                      <span className="text-xs font-semibold text-slate-200 leading-tight">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mission Title */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                2. Mission Codename / Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Campus TechFest 2026 Operations"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
            </div>

            {/* Mission Objective / Goal */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  3. High-Level Objective Specification
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {goal.length} chars • ~{Math.round(goal.length / 4)} tokens
                </span>
              </div>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Describe your desired outcome, constraints, budget, audience, or key milestones in natural language..."
                rows={4}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors leading-relaxed"
                required
              />
            </div>

            {/* Autonomy Level */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 font-mono">
                4. Safety Protocol & Autonomy Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setAutonomyLevel('supervised')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    autonomyLevel === 'supervised'
                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider font-mono">
                      Supervised (Human-in-the-Loop)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Critical financial or irreversible external actions require explicit human sign-off via Approval Center.
                  </p>
                </div>

                <div
                  onClick={() => setAutonomyLevel('autonomous')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    autonomyLevel === 'autonomous'
                      ? 'border-cyan-500 bg-cyan-500/10 text-white'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold uppercase tracking-wider font-mono">
                      Full Autonomous Loop
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Agents execute end-to-end autonomously with automatic timer stepping and telemetry logging.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !title.trim() || !goal.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              <Rocket className="w-4 h-4" />
              <span>Launch Autonomous Mission</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>
        </div>

        {/* Right 1 Col: Presets & Mission History */}
        <div className="space-y-6">
          {/* Presets */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Curated Mission Presets
              </span>
            </div>

            <div className="space-y-2.5">
              {presets.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => applyPreset(p)}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-800/40 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                      {p.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {p.domain}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {p.goal}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Missions */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Active Missions ({missions.length})
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {missions.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    selectMission(m.id);
                    navigate('/dashboard');
                  }}
                  className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700 flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="truncate mr-2">
                    <div className="text-xs font-medium text-slate-200 truncate">{m.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono capitalize">{m.domain}</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
