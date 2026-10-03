import { useQuery } from '@tanstack/react-query';
import { useGameStore } from '../store/useGameStore';
import { api } from '../api/history';

export const HistoryScreen = () => {
  const { setGameState } = useGameStore();
  
  // Hardcoded to "Player 1" for MVP. In a real app we'd grab this from auth/store.
  const playerName = 'Player 1';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['history', playerName],
    queryFn: async () => {
      const res = await api.get(`/api/history?playerName=${playerName}`);
      return res.data;
    }
  });

  return (
    <div className="flex flex-col w-full max-w-2xl bg-slate-800 p-8 rounded-xl shadow-2xl z-50 max-h-[80vh]">
      <h1 className="text-4xl font-black mb-6 text-blue-400 text-center">Match History</h1>
      
      <div className="flex-1 overflow-y-auto pr-2 mb-6 space-y-2">
        {isLoading && <p className="text-center text-slate-400">Loading history...</p>}
        {isError && <p className="text-center text-red-400">Error loading history.</p>}
        
        {data?.data.length === 0 && (
          <p className="text-center text-slate-400">No matches played yet.</p>
        )}

        {data?.data.map((record: any) => (
          <div key={record.id} className="flex flex-col bg-slate-700 p-4 rounded-lg text-sm">
            <div className="flex justify-between items-center mb-2 border-b border-slate-600 pb-2">
              <span className="font-bold text-white">{new Date(record.date).toLocaleString()}</span>
              <span className={`font-bold ${record.reason === 'DEATH' ? 'text-red-400' : 'text-blue-400'}`}>
                {record.reason === 'DEATH' ? 'Destroyed' : 'Time Out'}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Score: {record.score} pts</span>
              <span>Time: {record.duration}s</span>
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
