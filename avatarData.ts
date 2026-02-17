export type ItemType = 'outfit' | 'hat' | 'accessory' | 'vehicle';
export type Tier = 'common' | 'rare' | 'epic' | 'legendary';
export type Gender = 'male' | 'female';

export interface ShopItem {
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

export interface AvatarConfig {
    gender: Gender;
    outfit: string;
    hat: string;
    accessory: string;
    vehicle: string;
    owned_items: string[];
}

export const DEFAULT_CONFIG: AvatarConfig = {
    gender: 'male',
    outfit: 'outfit_none',
    hat: 'hat_none',
    accessory: 'acc_none',
    vehicle: 'veh_none',
    owned_items: ['outfit_none', 'hat_none', 'acc_none', 'veh_none'],
};

// Full body character images
export const CHAR_IMAGES = {
    male: '/avatar/char_boy.png',
    female: '/avatar/char_girl.png',
};

// ============================================================
// SHOP ITEMS - Using pre-made overlay PNGs
// ============================================================
export const SHOP_ITEMS: ShopItem[] = [
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

// Tier styling helper
export const getTierInfo = (tier: Tier) => {
    switch (tier) {
        case 'legendary': return { label: 'Huyền Thoại', color: 'border-amber-400 bg-gradient-to-b from-amber-50 to-yellow-50', badge: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white', dot: 'bg-amber-400' };
        case 'epic': return { label: 'Cao Cấp', color: 'border-purple-300 bg-gradient-to-b from-purple-50 to-pink-50', badge: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white', dot: 'bg-purple-400' };
        case 'rare': return { label: 'Hiếm', color: 'border-blue-300 bg-gradient-to-b from-blue-50 to-cyan-50', badge: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white', dot: 'bg-blue-400' };
        default: return { label: 'Thường', color: 'border-gray-200 bg-white', badge: 'bg-gray-400 text-white', dot: 'bg-gray-400' };
    }
};
