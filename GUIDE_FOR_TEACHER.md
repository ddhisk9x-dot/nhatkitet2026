# HƯỚNG DẪN CÀI ĐẶT VÀ QUẢN LÝ (DÀNH CHO GIÁO VIÊN)

Chào thầy/cô, đây là bộ code đã được chuẩn bị sẵn cho lớp **8B03**.

## PHẦN 1: CẤU HÌNH DỮ LIỆU (QUAN TRỌNG)

1. Đăng nhập vào [Supabase](https://supabase.com/). Tạo "New Project".
2. Vào mục **SQL Editor** (biểu tượng trang giấy ở cột trái).
3. Copy toàn bộ nội dung trong file `setup_supabase.sql` (đã chứa danh sách lớp 8B03).
4. Paste vào và bấm **RUN**.
   -> Dữ liệu sẽ được tạo với **Mật khẩu mặc định trùng với Mã Học Sinh**.

## PHẦN 2: KẾT NỐI VÀ DEPLOY

1. Mở file `constants.ts` trong danh sách file.
2. Vào Supabase -> **Settings** -> **API**.
3. Copy **URL** và **anon public key** dán vào file `constants.ts`.
4. Deploy lên Vercel hoặc CodeSandbox như bình thường (xem hướng dẫn cũ).

## PHẦN 3: TÀI KHOẢN DÙNG THỬ (TEST)

Để kiểm tra web hoạt động mà không ảnh hưởng dữ liệu học sinh thật, thầy/cô sử dụng tài khoản sau (đã được tạo sẵn trong file SQL):

- **Mã số (User):** `TEST01`
- **Mật khẩu (Pass):** `123456`

## PHẦN 4: XỬ LÝ KHI HỌC SINH QUÊN MẬT KHẨU

Nếu học sinh đổi mật khẩu rồi quên, thầy/cô có thể "Reset" mật khẩu về mặc định (chính là Mã số HS) bằng cách:

1. Vào Supabase -> **SQL Editor**.
2. Nhập lệnh sau (thay `MA_HS_CAN_RESET` bằng mã số của học sinh đó):
   
   ```sql
   UPDATE students 
   SET password = student_code 
   WHERE student_code = '24123802';
   ```
   
   *Hoặc sử dụng nút "Reset" trong trang Dashboard của Giáo viên.*

3. Bấm **RUN**.
4. Báo học sinh đăng nhập lại bằng Mã số của mình.