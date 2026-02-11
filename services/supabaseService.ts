import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '../constants';
import { Student, AvatarConfig } from '../types';

// ==========================================
// MOCK DATA (DỮ LIỆU GIẢ LẬP ĐỂ TEST NGAY)
// ==========================================
const MOCK_STUDENTS_INIT: Student[] = [
  { student_code: 'TEST01', full_name: 'Học Sinh Trải Nghiệm', class_name: 'LỚP TEST', password: '123456', task_1: 0, task_2: 0, task_3: 0, task_4: 0, task_5: 0, task_6: 0, task_7: 0, task_8: 0, task_9: 0, task_10: 0, parent_confirm: false, parent_message: null, last_updated: new Date().toISOString() },
  { student_code: '24123802', full_name: 'NGUYỄN DIỆP ANH', class_name: '8B03', password: '24123802', task_1: 5, task_2: 4.5, task_3: 0, task_4: 0, task_5: 0, task_6: 0, task_7: 0, task_8: 0, task_9: 0, task_10: 0, parent_confirm: false, parent_message: null, last_updated: new Date().toISOString() },
  { student_code: 'hieudd', full_name: 'Giáo Viên Test', class_name: 'GVCN', password: 'hieudd', task_1: 0, task_2: 0, task_3: 0, task_4: 0, task_5: 0, task_6: 0, task_7: 0, task_8: 0, task_9: 0, task_10: 0, parent_confirm: false, parent_message: null, last_updated: new Date().toISOString() },
];

// Biến lưu trữ tạm thời trong RAM (Mất khi reload trang)
let MOCK_DB = [...MOCK_STUDENTS_INIT];

// Check config
const isConfigured = SUPABASE_URL && !SUPABASE_URL.includes('DÁN_URL_CỦA_BẠN');

const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

// ==========================================
// SERVICES
// ==========================================

export const getStudent = async (code: string): Promise<{ data: Student | null; error: any }> => {
  const cleanCode = code.trim().toUpperCase();

  // --- MOCK MODE ---
  if (!supabase) {
    const mockUser = MOCK_DB.find(s => s.student_code === cleanCode);
    if (mockUser) return { data: { ...mockUser }, error: null };
    return { data: null, error: 'User not found in Mock DB' };
  }

  // --- REAL MODE ---
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('student_code', cleanCode)
    .single();

  return { data, error };
};

export const getAllStudents = async (): Promise<{ data: Student[] | null; error: any }> => {
  // --- MOCK MODE ---
  if (!supabase) {
    return { data: [...MOCK_DB], error: null };
  }

  // --- REAL MODE ---
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('student_code', { ascending: true });

  return { data, error };
};

// Update task value (now accepts number)
export const updateTask = async (code: string, taskKey: string, value: number): Promise<any> => {
  // --- MOCK MODE ---
  if (!supabase) {
    const index = MOCK_DB.findIndex(s => s.student_code === code);
    if (index !== -1) {
      MOCK_DB[index] = { ...MOCK_DB[index], [taskKey]: value, last_updated: new Date().toISOString() };
      return { data: MOCK_DB[index], error: null };
    }
    return { error: 'Not found' };
  }

  // --- REAL MODE ---
  const { data, error } = await supabase
    .from('students')
    .update({
      [taskKey]: value,
      last_updated: new Date().toISOString()
    })
    .eq('student_code', code);

  return { data, error };
};

export const updateParentConfirm = async (code: string, confirmed: boolean, message: string): Promise<any> => {
  // --- MOCK MODE ---
  if (!supabase) {
    const index = MOCK_DB.findIndex(s => s.student_code === code);
    if (index !== -1) {
      MOCK_DB[index] = {
        ...MOCK_DB[index],
        parent_confirm: confirmed,
        parent_message: message,
        last_updated: new Date().toISOString()
      };
      return { data: MOCK_DB[index], error: null };
    }
    return { error: 'Not found' };
  }

  // --- REAL MODE ---
  const { data, error } = await supabase
    .from('students')
    .update({
      parent_confirm: confirmed,
      parent_message: message,
      last_updated: new Date().toISOString()
    })
    .eq('student_code', code);

  return { data, error };
};

export const changePassword = async (code: string, newPass: string): Promise<any> => {
  // --- MOCK MODE ---
  if (!supabase) {
    const index = MOCK_DB.findIndex(s => s.student_code === code);
    if (index !== -1) {
      MOCK_DB[index] = { ...MOCK_DB[index], password: newPass, last_updated: new Date().toISOString() };
      return { data: MOCK_DB[index], error: null };
    }
    return { error: 'Not found' };
  }

  // --- REAL MODE ---
  const { data, error } = await supabase
    .from('students')
    .update({
      password: newPass,
      last_updated: new Date().toISOString()
    })
    .eq('student_code', code);

  return { data, error };
};

