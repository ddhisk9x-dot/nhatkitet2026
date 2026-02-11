import fs from 'fs';
import path from 'path';

const SRC = 'C:\\Users\\Duong Hieu\\.gemini\\antigravity\\scratch\\anh trang phuc\\Tong hop';
const DST = 'C:\\Users\\Duong Hieu\\.gemini\\antigravity\\scratch\\nhatkitet2026\\public\\avatar';

const mapping = [
    ['nhan vat/nam.png', 'char_boy.png'],
    ['nhan vat/nu.png', 'char_girl.png'],
    ['Ao/ao sao vang.png', 'outfit_ao_sao_vang.png'],
    ['Ao/ao cap 1.png', 'outfit_ao_cap1.png'],
    ['Ao/ao cap 2.png', 'outfit_ao_cap2.png'],
    ['Ao/ao dai cap 1.png', 'outfit_aodai_cap1.png'],
    ['Ao/ao dai cap 2.png', 'outfit_aodai_cap2.png'],
    ['Ao/ao LV3.png', 'outfit_ao_lv3.png'],
    ['mu/non.png', 'hat_non_la.png'],
    ['mu/khan don.png', 'hat_khan_don.png'],
    ['mu/mu cap 1.png', 'hat_mu_cap1.png'],
    ['mu/Vuong mien.png', 'hat_vuong_mien.png'],
    ['phu kien/li xi.png', 'acc_li_xi.png'],
    ['phu kien/long den.png', 'acc_long_den.png'],
    ['phu kien/Vang.png', 'acc_vang.png'],
    ['phu kien/quat.png', 'acc_quat.png'],
    ['Phuong tien/xe dap.png', 'veh_xe_dap.png'],
    ['Phuong tien/xe may.png', 'veh_xe_may.png'],
    ['Phuong tien/o to.png', 'veh_o_to.png'],
    ['Phuong tien/du thuyen.png', 'veh_du_thuyen.png'],
];

for (const [src, dst] of mapping) {
    const srcPath = path.join(SRC, src);
    const dstPath = path.join(DST, dst);
    fs.copyFileSync(srcPath, dstPath);
    console.log(`OK: ${dst}`);
}
console.log('All 20 files copied!');
