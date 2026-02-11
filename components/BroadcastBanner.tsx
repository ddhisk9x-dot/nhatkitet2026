import React, { useEffect, useState } from 'react';
import { Megaphone, X } from 'lucide-react';
import { getBroadcast, subscribeToBroadcast, unsubscribeChannel } from '../services/supabaseService';

const BroadcastBanner: React.FC = () => {
    const [message, setMessage] = useState<string | null>(null);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // Fetch initial
        const fetch = async () => {
            const { data } = await getBroadcast();
            if (data && data.is_active) {
                setMessage(data.message);
                setVisible(true);
            }
        };
        fetch();

        // Subscribe
        const channel = subscribeToBroadcast((payload) => {
            if (payload && payload.is_active) {
                setMessage(payload.message);
                setVisible(true);
            }
        });

        return () => {
            if (channel) unsubscribeChannel(channel);
        };
    }, []);

    if (!message || !visible) return null;

    return (
        <div className="bg-yellow-400 text-red-700 px-4 py-2 flex items-center justify-between shadow-md relative z-50 overflow-hidden animate-slide-down">
            <div className="flex items-center gap-2 flex-1 overflow-hidden">
                <Megaphone size={20} className="animate-pulse shrink-0" />
                <div className="whitespace-nowrap overflow-hidden w-full">
                    <span className="inline-block animate-marquee pl-full font-bold">
                        {message}
                    </span>
                </div>
            </div>
            <button
                onClick={() => setVisible(false)}
                className="ml-4 p-1 rounded-full hover:bg-yellow-500/50"
            >
                <X size={16} />
            </button>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 15s linear infinite;
                    white-space: nowrap;
                    padding-left: 100%;
                }
                .animate-slide-down {
                    animation: slideDown 0.5s ease-out;
                }
                @keyframes slideDown {
                    from { transform: translateY(-100%); }
                    to { transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default BroadcastBanner;
