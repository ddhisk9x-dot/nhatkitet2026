import React, { useState, useEffect } from 'react';

// Tết Nguyên Đán 2026 - Bính Ngọ: 17/02/2026 (Mùng 1)
const TET_DATE = new Date('2026-02-17T00:00:00+07:00');
const TET_END = new Date('2026-02-22T23:59:59+07:00'); // Mùng 6 (hết Tết)

const TetCountdown: React.FC = () => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const diff = TET_DATE.getTime() - now.getTime();
    const isTet = diff <= 0 && now.getTime() <= TET_END.getTime();
    const isPastTet = now.getTime() > TET_END.getTime();

    // Tính mùng mấy
    const getTetDay = () => {
        const daysSinceTet = Math.floor((now.getTime() - TET_DATE.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceTet === 0) return 'Mùng 1 Tết';
        if (daysSinceTet === 1) return 'Mùng 2 Tết';
        if (daysSinceTet === 2) return 'Mùng 3 Tết';
        if (daysSinceTet === 3) return 'Mùng 4 Tết';
        if (daysSinceTet === 4) return 'Mùng 5 Tết';
        return `Ngày ${daysSinceTet + 1} Tết`;
    };

    if (isPastTet) {
        return (
            <div className="text-center py-1 text-[11px] font-bold text-yellow-300 bg-red-800/30 rounded-lg flex items-center justify-center gap-1">
                🎒 Đã hết Tết — Sẵn sàng trở lại trường!
            </div>
        );
    }

    if (isTet) {
        return (
            <div className="text-center py-2 font-bold text-yellow-300 bg-red-800/30 rounded-lg flex items-center justify-center gap-2 animate-pulse">
                <span className="text-xl">🧧</span>
                <span className="text-sm">{getTetDay()} — Năm Bính Ngọ 2026</span>
                <span className="text-xl">🧧</span>
            </div>
        );
    }

    // Đếm ngược
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return (
        <div className="text-center py-2 bg-red-800/30 rounded-lg">
            <div className="text-[10px] uppercase font-bold text-red-200 tracking-wider mb-1">🎆 Đếm Ngược Giao Thừa</div>
            <div className="flex items-center justify-center gap-2">
                {[
                    { val: days, label: 'ngày' },
                    { val: hours, label: 'giờ' },
                    { val: minutes, label: 'phút' },
                    { val: seconds, label: 'giây' },
                ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <div className="bg-red-900/60 text-yellow-300 font-bold text-lg w-10 h-10 rounded-lg flex items-center justify-center shadow-inner border border-red-700/50">
                            {String(item.val).padStart(2, '0')}
                        </div>
                        <span className="text-[8px] text-red-200 mt-0.5">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TetCountdown;
