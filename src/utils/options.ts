// Persist options to localStorage and read them back on startup
const OPTIONS_KEY = 'pirate-battle-options';

export interface GameOptions {
  sessionTime: number;
  enemySpawnTime: number;
}

export const loadOptions = (): GameOptions | null => {
  try {
    const raw = localStorage.getItem(OPTIONS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveOptions = (opts: GameOptions) => {
  localStorage.setItem(OPTIONS_KEY, JSON.stringify(opts));
};
