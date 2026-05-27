import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Character } from '../types';

interface CharacterOrbProps {
  character: Character;
  isActive: boolean;
  isConstellation: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const CharacterOrb: React.FC<CharacterOrbProps> = ({
  character,
  isActive,
  isConstellation,
  onClick,
  style,
}) => {
  // Determine glowing aura shadow styles dynamically
  const glowShadowStyle = {
    boxShadow: isActive
      ? `0 0 45px 12px ${character.glowColor}, inset 0 0 15px rgba(255, 255, 255, 0.6)`
      : `0 0 22px 4px ${character.glowColor}, inset 0 0 5px rgba(255, 255, 255, 0.2)`,
  };

  return (
    <div
      onClick={onClick}
      style={style}
      className={`relative flex flex-col items-center justify-center select-none ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Dynamic Halo rings for active character */}
      <AnimatePresence>
        {isActive && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.4, 1.8], opacity: [0.6, 0.3, 0] }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut' }}
              className="absolute w-24 h-24 rounded-full border border-amber-400/30 pointer-events-none"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.25, 1.5], opacity: [0.5, 0.2, 0] }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut', delay: 0.5 }}
              className="absolute w-24 h-24 rounded-full border-2 border-dashed pointer-events-none"
              style={{ borderColor: character.glowColor }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main Glowing Avatar Orb */}
      <motion.div
        whileHover={{ scale: isConstellation ? 1.25 : 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        style={glowShadowStyle}
        className={`relative z-10 flex items-center justify-center rounded-full transition-all duration-500 bg-[#02040a] ${
          isConstellation ? 'w-10 h-10 sm:w-11 sm:h-11' : 'w-16 h-16 sm:w-20 sm:h-20'
        } border-2 border-white/40 overflow-hidden`}
      >
        <img
          src={character.avatarImage}
          alt={character.name}
          className="w-full h-full object-cover rounded-full pointer-events-none select-none z-10"
          referrerPolicy="no-referrer"
        />

        {/* Small source badge for large view */}
        {!isConstellation && (
          <div className="absolute -bottom-1 -right-1 bg-slate-900/90 text-[10px] text-amber-400 border border-amber-400/40 px-1 rounded-sm tracking-wide scale-90 z-25">
            {character.name.split(' ')[0]}
          </div>
        )}
      </motion.div>

      {/* Character Name Label (mainly in constellation view on hover or always for active star) */}
      <div className="pointer-events-none mt-2 text-center">
        <span
          className={`font-semibold tracking-wide transition-all duration-300 block ${
            isActive
              ? 'text-yellow-400 text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(234,179,8,0.5)] font-bold'
              : 'text-slate-300 text-[11px] opacity-80'
          }`}
        >
          {character.name}
        </span>
        {!isConstellation && (
          <span className="text-[10px] text-slate-400 block opacity-70">
            {character.source}
          </span>
        )}
      </div>

      {/* SPECIAL EFFECTS FOR SPECIFIC CHARACTERS */}
      <AnimatePresence>
        {isActive && (
          <div className="absolute top-0 inset-x-0 w-full flex justify-center z-20 pointer-events-none">
            {/* Luffy Fire Sparks */}
            {character.styleType === 'luffy' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute -top-12 flex space-x-1"
              >
                {['🔥', '✨', '🍗'].map((itm, i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [-15, -45], opacity: [1, 0], scale: [1, 1.4] }}
                    transition={{ repeat: Infinity, duration: 1.2 + i * 0.3, ease: 'easeOut' }}
                    className="text-lg"
                  >
                    {itm}
                  </motion.span>
                ))}
              </motion.div>
            )}

            {/* Eragon Magic Dragon Runes */}
            {character.styleType === 'eragon' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute -top-10 flex space-x-2"
              >
                {['❄️', '✨', '🗡️'].map((itm, i) => (
                  <motion.span
                    key={i}
                    animate={{ rotate: 360, scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2.5 + i }}
                    className="text-sm drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]"
                  >
                    {itm}
                  </motion.span>
                ))}
              </motion.div>
            )}

            {/* Shri Krishna Floating Lotus Petals */}
            {character.styleType === 'krishna' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute -inset-x-16 -top-16 -bottom-16 w-48 h-48"
              >
                {['🌸', '🪷', '✨', '🌸'].map((emoji, i) => (
                  <motion.span
                    key={i}
                    animate={{
                      y: [-20, 60],
                      x: [Math.sin(i) * 20, Math.sin(i) * -20],
                      opacity: [0, 1, 0],
                      rotate: [0, 180],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 3 + i * 0.8,
                      ease: 'linear',
                    }}
                    className="absolute text-sm"
                    style={{
                      left: `${15 + i * 25}%`,
                      top: '10%',
                    }}
                  >
                    {emoji}
                  </motion.span>
                ))}
              </motion.div>
            )}

            {/* Tom & Jerry Chasing Animation Sub-Orb loop */}
            {character.styleType === 'tomjerry' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 35 }}
                exit={{ opacity: 0 }}
                className="absolute w-40 h-10 flex flex-col items-center justify-center whitespace-nowrap bg-slate-900/90 border border-rose-500/30 py-0.5 px-2 rounded-full shadow-lg"
              >
                {/* Micro animation loop: Cat chasing mouse */}
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <motion.div
                    animate={{ x: [-80, 80] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                    className="absolute text-sm flex items-center space-x-1"
                  >
                    <span>🐱</span>
                    <span className="text-[9px] opacity-75">💨</span>
                    <span>🐭</span>
                    <span className="text-[10px] ml-1">🎂</span>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Mr Bean Teddy bear pop up */}
            {character.styleType === 'bean' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: 1.1, y: 34 }}
                exit={{ opacity: 0 }}
                className="absolute bg-amber-950/90 border border-amber-600/30 text-xs px-2 py-0.5 rounded-full flex items-center space-x-1"
              >
                <span>🧸</span>
                <span className="font-semibold text-yellow-300">Teddy:</span>
                <span>👍</span>
              </motion.div>
            )}

            {/* Batman Bat signal */}
            {character.styleType === 'batman' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                className="absolute -top-14"
              >
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="text-2xl"
                >
                  🦇
                </motion.div>
              </motion.div>
            )}

            {/* Spider-Man Web flare */}
            {character.styleType === 'spiderman' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none"
              >
                {[0, 90, 180, 270].map((deg) => (
                  <motion.div
                    key={deg}
                    animate={{ width: [0, 40], opacity: [0.8, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                    className="absolute bg-sky-400/40 h-[1px] origin-left"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `rotate(${deg}deg)`,
                    }}
                  />
                ))}
              </motion.div>
            )}

            {/* Ben 10 Omnitrix glowing ring */}
            {character.styleType === 'ben' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute -top-12"
              >
                <motion.div
                  animate={{ scale: [0.9, 1.25, 0.9], rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                  className="w-8 h-8 rounded-full border-2 border-dashed border-emerald-500/70 flex items-center justify-center text-[10px]"
                >
                  🟢
                </motion.div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
