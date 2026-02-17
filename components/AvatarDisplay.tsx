import React from 'react';
import { CHAR_IMAGES, SHOP_ITEMS, AvatarConfig } from '../avatarData';

interface AvatarDisplayProps {
    config: AvatarConfig | null;
    className?: string;
    showName?: boolean;
    studentName?: string;
}

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ config, className = "w-40 h-56", showName = false, studentName }) => {
    if (!config) {
        return (
            <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs flex-col`}>
                <span>Chưa tạo</span>
                <span>Nhân vật</span>
            </div>
        );
    }

    const charSrc = CHAR_IMAGES[config.gender];

    // Collect equipped overlay sources (in render order)
    const overlays: { src: string; z: number; alt: string }[] = [];

    const vehItem = SHOP_ITEMS.find(i => i.id === config.vehicle);
    if (vehItem && vehItem.src) overlays.push({ src: vehItem.src, z: 0, alt: 'vehicle' });

    const outfitItem = SHOP_ITEMS.find(i => i.id === config.outfit);
    if (outfitItem && outfitItem.src) overlays.push({ src: outfitItem.src, z: 2, alt: 'outfit' });

    const accItem = SHOP_ITEMS.find(i => i.id === config.accessory);
    if (accItem && accItem.src) overlays.push({ src: accItem.src, z: 3, alt: 'accessory' });

    const hatItem = SHOP_ITEMS.find(i => i.id === config.hat);
    if (hatItem && hatItem.src) overlays.push({ src: hatItem.src, z: 4, alt: 'hat' });

    return (
        <div className={`relative ${className} mx-auto group`}>
            {/* All overlays are same-size PNGs designed to stack perfectly */}
            {overlays.filter(o => o.z < 1).map(o => (
                <img key={o.alt} src={o.src} className="absolute inset-0 w-full h-full object-contain" style={{ zIndex: o.z }} alt={o.alt} />
            ))}

            {/* Full Body Character (z=1) */}
            <img
                src={charSrc}
                className="absolute inset-0 w-full h-full object-contain drop-shadow-sm filter group-hover:drop-shadow-lg transition-all"
                style={{ zIndex: 1 }}
                alt="character"
            />

            {/* Overlays above character */}
            {overlays.filter(o => o.z > 1).map(o => (
                <img key={o.alt} src={o.src} className="absolute inset-0 w-full h-full object-contain" style={{ zIndex: o.z }} alt={o.alt} />
            ))}

            {showName && studentName && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold shadow whitespace-nowrap border border-gray-200 z-10">
                    {studentName}
                </div>
            )}
        </div>
    );
};

export default AvatarDisplay;
