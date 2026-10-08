import React from 'react';
import { motion } from 'framer-motion';
import {
  RotateCcw,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Activity,
  Layers,
  Sparkles,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useMissionStore } from '../store/missionStore';

export const MissionReplay: React.FC = () => {
  const {
    telemetry,
    currentMission,
    isReplaying,
    replayStep,
    replaySpeed,
    startReplay,
    pauseReplay,
    setReplayStep,
    setReplaySpeed,
  } = useMissionStore();

  const totalEvents = telemetry.length;
  const currentEvent = telemetry[replayStep] || telemetry[telemetry.length - 1];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const step = parseInt(e.target.value, 10);
    setReplayStep(step);
  };

  const getEventIcon = (type: string) => {
    if (type.includes('anomaly') || type.includes('failure')) {
      return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    }
    if (type.includes('completed') || type.includes('achieved')) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
    if (type.includes('approval')) {
      return <Clock className="w-4 h-4 text-amber-400" />;
    }
    return <Activity className="w-4 h-4 text-cyan-400" />;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <RotateCcw className="w-5 h-5 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white font-['Outfit']">
            Mission Historical Replay & Scrubber
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Reconstruct the sequence of multi-agent planning, execution milestones, failure alerts, and autonomous recoveries
        </p>
      </div>

      {/* Playback Scrubber Control Console */}
      <div className="glass-panel p-6 lg:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-slate-400 block">Mission Under Inspection</span>
            <h2 className="text-lg font-bold text-white font-['Outfit'] mt-0.5">
              {currentMission?.title || 'Active Mission'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed Selector */}
            <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 text-xs font-mono">
              {[0.5, 1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setReplaySpeed(spd)}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    replaySpeed === spd
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Transport Controls */}
            <div className="flex items-center gap-1.5 bg-slate-900 rounded-xl p-1 border border-slate-800">
              <button
                onClick={() => setReplayStep(Math.max(0, replayStep - 1))}
                disabled={replayStep <= 0}
                className="p-2 text-slate-400 hover:text-white rounded-lg disabled:opacity-40"
                title="Step backward"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={isReplaying ? pauseReplay : startReplay}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
              >
                {isReplaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Play</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setReplayStep(Math.min(totalEvents - 1, replayStep + 1))}
                disabled={replayStep >= totalEvents - 1}
                className="p-2 text-slate-400 hover:text-white rounded-lg disabled:opacity-40"
                title="Step forward"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrubber Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>
              Step: <strong className="text-cyan-400">{replayStep + 1}</strong> / {totalEvents}
            </span>
            <span>
              {currentEvent ? new Date(currentEvent.timestamp).toLocaleTimeString() : '00:00:00'}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={Math.max(0, totalEvents - 1)}
            value={replayStep}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Spotlight Event Card */}
      {currentEvent && (
        <motion.div
          key={currentEvent.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-slate-900/90 to-cyan-950/20 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                {getEventIcon(currentEvent.event_type)}
              </div>
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
                  Event Spotlight
                </span>
                <h3 className="text-base font-bold text-white font-['Outfit'] uppercase">
                  {currentEvent.event_type}
                </h3>
              </div>
            </div>

            <span className="text-xs font-mono text-slate-400">
              {new Date(currentEvent.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-mono text-slate-400 block mb-1 uppercase tracking-wider">
              Event State Payload
            </span>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-xs text-cyan-300 overflow-x-auto max-h-56">
              <pre>{JSON.stringify(currentEvent.payload, null, 2)}</pre>
            </div>
          </div>
        </motion.div>
      )}

      {/* Chronological Event Timeline */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          Full Chronological Telemetry Sequence ({totalEvents})
        </h3>

        <div className="space-y-2">
          {telemetry.map((ev, idx) => {
            const isCurrent = idx === replayStep;

            return (
              <div
                key={ev.id}
                onClick={() => setReplayStep(idx)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                  isCurrent
                    ? 'bg-cyan-500/15 border-cyan-500/60 shadow-md ring-1 ring-cyan-500/40 text-white'
                    : 'bg-slate-900/40 border-slate-850 text-slate-400 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="w-5 text-right font-mono text-[10px] text-slate-500">
                    #{idx + 1}
                  </span>
                  {getEventIcon(ev.event_type)}
                  <span className="font-mono font-bold uppercase truncate max-w-[200px]">
                    {ev.event_type}
                  </span>
                  <span className="text-slate-500 truncate max-w-[300px] hidden sm:inline font-mono text-[11px]">
                    {JSON.stringify(ev.payload)}
                  </span>
                </div>

                <span className="font-mono text-[11px] shrink-0">
                  {new Date(ev.timestamp).toLocaleTimeString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
