-- 1. Xóa bảng cũ để cập nhật cấu trúc mới
DROP TABLE IF EXISTS students;

-- 2. Tạo bảng students mới (10 nhiệm vụ, kiểu số float để lưu điểm sao)
CREATE TABLE students (
    student_code TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    password TEXT,
    task_1 FLOAT DEFAULT 0,
    task_2 FLOAT DEFAULT 0,
    task_3 FLOAT DEFAULT 0,
    task_4 FLOAT DEFAULT 0,
    task_5 FLOAT DEFAULT 0,
    task_6 FLOAT DEFAULT 0,
    task_7 FLOAT DEFAULT 0,
    task_8 FLOAT DEFAULT 0,
    task_9 FLOAT DEFAULT 0,
    task_10 FLOAT DEFAULT 0,
    parent_confirm BOOLEAN DEFAULT FALSE,
    parent_message TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tắt RLS
ALTER TABLE students DISABLE ROW LEVEL SECURITY;

-- 4. Chèn dữ liệu mẫu
INSERT INTO students (student_code, class_name, full_name, password)
VALUES 
    -- TÀI KHOẢN TEST
    ('TEST01', 'LỚP TEST', 'Học Sinh Trải Nghiệm', '123456'),

    -- DANH SÁCH LỚP 8B03 (Demo vài bạn, thầy cô có thể copy lại danh sách đầy đủ từ file cũ nếu cần)
    ('24123802', '8B03', 'NGUYỄN DIỆP ANH', '24123802'),
    ('24125706', '8B03', 'LƯƠNG NGỌC BẢO', '24125706'),
    ('hieudd', 'GVCN', 'Giáo Viên Test', 'hieudd');

-- XONG! Bấm RUN để chạy.