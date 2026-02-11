import React, { useState } from 'react';
import { updateStudentAvatar } from '../services/supabaseService';
import { Student } from '../types';
import { X, User } from 'lucide-react';

// ============================================================
// AVATAR SYSTEM - Full Body + Overlay Items
// ============================================================
// All items are pre-designed transparent PNGs positioned to
// overlay perfectly on the full body character.
// Z-order: Vehicle (0) → Character (1) → Outfit (2) → Accessory (3) → Hat (4)
// ============================================================

type ItemType = 'outfit' | 'hat' | 'accessory' | 'vehicle';
type Tier = 'common' | 'rare' | 'epic' | 'legendary';
type Gender = 'male' | 'female';

interface ShopItem {
    id: string;
    name: string;
    icon: string;
    type: ItemType;
    tier: Tier;
    price: number;
    src: string;         // overlay image path (positioned to overlay on character)
    // For shop thumbnail: crop region to focus on the item detail
    // [top%, left%, width%, height%] of the source image to show as thumbnail
    thumbCrop?: [number, number, number, number];
}

// Full body character images
const CHAR_IMAGES = {
    male: '/avatar/char_boy.png',
    female: '/avatar/char_girl.png',
};

// ============================================================
// SHOP ITEMS - Using pre-made overlay PNGs
// ============================================================
const SHOP_ITEMS: ShopItem[] = [
    // === OUTFITS (6 items, shared between genders) ===
    { id: 'outfit_none', name: 'Đồ cơ bản', icon: '👕', type: 'outfit', tier: 'common', price: 0, src: '' },
    {
        id: 'outfit_sao_vang', name: 'Áo Sao Vàng', icon: '⭐', type: 'outfit', tier: 'common', price: 5,
        src: '/avatar/outfit_ao_sao_vang.png', thumbCrop: [40, 20, 60, 40]
    },
    {
        id: 'outfit_cap1', name: 'Áo Tết Cấp 1', icon: '🧧', type: 'outfit', tier: 'common', price: 8,
        src: '/avatar/outfit_ao_cap1.png', thumbCrop: [35, 15, 70, 45]
    },
    {
        id: 'outfit_cap2', name: 'Áo Tết Cấp 2', icon: '🎋', type: 'outfit', tier: 'rare', price: 12,
        src: '/avatar/outfit_ao_cap2.png', thumbCrop: [35, 15, 70, 45]
    },
    {
        id: 'outfit_aodai1', name: 'Áo Dài Cấp 1', icon: '🌸', type: 'outfit', tier: 'rare', price: 15,
        src: '/avatar/outfit_aodai_cap1.png', thumbCrop: [30, 15, 70, 50]
    },
    {
        id: 'outfit_aodai2', name: 'Áo Dài Cấp 2', icon: '🐉', type: 'outfit', tier: 'epic', price: 25,
        src: '/avatar/outfit_aodai_cap2.png', thumbCrop: [30, 15, 70, 50]
    },
    {
        id: 'outfit_lv3', name: 'Trang Phục VIP', icon: '✨', type: 'outfit', tier: 'legendary', price: 40,
        src: '/avatar/outfit_ao_lv3.png', thumbCrop: [25, 10, 80, 55]
    },

    // === HATS (4 items) ===
    { id: 'hat_none', name: 'Không đội', icon: '❌', type: 'hat', tier: 'common', price: 0, src: '' },
    {
        id: 'hat_mu1', name: 'Mũ Tết', icon: '🎩', type: 'hat', tier: 'common', price: 4,
        src: '/avatar/hat_mu_cap1.png', thumbCrop: [5, 10, 60, 30]
    },
    {
        id: 'hat_non_la', name: 'Nón Lá', icon: '👒', type: 'hat', tier: 'rare', price: 10,
        src: '/avatar/hat_non_la.png', thumbCrop: [5, 5, 50, 25]
    },
    {
        id: 'hat_khan', name: 'Khăn Đóng', icon: '🎀', type: 'hat', tier: 'rare', price: 12,
        src: '/avatar/hat_khan_don.png', thumbCrop: [5, 15, 55, 25]
    },
    {
        id: 'hat_vuong_mien', name: 'Vương Miện', icon: '👑', type: 'hat', tier: 'legendary', price: 35,
        src: '/avatar/hat_vuong_mien.png', thumbCrop: [0, 15, 60, 25]
    },

    // === ACCESSORIES (4 items) ===
    { id: 'acc_none', name: 'Không cầm', icon: '❌', type: 'accessory', tier: 'common', price: 0, src: '' },
    {
        id: 'acc_li_xi', name: 'Bao Lì Xì', icon: '🧧', type: 'accessory', tier: 'common', price: 4,
        src: '/avatar/acc_li_xi.png', thumbCrop: [55, 55, 35, 35]
    },
    {
        id: 'acc_long_den', name: 'Lồng Đèn', icon: '🏮', type: 'accessory', tier: 'rare', price: 10,
        src: '/avatar/acc_long_den.png', thumbCrop: [35, 50, 40, 45]
    },
    {
        id: 'acc_quat', name: 'Quạt Tết', icon: '🪭', type: 'accessory', tier: 'rare', price: 12,
        src: '/avatar/acc_quat.png', thumbCrop: [20, 40, 50, 50]
    },
    {
        id: 'acc_vang', name: 'Thỏi Vàng', icon: '💰', type: 'accessory', tier: 'epic', price: 20,
        src: '/avatar/acc_vang.png', thumbCrop: [50, 50, 40, 40]
    },

    // === VEHICLES (4 items) ===
    { id: 'veh_none', name: 'Đi bộ', icon: '🚶', type: 'vehicle', tier: 'common', price: 0, src: '' },
    {
        id: 'veh_xe_dap', name: 'Xe Đạp', icon: '🚲', type: 'vehicle', tier: 'common', price: 6,
        src: '/avatar/veh_xe_dap.png', thumbCrop: [50, 30, 60, 45]
    },
    {
        id: 'veh_xe_may', name: 'Xe Máy', icon: '🛵', type: 'vehicle', tier: 'rare', price: 15,
        src: '/avatar/veh_xe_may.png', thumbCrop: [45, 25, 65, 45]
    },
    {
        id: 'veh_o_to', name: 'Ô Tô', icon: '🚗', type: 'vehicle', tier: 'epic', price: 25,
        src: '/avatar/veh_o_to.png', thumbCrop: [40, 15, 75, 50]
    },
    {
        id: 'veh_du_thuyen', name: 'Du Thuyền', icon: '🛥️', type: 'vehicle', tier: 'legendary', price: 45,
        src: '/avatar/veh_du_thuyen.png', thumbCrop: [35, 10, 80, 55]
    },
];

