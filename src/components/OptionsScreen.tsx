import { useGameStore } from '../store/useGameStore';
import { saveOptions } from '../utils/options';
import { useState } from 'react';

export const OptionsScreen = () => {
  const { setGameState, sessionTime, enemySpawnTime, setSessionTime, setEnemySpawnTime } = useGameStore();
  
  const [sessionInput, setSessionInput] = useState(sessionTime);
  const [spawnInput, setSpawnInput] = useState(enemySpawnTime);

  const handleSave = () => {
    const finalSession = Math.max(60, Math.min(180, sessionInput));
    const finalSpawn = Math.max(500, Math.min(5000, spawnInput));
    
    setSessionTime(finalSession);
    setEnemySpawnTime(finalSpawn);
    saveOptions({ sessionTime: finalSession, enemySpawnTime: finalSpawn });
    setGameState('MENU');
  };

  return (
    <div className="flex flex-col w-full max-w-md bg-slate-800 p-8 rounded-xl shadow-2xl z-50">
      <h1 className="text-4xl font-black mb-6 text-blue-400 text-center">Options</h1>
      
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-300 font-bold">
            Game session time (seconds)
          </label>
          <input 
            type="number" 
            min={60} 
            max={180}
            value={sessionInput} 
            onChange={(e) => setSessionInput(Number(e.target.value))}
            className="p-3 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
          />
          <span className="text-xs text-slate-500">Between 60 and 180 seconds</span>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-300 font-bold">
            Enemy spawn time (milliseconds)
          </label>
          <input 
            type="number" 
            min={500} 
            max={5000}
            step={100}
            value={spawnInput} 
            onChange={(e) => setSpawnInput(Number(e.target.value))}
            className="p-3 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
          />
          <span className="text-xs text-slate-500">Lower = harder. Valid range: 500ms to 5000ms</span>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={handleSave}
          className="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-colors"
        >
          Save
        </button>
        <button 
          onClick={() => setGameState('MENU')}
          className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
