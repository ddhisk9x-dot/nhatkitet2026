import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  type: 'dao' | 'mai' | 'lixi' | 'star';
  size: number;
}

const EMOJIS = {
  dao: '🌸',
  mai: '🌼',
  lixi: '🧧',
  star: '✨',
};

const FallingBlossoms: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const items: Particle[] = Array.from({ length: 30 }).map((_, i) => {
      const types: Particle['type'][] = ['dao', 'dao', 'mai', 'mai', 'lixi', 'star'];
      return {
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 6 + Math.random() * 8,
        type: types[Math.floor(Math.random() * types.length)],
        size: 14 + Math.random() * 14,
      };
    });
    setParticles(items);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-[-10%] opacity-50"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animation: `fall ${p.duration}s linear infinite, sway ${3 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {EMOJIS[p.type]}
        </div>
      ))}

      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.5; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes sway {
          0%, 100% { margin-left: 0px; }
          50% { margin-left: 30px; }
        }
      `}</style>
    </div>
  );
};

export default FallingBlossoms;