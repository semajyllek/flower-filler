import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import { Droplet, OutlineData } from './types';
import { P5Renderer } from './P5Renderer';
import { calculateFillPercentage } from './physics/utils/calculations';

const FLOWER_COUNT = 500;
const WIN_PERCENTAGE = 90;

const FlowerGame: React.FC = () => {
  // Existing refs
  const containerRef = useRef<HTMLDivElement>(null);
  const drops = useRef<Droplet[]>([]);
  const rendererRef = useRef<P5Renderer | null>(null);

  // Existing state
  const [outlineData, setOutlineData] = useState<OutlineData | null>(null);
  const [selectedSpout, setSelectedSpout] = useState(0);
  const [fillPercentage, setFillPercentage] = useState<number>(0);
  const [hasWon, setHasWon] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  // New dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Existing getRandomDropletSize function
  const getRandomDropletSize = () => {
    const rand = Math.random();
    if (rand < 0.1) return Math.random() * 5 + 20;    // Large
    if (rand < 0.3) return Math.random() * 5 + 15;    // Medium
    return Math.random() * 3 + 12;                     // Small
  };

  useEffect(() => {
    if (!containerRef.current || !outlineData) return;

    const sketch = (p: p5) => {
      p.setup = () => {
        p.createCanvas(800, 600);
        rendererRef.current = new P5Renderer(p, outlineData, drops.current, selectedSpout);
        if (originalImageUrl) {
          rendererRef.current.loadImage(originalImageUrl);
        }
      };

      p.draw = () => {
        if (rendererRef.current) {
          rendererRef.current.setWinState(hasWon);
          rendererRef.current.setDarkMode(isDarkMode);  // Pass dark mode state to renderer
          rendererRef.current.render();
          
          if (outlineData && drops.current.length > 0) {
            const percentage = calculateFillPercentage(drops.current, outlineData);
            setFillPercentage(percentage);
            
            if (percentage >= WIN_PERCENTAGE && !hasWon) {
              setHasWon(true);
            }
          }
        }
      };
    };

    const p5instance = new p5(sketch, containerRef.current);
    return () => p5instance.remove();
  }, [outlineData, selectedSpout, hasWon, originalImageUrl, isDarkMode]);  // Added isDarkMode to dependencies

  // Existing functions remain the same
  const createDroplet = (spoutPoint: [number, number]): Droplet => ({
    x: spoutPoint[0],
    y: spoutPoint[1],
    lastX: spoutPoint[0],
    lastY: spoutPoint[1],
    vx: (Math.random() - 0.5) * 2,
    vy: 0,
    color: rendererRef.current!.createRandomColor(),
    size: getRandomDropletSize(),
    isSettled: false,
    settledTime: 0,
    collisionCount: 0
  });

  const dropDroplet = () => {
    if (!outlineData || !rendererRef.current || hasWon) return;
    const spout = outlineData.spoutPoints[selectedSpout];
    const droplet = createDroplet(spout);
    drops.current.push(droplet);
  };

  const switchSpout = () => {
    if (outlineData && !hasWon) {
      setSelectedSpout(prev => (prev + 1) % outlineData.spoutPoints.length);
    }
  };

  const resetGame = () => {
    drops.current = [];
    setFillPercentage(0);
    setHasWon(false);
    
    const randomFlowerNumber = Math.floor(Math.random() * FLOWER_COUNT);
    const paddedNum = String(randomFlowerNumber).padStart(8, '0');
    
    const newOutlineUrl = `https://flower-filler-bucket.s3.us-west-2.amazonaws.com/flower_dataset/processed_outlines/flower_${paddedNum}.json`;
    const newImageUrl = `https://flower-filler-bucket.s3.us-west-2.amazonaws.com/flower_dataset/originals/flower_original_${paddedNum}.png`;
    
    setOriginalImageUrl(newImageUrl);
    
    fetch(newOutlineUrl)
      .then(response => response.text())
      .then(dataStr => {
        const data = JSON.parse(dataStr.trim().replace(/%$/, ''));
        setOutlineData(data);
      })
      .catch(error => {
        console.error('Error fetching new outline data:', error);
      });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      <div className="relative">
        <div ref={containerRef} className="border border-gray-300" />
        
        {hasWon && (
          <div className="absolute inset-0 flex items-start justify-center pt-32 pointer-events-none">
            <span className="text-8xl font-bold transform rotate-[-5deg]" style={{ color: '#42ff33' }}>
              YOU WIN!
            </span>
          </div>
        )}
        
        <div className={`absolute top-4 right-4 font-mono text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <div className={`border-2 ${isDarkMode ? 'border-white' : 'border-black'} p-1`}>
                <div className={`w-48 h-5 border-2 ${isDarkMode ? 'border-white' : 'border-black'}`}>
                  <div 
                    className={`h-full ${isDarkMode ? 'bg-white' : 'bg-black'} transition-all duration-300`}
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between mt-1">
                <span>FILL PCT...</span>
                <span>{fillPercentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={dropDroplet}
          disabled={hasWon}
          className={`px-4 py-2 font-mono border-2 ${isDarkMode ? 'border-white text-white hover:bg-gray-900' : 'border-black text-black hover:bg-gray-100'} 
          ${hasWon ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          DROP DROPLET
        </button>
        <button
          onClick={switchSpout}
          disabled={hasWon}
          className={`px-4 py-2 font-mono border-2 ${isDarkMode ? 'border-white text-white hover:bg-gray-900' : 'border-black text-black hover:bg-gray-100'} 
          ${hasWon ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          SWITCH SPOUT
        </button>
        <button
          onClick={resetGame}
          className={`px-4 py-2 font-mono border-2 ${isDarkMode ? 'border-white text-white hover:bg-gray-900' : 'border-black text-black hover:bg-gray-100'}`}
        >
          RESET
        </button>
        <button
          onClick={toggleDarkMode}
          className={`px-4 py-2 font-mono border-2 ${isDarkMode ? 'bg-black text-white border-white hover:bg-gray-900' : 'bg-black text-white border-black hover:bg-gray-800'}`}
        >
          DARK MODE
        </button>
      </div>
    </div>
  );
};

export default FlowerGame;