import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { User, LogIn, CheckCircle, Save, Award, Lock, Key, X, AlertCircle, ShieldCheck, Database, Info, Star, HelpCircle, Gift, Trophy, Coins, Unlock, ChevronRight, Moon, Sun, Volume2, VolumeX, Share2 } from 'lucide-react';
import { getStudent, updateTask, updateParentConfirm, changePassword, completeHiddenTask } from './services/supabaseService';
import { Student, TASKS_LIST } from './types';
import { TEACHER_PASSWORD, TEACHER_USERNAME, SUPABASE_URL } from './constants';
import FallingBlossoms from './components/FallingBlossoms';
import TeacherDashboard from './components/TeacherDashboard';
import Leaderboard from './components/Leaderboard';
import TetCountdown from './components/TetCountdown';
import CauDoi from './components/CauDoi';
import BadgesDisplay from './components/BadgesDisplay';
import CayDaoLop from './components/CayDaoLop';
import LiXiGame from './components/LiXiGame';
import EvidenceUpload from './components/EvidenceUpload';
import ClassTimeline from './components/ClassTimeline';
import BroadcastBanner from './components/BroadcastBanner';
import AvatarEditor from './components/AvatarEditor';
import { Shirt } from 'lucide-react';

// --- COMPONENT: LOGO NGÔI SAO HOÀNG MAI (SVG) ---
const SchoolLogo = ({ onClick }: { onClick?: () => void }) => (
  <svg onClick={onClick} viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 shadow-lg rounded-lg overflow-hidden shrink-0 cursor-pointer active:scale-95 transition-transform">
    <defs>
      <mask id="mask">
        <rect width="100" height="100" fill="white" />
        {/* Geometric Cutouts mimic the logo provided */}
        <rect x="15" y="15" width="70" height="70" stroke="black" strokeWidth="8" fill="none" />
        <circle cx="50" cy="50" r="25" stroke="black" strokeWidth="8" fill="none" />
        <path d="M15 15 L32 32 M85 15 L68 32 M85 85 L68 68 M15 85 L32 68" stroke="black" strokeWidth="6" />
        <path d="M50 15 L50 25 M85 50 L75 50 M50 85 L50 75 M15 50 L25 50" stroke="black" strokeWidth="6" />
      </mask>
    </defs>
    <rect width="100" height="100" fill="#D90429" />
    <path d="M15 15 H85 V85 H15 Z" stroke="white" strokeWidth="6" fill="none" />
    <circle cx="50" cy="50" r="28" stroke="white" strokeWidth="6" fill="none" />
    <path d="M15 15 L30 30 M85 15 L70 30 M85 85 L70 70 M15 85 L30 70" stroke="white" strokeWidth="6" />
    <path d="M50 15 L50 22 M85 50 L78 50 M50 85 L50 78 M15 50 L22 50" stroke="white" strokeWidth="6" />
  </svg>
);

// --- COMPONENT: STAR RATING (Mobile Optimized) ---
const StarRating = ({ value, onChange, disabled }: { value: number, onChange: (val: number) => void, disabled: boolean }) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-2 sm:gap-1" onMouseLeave={() => setHoverValue(null)}>
      {stars.map((starIndex) => {
        const ratingValue = starIndex;
        const isFull = (hoverValue !== null ? hoverValue : value) >= ratingValue;

        return (
          <div key={starIndex} className="relative cursor-pointer w-10 h-10 sm:w-8 sm:h-8 md:w-10 md:h-10 transition-transform active:scale-90">
            <div
              className="absolute left-0 top-0 w-1/2 h-full z-10"
              onClick={() => {
                if (disabled) return;
                const newValue = starIndex - 0.5;
                onChange(value === newValue ? 0 : newValue);
              }}
              onMouseEnter={() => !disabled && setHoverValue(starIndex - 0.5)}
            ></div>
            <div
              className="absolute right-0 top-0 w-1/2 h-full z-10"
              onClick={() => {
                if (disabled) return;
                const newValue = starIndex;
                onChange(value === newValue ? 0 : newValue);
              }}
              onMouseEnter={() => !disabled && setHoverValue(starIndex)}
            ></div>
            <Star
              className={`w-full h-full transition-all duration-200 drop-shadow-sm ${isFull
                ? 'fill-yellow-400 text-yellow-400'
                : (value >= starIndex - 0.5 && value < starIndex) || (hoverValue === starIndex - 0.5)
                  ? 'fill-transparent text-yellow-400'
                  : 'text-gray-300'
                }`}
            />
            {((value === starIndex - 0.5) || (hoverValue === starIndex - 0.5)) && (
              <div className="absolute top-0 left-0 w-[50%] h-full overflow-hidden pointer-events-none">
                <Star className="w-[200%] h-full fill-yellow-400 text-yellow-400" style={{ transform: 'translateX(0)' }} />
              </div>
            )}
          </div>
        );
      })}
      <span className="ml-2 text-lg font-bold text-red-600 w-8">
        {(hoverValue !== null ? hoverValue : value) > 0 ? (hoverValue !== null ? hoverValue : value) : ''}
      </span>
    </div>
  );
};

