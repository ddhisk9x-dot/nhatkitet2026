import React, { useEffect, useState } from 'react';
import { getAllStudents } from '../services/supabaseService';
import { Student, TASKS_LIST } from '../types';
import { Trophy, Medal, X, Clock } from 'lucide-react';

interface LeaderboardProps {
    onClose: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onClose }) => {
    const [topStudents, setTopStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            const { data } = await getAllStudents();
            if (data) {
                const ranked = data.map(s => {
                    let total = 0;
                    TASKS_LIST.forEach(t => total += (s[t.id] as number));
                    return { ...s, totalScore: total };
                })
                    .sort((a, b) => {
                        // 1. Sort by Score (Higher is better)
                        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;

                        // 2. Sort by Time (Earlier is better - if score is equal)
                        const timeA = new Date(a.last_updated || 0).getTime();
                        const timeB = new Date(b.last_updated || 0).getTime();
                        return timeA - timeB;
                    })
                    .slice(0, 5); // Take Top 5

                setTopStudents(ranked);
            }
            setLoading(false);
        };
        fetchLeaderboard();
    }, []);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md relative overflow-hidden shadow-2xl border-4 border-yellow-400">
                <button onClick={onClose} className="absolute top-2 right-2 p-2 bg-gray-100 rounded-full hover:bg-gray-200 z-10"><X size={20} /></button>

                {/* Header */}
                <div className="bg-red-600 p-6 text-center text-white relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <Trophy className="mx-auto w-16 h-16 text-yellow-300 drop-shadow-lg mb-2 animate-bounce" />
                    <h2 className="text-2xl font-bold font-hand uppercase text-yellow-300 tracking-wider">Bảng Phong Thần</h2>
                    <p className="text-xs text-red-100 uppercase font-bold mt-1">Top 5 Chiến Thần 8B03</p>
                </div>

                {/* List */}
                <div className="p-4 space-y-3 bg-tetCream min-h-[300px]">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500 italic">Đang triệu hồi các vị thần...</div>
                    ) : (
                        topStudents.map((s, index) => {
                            let rankIcon;
                            let rankColor = "bg-white border-gray-200";
                            let textColor = "text-gray-700";

                            if (index === 0) {
                                rankIcon = <Medal size={24} className="text-yellow-500" />;
                                rankColor = "bg-yellow-50 border-yellow-400 ring-2 ring-yellow-200";
                                textColor = "text-yellow-800";
                            } else if (index === 1) {
                                rankIcon = <Medal size={24} className="text-gray-400" />;
                                rankColor = "bg-gray-50 border-gray-300";
                                textColor = "text-gray-700";
                            } else if (index === 2) {
                                rankIcon = <Medal size={24} className="text-orange-400" />;
                                rankColor = "bg-orange-50 border-orange-300";
                                textColor = "text-orange-800";
                            } else {
                                rankIcon = <span className="text-lg font-bold text-gray-400 w-6 text-center">#{index + 1}</span>;
                            }

                            return (
                                <div key={s.student_code} className={`flex items-center gap-4 p-3 rounded-xl border-2 shadow-sm transform transition hover:scale-105 ${rankColor}`}>
                                    <div className="flex-shrink-0 w-8 flex justify-center">{rankIcon}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-bold truncate ${textColor}`}>{s.full_name}</div>
                                        {index === 0 && <div className="text-[10px] text-yellow-600 font-bold uppercase tracking-wide">👑 Quán Quân</div>}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-red-600">{s.totalScore}</div>
                                        <div className="text-[10px] text-gray-400 font-medium lowercase">sao</div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
