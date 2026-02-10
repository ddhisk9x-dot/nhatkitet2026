import React, { useEffect, useState } from 'react';

const FallingBlossoms: React.FC = () => {
  const [blossoms, setBlossoms] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    // Generate static blossom data only once on mount to avoid re-renders
    const items = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 5
    }));
    setBlossoms(items);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {blossoms.map((b) => (
        <div
          key={b.id}
          className="absolute top-[-10%] text-pink-300 opacity-60 text-2xl animate-fall"
          style={{
            left: `${b.left}%`,
            animation: `fall ${b.duration}s linear infinite`,
            animationDelay: `${b.delay}s`,
          }}
        >
          🌸
        </div>
      ))}
      {blossoms.map((b) => (
        <div
          key={`yellow-${b.id}`}
          className="absolute top-[-10%] text-yellow-400 opacity-60 text-xl animate-fall"
          style={{
            left: `${(b.left + 50) % 100}%`,
            animation: `fall ${b.duration + 2}s linear infinite`,
            animationDelay: `${b.delay + 1}s`,
          }}
        >
          🌼
        </div>
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default FallingBlossoms;