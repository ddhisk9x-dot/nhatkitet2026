import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, User, Calendar } from 'lucide-react';
import { getAllEvidence, getAllStudents } from '../services/supabaseService';
import { TaskEvidence, Student, TASKS_LIST } from '../types';

interface ClassTimelineProps {
    onBack: () => void;
    darkMode?: boolean;
}

const ClassTimeline: React.FC<ClassTimelineProps> = ({ onBack, darkMode }) => {
    const [evidenceList, setEvidenceList] = useState<TaskEvidence[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [evidenceRes, studentsRes] = await Promise.all([
                getAllEvidence(),
                getAllStudents()
            ]);

            if (evidenceRes.data) setEvidenceList(evidenceRes.data);
            if (studentsRes.data) setStudents(studentsRes.data);
            setLoading(false);
        };
        fetchData();
    }, []);

    const getStudentName = (code: string) => {
        const s = students.find(st => st.student_code === code);
        return s ? s.full_name : code;
    };

    const getTaskInfo = (taskId: string) => {
        return TASKS_LIST.find(t => t.id === taskId) || { title: 'Nhiệm vụ', icon: '📝' };
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
            {/* Header */}
            <div className={`sticky top-0 z-20 p-4 shadow-md flex items-center justify-between ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 font-bold hover:opacity-70 transition"
                >
                    <ArrowLeft size={20} /> Quay lại
                </button>
                <h1 className="text-xl font-bold font-hand text-center flex-1">📸 Nhật Ký Ảnh Lớp 8B03</h1>
                <div className="w-20"></div> {/* Spacer */}
            </div>

            {/* Content */}
            <div className="p-4 max-w-6xl mx-auto">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
                    </div>
                ) : evidenceList.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 italic">
                        Chưa có hình ảnh nào được tải lên...
                    </div>
                ) : (
                    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                        {evidenceList.map((item) => {
                            const studentName = getStudentName(item.student_code);
                            const task = getTaskInfo(item.task_id);

                            return (
                                <div key={item.id} className={`break-inside-avoid rounded-xl overflow-hidden shadow-lg border hover:shadow-2xl transition duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                    <div className="relative group">
                                        <img
                                            src={item.image_url}
                                            alt="Evidence"
                                            className="w-full h-auto object-cover"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition"></div>
                                        <a href={item.image_url} target="_blank" rel="noreferrer" className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition backdrop-blur">
                                            🔍
                                        </a>
                                    </div>

                                    <div className="p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                                {studentName.charAt(studentName.lastIndexOf(' ') + 1) || studentName.charAt(0)}
                                            </div>
                                            <div className="overflow-hidden">
                                                <h3 className="font-bold text-sm truncate">{studentName}</h3>
                                                <p className="text-[10px] text-gray-500 truncate" title={studentName}>Mã: {item.student_code}</p>
                                            </div>
                                        </div>

                                        <div className={`rounded-lg p-2 text-xs mb-2 flex items-center gap-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                            <span className="text-lg">{task.icon}</span>
                                            <span className="font-medium line-clamp-1">{task.title}</span>
                                        </div>

                                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                                            <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(item.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassTimeline;
