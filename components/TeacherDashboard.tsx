import React, { useEffect, useState } from 'react';
import { getAllStudents, resetStudentPassword, updateTask, updateParentConfirm, subscribeToStudents, unsubscribeChannel, getEvidence, deleteEvidence, updateBroadcast, getBroadcast, updateBonusStars, resetStudentData } from '../services/supabaseService';
import { Student, TASKS_LIST, TaskEvidence } from '../types';
import { Search, RefreshCw, CheckCircle, XCircle, Edit, Save, LogOut, Key, Star, Gift, Clock, Lock, Download, FileText, BarChart3, Send, Bell, Filter, Image as ImageIcon, Trash2, Megaphone, LayoutGrid, List } from 'lucide-react';
import AvatarDisplay from './AvatarDisplay';
import { AvatarConfig } from '../avatarData';

interface TeacherDashboardProps {
  onLogout: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onLogout }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentEvidence, setStudentEvidence] = useState<TaskEvidence[]>([]);

  // Broadcast State
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [isBroadcastActive, setIsBroadcastActive] = useState(false);

  // Edit states
  const [editMessage, setEditMessage] = useState('');
  const [processing, setProcessing] = useState(false);

  const [sortOrder, setSortOrder] = useState<'default' | 'stars'>('default');
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_started' | 'in_progress' | 'done' | 'confirmed'>('all');
  const [notification, setNotification] = useState('');
  const [showStats, setShowStats] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'students'>('overview'); // New state for tabs
  const [viewMode, setViewMode] = useState<'list' | 'gallery'>('list'); // Toggle View

  // Bonus Star Modal
  const [bonusModal, setBonusModal] = useState<{ isOpen: boolean, student: Student | null, amount: number, reason: string }>({
    isOpen: false, student: null, amount: 1, reason: ''
  });


  useEffect(() => {
    fetchData();
    // Fetch current broadcast
    getBroadcast().then(({ data }) => {
      if (data) {
        setBroadcastMsg(data.message);
        setIsBroadcastActive(data.is_active);
      }
    });

    // Realtime subscription
    const channel = subscribeToStudents((updatedStudent) => {
      setStudents(prev => prev.map(s =>
        s.student_code === updatedStudent.student_code ? updatedStudent : s
      ));
    });

    return () => {
      if (channel) unsubscribeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await getAllStudents();
    if (data) setStudents(data);
    setLoading(false);
  };

  const handleResetPassword = async (student: Student) => {
    if (!window.confirm(`Xác nhận reset mật khẩu cho em ${student.full_name} về mặc định (${student.student_code})?`)) return;

    setProcessing(true);
    const { error } = await resetStudentPassword(student.student_code);
    setProcessing(false);

    if (!error) {
      alert(`Đã reset mật khẩu cho ${student.full_name} thành công!`);
    } else {
      alert('Có lỗi xảy ra.');
    }
  };

  const openEditModal = async (student: Student) => {
    setSelectedStudent(student);
    setEditMessage(student.parent_message || '');
    // Fetch evidence
    const { data } = await getEvidence(student.student_code);
    if (data) setStudentEvidence(data);
    else setStudentEvidence([]);
  };

  const handleDeleteEvidence = async (id: number, url: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa ảnh minh chứng này?")) return;
    const { error } = await deleteEvidence(id, url);
    if (error) {
      alert("Lỗi xóa ảnh: " + error);
    } else {
      // Refresh evidence list local state
      setStudentEvidence(prev => prev.filter(e => e.id !== id));
    }
  };

  const closeEditModal = () => {
    setSelectedStudent(null);
    fetchData(); // Refresh data to reflect changes
  };

  const handleTaskChange = async (taskKey: string, newValue: number) => {
    if (!selectedStudent) return;

    // Optimistic update
    setSelectedStudent({ ...selectedStudent, [taskKey]: newValue } as any);

    await updateTask(selectedStudent.student_code, taskKey, newValue);
  };

  const handleSaveMessage = async () => {
    if (!selectedStudent) return;
    setProcessing(true);
    await updateParentConfirm(selectedStudent.student_code, true, editMessage);
    setProcessing(false);
    alert('Đã lưu lời chúc/nhận xét!');
    closeEditModal();
  };

  const handleResetAll = async () => {
    if (!selectedStudent) return;
    if (!window.confirm(`⚠️ Nguy hiểm: Bạn có chắc muốn xóa hết sao và hủy xác nhận của em ${selectedStudent.full_name}?`)) return;

    setProcessing(true);
    try {
      // Call centralized reset function
      const { error } = await resetStudentData(selectedStudent.student_code);
      if (error) throw error;

      // Update Local State (Optimistic)
      const updatedStudent = {
        ...selectedStudent,
        parent_confirm: false,
        parent_message: '',
        bonus_stars: 0,
        avatar_config: null,
        completed_hidden_tasks: []
      };
      TASKS_LIST.forEach(t => (updatedStudent as any)[t.id] = 0);

      setSelectedStudent(updatedStudent);

      // Update main list
      setStudents(prev => prev.map(s => s.student_code === selectedStudent.student_code ? updatedStudent : s));

      alert("Đã reset hoàn toàn (kể cả trang phục & sao thưởng) thành công!");
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi reset.");
    } finally {
      setProcessing(false);
    }
  };

  const handleGiveBonus = async () => {
    if (!bonusModal.student) return;
    setProcessing(true);
    await updateBonusStars(bonusModal.student.student_code, bonusModal.amount);

    // Update local state optimistic
    const updatedList = students.map(s => {
      if (s.student_code === bonusModal.student?.student_code) {
        return { ...s, bonus_stars: (s.bonus_stars || 0) + bonusModal.amount };
      }
      return s;
    });
    setStudents(updatedList);

    setProcessing(false);
    alert(`Đã thưởng ${bonusModal.amount} sao cho ${bonusModal.student.full_name}!`);
    setBonusModal({ ...bonusModal, isOpen: false });
  };

  // Real students only (exclude test/teacher accounts)
  const realStudents = students.filter(s =>
    s.class_name && s.class_name !== 'GVCN' && !s.class_name.includes('TEST')
  );

  // Stats calculations
  const stats = (() => {
    const maxScore = TASKS_LIST.length * 5;
    let totalScoreAll = 0;
    let completed100 = 0;
    let confirmed = 0;
    let notStarted = 0;
    let inProgress = 0;

    realStudents.forEach(s => {
      let score = 0;
      TASKS_LIST.forEach(t => score += (s[t.id] as number));
      totalScoreAll += score;
      const pct = (score / maxScore) * 100;
      if (pct >= 100) completed100++;
      if (s.parent_confirm) confirmed++;
      if (score === 0) notStarted++;
      else if (pct < 100) inProgress++;
    });

    return {
      total: realStudents.length,
      completed100,
      confirmed,
      notStarted,
      inProgress,
      avgScore: realStudents.length > 0 ? (totalScoreAll / realStudents.length).toFixed(1) : '0',
      maxScore,
    };
  })();

  // CSV Export
  const exportCSV = () => {
    const maxScore = TASKS_LIST.length * 5;
    const header = ['STT', 'Mã HS', 'Họ Tên', ...TASKS_LIST.map(t => t.title), 'Tổng Sao', '% Hoàn Thành', 'PH Xác Nhận', 'Lời nhắn PH'];
    const rows = realStudents
      .sort((a, b) => a.student_code.localeCompare(b.student_code))
      .map((s, i) => {
        const scores = TASKS_LIST.map(t => s[t.id] as number);
        const total = scores.reduce((a, b) => a + b, 0);
        return [
          i + 1, s.student_code, s.full_name, ...scores, total,
          Math.round((total / maxScore) * 100) + '%',
          s.parent_confirm ? 'Có' : 'Chưa',
          s.parent_message || ''
        ];
      });

    const BOM = '\uFEFF';
    const csv = BOM + [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NhatKyTet_8B03_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredStudents = realStudents.filter(s => {
    const matchSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || s.student_code.includes(searchTerm);
    if (!matchSearch) return false;

    if (statusFilter === 'all') return true;
    let score = 0;
    TASKS_LIST.forEach(t => score += (s[t.id] as number));
    const pct = (score / (TASKS_LIST.length * 5)) * 100;

    if (statusFilter === 'not_started') return score === 0;
    if (statusFilter === 'in_progress') return score > 0 && pct < 100;
    if (statusFilter === 'done') return pct >= 100;
    if (statusFilter === 'confirmed') return s.parent_confirm;
    return true;
  }).sort((a, b) => {
    if (sortOrder === 'default') {
      return a.student_code.localeCompare(b.student_code);
    } else {
      const scoreA = TASKS_LIST.reduce((acc, t) => acc + (a[t.id] as number), 0);
      const scoreB = TASKS_LIST.reduce((acc, t) => acc + (b[t.id] as number), 0);
      return scoreB - scoreA; // Descending
    }
  });

  // Duplicate calculation logic here for display
  const calculateRewards = (totalStars: number) => {
    const maxStars = TASKS_LIST.length * 5;
    const percent = (totalStars / maxStars) * 100;
    let civilPoints = 0;
    let money = 0;

    if (percent > 70) civilPoints += 3;
    if (percent > 80) civilPoints += 5;
    if (percent > 90) civilPoints += 10;
    if (percent > 95) money += 10000;
    if (percent >= 100) money += 20000;

    return { civilPoints, money, percent };
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-red-700 text-white p-4 shadow-lg sticky top-0 z-30 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold font-hand">Trang Quản Lý GVCN</h1>
          <p className="text-xs text-red-100">Lớp 8B03 - Sĩ số: {stats.total}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="bg-green-600 p-2 rounded hover:bg-green-700 flex items-center gap-1 text-sm" title="Xuất Excel">
            <Download size={16} /> CSV
          </button>
          <button onClick={onLogout} className="bg-red-800 p-2 rounded hover:bg-red-900 flex items-center gap-1 text-sm">
            <LogOut size={16} /> Thoát
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">

        {/* BROADCAST CONTROL */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-yellow-200 mb-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3"><Megaphone className="text-red-500" /> Gửi Thông Báo (Banner chạy chữ)</h3>
          <div className="flex gap-2 flex-col sm:flex-row">
            <input
              type="text"
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              placeholder="Nhập nội dung thông báo..."
              className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  const newState = !isBroadcastActive;
                  setIsBroadcastActive(newState);
                  await updateBroadcast(broadcastMsg, newState);
                  alert(`Đã ${newState ? 'BẬT' : 'TẮT'} thông báo!`);
                }}
                className={`px-4 py-2 rounded-lg font-bold w-32 ${isBroadcastActive ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-500 border border-gray-300'}`}
              >
                {isBroadcastActive ? 'Đang HIỆN' : 'Đang ẨN'}
              </button>
              <button
                onClick={async () => {
                  await updateBroadcast(broadcastMsg, isBroadcastActive);
                  alert("Đã cập nhật nội dung!");
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
              >
                <Send size={18} /> Cập nhật
              </button>
            </div>
          </div>
        </div>

        {/* STATS OVERVIEW */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800 flex items-center gap-2"><BarChart3 size={18} className="text-red-600" /> Tổng Quan</h2>
            <button onClick={() => setShowStats(!showStats)} className="text-xs text-gray-400 hover:text-gray-600">{showStats ? 'Ẩn' : 'Hiện'}</button>
          </div>
          {showStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                <div className="text-[10px] text-blue-500 font-bold">Tổng HS</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
                <div className="text-2xl font-bold text-green-700">{stats.confirmed}</div>
                <div className="text-[10px] text-green-500 font-bold">PH Xác Nhận</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-100">
                <div className="text-2xl font-bold text-orange-700">{stats.notStarted}</div>
                <div className="text-[10px] text-orange-500 font-bold">Chưa Làm</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-100">
                <div className="text-2xl font-bold text-yellow-700">{stats.avgScore}</div>
                <div className="text-[10px] text-yellow-600 font-bold">TB Sao / {stats.maxScore}</div>
              </div>
            </div>
          )}
        </div>

        {/* VIEW TOGGLE & SEARCH */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center">
          {/* View Mode Toggle */}
          <div className="bg-white p-1 rounded-lg shadow border border-gray-200 flex gap-1 shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded flex items-center gap-2 text-sm font-bold transition ${viewMode === 'list' ? 'bg-red-100 text-red-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <List size={18} /> Danh sách
            </button>
            <button
              onClick={() => setViewMode('gallery')}
              className={`px-3 py-2 rounded flex items-center gap-2 text-sm font-bold transition ${viewMode === 'gallery' ? 'bg-red-100 text-red-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <LayoutGrid size={18} /> Xem Nhân Vật
            </button>
          </div>

          {/* Search */}
          <div className="bg-white p-2 rounded-lg shadow border border-gray-200 flex gap-2 flex-1 w-full">
            <div className="p-2"><Search className="text-gray-400" size={20} /></div>
            <input
              type="text"
              placeholder="Tìm tên hoặc mã số HS..."
              className="flex-1 outline-none text-gray-700 text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* STATUS FILTER TABS */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 text-xs">
          {[
            { key: 'all', label: `Tất cả (${stats.total})`, color: 'gray' },
            { key: 'not_started', label: `Chưa làm (${stats.notStarted})`, color: 'orange' },
            { key: 'in_progress', label: `Đang làm (${stats.inProgress})`, color: 'blue' },
            { key: 'done', label: `Hoàn thành (${stats.completed100})`, color: 'green' },
            { key: 'confirmed', label: `PH duyệt (${stats.confirmed})`, color: 'emerald' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-full font-bold border whitespace-nowrap transition ${statusFilter === tab.key
                ? `bg-${tab.color}-600 text-white border-${tab.color}-600`
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setSortOrder('default')}
            className={`px-4 py-2 rounded-full text-sm font-bold border transition ${sortOrder === 'default' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200'}`}
          >
            A-Z Mặc định
          </button>
          <button
            onClick={() => setSortOrder('stars')}
            className={`px-4 py-2 rounded-full text-sm font-bold border transition flex items-center gap-1 ${sortOrder === 'stars' ? 'bg-yellow-400 text-red-800 border-yellow-400' : 'bg-white text-gray-600 border-gray-200'}`}
          >
            <Star size={14} fill={sortOrder === 'stars' ? "currentColor" : "none"} /> Xếp hạng Sao
          </button>
        </div>

        {
          loading ? (
            <div className="text-center py-10 text-gray-500">Đang tải danh sách...</div>
          ) : viewMode === 'gallery' ? (
            /* GALLERY VIEW */
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredStudents.map(student => {
                let totalScore = 0;
                TASKS_LIST.forEach(t => totalScore += (student[t.id] as number));
                const maxScore = TASKS_LIST.length * 5;
                const percent = (totalScore / maxScore) * 100;
                const isConfirmed = student.parent_confirm;

                return (
                  <div key={student.student_code} className="bg-white rounded-xl shadow border border-gray-100 hover:shadow-lg transition overflow-hidden relative group">
                    {/* Rank Badge */}
                    <div className="absolute top-2 left-2 z-10 bg-yellow-400 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                      {totalScore} ⭐
                    </div>

                    {/* Avatar Preview */}
                    <div className="bg-gradient-to-b from-blue-50 to-white p-2 pt-4 relative">
                      <div className="transform scale-[0.85] origin-bottom hover:scale-100 transition duration-300">
                        <AvatarDisplay config={student.avatar_config as AvatarConfig} />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3 border-t border-gray-100">
                      <h3 className="font-bold text-gray-800 text-center truncate text-sm">{student.full_name}</h3>
                      <p className="text-center text-xs text-gray-500 mb-2">{student.student_code}</p>

                      {/* Items Summary */}
                      <div className="flex justify-center gap-1 mb-2">
                        {student.avatar_config?.outfit?.includes('outfit_') && student.avatar_config.outfit !== 'outfit_none' && <span title="Có trang phục" className="text-[10px] bg-purple-100 text-purple-600 px-1 py-0.5 rounded">👕</span>}
                        {student.avatar_config?.hat?.includes('hat_') && student.avatar_config.hat !== 'hat_none' && <span title="Có mũ" className="text-[10px] bg-orange-100 text-orange-600 px-1 py-0.5 rounded">👒</span>}
                        {student.avatar_config?.vehicle?.includes('veh_') && student.avatar_config.vehicle !== 'veh_none' && <span title="Có xe" className="text-[10px] bg-blue-100 text-blue-600 px-1 py-0.5 rounded">🚲</span>}
                      </div>

                      <button
                        onClick={() => openEditModal(student)}
                        className="w-full bg-blue-50 text-blue-600 text-xs font-bold py-1.5 rounded hover:bg-blue-100"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredStudents.map(student => {
                let totalScore = 0;
                TASKS_LIST.forEach(t => totalScore += (student[t.id] as number));
                const maxScore = TASKS_LIST.length * 5;
                const { civilPoints, money, percent } = calculateRewards(totalScore);
                const isConfirmed = student.parent_confirm;

                return (
                  <div key={student.student_code} className={`bg-white p-4 rounded-xl shadow border-l-4 hover:shadow-lg transition relative ${isConfirmed ? 'border-l-green-500' : 'border-l-orange-500'}`}>
                    {/* Rank Badge */}
                    {sortOrder === 'stars' && (
                      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-yellow-400 text-red-800 font-bold flex items-center justify-center border-2 border-white shadow-md z-10">
                        #{filteredStudents.indexOf(student) + 1}
                      </div>
                    )}

                    {/* Parent Confirm Status Badge */}
                    <div className="absolute top-2 right-2">
                      {isConfirmed ? (
                        <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1">
                          <CheckCircle size={10} /> Đã duyệt
                        </span>
                      ) : (
                        <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1">
                          <Clock size={10} /> Chờ PH
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-start mb-2 pr-16">
                      <div>
                        <h3 className="font-bold text-gray-800">{student.full_name}</h3>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{student.student_code}</span>
                      </div>
                    </div>

                    {/* Mini Progress Bar */}
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                      <span>Tiến độ: {Math.round(percent)}%</span>
                      <span>{totalScore}/{maxScore} sao</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div className={`h-2 rounded-full transition-all ${isConfirmed ? 'bg-green-500' : 'bg-orange-400'}`} style={{ width: `${percent}%` }}></div>
                    </div>

                    {/* Reward Summary */}
                    <div className="flex gap-2 mb-3 text-xs">
                      <div className={`px-2 py-1 rounded border flex items-center gap-1 ${isConfirmed && civilPoints > 0 ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'bg-gray-50 text-gray-400'}`}>
                        {isConfirmed ? <CheckCircle size={10} /> : <Lock size={10} />} +{civilPoints} Điểm
                      </div>
                      <div className={`px-2 py-1 rounded border flex items-center gap-1 ${isConfirmed && money > 0 ? 'bg-red-50 border-red-200 text-red-700 font-bold' : 'bg-gray-50 text-gray-400'}`}>
                        {isConfirmed ? <Gift size={10} /> : <Lock size={10} />} +{money > 0 ? money / 1000 + 'k' : '0đ'}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => openEditModal(student)}
                        className="flex-1 bg-blue-50 text-blue-600 py-2 rounded text-sm font-bold hover:bg-blue-100 flex justify-center items-center gap-1"
                      >
                        <Edit size={14} /> Chấm điểm
                      </button>
                      <button
                        onClick={() => setBonusModal({ isOpen: true, student: student, amount: 1, reason: 'Thưởng nóng' })}
                        className="bg-yellow-100 text-yellow-700 p-2 rounded hover:bg-yellow-200 text-xs flex flex-col items-center justify-center w-16"
                        title="Thưởng sao"
                      >
                        <Star size={14} fill="currentColor" />
                        <span className="scale-75">Thưởng</span>
                      </button>
                      <button
                        onClick={() => handleResetPassword(student)}
                        className="bg-gray-100 text-gray-600 p-2 rounded hover:bg-gray-200 text-xs flex flex-col items-center justify-center w-16"
                        title="Reset Mật khẩu về mặc định"
                      >
                        <RefreshCw size={14} />
                        <span className="scale-75">Reset</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        }
      </main >

      {/* Modal Edit Detail */}
      {
        selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
              <button onClick={closeEditModal} className="absolute top-4 right-4 text-gray-400 hover:text-black"><XCircle /></button>

              <h2 className="text-2xl font-bold text-red-600 mb-1">{selectedStudent.full_name}</h2>
              <p className="text-sm text-gray-500 mb-4">Mã số: {selectedStudent.student_code}</p>

              {/* Password Info */}
              <div className="bg-yellow-50 p-3 rounded-lg mb-4 text-sm flex items-center justify-between">
                <span className="text-yellow-800 font-bold flex items-center gap-2">
                  <Key size={16} /> Mật khẩu hiện tại:
                  <span className="font-mono bg-white px-2 py-0.5 rounded border">
                    {selectedStudent.password || selectedStudent.student_code}
                  </span>
                </span>
                <button
                  onClick={() => handleResetPassword(selectedStudent)}
                  className="text-xs text-blue-600 underline"
                >
                  Reset
                </button>
              </div>

              <div className="flex justify-end mb-4">
                <button
                  onClick={handleResetAll}
                  disabled={processing}
                  className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 font-bold flex items-center gap-1"
                >
                  <RefreshCw size={12} className={processing ? "animate-spin" : ""} /> {processing ? "Đang xử lý..." : "Reset Tất Cả (Sao + Duyệt)"}
                </button>
              </div>

              {/* Reward Detail in Modal */}
              {(() => {
                let totalScore = 0;
                TASKS_LIST.forEach(t => totalScore += (selectedStudent[t.id] as number) || 0);
                totalScore += (selectedStudent.bonus_stars || 0);
                const { civilPoints, money } = calculateRewards(totalScore);
                const isConfirmed = selectedStudent.parent_confirm;

                return (
                  <div className={`p-4 rounded-xl border mb-4 flex items-center justify-between ${isConfirmed ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : 'bg-gray-100 border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <Gift className={isConfirmed ? "text-green-600" : "text-gray-400"} />
                      <div>
                        <div className="text-xs text-gray-500 font-bold uppercase mb-1">
                          Tổng Phần Thưởng {isConfirmed ? '(Đã duyệt)' : '(Chờ PH duyệt)'}
                        </div>
                        <div className={`font-bold ${isConfirmed ? 'text-green-800' : 'text-gray-500'}`}>
                          +{civilPoints} điểm Văn Minh
                          {money > 0 && <span className={`${isConfirmed ? 'text-red-600' : 'text-gray-500'} ml-1`}> & {money / 1000}k Lì Xì</span>}
                        </div>
                      </div>
                    </div>
                    {!isConfirmed && <Lock className="text-gray-400" />}
                  </div>
                )
              })()}

              {/* Tasks */}
              <h3 className="font-bold text-gray-700 mb-2">Chấm điểm chi tiết</h3>
              <div className="grid grid-cols-1 gap-2 mb-6 max-h-60 overflow-y-auto pr-2">
                {TASKS_LIST.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 group">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xl">{task.icon}</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{task.title}</span>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {studentEvidence.filter(e => e.task_id === task.id).map((e, idx) => (
                            <div key={idx} className="relative group w-8 h-8">
                              <a href={e.image_url} target="_blank" rel="noreferrer" className="block w-full h-full rounded overflow-hidden border hover:scale-150 transition-transform origin-bottom-left relative z-10" title="Xem ảnh minh chứng">
                                <img src={e.image_url} className="w-full h-full object-cover" alt="evidence" />
                              </a>
                              <button
                                onClick={() => handleDeleteEvidence(e.id, e.image_url)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition z-20 scale-75 hover:scale-100 shadow-sm"
                                title="Xóa ảnh"
                              >
                                <XCircle size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <input
                      type="number"
                      min="0" max="5" step="0.5"
                      className="w-16 border rounded p-1 text-center font-bold"
                      value={selectedStudent[task.id] as number}
                      onChange={(e) => handleTaskChange(task.id, parseFloat(e.target.value))}
                    />
                  </div>
                ))}
              </div>

              {/* Teacher Message */}
              <h3 className="font-bold text-gray-700 mb-2">Lời chúc / Nhận xét của GVCN</h3>
              <textarea
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-red-500 outline-none mb-4"
                rows={3}
                placeholder="Nhập lời nhận xét..."
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
              ></textarea>

              <button
                onClick={handleSaveMessage}
                disabled={processing}
                className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 flex justify-center items-center gap-2"
              >
                <Save size={18} /> {selectedStudent.parent_confirm ? 'Lưu Thay Đổi' : 'Xác Nhận Thay PH & Lưu'}
              </button>
            </div>
          </div>
        )
      }

      {/* BONUS STAR MODAL */}
      {
        bonusModal.isOpen && bonusModal.student && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Star className="text-yellow-400 fill-yellow-400" /> Thưởng Sao
              </h3>
              <p className="mb-4">Học sinh: <b>{bonusModal.student.full_name}</b></p>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {[1, 2, 5, 10].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setBonusModal({ ...bonusModal, amount: amt })}
                    className={`py-2 rounded font-bold border ${bonusModal.amount === amt ? 'bg-yellow-400 border-yellow-500 text-red-900' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <label className="text-xs font-bold text-gray-500">Số lượng tùy chỉnh:</label>
                <input
                  type="number"
                  value={bonusModal.amount}
                  onChange={(e) => setBonusModal({ ...bonusModal, amount: Number(e.target.value) })}
                  className="w-full border p-2 rounded mt-1 font-bold text-center text-lg"
                />
              </div>

              <div className="flex gap-2">
                <button onClick={() => setBonusModal({ ...bonusModal, isOpen: false })} className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-bold">Hủy</button>
                <button onClick={handleGiveBonus} disabled={processing} className="flex-1 px-4 py-2 bg-yellow-400 text-red-800 rounded-lg hover:bg-yellow-300 font-bold border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all">
                  {processing ? 'Đang gửi...' : 'Xác Nhận'}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default TeacherDashboard;