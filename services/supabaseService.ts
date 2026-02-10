import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '../constants';
import { Student } from '../types';

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