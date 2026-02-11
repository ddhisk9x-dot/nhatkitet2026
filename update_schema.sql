-- CẬP NHẬT CẤU TRÚC BẢNG STUDENTS (Chạy 1 lần duy nhất)

-- 1. Thêm cột avatar_config (nếu chưa có)
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS avatar_config JSONB DEFAULT '{}'::jsonb;

-- 2. Thêm cột bonus_stars (Sao thưởng)
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS bonus_stars FLOAT DEFAULT 0;

-- 3. Thêm cột completed_hidden_tasks (Nhiệm vụ ẩn đã làm)
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS completed_hidden_tasks TEXT[] DEFAULT '{}';

-- 4. Đảm bảo permissions (nếu cần)
GRANT ALL ON TABLE public.students TO anon;
GRANT ALL ON TABLE public.students TO authenticated;
GRANT ALL ON TABLE public.students TO service_role;