const App: React.FC = () => {
  // Login State
  const [studentCode, setStudentCode] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  // Teacher Login State
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState(false);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' });

  // Leaderboard State
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Feature State
  const [parentMessage, setParentMessage] = useState('');
  const [honestyPledge, setHonestyPledge] = useState(false); // Lời hứa trung thực

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return new Date().getHours() >= 18 || new Date().getHours() < 6;
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLiXi, setShowLiXi] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);

  // Change Password Modal State
  const [showPassModal, setShowPassModal] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false); // Restore passLoading

  // Hidden Task State
  const [logoTaps, setLogoTaps] = useState(0);

  // Check Configuration
  const isMockMode = !SUPABASE_URL || SUPABASE_URL.includes('DÁN_URL_CỦA_BẠN');

  // --- HIDDEN TASK HANDLERS ---
  const handleHiddenTask = async (taskId: string, reward: number, msg: string) => {
    if (!currentStudent) return;
    if (currentStudent.completed_hidden_tasks?.includes(taskId)) return;

    // Optimistic update
    const updatedStudent = {
      ...currentStudent,
      bonus_stars: (currentStudent.bonus_stars || 0) + reward,
      completed_hidden_tasks: [...(currentStudent.completed_hidden_tasks || []), taskId]
    };
    setCurrentStudent(updatedStudent);
    showToast(`🎉 ${msg} (+${reward} sao)`);
    playStarSound();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });

    await completeHiddenTask(currentStudent.student_code, taskId, reward);
  };

  // Scroll to bottom detection
  useEffect(() => {
    const handleScroll = () => {
      const bottom = Math.abs(document.documentElement.scrollHeight - window.innerHeight - window.scrollY) < 50;
      if (bottom && currentStudent) {
        handleHiddenTask('scroll_bottom', 1, 'Bạn đã khám phá tận đáy trang!');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentStudent]); // Re-bind when student changes

  // Logo Tap Handler
  const handleLogoTap = () => {
    const newTaps = logoTaps + 1;
    setLogoTaps(newTaps);
    if (newTaps === 5) {
      handleHiddenTask('tap_logo_5', 2, 'Bạn đã tìm thấy bí mật Logo!');
    }
  };


  useEffect(() => {
    const savedCode = localStorage.getItem('student_code');
    if (savedCode) {
      setStudentCode(savedCode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Sound effect helper
  const playStarSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) { /* ignore audio errors */ }
  };

  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 2000);
  };

  const handleLogin = async () => {
    if (isTeacherMode) {
      if (studentCode.toLowerCase() === TEACHER_USERNAME.toLowerCase() && loginPassword === TEACHER_PASSWORD) {
        setIsTeacherAuthenticated(true);
        setError('');
      } else {
        setError('Tài khoản hoặc Mật khẩu GVCN không đúng!');
      }
      return;
    }

    if (!studentCode || !loginPassword) {
      setError('Vui lòng nhập cả Mã số và Mật khẩu');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: apiError } = await getStudent(studentCode);
      if (apiError || !data) {
        setError('Không tìm thấy mã số này.');
      } else {
        const dbPass = data.password || data.student_code;
        if (loginPassword.trim() !== dbPass) {
          setError('Mật khẩu không đúng.');
        } else {
          setCurrentStudent(data);
          setParentMessage(data.parent_message || '');
          localStorage.setItem('student_code', data.student_code);
        }
      }
    } catch (e) {
      setError('Lỗi hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentStudent) return;
    setPassError('');
    if (!passForm.current || !passForm.new || !passForm.confirm) {
      setPassError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    const realCurrentPass = currentStudent.password || currentStudent.student_code;
    if (passForm.current.trim() !== realCurrentPass) {
      setPassError('Mật khẩu hiện tại không đúng');
      return;
    }
    if (passForm.new !== passForm.confirm) {
      setPassError('Mật khẩu mới không khớp');
      return;
    }
    if (passForm.new.length < 4) {
      setPassError('Mật khẩu mới phải có ít nhất 4 ký tự');
      return;
    }

    setPassLoading(true);
    const { error } = await changePassword(currentStudent.student_code, passForm.new.trim());
    setPassLoading(false);

    if (error) {
      setPassError('Đã có lỗi xảy ra.');
    } else {
      setCurrentStudent({ ...currentStudent, password: passForm.new.trim() });
      setShowPassModal(false);
      setPassForm({ current: '', new: '', confirm: '' });
      showToast('Đổi mật khẩu thành công!');
    }
  };

  const handleTaskRating = async (taskKey: keyof Student, newValue: number) => {
    if (!currentStudent) return;

    // Check lock
    // Check lock
    const taskDef = TASKS_LIST.find(t => t.id === taskKey);
    // Use local date for comparison to avoid UTC issues
    const today = new Date().toLocaleDateString('en-CA');
    if (taskDef?.unlockDate && taskDef.unlockDate > today) {
      alert(`🔒 Nhiệm vụ này đang KHÓA.\n📅 Sẽ mở vào: ${taskDef.unlockLabel}`);
      return;
    }

    playStarSound();
    const updatedStudent = { ...currentStudent, [taskKey]: newValue };
    setCurrentStudent(updatedStudent);
    let total = 0;
    TASKS_LIST.forEach(t => {
      const val = t.id === taskKey ? newValue : updatedStudent[t.id] as number;
      total += val;
    });
    if (total >= 45) triggerConfetti();
    await updateTask(currentStudent.student_code, taskKey as string, newValue);
  };

  const handleParentSubmit = async () => {
    if (!currentStudent) return;
    setLoading(true);
    await updateParentConfirm(currentStudent.student_code, true, parentMessage);
    setCurrentStudent({
      ...currentStudent,
      parent_confirm: true,
      parent_message: parentMessage
    });
    setLoading(false);
    showToast("Đã gửi xác nhận của phụ huynh!");
    triggerConfetti();
  };

  const triggerConfetti = () => {
    // Hiệu ứng pháo hoa rực rỡ
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Pháo hoa từ hai bên bắn lên
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#D90429', '#FFD60A', '#FB8500', '#FFFFFF'] // Màu Tết: Đỏ, Vàng, Cam, Trắng
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#D90429', '#FFD60A', '#FB8500', '#FFFFFF']
      });
    }, 250);
  };

  const handleLogout = () => {
    localStorage.removeItem('student_code');
    setCurrentStudent(null);
    setStudentCode('');
    setLoginPassword('');
    setParentMessage('');
    setIsTeacherAuthenticated(false);
    setIsTeacherMode(false);
  };

  // Helper Stats
  const getStats = (student: Student) => {
    let totalScore = 0;
    TASKS_LIST.forEach(task => totalScore += (student[task.id] as number) || 0);
    totalScore += (student.bonus_stars || 0); // Add bonus stars logic

    const maxScore = TASKS_LIST.length * 5;
    const percent = (totalScore / maxScore) * 100;

    let rank = { title: "Hạt Giống", color: "bg-gray-100 text-gray-600" };
    if (percent >= 90) rank = { title: "Đại Sứ Mùa Xuân 🏆", color: "bg-gradient-to-r from-yellow-300 to-yellow-500 text-red-800" };
    else if (percent >= 70) rank = { title: "Hoa Đào Rực Rỡ 🌸", color: "bg-pink-100 text-pink-700" };
    else if (percent >= 40) rank = { title: "Chồi Non Tích Cực 🌿", color: "bg-green-100 text-green-700" };

    return { totalScore, maxScore, percent, rank };
  };

  // --- RENDER TEACHER DASHBOARD ---
  if (isTeacherAuthenticated) {
    return (
      <>
        {isMockMode && <div className="bg-yellow-400 text-red-900 text-center text-[10px] font-bold sticky top-0 z-50">⚠️ DEMO MODE</div>}
        <TeacherDashboard onLogout={handleLogout} />
      </>
    );
  }

  // --- RENDER LOGIN ---
  if (!currentStudent) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${darkMode ? 'bg-gradient-to-b from-red-900 to-gray-900' : 'bg-gradient-to-b from-red-600 to-red-800'}`}>
        <FallingBlossoms />
        <CauDoi />
        {isMockMode && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur rounded-full px-4 py-1 text-white text-xs font-bold border border-white/30 flex items-center gap-2 z-20">
            <Database size={12} /> CHẾ ĐỘ DEMO
          </div>
        )}
        {/* Dark Mode Toggle */}
        <button onClick={() => setDarkMode(!darkMode)} className="absolute top-4 right-4 z-20 p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30 transition">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className={`rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative z-10 border-4 border-yellow-400 animate-fade-in-up ${darkMode ? 'bg-gray-900/90 backdrop-blur' : 'bg-white'}`}>
          <div className="flex flex-col items-center mb-4 gap-2">
            <SchoolLogo />
            <div className="text-center">
              <h1 className={`text-3xl font-hand font-bold mb-1 ${darkMode ? 'text-yellow-400' : 'text-red-600'}`}>Nhật Ký Tết 2026</h1>
              <p className={`font-sans font-bold text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{isTeacherMode ? 'Đăng Nhập GVCN' : 'Lớp 8B03'}</p>
            </div>
          </div>
          {/* Đếm ngược Tết */}
          <div className="mb-4">
            <TetCountdown />
          </div>
          <div className="space-y-4">
            <div>
              <label className={`block text-xs font-bold mb-1 uppercase ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>{isTeacherMode ? 'Tài khoản GVCN' : 'Mã Số Học Sinh'}</label>
              <div className="relative">
                <input type="text" value={studentCode} onChange={(e) => setStudentCode(isTeacherMode ? e.target.value : e.target.value.toUpperCase())}
                  placeholder={isTeacherMode ? 'Tên đăng nhập' : 'Nhập mã số học sinh'} className={`w-full pl-4 pr-10 py-3 border-2 rounded-xl focus:outline-none focus:border-red-500 text-lg font-bold tracking-widest ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'border-red-100'}`} />
                <User className="absolute right-3 top-3.5 text-gray-400" size={20} />
              </div>
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1 uppercase ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Mật khẩu</label>
              <div className="relative">
                <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Nhập mật khẩu" className={`w-full pl-4 pr-10 py-3 border-2 rounded-xl focus:outline-none focus:border-red-500 text-lg ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'border-red-100'}`} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                <Lock className="absolute right-3 top-3.5 text-gray-400" size={20} />
              </div>
            </div>
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
            <button onClick={handleLogin} disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-yellow-300 font-bold py-3 rounded-xl shadow-lg transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
              {loading ? 'Đang kiểm tra...' : <><LogIn size={20} /> {isTeacherMode ? 'Vào Quản Lý' : 'Đăng nhập'}</>}
            </button>
          </div>
          <div className="mt-6 text-center text-xs">
            {!isTeacherMode ? <button onClick={() => { setIsTeacherMode(true); setError(''); setLoginPassword(''); setStudentCode(''); }} className="text-red-600 font-bold hover:underline flex items-center justify-center gap-1 w-full"><ShieldCheck size={14} /> Dành cho GVCN</button>
              : <button onClick={() => { setIsTeacherMode(false); setError(''); setLoginPassword(''); setStudentCode(''); }} className={`font-bold hover:underline ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>← Quay lại Đăng nhập Học sinh</button>}
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN APP RENDER ---
  const { totalScore, maxScore, percent, rank } = getStats(currentStudent);

  // Define Milestones
  const milestones = [
    { pct: 70, label: "70% Sao", reward: "3 Điểm Văn Minh", type: "point" },
    { pct: 80, label: "80% Sao", reward: "+5 Điểm Văn Minh", type: "point" },
    { pct: 90, label: "90% Sao", reward: "+10 Điểm Văn Minh", type: "point" },
    { pct: 95, label: "95% Sao", reward: "+10.000đ Lì Xì", type: "money" },
    { pct: 100, label: "100% Sao", reward: "+20.000đ Lì Xì", type: "money" },
  ];

  return (
    <div className={`min-h-screen relative pb-24 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-tetCream'}`}>
      <FallingBlossoms />
      {isMockMode && <div className="bg-yellow-400 text-red-900 text-center text-[10px] py-1 font-bold sticky top-0 z-50">⚠️ Chế độ Demo</div>}
      {toast.show && <div className="fixed top-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-2 rounded-full shadow-xl animate-fade-in-down flex items-center gap-2 whitespace-nowrap"><CheckCircle size={18} /> {toast.msg}</div>}

      {/* Change Pass Modal */}
      {showPassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative animate-fade-in shadow-2xl">
            <button onClick={() => setShowPassModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
            <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2"><Key size={20} /> Đổi Mật Khẩu</h3>
            <div className="space-y-3">
              <div><label className="text-xs font-bold text-gray-500">Mật khẩu hiện tại</label><input type="password" className="w-full p-3 border rounded-lg" value={passForm.current} onChange={e => setPassForm({ ...passForm, current: e.target.value })} /></div>
              <div><label className="text-xs font-bold text-gray-500">Mật khẩu mới</label><input type="password" className="w-full p-3 border rounded-lg" value={passForm.new} onChange={e => setPassForm({ ...passForm, new: e.target.value })} /></div>
              <div><label className="text-xs font-bold text-gray-500">Nhập lại</label><input type="password" className="w-full p-3 border rounded-lg" value={passForm.confirm} onChange={e => setPassForm({ ...passForm, confirm: e.target.value })} /></div>
              {passError && <div className="text-red-500 text-sm font-bold">{passError}</div>}
              <button onClick={handleChangePassword} disabled={passLoading} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg shadow mt-2 hover:bg-red-700 disabled:bg-gray-400">{passLoading ? 'Đang xử lý...' : 'Lưu Thay Đổi'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Banner */}
      <BroadcastBanner />
      {/* Leaderboard Modal */}
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
      {showLiXi && currentStudent && (
        <LiXiGame
          studentName={currentStudent.full_name}
          onClose={() => setShowLiXi(false)}
          onOpen={() => {
            const reward = Math.floor(Math.random() * 6) + 5; // 5-10 stars
            handleHiddenTask('lixi_lucky', reward, 'Lì xì may mắn đầu năm!');
          }}
        />
      )}

      {showTimeline && <ClassTimeline onBack={() => setShowTimeline(false)} darkMode={darkMode} />}
      {showAvatarEditor && currentStudent && (
        <AvatarEditor
          student={currentStudent}
          onClose={() => setShowAvatarEditor(false)}
          onUpdate={async () => {
            // Refresh student data
            if (currentStudent) {
              const { data } = await getStudent(currentStudent.student_code);
              if (data) setCurrentStudent(data);
            }
          }}
          totalScore={totalScore}
        />
      )}

      {/* Header */}
      <header className={`${darkMode ? 'bg-red-900' : 'bg-red-600'} text-yellow-300 p-3 sm:p-4 pb-8 shadow-lg sticky top-0 z-30 rounded-b-[2rem]`}>
        <div className="flex justify-between items-start max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <SchoolLogo />
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-hand truncate max-w-[150px] sm:max-w-xs">{currentStudent.full_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm ${rank.color}`}>{rank.title}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap justify-end">
            <button onClick={() => setShowAvatarEditor(true)} className="p-2 bg-pink-500 rounded-full text-white hover:bg-pink-600 transition shadow-inner flex items-center gap-1 animate-bounce duration-[2000ms]"><Shirt size={16} /></button>
            <button onClick={() => setShowLeaderboard(true)} className="p-2 bg-yellow-400 rounded-full text-red-800 hover:bg-yellow-300 transition shadow-inner"><Trophy size={16} /></button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 bg-red-700 rounded-full text-white hover:bg-red-800 transition shadow-inner">{darkMode ? <Sun size={16} /> : <Moon size={16} />}</button>
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 bg-red-700 rounded-full text-white hover:bg-red-800 transition shadow-inner">{soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}</button>
            <button onClick={() => setShowPassModal(true)} className="p-2 bg-red-700 rounded-full text-white hover:bg-red-800 transition shadow-inner"><Key size={16} /></button>
            <button onClick={handleLogout} className="text-xs bg-red-800 px-3 py-1 rounded-full text-white hover:bg-red-900 transition flex items-center shadow-inner">Thoát</button>
          </div>
        </div>

        {/* Đếm Ngược Tết */}
        <div className="max-w-2xl mx-auto mt-3 px-1">
          <TetCountdown />
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mt-3 px-1">
          <div className="flex justify-between text-xs text-red-100 mb-1 font-bold">
            <span>Điểm tích lũy: {totalScore}/{maxScore}</span>
            <span>{Math.round(percent)}%</span>
          </div>
          <div className="w-full bg-red-900/40 rounded-full h-3 shadow-inner overflow-hidden border border-red-500/30">
            <div className="bg-yellow-400 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,214,10,0.7)] relative" style={{ width: `${percent}%` }}>
              <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4 relative z-10 -mt-6">

        {/* REWARD LIST BOX */}
        <div className={`rounded-xl shadow-lg border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-3 border-b border-red-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="text-red-500" size={20} />
              <span className="font-bold text-red-800">Tháp Phần Thưởng</span>
            </div>
            <span className="text-xs text-gray-500 italic">Cộng dồn các mốc</span>
          </div>

          <div className="divide-y divide-gray-100">
            {milestones.map((m, idx) => {
              const isReached = percent >= m.pct;
              const isUnlocked = isReached && currentStudent.parent_confirm;

              return (
                <div key={idx} className={`flex items-center justify-between p-3 ${isUnlocked ? 'bg-yellow-50/50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                                    ${isUnlocked ? 'border-green-500 bg-green-100 text-green-600' :
                        isReached ? 'border-orange-400 bg-orange-100 text-orange-600' :
                          'border-gray-200 bg-gray-50 text-gray-300'}`}>
                      {isUnlocked ? <Unlock size={18} /> : (isReached ? <Lock size={18} className="animate-pulse" /> : <Lock size={18} />)}
                    </div>
                    <div>
                      <div className={`text-xs font-bold uppercase ${isReached ? 'text-gray-700' : 'text-gray-400'}`}>{m.label}</div>
                      <div className={`font-bold text-sm ${isUnlocked ? 'text-green-600' : (isReached ? 'text-orange-500' : 'text-gray-400')}`}>
                        {m.reward}
                      </div>
                    </div>
                  </div>
                  {isReached && !isUnlocked && (
                    <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold whitespace-nowrap">Chờ xác nhận</span>
                  )}
                  {isUnlocked && <CheckCircle size={16} className="text-green-500" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* BADGES SECTION */}
        <div className={`rounded-xl shadow-lg border overflow-hidden p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎖️</span>
              <span className={`font-bold ${darkMode ? 'text-yellow-400' : 'text-red-800'}`}>Huy Hiệu Thành Tích</span>
            </div>
            <button
              onClick={() => {
                const text = `🏅 ${currentStudent.full_name} - Nhật Ký Tết 2026\n⭐ ${totalScore}/${maxScore} sao (${Math.round(percent)}%)\n🏆 ${rank.title}\nLớp 8B03 - Trường Ngôi Sao Hoàng Mai`;
                if (navigator.share) {
                  navigator.share({ title: 'Nhật Ký Tết 2026', text })
                    .then(() => {
                      const reward = Math.floor(Math.random() * 5) + 1;
                      handleHiddenTask('share_app', reward, 'Cảm ơn bạn đã chia sẻ!');
                    })
                    .catch(() => { });
                } else {
                  navigator.clipboard.writeText(text);
                  showToast('Đã copy kết quả!');
                  // Also award for copying if sharing is not supported
                  const reward = Math.floor(Math.random() * 5) + 1;
                  handleHiddenTask('share_app', reward, 'Cảm ơn bạn đã chia sẻ!');
                }
              }}
              className="flex items-center gap-1 text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 transition"
            >
              <Share2 size={12} /> Chia sẻ
            </button>
          </div>
          <BadgesDisplay
            percent={percent}
            confirmed={currentStudent.parent_confirm}
            totalScore={totalScore}
            tasks={TASKS_LIST.reduce((acc, t) => ({ ...acc, [t.id]: currentStudent[t.id] as number }), {} as Record<string, number>)}
          />
        </div>

        {/* Guide */}
        <div className={`rounded-xl p-4 shadow-sm border text-sm sm:text-xs flex gap-2 items-start leading-relaxed ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-yellow-200 text-gray-600'}`}>
          <HelpCircle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
          <p>
            <b>Hướng dẫn:</b> Hãy tự đánh giá nhiệm vụ. <br className="block sm:hidden" />
            <span className="text-yellow-600 font-bold whitespace-nowrap">5 sao</span> = Xuất sắc.
            <span className="text-yellow-600 font-bold whitespace-nowrap ml-2">1-2 sao</span> = Cần cố gắng.
          </p>
        </div>

        {/* Cây Đào Lớp */}
        <CayDaoLop darkMode={darkMode} />

        {/* Timeline Button */}
        <button
          onClick={() => setShowTimeline(true)}
          className={`w-full mt-2 py-3 rounded-xl shadow-sm border font-bold flex items-center justify-center gap-2 transition transform hover:scale-[1.02] ${darkMode ? 'bg-gray-800 border-gray-700 text-pink-400 hover:bg-gray-700' : 'bg-white border-pink-200 text-pink-600 hover:bg-pink-50'}`}
        >
          📸 Xem Nhật Ký Ảnh Lớp 8B03
        </button>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 gap-4">
          {TASKS_LIST.map((task) => {
            const today = new Date().toLocaleDateString('en-CA');
            const isLocked = task.unlockDate && task.unlockDate > today;

            return (
              <div key={task.id} className={`p-4 rounded-xl shadow-md border-l-4 transition-all duration-300 relative ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${(currentStudent[task.id] as number) > 0 ? 'border-l-green-500' : 'border-l-gray-300'} ${isLocked ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                {isLocked && (
                  <div className="absolute inset-0 z-20 bg-gray-100/50 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
                    <div className="bg-white/90 p-3 rounded-lg shadow-lg border border-red-200 flex flex-col items-center">
                      <Lock className="text-red-500 mb-1" size={24} />
                      <span className="text-red-800 font-bold text-sm uppercase">{task.unlockLabel}</span>
                      <span className="text-xs text-gray-500 font-mono mt-1">{task.unlockDate?.split('-').reverse().join('/')}</span>
                    </div>
                  </div>
                )}
                <div className="flex gap-3 mb-3">
                  <span className="text-4xl sm:text-3xl">{task.icon}</span>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg font-hand ${darkMode ? 'text-yellow-400' : 'text-red-700'}`}>
                      {task.title} {isLocked && <span className="text-sm text-gray-400 font-sans ml-2">(🔒 Khóa)</span>}
                    </h3>
                    <p className={`text-sm sm:text-xs mt-1 font-medium leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{task.description}</p>
                    <p className={`text-xs sm:text-[10px] mt-2 italic border-t pt-1 border-dashed ${darkMode ? 'text-gray-400 border-gray-600' : 'text-gray-500 border-gray-200'}`}>🎯 {task.criteria}</p>
                  </div>
                </div>
                <div className="border-t pt-3 flex flex-col items-center justify-center gap-2">
                  <StarRating value={currentStudent[task.id] as number} onChange={(val) => handleTaskRating(task.id, val)} disabled={currentStudent.parent_confirm || !!isLocked} />
                  <EvidenceUpload
                    studentCode={currentStudent.student_code}
                    taskId={task.id}
                    darkMode={darkMode}
                    disabled={!!isLocked}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Parent Section */}
        <div className={`mt-8 backdrop-blur rounded-2xl p-6 shadow-xl border-2 ${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-red-100'}`}>
          <h3 className={`text-xl font-bold flex items-center gap-2 mb-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`}><Award className="text-yellow-500" /> Góc Cảm Xúc & Xác Nhận</h3>
          {currentStudent.parent_confirm ? (
            <div className="bg-yellow-50 p-4 rounded-lg text-center border border-yellow-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500"></div>
              <div className="text-green-600 font-bold text-lg mb-2 flex items-center justify-center gap-2"><CheckCircle size={20} /> Đã xác nhận</div>
              <p className="italic text-gray-700 font-hand text-lg leading-relaxed">"{currentStudent.parent_message}"</p>
              <div className="mt-3 text-xs text-gray-400 flex justify-center items-center gap-1"><Star size={10} fill="currentColor" /> Gia đình hạnh phúc <Star size={10} fill="currentColor" /></div>
              <button
                onClick={() => setShowLiXi(true)}
                className="mt-4 bg-red-600 text-yellow-300 font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-red-700 transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 mx-auto text-lg animate-pulse"
              >
                🧧 Bốc Lì Xì May Mắn!
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800 flex gap-2">
                <Info size={16} className="shrink-0 mt-0.5" />
                <p>
                  "Sự trung thực quý giá hơn mọi điểm số." <br />
                  Hãy cùng Ba Mẹ xem lại các nhiệm vụ và ghi lại những kỷ niệm vui vẻ nhé!
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200 cursor-pointer hover:bg-yellow-100 transition" onClick={() => setHonestyPledge(!honestyPledge)}>
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${honestyPledge ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-300'}`}>
                  {honestyPledge && <CheckCircle size={16} />}
                </div>
                <div>
                  <p className="font-bold text-gray-800">Lời Hứa Danh Dự</p>
                  <p className="text-xs text-gray-600">Em xin hứa những điều em tự đánh giá ở trên là hoàn toàn trung thực.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nhật Ký / Lời Nhắn (Của Bố Mẹ)</label>
                <textarea className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base" rows={3} placeholder="VD: Hôm nay con quét nhà rất sạch, mẹ rất vui..." value={parentMessage} onChange={(e) => setParentMessage(e.target.value)}></textarea>
              </div>

              <button
                onClick={() => {
                  if (!honestyPledge) {
                    alert("Em hãy đánh dấu vào 'Lời Hứa Danh Dự' trước nhé!");
                    return;
                  }
                  if (!parentMessage.trim()) {
                    alert("Hãy để lại một lời nhắn hoặc kỷ niệm nhỏ nhé!");
                    document.querySelector('textarea')?.focus();
                    return;
                  }
                  if (window.confirm("Xác nhận: Em đã hoàn thành nhiệm vụ và trung thực với những gì đã báo cáo?")) {
                    handleParentSubmit();
                  }
                }}
                disabled={loading}
                className={`w-full text-white font-bold py-4 rounded-lg shadow flex justify-center items-center gap-2 transition-transform active:scale-95 text-lg ${honestyPledge && parentMessage ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                {loading ? 'Đang gửi...' : <><Save size={20} /> Xác Nhận Hoàn Thành</>}
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center p-4 text-gray-500 text-xs mt-8 pb-10 space-y-1">
        <p className="font-bold text-red-800 uppercase tracking-wide">LỚP 8B03 - Trường TH,THCS & THPT Ngôi Sao Hoàng Mai</p>
        <p>Chúc Mừng Năm Mới 2026</p>
      </footer>
    </div>
  );
};

export default App;