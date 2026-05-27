export type CharacterId =
  | 'luffy'
  | 'eragon'
  | 'ben'
  | 'koro'
  | 'ayanokoji'
  | 'spiderman'
  | 'batman'
  | 'robin'
  | 'krishna'
  | 'tomjerry'
  | 'bean';

export interface Character {
  id: CharacterId;
  name: string;
  source: string;
  color: string; // Tailwind color class or name
  glowColor: string; // CSS color string (e.g. rgba, hex)
  avatarEmoji: string;
  avatarImage: string;
  message: string;
  styleType: CharacterId;
  auraCss: string; // Inline style or tailwind aura classes
  constellationPosition: { x: number; y: number }; // Percentage coordinate for final layout (relative to center)
}

export interface SoundConfig {
  frequency: number;
  type: OscillatorType;
  duration: number;
  delay?: number;
}
