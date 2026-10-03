import { useQuery } from '@tanstack/react-query';
import { useGameStore } from '../store/useGameStore';
import { api } from '../api/history';

export const RankingScreen = () => {
  const { setGameState } = useGameStore();
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['ranking'],
    queryFn: async () => {
      const res = await api.get('/api/ranking');
      return res.data;
    }
  });

  return (
    <div className="flex flex-col w-full max-w-2xl bg-slate-800 p-8 rounded-xl shadow-2xl z-50 max-h-[80vh]">
      <h1 className="text-4xl font-black mb-6 text-blue-400 text-center">Top Players</h1>
      
      <div className="flex-1 overflow-y-auto pr-2 mb-6 space-y-2">
        {isLoading && <p className="text-center text-slate-400">Loading ranking...</p>}
        {isError && <p className="text-center text-red-400">Error loading ranking.</p>}
        
        {data?.data.length === 0 && (
          <p className="text-center text-slate-400">No records found. Be the first to play!</p>
        )}

        {data?.data.map((record: any, index: number) => (
          <div key={record.id} className="flex justify-between items-center bg-slate-700 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="text-xl font-black text-slate-400 w-8">#{index + 1}</span>
              <span className="text-lg font-bold text-white">{record.playerName}</span>
            </div>
            <div className="flex gap-6 text-slate-300">
              <span>{record.score} pts</span>
              <span>{record.duration}s</span>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => setGameState('MENU')}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-xl font-bold transition-colors"
      >
        Back to Menu
      </button>
    </div>
  );
};
