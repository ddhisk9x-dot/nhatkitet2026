// ==========================================
// CẤU HÌNH KẾT NỐI SUPABASE (DÀNH CHO GIÁO VIÊN)
// ==========================================

// 1. Vào Settings -> API trong Supabase Dashboard
// 2. Copy "Project URL" và dán vào file .env (hoặc biến môi trường trên Vercel)
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

// 3. Copy "anon public" key và dán vào file .env (hoặc biến môi trường trên Vercel)
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || '';

// 4. TÀI KHOẢN QUẢN TRỊ (GVCN)
export const TEACHER_USERNAME = 'hieudd';
export const TEACHER_PASSWORD = 'hieudd';

// Lưu ý: Đảm bảo bạn không xóa dấu nháy đơn ' ' bao quanh mã.