export const resetStudentPassword = async (code: string): Promise<any> => {
  // --- MOCK MODE ---
  if (!supabase) {
    const index = MOCK_DB.findIndex(s => s.student_code === code);
    if (index !== -1) {
      MOCK_DB[index] = { ...MOCK_DB[index], password: code, last_updated: new Date().toISOString() };
      return { data: MOCK_DB[index], error: null };
    }
    return { error: 'Not found' };
  }

  // --- REAL MODE ---
  const { data, error } = await supabase
    .from('students')
    .update({
      password: code,
      last_updated: new Date().toISOString()
    })
    .eq('student_code', code);

  return { data, error };
};

// ==========================================
// REALTIME SUBSCRIPTION (4.1)
// ==========================================
export const subscribeToStudents = (onUpdate: (student: Student) => void) => {
  if (!supabase) return null; // No realtime in mock mode

  const channel = supabase
    .channel('students-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'students' },
      (payload: any) => {
        if (payload.new) {
          onUpdate(payload.new as Student);
        }
      }
    )
    .subscribe();

  return channel;
};

export const unsubscribeChannel = (channel: any) => {
  if (supabase && channel) {
    supabase.removeChannel(channel);
  }
};

// ==========================================
// EVIDENCE SERVICES (1.1)
// ==========================================

