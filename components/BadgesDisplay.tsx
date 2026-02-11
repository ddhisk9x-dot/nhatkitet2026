import React from 'react';

export interface Badge {
    id: string;
    title: string;
    icon: string;
    description: string;
    check: (stats: { percent: number; confirmed: boolean; totalScore: number; tasks: Record<string, number>; completedBefore: Date | null }) => boolean;
}

export const BADGES: Badge[] = [
    {
        id: 'seed',
        title: 'Hạt Giống Mùa Xuân',
        icon: '🌱',
        description: 'Hoàn thành ít nhất 1 nhiệm vụ',
        check: ({ totalScore }) => totalScore > 0,
    },
    {
        id: 'sprout',
        title: 'Chồi Non Tích Cực',
        icon: '🌿',
        description: 'Đạt 40% sao',
        check: ({ percent }) => percent >= 40,
    },
    {
        id: 'blossom',
        title: 'Hoa Đào Rực Rỡ',
        icon: '🌸',
        description: 'Đạt 70% sao',
        check: ({ percent }) => percent >= 70,
    },
    {
        id: 'ambassador',
        title: 'Đại Sứ Mùa Xuân',
        icon: '🏆',
        description: 'Đạt 90% sao',
        check: ({ percent }) => percent >= 90,
    },
    {
        id: 'champion',
        title: 'Trạng Nguyên Tết',
        icon: '👑',
        description: '100% sao + PH xác nhận',
        check: ({ percent, confirmed }) => percent >= 100 && confirmed,
    },
    {
        id: 'filial',
        title: 'Hiếu Thảo',
        icon: '❤️',
        description: '5 sao "Kết Nối Thế Hệ"',
        check: ({ tasks }) => (tasks['task_4'] || 0) >= 5,
    },
    {
        id: 'scholar',
        title: 'Khai Bút Thành Tài',
        icon: '✍️',
        description: '5 sao "Khai Bút Đầu Xuân"',
        check: ({ tasks }) => (tasks['task_9'] || 0) >= 5,
    },
];

interface BadgesDisplayProps {
    percent: number;
    confirmed: boolean;
    totalScore: number;
    tasks: Record<string, number>;
}

const BadgesDisplay: React.FC<BadgesDisplayProps> = ({ percent, confirmed, totalScore, tasks }) => {
    const earnedBadges = BADGES.filter(b => b.check({ percent, confirmed, totalScore, tasks, completedBefore: null }));
    const lockedBadges = BADGES.filter(b => !b.check({ percent, confirmed, totalScore, tasks, completedBefore: null }));

    if (earnedBadges.length === 0 && lockedBadges.length > 0) {
        return (
            <div className="text-center py-3 text-gray-400 text-sm italic">
                Chưa có huy hiệu nào. Hãy hoàn thành nhiệm vụ để nhận! 🌟
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {/* Earned */}
            <div className="flex flex-wrap gap-2 justify-center">
                {earnedBadges.map(b => (
                    <div key={b.id} className="flex flex-col items-center p-2 bg-yellow-50 rounded-xl border border-yellow-200 shadow-sm w-20 text-center animate-fade-in">
                        <span className="text-2xl mb-1">{b.icon}</span>
                        <span className="text-[9px] font-bold text-yellow-800 leading-tight">{b.title}</span>
                    </div>
                ))}
            </div>
            {/* Locked */}
            {lockedBadges.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center opacity-40">
                    {lockedBadges.map(b => (
                        <div key={b.id} className="flex flex-col items-center p-2 bg-gray-100 rounded-xl border border-gray-200 w-20 text-center">
                            <span className="text-2xl mb-1 grayscale">{b.icon}</span>
                            <span className="text-[9px] font-bold text-gray-500 leading-tight">{b.title}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BadgesDisplay;
