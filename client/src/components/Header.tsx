import React from 'react';
import {
  Play,
  Pause,
  StepForward,
  AlertTriangle,
  Radio,
  Sparkles,
  Layers,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { useMissionStore } from '../store/missionStore';

export const Header: React.FC = () => {
  const {
    currentMission,
    missions,
    selectMission,
    isWsConnected,
    stepCurrentMission,
    togglePauseMission,
    setFailureModalOpen,
    loadDemoMission,
    model,
    setModel,
    isDemoMode,
    setDemoMode,
    isLoading,
  } = useMissionStore();

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'executing':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Executing
          </span>
        );
      case 'recovering':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            Recovering (Replanning)
          </span>
        );
      case 'paused':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Paused
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Goal Achieved
          </span>
        );
      case 'planning':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Planning DAG
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            {status || 'Idle'}
          </span>
        );
    }
  };

  return (
    <header className="h-16 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mission Selector & Status */}
      <div className="flex items-center gap-4">
        <div className="relative flex items-center">
          <Layers className="w-4 h-4 text-cyan-400 mr-2 shrink-0" />
          <select
            value={currentMission?.id || ''}
            onChange={(e) => selectMission(e.target.value)}
            className="bg-slate-900/90 text-slate-200 text-sm font-medium rounded-lg border border-slate-700/80 px-3 py-1.5 pr-8 appearance-none focus:outline-none focus:border-cyan-500 cursor-pointer max-w-[280px] truncate"
          >
            {missions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
        </div>

        {getStatusBadge(currentMission?.status)}

        {currentMission && (
          <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono border border-slate-700/50 hidden md:inline-block">
            {currentMission.domain}
          </span>
        )}
      </div>

      {/* Right: Operational Control Bar */}
      <div className="flex items-center gap-2.5">
        {/* Model Selector */}
        <div className="hidden lg:flex items-center bg-slate-900/80 rounded-lg p-0.5 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setModel('gemini-2.5-flash')}
            className={`px-2 py-1 rounded flex items-center gap-1 transition-all ${
              model === 'gemini-2.5-flash'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            2.5 Flash
          </button>
          <button
            onClick={() => setModel('gemini-2.5-pro')}
            className={`px-2 py-1 rounded flex items-center gap-1 transition-all ${
              model === 'gemini-2.5-pro'
                ? 'bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            2.5 Pro
          </button>
        </div>

        {/* Demo Mode Toggle */}
        <button
          onClick={() => setDemoMode(!isDemoMode)}
          className={`text-xs px-2.5 py-1.5 rounded-lg border font-mono transition-all hidden sm:flex items-center gap-1.5 ${
            isDemoMode
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-300'
          }`}
          title="Toggle Deterministic Offline Simulation Mode"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isDemoMode ? 'bg-amber-400' : 'bg-slate-600'}`} />
          {isDemoMode ? 'Demo Mode' : 'Live LLM'}
        </button>

        {/* WebSocket status */}
        <div
          className={`flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded-md border ${
            isWsConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}
          title={isWsConnected ? 'Connected to live agent WebSocket stream' : 'Reconnecting to stream...'}
        >
          <Radio className={`w-3 h-3 ${isWsConnected ? 'animate-pulse' : ''}`} />
          <span className="hidden sm:inline">{isWsConnected ? 'Telemetry Live' : 'WS Reconnecting'}</span>
        </div>

        <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

        {/* Mission Controls */}
        <button
          onClick={stepCurrentMission}
          disabled={isLoading || !currentMission || currentMission.status === 'completed'}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          title="Step forward one autonomous agent action"
        >
          <StepForward className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Next Step</span>
        </button>

        <button
          onClick={togglePauseMission}
          disabled={!currentMission || currentMission.status === 'completed'}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1 transition-all disabled:opacity-40 shadow-sm"
          title="Pause or Resume autonomous loop"
        >
          {currentMission?.status === 'paused' ? (
            <>
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Resume</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Pause</span>
            </>
          )}
        </button>

        {/* Simulate Failure Button */}
        <button
          onClick={() => setFailureModalOpen(true)}
          disabled={!currentMission || currentMission.status === 'completed'}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all disabled:opacity-40"
          title="Inject environmental disruption or failure to trigger Autonomous Replan"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-200 animate-pulse" />
          <span>Simulate Failure</span>
        </button>

        {/* Quick Reset Demo */}
        <button
          onClick={loadDemoMission}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80 transition-all"
          title="Reset to Demo Mission (College Tech Festival)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
