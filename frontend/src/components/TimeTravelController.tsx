import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Clock, 
  Calendar,
  Gauge
} from 'lucide-react';

export const TimeTravelController: React.FC = () => {
  const {
    timestamps,
    currentIndex,
    currentTime,
    isPlaying,
    playbackSpeed,
    setTimeIndex,
    setTime,
    stepForward,
    stepBackward,
    jumpDay,
    togglePlay,
    setPlaybackSpeed,
  } = useSimulation();

  // Parse date and time from simulation timestamp (e.g. "2026-08-31 09:30:00")
  const formatDisplayTime = (ts: string) => {
    if (!ts) return { dateStr: '--', timeStr: '--' };
    const parts = ts.split(' ');
    const datePart = parts[0] || '';
    const timePart = parts[1] || '';

    // Convert 24hr to 12hr AM/PM
    const [h, m] = timePart.split(':');
    let hourNum = parseInt(h, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    if (hourNum === 0) hourNum = 12;
    if (hourNum > 12) hourNum -= 12;

    const formattedTime = `${hourNum}:${m} ${ampm} EST`;

    // Format date nicely
    const d = new Date(`${datePart}T12:00:00Z`);
    const dateOptions: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    const formattedDate = isNaN(d.getTime()) ? datePart : d.toLocaleDateString('en-US', dateOptions);

    return { dateStr: formattedDate, timeStr: formattedTime };
  };

  const { dateStr, timeStr } = formatDisplayTime(currentTime);

  return (
    <div className="bg-[#0D1322] border-b border-slate-800/80 px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Left: Simulation Time Display & Date/Time Select Picker */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-2.5 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-700/60 shadow-inner">
            <div className="flex items-center gap-1.5 text-blue-400">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{dateStr}</span>
            </div>
            <div className="w-px h-4 bg-slate-700" />
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono-num font-bold text-sm">
              <Clock className="w-4 h-4" />
              <span>{timeStr}</span>
              {isPlaying && (
                <span className="relative flex h-2 w-2 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </div>
          </div>

          {/* Quick Jump Dropdown Picker */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="hidden sm:inline">Jump to:</span>
            <select
              value={currentTime}
              onChange={(e) => setTime(e.target.value)}
              className="bg-slate-900 text-slate-200 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-mono-num"
            >
              {timestamps.map((ts, idx) => {
                const { dateStr: d, timeStr: t } = formatDisplayTime(ts);
                return (
                  <option key={ts} value={ts}>
                    {idx + 1}. {d} - {t}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Center: Interactive Scrubber Slider */}
        <div className="w-full lg:flex-1 max-w-xl flex items-center gap-3">
          <span className="text-[11px] font-mono-num text-slate-400 whitespace-nowrap">
            {currentIndex + 1} / {timestamps.length}
          </span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min={0}
              max={timestamps.length > 0 ? timestamps.length - 1 : 0}
              value={currentIndex}
              onChange={(e) => setTimeIndex(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
            />
          </div>
        </div>

        {/* Right: Playback and Step Controls */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-center lg:justify-end">
          {/* Step Controls */}
          <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 p-0.5">
            <button
              onClick={() => jumpDay(-1)}
              disabled={currentIndex <= 0}
              title="Jump Back 1 Day"
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg hover:bg-slate-800 transition"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={stepBackward}
              disabled={currentIndex <= 0}
              title="Step Back 30 Minutes"
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              title={isPlaying ? "Pause Market Simulation" : "Play Market Simulation"}
              className={`px-3 py-1.5 mx-1 rounded-lg flex items-center gap-1.5 text-xs font-bold transition shadow-sm ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={stepForward}
              disabled={currentIndex >= timestamps.length - 1}
              title="Step Forward 30 Minutes"
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg hover:bg-slate-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => jumpDay(1)}
              disabled={currentIndex >= timestamps.length - 1}
              title="Jump Forward 1 Day"
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg hover:bg-slate-800 transition"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 p-0.5 text-[11px] font-bold">
            {[1, 2, 5, 10].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-1 rounded-lg transition ${
                  playbackSpeed === spd
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
