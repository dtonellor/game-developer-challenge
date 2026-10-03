import { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../core/GameEngine';
import { useGameStore } from '../store/useGameStore';

export const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  const { gameState, isPaused, setPaused } = useGameStore();

  useEffect(() => {
    let isMounted = true;
    
    const initPixi = async () => {
      if (!canvasRef.current) return;
      const engine = new GameEngine();
      engineRef.current = engine;
      await engine.init(canvasRef.current);
      if (isMounted) setEngineReady(true);
    };

    initPixi();

    // Auto-pause on tab blur
    const handleBlur = () => setPaused(true);
    window.addEventListener('blur', handleBlur);

    return () => {
      isMounted = false;
      window.removeEventListener('blur', handleBlur);
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      
      {!engineReady && (
        <div className="absolute inset-0 flex items-center justify-center text-white z-10">
          Loading Engine...
        </div>
      )}
      
      {engineReady && gameState === 'PLAYING' && (
        <>
          <div className="absolute top-0 left-0 w-full p-4 pointer-events-none flex justify-between text-white font-bold text-xl drop-shadow-md z-20">
            <div className="flex gap-4">
              <div>HP: <HUDValue selector={(s) => s.hp} /></div>
              <div>Score: <HUDValue selector={(s) => s.score} /></div>
            </div>
            <div className="flex gap-4 items-center">
              <div>Time: <HUDValue selector={(s) => s.timeLeft} /></div>
              <button 
                className="pointer-events-auto bg-slate-700/80 hover:bg-slate-600 px-4 py-1 rounded text-sm"
                onClick={() => setPaused(!isPaused)}
              >
                {isPaused ? 'RESUME' : 'PAUSE'}
              </button>
            </div>
          </div>

          {isPaused && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
              <div className="text-center text-white">
                <h2 className="text-6xl font-black mb-8 tracking-widest text-blue-400">PAUSED</h2>
                <button 
                  className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-lg text-2xl font-bold"
                  onClick={() => setPaused(false)}
                >
                  RESUME GAME
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Optimization: Component to listen to specific store updates without re-rendering the whole canvas wrapper
const HUDValue = ({ selector }: { selector: (state: any) => number }) => {
  const value = useGameStore(selector);
  return <span>{value}</span>;
};
