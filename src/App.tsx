import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Terminal, Cpu, AlertTriangle, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Constants ---
const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 70;

const TRACKS = [
  {
    id: 1,
    title: "ERR_0x1A_PULSE",
    artist: "SYS.ADMIN",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    color: "cyan"
  },
  {
    id: 2,
    title: "MEM_LEAK_DRIFT",
    artist: "UNKNOWN_PROCESS",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    color: "magenta"
  },
  {
    id: 3,
    title: "SECTOR_CORRUPTED",
    artist: "NULL_PTR",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    color: "cyan"
  }
];

export default function App() {
  // --- Music State ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = TRACKS[currentTrackIndex];

  // --- Game State ---
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // --- Music Logic ---
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  
  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  // --- Game Logic ---
  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      const onSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!onSnake) break;
    }
    setFood(newFood);
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setIsGameOver(false);
    setScore(0);
    setGameStarted(true);
    generateFood();
  };

  const moveSnake = useCallback(() => {
    if (isGameOver || !gameStarted) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE
      };

      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        setGameStarted(false);
        if (score > highScore) setHighScore(score);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        generateFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, isGameOver, gameStarted, score, highScore, generateFood]);

  useEffect(() => {
    const interval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(interval);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative font-vt text-white selection:bg-neon-magenta selection:text-black">
      {/* Overlays */}
      <div className="absolute inset-0 scanlines z-50"></div>
      <div className="absolute inset-0 noise z-40"></div>
      
      <div className="screen-tear w-full max-w-7xl relative z-10 flex flex-col items-center">
        
        {/* Header */}
        <div className="mb-6 text-center w-full border-b-4 border-neon-cyan pb-4 relative">
          <div className="absolute top-0 left-0 w-full h-full bg-neon-cyan/10 glitch-box z-[-1]"></div>
          <h1 className="text-6xl md:text-8xl font-black tracking-widest mb-2 flex justify-center gap-6">
            <span className="glitch text-neon-cyan" data-text="SYS">SYS</span>
            <span className="glitch text-neon-magenta" data-text="CORE">CORE</span>
          </h1>
          <p className="text-neon-cyan text-xl tracking-[0.5em] animate-pulse">
            [ OVERRIDE_PROTOCOL_ACTIVE ]
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-stretch w-full">
          
          {/* Left Panel: Stats & Info */}
          <div className="flex-1 flex flex-col gap-6 w-full lg:w-auto">
            <div className="bg-black border-2 border-neon-cyan p-6 relative group">
              <div className="absolute -inset-1 bg-neon-cyan opacity-20 group-hover:opacity-40 transition-opacity blur"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4 border-b-2 border-neon-cyan pb-2">
                  <Cpu className="text-neon-cyan" size={28} />
                  <h2 className="text-3xl text-neon-cyan tracking-widest">MEMORY_BANK</h2>
                </div>
                <div className="space-y-4 text-2xl">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">PEAK_ALLOCATION</span>
                    <span className="text-neon-cyan glitch" data-text={`0x${highScore.toString(16).toUpperCase().padStart(4, '0')}`}>0x{highScore.toString(16).toUpperCase().padStart(4, '0')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">CURRENT_STACK</span>
                    <span className="text-neon-magenta glitch" data-text={`0x${score.toString(16).toUpperCase().padStart(4, '0')}`}>0x{score.toString(16).toUpperCase().padStart(4, '0')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black border-2 border-neon-magenta p-6 relative group flex-1">
              <div className="absolute -inset-1 bg-neon-magenta opacity-20 group-hover:opacity-40 transition-opacity blur"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4 border-b-2 border-neon-magenta pb-2">
                  <Radio className="text-neon-magenta animate-pulse" size={28} />
                  <h2 className="text-3xl text-neon-magenta tracking-widest">AUDIO_STREAM</h2>
                </div>
                <div className="space-y-4">
                  <p className="text-3xl text-white truncate glitch" data-text={currentTrack.title}>{currentTrack.title}</p>
                  <p className="text-neon-magenta text-xl tracking-widest">[{currentTrack.artist}]</p>
                  <div className="pt-4 flex items-center justify-between border-t-2 border-neon-magenta/50 mt-4">
                    <button onClick={handlePrev} className="p-2 text-neon-cyan hover:bg-neon-cyan hover:text-black transition-colors border-2 border-transparent hover:border-neon-cyan">
                      <SkipBack size={32} />
                    </button>
                    <button 
                      onClick={handlePlayPause}
                      className="p-4 bg-neon-magenta text-black hover:bg-white hover:text-neon-magenta transition-colors border-2 border-neon-magenta"
                    >
                      {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                    </button>
                    <button onClick={handleNext} className="p-2 text-neon-cyan hover:bg-neon-cyan hover:text-black transition-colors border-2 border-transparent hover:border-neon-cyan">
                      <SkipForward size={32} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Snake Game */}
          <div className="relative p-2 border-4 border-neon-cyan bg-black shadow-[0_0_30px_rgba(0,255,255,0.3)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-neon-cyan/50 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-neon-cyan/50 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-1 h-full bg-neon-cyan/50 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-1 h-full bg-neon-cyan/50 animate-pulse"></div>
            
            <div className="relative bg-black overflow-hidden">
              <div 
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                  width: 'min(80vw, 500px)',
                  height: 'min(80vw, 500px)',
                  backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
                  backgroundSize: `${100/GRID_SIZE}% ${100/GRID_SIZE}%`
                }}
              >
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                  const x = i % GRID_SIZE;
                  const y = Math.floor(i / GRID_SIZE);
                  const snakeIndex = snake.findIndex(s => s.x === x && s.y === y);
                  const isSnake = snakeIndex !== -1;
                  const isHead = snakeIndex === 0;
                  const isFood = food.x === x && food.y === y;

                  return (
                    <div key={i} className="flex items-center justify-center relative">
                      {isSnake && (
                        <div 
                          className={`absolute inset-0 ${isHead ? 'bg-white border-2 border-neon-cyan z-10' : 'bg-neon-cyan'}`}
                          style={{
                            opacity: isHead ? 1 : Math.max(0.2, 1 - (snakeIndex / snake.length)),
                            boxShadow: isHead ? '0 0 10px #00ffff' : 'none'
                          }}
                        />
                      )}
                      {isFood && (
                        <div className="absolute inset-1 bg-neon-magenta animate-pulse shadow-[0_0_15px_#ff00ff]" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Game Over Overlay */}
              <AnimatePresence>
                {(!gameStarted || isGameOver) && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20 border-4 border-neon-magenta"
                  >
                    {isGameOver && (
                      <div className="flex items-center gap-4 mb-6 text-neon-magenta">
                        <AlertTriangle size={48} className="animate-pulse" />
                        <h2 className="text-6xl font-black tracking-widest glitch" data-text="FATAL_ERR">
                          FATAL_ERR
                        </h2>
                        <AlertTriangle size={48} className="animate-pulse" />
                      </div>
                    )}
                    <button 
                      onClick={resetGame}
                      className="bg-transparent border-4 border-neon-cyan text-neon-cyan px-8 py-4 text-3xl font-bold hover:bg-neon-cyan hover:text-black transition-all uppercase tracking-widest glitch-box"
                    >
                      {isGameOver ? 'REBOOT_SYS' : 'EXECUTE_RUN'}
                    </button>
                    <p className="mt-8 text-neon-magenta text-xl animate-pulse">AWAITING_INPUT [ARROWS]</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Panel: Playlist */}
          <div className="flex-1 w-full lg:w-auto">
            <div className="bg-black border-2 border-neon-cyan p-6 relative h-full">
              <div className="flex items-center gap-3 mb-6 border-b-2 border-neon-cyan pb-2">
                <Terminal className="text-neon-cyan" size={28} />
                <h2 className="text-3xl text-neon-cyan tracking-widest">FREQ_INDEX</h2>
              </div>
              <div className="space-y-4">
                {TRACKS.map((track, idx) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      setCurrentTrackIndex(idx);
                      setIsPlaying(true);
                    }}
                    className={`w-full flex items-center gap-4 p-4 border-2 transition-all ${
                      currentTrackIndex === idx 
                        ? 'border-neon-magenta bg-neon-magenta/10' 
                        : 'border-white/20 hover:border-neon-cyan hover:bg-neon-cyan/10'
                    }`}
                  >
                    <div className={`text-2xl ${currentTrackIndex === idx ? 'text-neon-magenta' : 'text-gray-500'}`}>
                      {currentTrackIndex === idx && isPlaying ? '>_' : '[]'}
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className={`text-2xl truncate tracking-wider ${currentTrackIndex === idx ? 'text-white' : 'text-gray-400'}`}>
                        {track.title}
                      </p>
                      <p className={`text-lg ${currentTrackIndex === idx ? 'text-neon-magenta' : 'text-gray-600'}`}>
                        {track.artist}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Audio Element */}
        <audio 
          ref={audioRef}
          src={currentTrack.url}
          onEnded={handleNext}
        />
      </div>
    </div>
  );
}
