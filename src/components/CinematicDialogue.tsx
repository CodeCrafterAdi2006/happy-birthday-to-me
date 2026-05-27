import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Character } from '../types';
import { Play, Pause, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface CinematicDialogueProps {
  character: Character;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  autoPlay: boolean;
  onToggleAutoPlay: () => void;
  autoProgressMs: number;
}

export const CinematicDialogue: React.FC<CinematicDialogueProps> = ({
  character,
  onNext,
  onPrev,
  isFirst,
  isLast,
  autoPlay,
  onToggleAutoPlay,
  autoProgressMs,
}) => {
  const [typedMessage, setTypedMessage] = useState('');
  const [progressWidth, setProgressWidth] = useState(0);

  // Typewriter effect simulating speech
  useEffect(() => {
    let isMounted = true;
    const fullMsg = character.message;
    
    if (!fullMsg) {
      setTypedMessage('');
      return;
    }
    
    setTypedMessage('');
    let index = 0;
    
    // Quick typing speed
    const interval = setInterval(() => {
      if (!isMounted) return;
      if (index <= fullMsg.length) {
        setTypedMessage(fullMsg.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 15);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [character]);

  // Handle auto-progress timeline bar
  useEffect(() => {
    if (!autoPlay) {
      setProgressWidth(0);
      return;
    }

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const percent = Math.min(100, (elapsed / autoProgressMs) * 100);
      setProgressWidth(percent);
    }, 40);

    return () => clearInterval(interval);
  }, [character, autoPlay, autoProgressMs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="w-full max-w-4xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center shadow-2xl relative overflow-hidden transition-all duration-300"
    >
      {/* Decorative Aura Background inside card */}
      <div
        className="absolute -left-10 -top-10 w-32 h-32 rounded-full blur-[40px] opacity-25 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: character.glowColor }}
      />
      
      {/* Timeline Auto Progress bar at top edge */}
      {autoPlay && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-[40ms] ease-linear"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      )}

      {/* Speaker Profile */}
      <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-[1.5px] self-center md:self-auto shadow-lg">
        <div className="w-full h-full rounded-2xl bg-[#02040a] flex items-center justify-center overflow-hidden relative">
          <img 
            src={character.avatarImage} 
            alt={character.name} 
            className="w-full h-full object-cover rounded-2xl z-10 transition-transform duration-500 hover:scale-115"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-amber-400/10 animate-pulse z-0" />
        </div>
      </div>

      {/* Message Content & Controls Panel */}
      <div className="flex-grow w-full flex flex-col justify-between">
        
        {/* Alignment metadata */}
        <div className="flex items-center gap-3 mb-2 flex-wrap w-full">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">{character.name}</span>
          <div className="h-[1px] flex-grow bg-white/10 min-w-[30px]" />
          <span className="text-[10px] text-white/40 italic uppercase tracking-wider">{character.source}</span>
        </div>

        {/* Typed dialog message using beautiful editorial serif */}
        <div className="min-h-[90px] text-white/95 text-lg sm:text-2xl font-serif italic leading-relaxed mb-4">
          <p>
            "{typedMessage}"
            <span className="inline-block w-1.5 h-4 bg-amber-400 ml-1 animate-pulse" />
          </p>
        </div>

        {/* Transmission metadata */}
        <div className="mb-4 flex flex-wrap items-center gap-2 text-[9px] sm:text-[10px] text-white/30 uppercase tracking-widest italic">
          <span className="px-2 py-0.5 bg-amber-400/10 rounded text-amber-400 border border-amber-400/20 not-italic">Star aligned</span>
          <span>Transmission received from The Celestial Plains</span>
        </div>

        {/* Controls panel integrated inside message container */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-4 w-full">
          {/* Play / Pause toggle */}
          <button
            onClick={onToggleAutoPlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
              autoPlay
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:bg-amber-400'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
            title={autoPlay ? 'Pause auto assembly timer' : 'Start auto assembly timer'}
          >
            {autoPlay ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
            {autoPlay ? 'Auto-Orbiting' : 'Auto-Orbit Off'}
          </button>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={onPrev}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-3 h-3" />
                Prev Star
              </button>
            )}

            <button
              onClick={onNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer shadow-lg active:scale-95"
            >
              {isLast ? 'Unfold Constellation' : 'Next Star'}
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
