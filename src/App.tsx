import { useGameStore } from './store/useGameStore';
import { GameCanvas } from './components/GameCanvas';
import { GameOverScreen } from './components/GameOverScreen';
import { RankingScreen } from './components/RankingScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { OptionsScreen } from './components/OptionsScreen';

function App() {
  const { gameState, setGameState, resetGame } = useGameStore();

  return (
    <div className="w-full h-full bg-slate-900 text-white font-sans flex items-center justify-center">
      {gameState === 'MENU' && (
        <div className="text-center p-8 bg-slate-800 rounded-xl shadow-2xl">
          <h1 className="text-5xl font-black mb-8 text-blue-400">Pirate Battle</h1>
          <button 
            onClick={() => { resetGame(); setGameState('PLAYING'); }}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-lg text-2xl font-bold transition-colors"
          >
            PLAY
          </button>
          
          <div className="mt-8 flex gap-4">
            <button onClick={() => setGameState('OPTIONS')} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded">Options</button>
            <button onClick={() => setGameState('RANKING')} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded">Ranking</button>
            <button onClick={() => setGameState('HISTORY')} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded">History</button>
          </div>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <GameCanvas />
      )}

      {gameState === 'GAMEOVER' && (
        <GameOverScreen />
      )}

      {gameState === 'RANKING' && <RankingScreen />}
      
      {gameState === 'HISTORY' && <HistoryScreen />}

      {gameState === 'OPTIONS' && <OptionsScreen />}
    </div>
  );
}

export default App;
