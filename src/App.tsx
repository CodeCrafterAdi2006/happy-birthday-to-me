/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CHARACTERS } from './data';
import { Character, CharacterId } from './types';
import { audio } from './utils/audio';
import { CosmicBackground } from './components/CosmicBackground';
import { CharacterOrb } from './components/CharacterOrb';
import { CinematicDialogue } from './components/CinematicDialogue';
import { Guestbook } from './components/Guestbook';
import {  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  ArrowRight,
  Heart,
  X,
  ChevronRight
} from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<'intro' | 'assembling' | 'celebration'>('intro');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [autoPlay, setAutoPlay] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedHero, setSelectedHero] = useState<Character | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [realTime, setRealTime] = useState<Date>(new Date());

  // Real-time ticking clock effect
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setRealTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const formattedDate = realTime.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedTime = realTime.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  });

  const totalCharacters = CHARACTERS.length;
  const autoProgressMs = 5000; // Time spent on each star during autoplay

  // Responsive design checker
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize audio on first physical user interaction to bypass browser autoplay policies
  useEffect(() => {
    const initAudioOnInteraction = () => {
      audio.init();
      window.removeEventListener('click', initAudioOnInteraction);
      window.removeEventListener('touchstart', initAudioOnInteraction);
    };
    window.addEventListener('click', initAudioOnInteraction);
    window.addEventListener('touchstart', initAudioOnInteraction);
    return () => {
      window.removeEventListener('click', initAudioOnInteraction);
      window.removeEventListener('touchstart', initAudioOnInteraction);
    };
  }, []);

  // Handle auto-advance timing
  useEffect(() => {
    if (appState !== 'assembling' || !autoPlay) return;

    const timer = setTimeout(() => {
      handleNextStar();
    }, autoProgressMs);

    return () => clearTimeout(timer);
  }, [appState, currentStep, autoPlay]);

  // Sync mute state to AudioManager
  const handleToggleMute = () => {
    audio.init();
    const nextMute = audio.toggleMute();
    setIsMuted(nextMute);
  };

  const handleStartJourney = () => {
    audio.init();
    audio.setMute(isMuted);
    setAppState('assembling');
    setCurrentStep(0);
    // Play Luffy theme immediately
    audio.playCharacterTheme(CHARACTERS[0].styleType);
  };

  const handleNextStar = () => {
    // Advancing ambient sounds
    audio.transitionAmbientNoise();

    if (currentStep < totalCharacters - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      // Play thematic sound sequence
      audio.playCharacterTheme(CHARACTERS[nextIdx].styleType);
    } else {
      // Transition to final grand constellation
      setAppState('celebration');
      audio.playGrandFinale();
    }
  };

  const handlePrevStar = () => {
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      audio.playCharacterTheme(CHARACTERS[prevIdx].styleType);
    }
  };

  const handleRestart = () => {
    setAppState('intro');
    setCurrentStep(0);
    setSelectedHero(null);
    setAutoPlay(true);
  };

  // Pre-calculate which points should draw connection lines in CosmicBackground
  const constellationPoints =
    appState === 'celebration'
      ? CHARACTERS.map((c) => ({
          x: c.constellationPosition.x,
          y: c.constellationPosition.y,
          color: c.glowColor,
        }))
      : CHARACTERS.slice(0, currentStep + 1).map((c) => ({
          x: c.constellationPosition.x,
          y: c.constellationPosition.y,
          color: c.glowColor,
        }));

  const activeCharacter = CHARACTERS[currentStep];

  // Helper inside viewport positioning
  const getConstellationStyle = (char: Character) => {
    const multX = isMobile ? 0.42 : 0.60;
    const multY = isMobile ? 0.38 : 0.52;
    return {
      position: 'absolute' as const,
      left: `calc(50% + ${char.constellationPosition.x * multX}%)`,
      top: `calc(45% + ${char.constellationPosition.y * multY}%)`,
      transform: 'translate(-50%, -50%)',
    };
  };

  return (
    <div className="relative min-h-screen w-full text-slate-100 font-sans flex flex-col justify-between overflow-hidden selection:bg-white/10 selection:text-white">
      
      {/* 60FPS Stars & Nebula Canvas */}
      <CosmicBackground
        currentStep={currentStep}
        isConstellationAssembled={appState === 'celebration'}
        constellationPoints={constellationPoints}
      />

      {/* Persistent Audio Controller */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={handleToggleMute}
          className="p-3 rounded-full bg-slate-900/80 border border-white/10 text-amber-400 hover:text-amber-300 hover:bg-slate-800 hover:border-amber-400/40 transition-all duration-300 active:scale-95 shadow-md cursor-pointer"
          title={isMuted ? 'Unmute space soundscape' : 'Mute music'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
        </button>
      </div>

      {/* TOP HEADER / NARRATIVE NAVEGATION */}
      <header className="w-full max-w-7xl mx-auto px-6 pt-6 z-20 flex justify-between items-start">
        <div className="border-l-2 border-amber-500/50 pl-4 text-left">
          <p className="text-[10px] uppercase tracking-[0.4em] text-amber-500/70 font-semibold mb-1">
            Project Designation
          </p>
          <h2 className="text-xl sm:text-2xl font-light italic tracking-tight font-serif text-white">
            The Assembly of Legends
          </h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-1">Current Timeline</p>
          <p className="text-xs sm:text-sm font-mono text-amber-200">DECADE III / CE {realTime.getFullYear()}</p>
          <p className="text-[10px] font-mono text-amber-400/80 tracking-widest uppercase mt-0.5">
            {formattedDate} • {formattedTime}
          </p>
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className="w-full max-w-7xl mx-auto px-4 flex-grow flex flex-col items-center justify-center z-10 py-6">
        <AnimatePresence mode="wait">
          
          {/* 1. INTRO VIEW */}
          {appState === 'intro' && (
            <motion.div
              key="intro-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl px-4 py-8 flex flex-col items-center"
            >
              <div className="mb-6 px-6 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                <p className="text-[11px] uppercase tracking-[0.3em] font-semibold text-amber-200/95 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                  Welcome to the Third Decade
                </p>
              </div>

              <h1 className="text-5xl sm:text-8xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-500 to-amber-700 tracking-tight leading-none text-center mb-6 drop-shadow-md">
                HAPPY BIRTHDAY<br />
                <span className="text-white italic font-normal tracking-wide">ADITYA</span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-lg mb-8 font-sans">
                A magical gathering across universes has begun. Every hero, rival, and mentor you ever loved is assembling in the deep cosmos to celebrate the best decade of your life.
              </p>

              <button
                onClick={handleStartJourney}
                className="group relative flex items-center gap-2.5 px-8 py-4 bg-amber-500 text-black hover:bg-white hover:text-black font-bold uppercase tracking-[0.2em] text-xs sm:text-sm rounded-full transition-all duration-300 transform active:scale-95 shadow-2xl shadow-amber-500/20 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span>Summon the Crew</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="mt-4 text-xs text-slate-400/80 font-mono flex items-center gap-1">
                🎧 Put on headphones for synthesized soundscapes
              </p>
            </motion.div>
          )}

          {/* 2. ASSEMBLING STARFIELD STEP BY STEP */}
          {appState === 'assembling' && (
            <motion.div
              key="assembling-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-between gap-6"
            >
              {/* As Assembled Map overlay */}
              <div className="text-center font-mono text-xs text-slate-400 tracking-wider">
                Aligning star <span className="text-amber-400 font-bold">{currentStep + 1}</span> of <span className="text-slate-400">{totalCharacters}</span>
              </div>

              {/* Central Big active Orb representation */}
              <div className="w-full relative py-8 flex items-center justify-center min-h-[160px] sm:min-h-[200px]">
                {/* Background assembled points as tiny glowing specs */}
                <div className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
                  {CHARACTERS.map((char, index) => {
                    if (index >= currentStep) return null;
                    return (
                      <div
                        key={char.id}
                        style={getConstellationStyle(char)}
                        className="w-3 h-3 rounded-full bg-white animate-ping absolute"
                      />
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCharacter.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0, x: activeCharacter.constellationPosition.x * 4, y: activeCharacter.constellationPosition.y * 4 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                  >
                    <CharacterOrb
                      character={activeCharacter}
                      isActive={true}
                      isConstellation={false}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Large Typed dialogue and buttons controllers */}
              <CinematicDialogue
                character={activeCharacter}
                onNext={handleNextStar}
                onPrev={handlePrevStar}
                isFirst={currentStep === 0}
                isLast={currentStep === totalCharacters - 1}
                autoPlay={autoPlay}
                onToggleAutoPlay={() => setAutoPlay(!autoPlay)}
                autoProgressMs={autoProgressMs}
              />
            </motion.div>
          )}

          {/* 3. FINAL CONSTELLATION CELEBRATION */}
          {appState === 'celebration' && (
            <motion.div
              key="celebration-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="w-full flex-grow flex flex-col justify-between gap-6 relative"
            >
              {/* Central Headline */}
              <div className="text-center z-10 max-w-4xl mx-auto px-4 mt-2">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-4 inline-block px-6 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 shadow-lg"
                >
                  <p className="text-[11px] uppercase tracking-[0.3em] font-semibold text-amber-200/95 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                    Welcome to the Third Decade
                  </p>
                </motion.div>
                
                <motion.h1
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="text-5xl sm:text-8xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-500 to-amber-700 tracking-tight leading-none text-center mb-6 drop-shadow-md"
                >
                  HAPPY BIRTHDAY<br />
                  <span className="text-white italic font-normal tracking-wide">ADITYA</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-slate-300 text-sm sm:text-base font-sans max-w-xl mx-auto leading-relaxed"
                >
                  From every world you ever loved — welcome to the best decade of your life. 
                  <span className="text-amber-400 block mt-1.5 font-semibold text-xs sm:text-sm">
                    ✨ Tap any glowing star to read their birthday message and replay their theme tune!
                  </span>
                </motion.p>
              </div>

              {/* Constellation Star Matrix Map Grid container */}
              <div className="relative w-full h-[320px] sm:h-[420px] my-4 overflow-visible rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
                {CHARACTERS.map((char) => (
                  <motion.div
                    key={char.id}
                    style={getConstellationStyle(char)}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.5 + Math.random() * 0.8,
                      type: 'spring',
                      stiffness: 70,
                    }}
                    className="absolute cursor-pointer"
                  >
                    <CharacterOrb
                      character={char}
                      isActive={selectedHero?.id === char.id}
                      isConstellation={true}
                      onClick={() => {
                        setSelectedHero(char);
                        audio.playCharacterTheme(char.styleType);
                      }}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Editorial Layout Footer Controls */}
              <div className="w-full flex flex-col sm:flex-row justify-between items-center z-20 pt-4 border-t border-white/10 mt-6 gap-4">
                <div className="flex gap-6 items-center flex-wrap justify-center sm:justify-start">
                  <button 
                    onClick={handleRestart}
                    className="group flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/5 group-hover:bg-white group-hover:text-black transition-all">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">Rewatch Assembly</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] uppercase tracking-tighter text-white/40">{totalCharacters} Heroes Present</span>
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="flex -space-x-3">
                    <div className="w-8 h-8 rounded-full border-2 border-[#02040a] bg-red-500/50" />
                    <div className="w-8 h-8 rounded-full border-2 border-[#02040a] bg-blue-500/50" />
                    <div className="w-8 h-8 rounded-full border-2 border-[#02040a] bg-green-500/50" />
                    <div className="w-8 h-8 rounded-full border-2 border-[#02040a] bg-amber-500/50" />
                    <div className="w-8 h-8 rounded-full border-2 border-[#02040a] bg-white/10 flex items-center justify-center text-[10px] font-bold">+7</div>
                  </div>
                  <button 
                    onClick={handleRestart}
                    className="px-8 py-3 bg-amber-500 text-black font-bold text-[10px] uppercase tracking-widest rounded-full hover:bg-white hover:text-black transition-all transform active:scale-95 shadow-xl shadow-amber-500/20 cursor-pointer"
                  >
                    Continue The Journey
                  </button>
                </div>
              </div>

              {/* Guestbook and Local Sync Tool */}
              <Guestbook />

              {/* FLOATING DIALOG OVERLAY for Selected star inside constellation */}
              <AnimatePresence>
                {selectedHero && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/85 backdrop-blur-sm"
                    onClick={() => setSelectedHero(null)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 30 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 30 }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full max-w-lg bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 relative shadow-2xl overflow-hidden"
                    >
                      {/* Decorative internal aura glow */}
                      <div
                        className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-[30px] opacity-20 pointer-events-none"
                        style={{ backgroundColor: selectedHero.glowColor }}
                      />

                      {/* Close */}
                      <button
                        onClick={() => setSelectedHero(null)}
                        className="absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/5 p-1.5 rounded-full transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4 pointer-events-none" />
                      </button>

                      <div className="flex items-center gap-4 mb-5">
                        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-[1.5px] shadow-lg">
                          <div className="w-full h-full rounded-xl bg-[#02040a] flex items-center justify-center overflow-hidden relative">
                            <img 
                              src={selectedHero.avatarImage} 
                              alt={selectedHero.name} 
                              className="w-full h-full object-cover rounded-xl z-10 transition-transform duration-500 hover:scale-110"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-amber-400/5 animate-pulse z-0" />
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] tracking-widest text-amber-400 uppercase font-bold">
                            {selectedHero.source}
                          </span>
                          <h4 className="text-xl font-bold text-white leading-tight">
                            {selectedHero.name}
                          </h4>
                        </div>
                      </div>

                      <div className="p-5 sm:p-6 bg-white/5 border border-white/10 rounded-2xl text-white/95 text-base sm:text-lg leading-relaxed italic mb-6 font-serif relative">
                        “{selectedHero.message}”
                      </div>

                      <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-4">
                        <button
                          onClick={() => audio.playCharacterTheme(selectedHero.styleType)}
                          className="flex items-center gap-1.5 text-[10px] text-amber-400 hover:text-amber-300 font-bold tracking-widest uppercase transition-colors cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          Replay Theme Voice
                        </button>
                        <button
                          onClick={() => setSelectedHero(null)}
                          className="px-4 py-2 bg-amber-500 hover:bg-white hover:text-black text-black font-bold text-[10px] uppercase tracking-widest rounded-lg cursor-pointer transition-all"
                        >
                          Back to Sky
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="w-full text-center py-4 px-4 text-slate-500 text-[10px] sm:text-xs font-mono tracking-widest uppercase z-10 mt-auto border-t border-white/5 bg-slate-950/20 backdrop-blur-xs">
        Assembled for Aditya at age 20 • Happy Birthday • Live with Dharma
      </footer>
    </div>
  );
}