export const uploadEvidence = async (studentCode: string, taskId: string, file: File) => {
  if (!supabase) return { data: null, error: 'No Supabase config' };

  try {
    // 1. Upload to Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${studentCode}_${taskId}_${Date.now()}.${fileExt}`;
    const filePath = `${studentCode}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('evidence')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('evidence')
      .getPublicUrl(filePath);

    // 3. Save to DB
    const { data, error: dbError } = await supabase
      .from('task_evidence')
      .insert([
        { student_code: studentCode, task_id: taskId, image_url: publicUrl }
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    return { data, error: null };
  } catch (err) {
    console.error('Upload failed:', err);
    return { data: null, error: err };
  }
};

export const getEvidence = async (studentCode: string, taskId?: string) => {
  if (!supabase) return { data: [], error: 'No Supabase config' };

  let query = supabase
    .from('task_evidence')
    .select('*')
    .eq('student_code', studentCode)
    .order('created_at', { ascending: false });

  if (taskId) {
    query = query.eq('task_id', taskId);
  }

  const { data, error } = await query;
  return { data, error };
};

export const getAllEvidence = async () => {
  if (!supabase) return { data: [], error: 'No Supabase config' };

  // Join with students table to get names? 
  // Supabase join syntax: select('*, students(full_name)')
  // But we need foreign key relation. 
  // Since we rely on manual student_code matching and no formal FK, we might just fetch all evidence and map names on client side if needed, 
  // OR just show student_code if we don't have FK.
  // Actually, we can fetch all students and look up names.

  const { data, error } = await supabase
    .from('task_evidence')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
};

export const deleteEvidence = async (id: number, imageUrl: string) => {
  if (!supabase) return { error: 'No Supabase config' };

  try {
    // 1. Delete from DB
    const { error: dbError } = await supabase
      .from('task_evidence')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;

    // 2. Delete from Storage
    // Extract path from URL: .../evidence/studentCode/fileName
    // This is tricky if URL format varies. But usually: 
    // publicUrl: .../storage/v1/object/public/evidence/PATH
    const path = imageUrl.split('/evidence/')[1];
    if (path) {
      // Decode URI component in case of spaces/special chars
      const decodedPath = decodeURIComponent(path);
      const { error: storageError } = await supabase.storage
        .from('evidence')
        .remove([decodedPath]);

      if (storageError) console.error('Storage delete error:', storageError);
    }

    return { error: null };
  } catch (err) {
    console.error('Delete failed:', err);
    return { error: err };
  }
};

// ==========================================
// BROADCAST SERVICES
// ==========================================
export const getBroadcast = async () => {
  if (!supabase) return { data: null, error: 'No config' };
  const { data, error } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  return { data, error };
};

export const updateBroadcast = async (message: string, isActive: boolean) => {
  if (!supabase) return { error: 'No config' };

  // We only use one row or create new ones? Let's just insert a new one for history, or update the latest.
  // Simpler: Insert new row.
  const { error } = await supabase
    .from('broadcasts')
    .insert([{ message, is_active: isActive }]);

  // Optional: Set others to inactive? 
  // Trigger or manual update? For simplicity, we just fetch the latest active one.

  return { error };
};

export const subscribeToBroadcast = (onUpdate: (payload: any) => void) => {
  if (!supabase) return null;
  return supabase
    .channel('broadcast-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'broadcasts' }, (payload) => {
      onUpdate(payload.new);
    })
    .subscribe();
};

export const updateStudentAvatar = async (studentCode: string, config: any) => {
  // --- MOCK MODE ---
  if (!supabase) {
    const index = MOCK_DB.findIndex(s => s.student_code === studentCode);
    if (index !== -1) {
      MOCK_DB[index] = { ...MOCK_DB[index], avatar_config: config, last_updated: new Date().toISOString() };
      return { error: null };
    }
    return { error: 'Student not found in Mock DB' };
  }

  // --- REAL MODE ---
  const { error } = await supabase
    .from('students')
    .update({ avatar_config: config })
    .eq('student_code', studentCode);
  return { error };
};

// ==========================================
// NEW FEATURES: BONUS STARS & HIDDEN TASKS
// ==========================================

export const updateBonusStars = async (studentCode: string, amount: number) => {
  // --- MOCK MODE ---
  if (!supabase) {
    const index = MOCK_DB.findIndex(s => s.student_code === studentCode);
    if (index !== -1) {
      const current = MOCK_DB[index].bonus_stars || 0;
      MOCK_DB[index] = { ...MOCK_DB[index], bonus_stars: current + amount, last_updated: new Date().toISOString() };
      return { error: null };
    }
    return { error: 'Not found' };
  }

  // --- REAL MODE ---
  const { data } = await supabase.from('students').select('bonus_stars').eq('student_code', studentCode).single();
  const current = data?.bonus_stars || 0;

  const { error } = await supabase
    .from('students')
    .update({ bonus_stars: current + amount })
    .eq('student_code', studentCode);

  return { error };
};

export const completeHiddenTask = async (studentCode: string, taskId: string, reward: number) => {
  // --- MOCK MODE ---
  if (!supabase) {
    const index = MOCK_DB.findIndex(s => s.student_code === studentCode);
    if (index !== -1) {
      const completed = MOCK_DB[index].completed_hidden_tasks || [];
      if (completed.includes(taskId)) return { error: 'Already completed' }; // Prevent abuse

      const currentBonus = MOCK_DB[index].bonus_stars || 0;
      MOCK_DB[index] = {
        ...MOCK_DB[index],
        completed_hidden_tasks: [...completed, taskId],
        bonus_stars: currentBonus + reward,
        last_updated: new Date().toISOString()
      };
      return { error: null };
    }
    return { error: 'Not found' };
  }

  // --- REAL MODE ---
  const { data } = await supabase.from('students').select('completed_hidden_tasks, bonus_stars').eq('student_code', studentCode).single();
  const completed = data?.completed_hidden_tasks || [];
  const currentBonus = data?.bonus_stars || 0;

  if (completed.includes(taskId)) return { error: 'Already completed' };

  const { error } = await supabase
    .from('students')
    .update({
      completed_hidden_tasks: [...completed, taskId],
      bonus_stars: currentBonus + reward
    })
    .eq('student_code', studentCode);

  return { error };
};

export const resetStudentData = async (studentCode: string) => {
  const DEFAULT_RESET_CONFIG: AvatarConfig = {
    gender: 'male',
    outfit: 'outfit_none',
    hat: 'hat_none',
    accessory: 'acc_none',
    vehicle: 'veh_none',
    owned_items: []
  };

  // --- MOCK MODE ---
  if (!supabase) {
    const index = MOCK_DB.findIndex(s => s.student_code === studentCode);
    if (index !== -1) {
      MOCK_DB[index] = {
        ...MOCK_DB[index],
        // Reset Tasks
        task_1: 0, task_2: 0, task_3: 0, task_4: 0, task_5: 0,
        task_6: 0, task_7: 0, task_8: 0, task_9: 0, task_10: 0,
        // Reset Extras
        bonus_stars: 0,
        completed_hidden_tasks: [],
        parent_confirm: false,
        parent_message: null,
        avatar_config: DEFAULT_RESET_CONFIG, // Explicit reset
        last_updated: new Date().toISOString()
      };
      return { error: null };
    }
    return { error: 'Not found' };
  }

  // --- REAL MODE ---
  const { error } = await supabase
    .from('students')
    .update({
      task_1: 0, task_2: 0, task_3: 0, task_4: 0, task_5: 0,
      task_6: 0, task_7: 0, task_8: 0, task_9: 0, task_10: 0,
      bonus_stars: 0,
      completed_hidden_tasks: [],
      parent_confirm: false,
      parent_message: null,
      avatar_config: DEFAULT_RESET_CONFIG, // Explicit reset
      last_updated: new Date().toISOString()
    })
    .eq('student_code', studentCode);

  return { error };
};
