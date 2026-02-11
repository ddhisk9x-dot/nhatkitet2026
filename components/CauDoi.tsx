import React from 'react';

/**
 * Câu Đối Tết — Trang trí 2 bên màn hình đăng nhập
 * Hiển thị câu đối đỏ viền vàng theo phong cách truyền thống
 */
const CauDoi: React.FC = () => {
    return (
        <>
            {/* Câu đối bên trái */}
            <div className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-0">
                <div className="bg-red-700 border-2 border-yellow-400 rounded-lg px-2 py-6 shadow-lg writing-vertical">
                    <p className="text-yellow-300 font-hand text-lg tracking-[0.3em]" style={{ writingMode: 'vertical-rl' }}>
                        An khang thịnh vượng
                    </p>
                </div>
            </div>

            {/* Câu đối bên phải */}
            <div className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-0">
                <div className="bg-red-700 border-2 border-yellow-400 rounded-lg px-2 py-6 shadow-lg">
                    <p className="text-yellow-300 font-hand text-lg tracking-[0.3em]" style={{ writingMode: 'vertical-rl' }}>
                        Vạn sự như ý
                    </p>
                </div>
            </div>

            {/* Đèn lồng treo ở 2 góc trên (visible on mobile too) */}
            <div className="absolute top-4 left-4 z-0 text-4xl animate-lantern-swing">🏮</div>
            <div className="absolute top-4 right-4 z-0 text-4xl animate-lantern-swing" style={{ animationDelay: '1s' }}>🏮</div>

            <style>{`
        @keyframes lantern-swing {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        .animate-lantern-swing {
          animation: lantern-swing 3s ease-in-out infinite;
          transform-origin: top center;
        }
      `}</style>
        </>
    );
};

export default CauDoi;
