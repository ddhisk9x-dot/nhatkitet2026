export interface Student {
  student_code: string;
  full_name: string;
  class_name: string;
  password?: string;
  task_1: number;
  task_2: number;
  task_3: number;
  task_4: number;
  task_5: number;
  task_6: number;
  task_7: number;
  task_8: number;
  task_9: number;
  task_10: number;
  parent_confirm: boolean;
  parent_message?: string | null;
  last_updated: string;
  avatar_config?: {
    gender?: 'male' | 'female';
    skin?: string;
    hair?: string;
    outfit?: string;
    hat?: string;
    hand?: string;
    accessory?: string;
    vehicle?: string;
    owned_items?: string[];
  };
  bonus_stars?: number; // Sao thưởng từ GVCN hoặc nhiệm vụ ẩn
  completed_hidden_tasks?: string[]; // Danh sách ID các nhiệm vụ ẩn đã làm
}

export interface TaskDef {
  id: keyof Student;
  title: string;
  icon: string;
  description: string;
  criteria: string; // Tiêu chí đánh giá 5 sao
}

export interface TaskEvidence {
  id: number;
  student_code: string;
  task_id: string;
  image_url: string;
  created_at: string;
}

export const TASKS_LIST: TaskDef[] = [
  {
    id: 'task_1',
    title: 'Trách Nhiệm Sẻ Chia',
    icon: '🧹',
    description: 'Chủ động dọn dẹp nhà cửa, trang trí Tết hoặc phụ nấu mâm cơm tất niên.',
    criteria: '5 sao: Tự giác làm việc lớn (lau dọn phòng khách, nấu món chính) không đợi nhắc.'
  },
  {
    id: 'task_2',
    title: 'Văn Hóa Ứng Xử',
    icon: '🙏',
    description: 'Chào hỏi lễ phép, chúc Tết ý nghĩa (không văn mẫu) và nhận lì xì bằng hai tay.',
    criteria: '5 sao: Lời chúc chân thành, thái độ kính trọng, không mở lì xì trước mặt khách.'
  },
  {
    id: 'task_3',
    title: 'Tôn Sư Trọng Đạo',
    icon: '👩‍🏫',
    description: 'Nhắn tin chúc mừng hoặc đi thăm thầy cô giáo cũ/hiện tại.',
    criteria: '5 sao: Có hành động tri ân cụ thể (tin nhắn riêng ý nghĩa hoặc đi thăm trực tiếp).'
  },
  {
    id: 'task_4',
    title: 'Kết Nối Thế Hệ',
    icon: '👵',
    description: 'Ngồi nghe ông bà/bố mẹ kể chuyện Tết xưa hoặc hỏi về nguồn gốc gia đình.',
    criteria: '5 sao: Dành ít nhất 30 phút trò chuyện sâu sắc, không cầm điện thoại.'
  },
  {
    id: 'task_5',
    title: 'Quản Lý Tài Chính',
    icon: '💰',
    description: 'Có kế hoạch cụ thể cho tiền lì xì (Tiết kiệm? Mua sách? Từ thiện?).',
    criteria: '5 sao: Lập được bảng kế hoạch chi tiêu/tiết kiệm rõ ràng trên giấy/note.'
  },
  {
    id: 'task_6',
    title: 'An Toàn & Văn Minh',
    icon: '🚦',
    description: 'Tuân thủ giao thông, đội mũ bảo hiểm, không hái lộc bẻ cành bừa bãi.',
    criteria: '5 sao: Tuân thủ tuyệt đối 100%, nhắc nhở bạn bè cùng thực hiện.'
  },
  {
    id: 'task_7',
    title: 'Dinh Dưỡng & Vận Động',
    icon: '⚽',
    description: 'Duy trì tập thể dục ít nhất 15p/ngày, hạn chế nước ngọt có gas.',
    criteria: '5 sao: Vận động mỗi ngày, không ngủ nướng quá trưa.'
  },
  {
    id: 'task_8',
    title: 'Tư Duy Tích Cực',
    icon: '🥰',
    description: 'Không cáu gắt, giữ nụ cười và nói lời hòa ái trong suốt những ngày Tết.',
    criteria: '5 sao: Không nổi nóng lần nào, luôn mỉm cười giải quyết vấn đề.'
  },
  {
    id: 'task_9',
    title: 'Khai Bút Đầu Xuân',
    icon: '✍️',
    description: 'Viết ra 3 mục tiêu lớn (học tập, rèn luyện) muốn đạt được trong năm mới.',
    criteria: '5 sao: Mục tiêu cụ thể, rõ ràng, viết nắn nót vào sổ tay/giấy đẹp.'
  },
  {
    id: 'task_10',
    title: 'Sẵn Sàng Trở Lại',
    icon: '🎒',
    description: 'Soạn sách vở, đồng phục đầy đủ vào tối mùng 5 Tết để đi học.',
    criteria: '5 sao: Chuẩn bị xong hết trước 8h tối mùng 5, tâm thế hào hứng.'
  },
];