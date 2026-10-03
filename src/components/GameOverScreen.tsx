import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveMatchHistory } from '../api/history';
import { useGameStore } from '../store/useGameStore';

export const GameOverScreen = () => {
  const { setGameState, resetGame, score, sessionTime, timeLeft, endReason } = useGameStore();
  const queryClient = useQueryClient();
  const [playerName, setPlayerName] = useState('Player 1');
  const [statusMsg, setStatusMsg] = useState('');

  const duration = sessionTime - timeLeft;

  const mutation = useMutation({
    mutationFn: saveMatchHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
      setStatusMsg('Score saved successfully!');
    },
    onError: () => {
      setStatusMsg('Failed to save score. Try again.');
    }
  });

  // Optional: Auto-save on mount, or wait for user to input name
  const handleSave = () => {
    mutation.mutate({
      playerName,
      score,
      duration,
      reason: endReason || 'DEATH',
      config: { sessionTime }
    });
  };

  return (
    <div className="text-center p-8 bg-slate-800 rounded-xl shadow-2xl z-50 flex flex-col gap-4 min-w-[300px]">
      <h1 className="text-5xl font-black mb-2 text-red-500">Game Over</h1>
      <p className="text-xl text-slate-300">Reason: {endReason === 'TIME' ? 'Time out!' : 'Destroyed!'}</p>
      
      <div className="bg-slate-900 p-4 rounded-lg my-4 border border-slate-700">
        <p className="text-3xl font-bold mb-2">Score: {score}</p>
        <p className="text-lg text-slate-400">Time played: {duration}s</p>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <label className="text-sm text-slate-400 text-left">Player Name</label>
        <input 
          type="text" 
          value={playerName} 
          onChange={(e) => setPlayerName(e.target.value)}
          className="p-3 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
        />
        <button 
          onClick={handleSave}
          disabled={mutation.isPending || mutation.isSuccess}
          className="mt-2 py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 rounded-lg font-bold transition-colors"
        >
          {mutation.isPending ? 'Saving...' : mutation.isSuccess ? 'Saved!' : 'Save Result'}
        </button>
        {statusMsg && <p className="text-sm text-blue-300 mt-1">{statusMsg}</p>}
      </div>

      <div className="flex gap-4">
        <button 
          onClick={() => { resetGame(); setGameState('PLAYING'); }}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors"
        >
          Play Again
        </button>
        <button 
          onClick={() => { setGameState('MENU'); }}
          className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition-colors"
        >
          Main Menu
        </button>
      </div>
    </div>
  );
};
