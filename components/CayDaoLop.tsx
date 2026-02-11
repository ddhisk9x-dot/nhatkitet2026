import React, { useEffect, useState } from 'react';
import { getAllStudents } from '../services/supabaseService';
import { Student, TASKS_LIST } from '../types';

interface CayDaoLopProps {
    darkMode?: boolean;
}

const CayDaoLop: React.FC<CayDaoLopProps> = ({ darkMode }) => {
    const [totalFlowers, setTotalFlowers] = useState(0);
    const [maxFlowers, setMaxFlowers] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            const { data } = await getAllStudents();
            if (data) {
                // Chỉ đếm học sinh thật (bỏ tài khoản test, GVCN)
                const realStudents = data.filter(s =>
                    s.class_name && s.class_name !== 'GVCN' && !s.class_name.includes('TEST')
                );
                let total = 0;
                realStudents.forEach(s => {
                    TASKS_LIST.forEach(t => {
                        if ((s[t.id] as number) > 0) total++;
                    });
                });
                setTotalFlowers(total);
                setMaxFlowers(realStudents.length * TASKS_LIST.length);
            }
            setLoading(false);
        };
        fetch();
    }, []);

    const percent = maxFlowers > 0 ? (totalFlowers / maxFlowers) * 100 : 0;

    // Generate flower positions on the tree
    const flowerCount = Math.min(Math.floor(totalFlowers / 2), 50);
    const flowers = Array.from({ length: flowerCount }).map((_, i) => ({
        id: i,
        x: 25 + Math.sin(i * 2.39) * (20 + (i % 3) * 8), // Semi-random spiral pattern
        y: 10 + (i / flowerCount) * 55,
        size: 10 + Math.random() * 8, // Smaller flowers for Peach Blossom?
        delay: i * 0.05,
        type: i % 3 === 0 ? '🌸' : (i % 3 === 1 ? '🌺' : '💮') // Varied pink flowers
    }));

    return (
        <div className={`rounded-xl shadow-lg border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-pink-100'}`}>
            <div className="bg-gradient-to-r from-pink-50 to-red-50 p-3 border-b border-pink-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🌳</span>
                    <span className="font-bold text-pink-800">Cây Đào Lớp 8B03</span>
                </div>
                <span className="text-xs text-pink-600 font-bold">{Math.round(percent)}% nở hoa</span>
            </div>

            <div className="relative w-full h-64 bg-gradient-to-b from-blue-100 to-green-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">Đang trồng cây đào...</div>
                ) : (
                    <>
                        {/* Ground */}
                        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-green-800 to-green-600 rounded-t-[50%]"></div>

                        {/* Tree trunk - Darker brown for Peach tree */}
                        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                            {/* Main trunk */}
                            <path d="M50 95 Q48 70 45 55 Q42 40 50 20" stroke="#5D4037" strokeWidth="4" fill="none" strokeLinecap="round" />
                            {/* Branches */}
                            <path d="M47 50 Q35 45 25 40" stroke="#5D4037" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            <path d="M48 40 Q60 35 70 30" stroke="#5D4037" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            <path d="M46 60 Q30 58 20 52" stroke="#5D4037" strokeWidth="2" fill="none" strokeLinecap="round" />
                            <path d="M49 30 Q40 22 30 18" stroke="#5D4037" strokeWidth="2" fill="none" strokeLinecap="round" />
                            <path d="M50 25 Q60 18 72 15" stroke="#5D4037" strokeWidth="2" fill="none" strokeLinecap="round" />
                            <path d="M48 45 Q55 42 65 45" stroke="#5D4037" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        </svg>

                        {/* Flowers */}
                        {flowers.map(f => (
                            <div
                                key={f.id}
                                className="absolute transition-all duration-500 select-none cursor-default hover:scale-125"
                                style={{
                                    left: `${f.x}%`,
                                    top: `${f.y}%`,
                                    fontSize: `${f.size}px`,
                                    filter: 'drop-shadow(0 0 2px rgba(255,192,203,0.5))',
                                    animation: `bloom 0.5s ease-out ${f.delay}s both`,
                                }}
                            >
                                {f.type}
                            </div>
                        ))}

                        {/* No flowers message */}
                        {flowerCount === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-sm text-pink-600 bg-white/80 px-4 py-2 rounded-full font-bold shadow-sm">Cây đang chờ tin vui từ các bạn! 🌸</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Stats */}
            <div className="p-3 flex items-center justify-between text-xs">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                    🌸 {totalFlowers} bông hoa / {maxFlowers} tối đa
                </span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-pink-400 h-2 rounded-full transition-all" style={{ width: `${percent}%` }}></div>
                </div>
            </div>

            <style>{`
        @keyframes bloom {
          0% { transform: scale(0) rotate(-90deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
        </div>
    );
};

export default CayDaoLop;
