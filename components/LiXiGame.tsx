import React, { useState } from 'react';
import confetti from 'canvas-confetti';

const LIXI_MESSAGES = [
    { text: '🎉 Chúc năm mới vạn sự như ý!', color: 'text-red-600' },
    { text: '💰 May mắn cả năm!', color: 'text-yellow-600' },
    { text: '📚 Học giỏi, thi đậu!', color: 'text-blue-600' },
    { text: '🌟 Em là ngôi sao sáng nhất!', color: 'text-purple-600' },
    { text: '🧧 An khang thịnh vượng!', color: 'text-red-700' },
    { text: '🌸 Xuân mới rạng ngời!', color: 'text-pink-600' },
    { text: '🎊 Tài lộc đầy nhà!', color: 'text-orange-600' },
    { text: '💪 Năm mới mạnh khỏe!', color: 'text-green-600' },
    { text: '🏆 Thành công vang dội!', color: 'text-amber-600' },
    { text: '❤️ Gia đình hạnh phúc!', color: 'text-rose-600' },
];

interface LiXiGameProps {
    studentName: string;
    onClose: () => void;
}

const LiXiGame: React.FC<LiXiGameProps> = ({ studentName, onClose }) => {
    const [opened, setOpened] = useState(false);
    const [message, setMessage] = useState(LIXI_MESSAGES[0]);
    const [shaking, setShaking] = useState(false);

    const openEnvelope = () => {
        setShaking(true);
        setTimeout(() => {
            setShaking(false);
            const randomMsg = LIXI_MESSAGES[Math.floor(Math.random() * LIXI_MESSAGES.length)];
            setMessage(randomMsg);
            setOpened(true);

            // Confetti burst
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#D90429', '#FFD60A', '#FB8500'] });
        }, 800);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl">✕</button>

                <h2 className="text-2xl font-hand font-bold text-red-600 mb-2">🧧 Lì Xì May Mắn</h2>
                <p className="text-sm text-gray-500 mb-4">Dành cho: <b>{studentName}</b></p>

                {!opened ? (
                    <div className="space-y-4">
                        <div
                            className={`text-8xl cursor-pointer select-none transition-transform hover:scale-110 ${shaking ? 'animate-shake' : ''}`}
                            onClick={openEnvelope}
                        >
                            🧧
                        </div>
                        <p className="text-sm text-gray-600 font-bold">Chạm vào phong bao để mở!</p>
                    </div>
                ) : (
                    <div className="space-y-4 animate-fade-in">
                        <div className="text-6xl">🎆</div>
                        <div className={`text-xl font-bold ${message.color} p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200`}>
                            {message.text}
                        </div>
                        <p className="text-xs text-gray-400">Lời chúc từ Nhật Ký Tết 2026 💛</p>
                        <button
                            onClick={onClose}
                            className="bg-red-600 text-white px-6 py-2 rounded-full font-bold hover:bg-red-700 transition"
                        >
                            Đóng
                        </button>
                    </div>
                )}

                <style>{`
          @keyframes shake {
            0%, 100% { transform: rotate(0deg); }
            20% { transform: rotate(-15deg); }
            40% { transform: rotate(15deg); }
            60% { transform: rotate(-10deg); }
            80% { transform: rotate(10deg); }
          }
          .animate-shake { animation: shake 0.6s ease-in-out; }
          .animate-fade-in { animation: fadeIn 0.5s ease-out; }
          @keyframes fadeIn { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
        `}</style>
            </div>
        </div>
    );
};

export default LiXiGame;