// ============================================================
// COMPONENT
// ============================================================

interface AvatarEditorProps {
    student: Student;
    onClose: () => void;
    onUpdate: () => void;
    totalScore: number;
}

interface AvatarConfig {
    gender: Gender;
    outfit: string;
    hat: string;
    accessory: string;
    vehicle: string;
    owned_items: string[];
}

const DEFAULT_CONFIG: AvatarConfig = {
    gender: 'male',
    outfit: 'outfit_none',
    hat: 'hat_none',
    accessory: 'acc_none',
    vehicle: 'veh_none',
    owned_items: ['outfit_none', 'hat_none', 'acc_none', 'veh_none'],
};

const AvatarEditor: React.FC<AvatarEditorProps> = ({ student, onClose, onUpdate, totalScore }) => {
    // Migrate old config
    const migrateConfig = (old: any): AvatarConfig => {
        if (!old) return DEFAULT_CONFIG;
        return {
            gender: old.gender || 'male',
            outfit: old.outfit?.startsWith('outfit_') ? old.outfit : 'outfit_none',
            hat: old.hat?.startsWith('hat_') ? old.hat : 'hat_none',
            accessory: old.accessory?.startsWith('acc_') ? old.accessory : (old.hand?.startsWith('acc_') ? old.hand : 'acc_none'),
            vehicle: old.vehicle?.startsWith('veh_') ? old.vehicle : 'veh_none',
            owned_items: old.owned_items || DEFAULT_CONFIG.owned_items,
        };
    };

    const [config, setConfig] = useState<AvatarConfig>(migrateConfig(student.avatar_config));
    const [activeTab, setActiveTab] = useState<ItemType>('outfit');
    const [isSetupDone, setIsSetupDone] = useState(false);
    const [saving, setSaving] = useState(false);

    // Balance
    const calculateSpent = () => {
        let spent = 0;
        (config.owned_items || []).forEach(id => {
            const item = SHOP_ITEMS.find(i => i.id === id);
            if (item && item.price > 0) spent += item.price;
        });
        return spent;
    };
    const balance = totalScore - calculateSpent();

    // Save
    const saveConfig = async (newConfig: AvatarConfig) => {
        setSaving(true);
        const res = await updateStudentAvatar(student.student_code, newConfig);
        setSaving(false);
        if (res.error) {
            const msg = typeof res.error === 'string' ? res.error : res.error.message;
            alert("Lỗi lưu: " + msg);
        }
        onUpdate();
    };

    // Buy or equip
    const handleBuyOrEquip = async (item: ShopItem) => {
        const owned = config.owned_items || [];
        const isOwned = owned.includes(item.id) || item.price === 0;

        if (isOwned) {
            const newConfig = { ...config, [item.type]: item.id };
            setConfig(newConfig);
            await saveConfig(newConfig);
        } else {
            if (balance >= item.price) {
                if (window.confirm(`Mua "${item.name}" với giá ${item.price} ⭐?`)) {
                    const newConfig = {
                        ...config,
                        [item.type]: item.id,
                        owned_items: [...owned, item.id],
                    };
                    setConfig(newConfig);
                    await saveConfig(newConfig);
                }
            } else {
                alert("Không đủ sao! Làm thêm nhiệm vụ nhé 💪");
            }
        }
    };

    // Tier styling
    const getTierInfo = (tier: Tier) => {
        switch (tier) {
            case 'legendary': return { label: 'Huyền Thoại', color: 'border-amber-400 bg-gradient-to-b from-amber-50 to-yellow-50', badge: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white', dot: 'bg-amber-400' };
            case 'epic': return { label: 'Cao Cấp', color: 'border-purple-300 bg-gradient-to-b from-purple-50 to-pink-50', badge: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white', dot: 'bg-purple-400' };
            case 'rare': return { label: 'Hiếm', color: 'border-blue-300 bg-gradient-to-b from-blue-50 to-cyan-50', badge: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white', dot: 'bg-blue-400' };
            default: return { label: 'Thường', color: 'border-gray-200 bg-white', badge: 'bg-gray-400 text-white', dot: 'bg-gray-400' };
        }
    };

    // ============================================================
    // AVATAR STAGE: Full body + overlay items
    // ============================================================
    const renderAvatarStage = () => {
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
            <div className="relative w-56 h-72 sm:w-64 sm:h-80 mx-auto">
                {/* All overlays are same-size PNGs designed to stack perfectly */}
                {overlays.filter(o => o.z < 1).map(o => (
                    <img key={o.alt} src={o.src} className="absolute inset-0 w-full h-full object-contain" style={{ zIndex: o.z }} alt={o.alt} />
                ))}

                {/* Full Body Character (z=1) */}
                <img
                    src={charSrc}
                    className="absolute inset-0 w-full h-full object-contain drop-shadow-lg"
                    style={{ zIndex: 1 }}
                    alt="character"
                />

                {/* Overlays above character */}
                {overlays.filter(o => o.z > 1).map(o => (
                    <img key={o.alt} src={o.src} className="absolute inset-0 w-full h-full object-contain" style={{ zIndex: o.z }} alt={o.alt} />
                ))}
            </div>
        );
    };

    // ============================================================
    // SHOP ITEM THUMBNAIL - Focus on the detail area
    // ============================================================
    const renderItemThumb = (item: ShopItem) => {
        if (!item.src) {
            return <div className="text-3xl mt-2">{item.icon}</div>;
        }

        // Use thumbCrop to show only the interesting part of the overlay
        if (item.thumbCrop) {
            const [top, left, width, height] = item.thumbCrop;
            return (
                <div className="w-14 h-14 mt-1 overflow-hidden rounded-lg relative" style={{
                    backgroundImage: `url(${item.src})`,
                    backgroundSize: `${(100 / width) * 100}% ${(100 / height) * 100}%`,
                    backgroundPosition: `${(left / (100 - width)) * 100}% ${(top / (100 - height)) * 100}%`,
                    backgroundRepeat: 'no-repeat',
                }} />
            );
        }

        return <img src={item.src} className="w-14 h-14 object-contain mt-1" alt={item.name} />;
    };

    // ============================================================
    // SLOT INDICATOR
    // ============================================================
    const renderSlot = (title: string, defaultIcon: string, type: ItemType) => {
        const currentId = config[type];
        const item = SHOP_ITEMS.find(i => i.id === currentId);

        return (
            <div
                onClick={() => setActiveTab(type)}
                className={`w-14 h-14 sm:w-16 sm:h-16 bg-white/80 backdrop-blur border-2 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-110 shadow-lg ${activeTab === type ? 'border-red-500 ring-2 ring-red-300 scale-105' : 'border-white/50'}`}
            >
                <div className="text-gray-400 text-[8px] font-bold uppercase">{title}</div>
                <div className="text-lg sm:text-xl">{item?.icon || defaultIcon}</div>
            </div>
        );
    };

    // ============================================================
    // GENDER SELECTION (First Time Setup)
    // ============================================================
    if (!student.avatar_config && !isSetupDone) {
        return (
            <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-fadeIn font-sans">
                <div className="bg-[#1a1a2e] rounded-3xl w-full max-w-2xl p-8 text-center border border-gray-700 shadow-2xl">
                    <h2 className="text-3xl font-bold text-white mb-2">Chào mừng bạn mới! 👋</h2>
                    <p className="text-gray-400 mb-8">Hãy chọn giới tính nhân vật.<br />
                        <span className="text-red-400 font-bold">(Lưu ý: Không thể thay đổi sau!)</span>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        {(['male', 'female'] as Gender[]).map(g => (
                            <button
                                key={g}
                                onClick={async () => {
                                    const label = g === 'male' ? 'NAM' : 'NỮ';
                                    if (window.confirm(`Chọn nhân vật ${label}? Không đổi được đâu nhé!`)) {
                                        const newConfig: AvatarConfig = { ...DEFAULT_CONFIG, gender: g };
                                        setConfig(newConfig);
                                        setIsSetupDone(true);
                                        const res = await updateStudentAvatar(student.student_code, newConfig);
                                        if (res.error) {
                                            alert("Lỗi lưu dữ liệu! Thử lại nhé.");
                                            setIsSetupDone(false);
                                        } else {
                                            onUpdate();
                                        }
                                    }
                                }}
                                className={`flex-1 ${g === 'male' ? 'bg-gradient-to-b from-blue-900 to-blue-800 border-blue-500' : 'bg-gradient-to-b from-pink-900 to-pink-800 border-pink-500'} border-2 rounded-2xl p-6 hover:scale-105 transition-all text-white group`}
                            >
                                <img src={CHAR_IMAGES[g]} className="h-40 mx-auto mb-4 object-contain drop-shadow-xl" alt={g} />
                                <div className="font-bold text-xl uppercase tracking-wider">{g === 'male' ? 'Nam' : 'Nữ'}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ============================================================
    // MAIN EDITOR UI
    // ============================================================
    const tabItems = SHOP_ITEMS.filter(item => item.type === activeTab);

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 sm:p-4 animate-fadeIn font-sans">
            <div className="bg-[#1a1a2e] rounded-3xl w-full max-w-4xl h-[95vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative">

                {/* Mobile Header */}
                <div className="md:hidden bg-[#16213e] p-3 flex justify-between items-center text-white border-b border-gray-700">
                    <span className="font-bold flex items-center gap-2">💎 {balance} Sao</span>
                    <button onClick={onClose}><X /></button>
                </div>

                {/* LEFT: Preview & Slots */}
                <div className="relative flex-1 bg-gradient-to-b from-[#0f3460] to-[#16213e] flex flex-col items-center justify-center p-4 overflow-hidden">

                    {/* Name & Level */}
                    <div className="absolute top-4 left-0 right-0 text-center z-10">
                        <h2 className="text-white font-bold text-lg sm:text-xl drop-shadow-md">{student.full_name}</h2>
                        <div className="text-yellow-400 text-xs font-bold uppercase tracking-wider">Học sinh ngoan</div>
                    </div>

                    {/* Gender Badge */}
                    <div className="absolute top-4 right-4 z-20">
                        <div className={`${config.gender === 'male' ? 'bg-blue-600' : 'bg-pink-600'} text-white p-2 rounded-full shadow-lg`}>
                            <User size={16} />
                        </div>
                    </div>

                    {/* Saving indicator */}
                    {saving && (
                        <div className="absolute top-4 left-4 z-20 bg-green-500 text-white text-xs px-3 py-1 rounded-full animate-pulse">
                            Đang lưu...
                        </div>
                    )}

                    {/* Avatar Stage + Slots */}
                    <div className="w-full max-w-md h-[400px] relative flex items-center justify-center">

                        {/* Character + Overlays */}
                        <div className="filter drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                            {renderAvatarStage()}
                        </div>

                        {/* Slots Left */}
                        <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
                            {renderSlot('Mũ', '👒', 'hat')}
                            {renderSlot('Tay', '🎁', 'accessory')}
                        </div>

                        {/* Slots Right */}
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
                            {renderSlot('Áo', '👕', 'outfit')}
                            {renderSlot('Xe', '🚲', 'vehicle')}
                        </div>
                    </div>

                    {/* Mobile Footer */}
                    <div className="md:hidden w-full mt-4">
                        <button onClick={onClose} className="w-full bg-gray-600 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95">
                            Đóng (Đã lưu)
                        </button>
                    </div>
                </div>

                {/* RIGHT: Shop Grid */}
                <div className="flex-1 bg-white md:max-w-md flex flex-col h-1/2 md:h-full border-l border-gray-200">

                    {/* Desktop Header */}
                    <div className="hidden md:flex bg-gray-100 p-4 justify-between items-center border-b">
                        <div>
                            <h3 className="font-bold text-gray-700">Cửa Hàng Vật Phẩm</h3>
                            <div className="text-sm text-gray-500">Số dư: <span className="font-bold text-amber-500">{balance} ⭐</span></div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex p-2 gap-2 overflow-x-auto bg-white border-b shadow-sm scrollbar-hide shrink-0">
                        {([
                            { type: 'outfit' as ItemType, label: '👕 Trang Phục', count: SHOP_ITEMS.filter(i => i.type === 'outfit').length },
                            { type: 'hat' as ItemType, label: '👒 Mũ/Nón', count: SHOP_ITEMS.filter(i => i.type === 'hat').length },
                            { type: 'accessory' as ItemType, label: '🎁 Phụ Kiện', count: SHOP_ITEMS.filter(i => i.type === 'accessory').length },
                            { type: 'vehicle' as ItemType, label: '🚲 Xe Cộ', count: SHOP_ITEMS.filter(i => i.type === 'vehicle').length },
                        ]).map(tab => (
                            <button
                                key={tab.type}
                                onClick={() => setActiveTab(tab.type)}
                                className={`px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab.type ? 'bg-red-100 text-red-600 shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tier Legend */}
                    <div className="px-4 py-2 bg-yellow-50 text-[10px] text-yellow-800 flex gap-3 justify-center flex-wrap border-b">
                        {(['common', 'rare', 'epic', 'legendary'] as Tier[]).map(t => {
                            const info = getTierInfo(t);
                            return (
                                <span key={t} className="flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${info.dot}`}></span> {info.label}
                                </span>
                            );
                        })}
                    </div>

                    {/* Items Grid */}
                    <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
                        <div className="grid grid-cols-3 gap-3">
                            {tabItems.map(item => {
                                const owned = (config.owned_items || []).includes(item.id) || item.price === 0;
                                const equipped = config[item.type] === item.id;
                                const canBuy = balance >= item.price;
                                const tierInfo = getTierInfo(item.tier);

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleBuyOrEquip(item)}
                                        className={`relative border-2 rounded-xl p-2 flex flex-col items-center justify-between min-h-[130px] transition-all active:scale-95 ${tierInfo.color} ${equipped ? 'ring-2 ring-red-500 ring-offset-2 shadow-lg' : ''} ${!owned && !canBuy ? 'opacity-50 grayscale' : 'hover:shadow-md hover:-translate-y-0.5'}`}
                                    >
                                        {/* Tier badge */}
                                        <div className={`absolute top-1 right-1 text-[7px] px-1.5 py-0.5 rounded-full font-bold ${tierInfo.badge}`}>
                                            {tierInfo.label}
                                        </div>

                                        {/* Item thumbnail (focused on detail) */}
                                        {renderItemThumb(item)}

                                        <div className="text-[11px] font-bold text-center w-full truncate mt-1 text-gray-700">{item.name}</div>

                                        {/* Status */}
                                        <div className="w-full pt-1">
                                            {equipped ? (
                                                <div className="bg-red-500 text-white text-[10px] py-1 rounded-md font-bold w-full text-center shadow-sm">✓ Đang Dùng</div>
                                            ) : owned ? (
                                                <div className="bg-green-100 text-green-700 text-[10px] py-1 rounded-md font-bold w-full text-center border border-green-200">Đã Mua ✓</div>
                                            ) : (
                                                <div className={`${canBuy ? 'bg-yellow-400 text-red-800' : 'bg-gray-300 text-gray-600'} text-[10px] py-1 rounded-md font-bold w-full text-center shadow-sm`}>
                                                    {item.price} ⭐
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Desktop Footer */}
                    <div className="hidden md:block p-4 bg-white border-t">
                        <button onClick={onClose} className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                            ✅ Đóng (Đã lưu tự động)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvatarEditor;
