import { create } from 'zustand';
import { loadOptions } from '../utils/options';

const saved = loadOptions();

export type GameState = 'MENU' | 'PLAYING' | 'GAMEOVER' | 'RANKING' | 'HISTORY' | 'OPTIONS';

interface GameStore {
  gameState: GameState;
  isPaused: boolean;
  hp: number;
  score: number;
  timeLeft: number;
  sessionTime: number; // in seconds
  enemySpawnTime: number; // in milliseconds
  endReason: 'TIME' | 'DEATH' | null;
  setGameState: (state: GameState, reason?: 'TIME' | 'DEATH') => void;
  setPaused: (paused: boolean) => void;
  setHp: (hp: number) => void;
  setScore: (score: number) => void;
  setTimeLeft: (time: number) => void;
  setSessionTime: (time: number) => void;
  setEnemySpawnTime: (time: number) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: 'MENU',
  isPaused: false,
  hp: 100,
  score: 0,
  timeLeft: saved?.sessionTime ?? 60,
  sessionTime: saved?.sessionTime ?? 60,
  enemySpawnTime: saved?.enemySpawnTime ?? 2000,
  endReason: null,
  setGameState: (state, reason) => set({ gameState: state, endReason: reason || null, isPaused: false }),
  setPaused: (paused) => set({ isPaused: paused }),
  setHp: (hp) => set({ hp }),
  setScore: (score) => set({ score }),
  setTimeLeft: (time) => set({ timeLeft: time }),
  setSessionTime: (time) => set({ sessionTime: time }),
  setEnemySpawnTime: (time) => set({ enemySpawnTime: time }),
  resetGame: () => set((state) => ({ hp: 100, score: 0, timeLeft: state.sessionTime, endReason: null })),
}));
