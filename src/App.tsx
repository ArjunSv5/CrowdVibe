/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSoundMeter } from './hooks/useSoundMeter';
import { SpeedometerGauge } from './components/SpeedometerGauge';
import {
  MicOff,
  Pause,
  Play,
  Maximize,
  Minimize,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  const {
    stats,
    rawDetectedDb,
    isRunning,
    hasPermission,
    isInitializing,
    errorMessage,
    toggleRunning,
    resetStats,
    startAudio,
  } = useSoundMeter();

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Pure Minimalist Speedometer View
  return (
    <div
      id="speedometer-screen"
      className="min-h-screen w-full bg-black text-zinc-100 flex flex-col justify-between items-center p-3 sm:p-6 font-sans select-none antialiased overflow-hidden"
    >
      {/* Discreet Stealth Top Bar */}
      <header id="meter-top-bar" className="w-full max-w-md flex items-center justify-between px-1 py-1 z-20">
        {/* Subtle live indicator dot */}
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isRunning
                ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]'
            }`}
          />
          <span className="text-[10px] font-mono text-zinc-600 tracking-wider font-medium">
            {isRunning ? 'LIVE' : 'HOLD'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Fullscreen Button */}
          <button
            id="fullscreen-toggle-btn"
            onClick={toggleFullscreen}
            className="p-2 text-zinc-600 hover:text-zinc-300 transition-colors rounded-lg hover:bg-zinc-900/80 active:scale-95"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

        </div>
      </header>

      {/* Permission Fallback Banner (only when mic access denied) */}
      {hasPermission === false && (
        <section
          id="mic-permission-warning"
          className="w-full max-w-md bg-zinc-950/90 border border-amber-900/40 rounded-xl p-3 flex items-center justify-between gap-3 text-xs z-20 animate-in fade-in"
        >
          <div className="flex items-center gap-2 text-amber-300">
            <MicOff className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="text-[11px] font-mono">{errorMessage || 'Acoustic simulation active.'}</span>
          </div>
          <button
            id="reconnect-mic-btn"
            onClick={startAudio}
            disabled={isInitializing}
            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg font-mono text-[10px] font-medium shrink-0 active:scale-95"
          >
            {isInitializing ? 'Connecting...' : 'Connect Mic'}
          </button>
        </section>
      )}

      {/* Primary Speedometer Dial & Big Bold dB Display */}
      <main
        id="speedometer-centerpiece"
        className="w-full max-w-md flex-1 flex flex-col items-center justify-center my-auto relative z-10"
      >
        <SpeedometerGauge currentDb={stats.current} minRange={30} maxRange={130} />
      </main>

      {/* Minimalist Bottom Control Deck */}
      <footer id="meter-bottom-controls" className="w-full max-w-md flex items-center justify-center gap-3 py-2 z-20">
        {/* HOLD / RESUME Toggle */}
        <button
          id="hold-toggle-btn"
          onClick={toggleRunning}
          className={`flex-1 py-3 px-4 rounded-xl font-mono font-bold text-xs tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98] ${
            isRunning
              ? 'bg-zinc-950 hover:bg-zinc-900 text-zinc-400 border border-zinc-800'
              : 'bg-amber-500 hover:bg-amber-400 text-black border border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 text-zinc-400" />
              <span>HOLD</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current text-black" />
              <span>RESUME</span>
            </>
          )}
        </button>

        {/* Reset Peak / Min */}
        <button
          id="reset-stats-btn"
          onClick={resetStats}
          className="py-3 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 font-mono font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          title="Reset Peak & Minimum"
        >
          <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
          <span>RESET</span>
        </button>
      </footer>
    </div>
  );
}
