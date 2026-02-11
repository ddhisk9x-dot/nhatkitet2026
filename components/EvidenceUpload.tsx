import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, X, Loader2, Trash2 } from 'lucide-react';
import { getEvidence, uploadEvidence, deleteEvidence } from '../services/supabaseService';
import { TaskEvidence } from '../types';
import { compressImage } from '../utils/imageCompression';

interface EvidenceUploadProps {
    studentCode: string;
    taskId: string;
    darkMode?: boolean;
    disabled?: boolean;
}

const EvidenceUpload: React.FC<EvidenceUploadProps> = ({ studentCode, taskId, darkMode, disabled }) => {
    const [evidences, setEvidences] = useState<TaskEvidence[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchEvidence();
    }, [studentCode, taskId]);

    const fetchEvidence = async () => {
        setLoading(true);
        const { data } = await getEvidence(studentCode, taskId);
        if (data) setEvidences(data);
        setLoading(false);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        let file = e.target.files[0];

        // 1. Compress Image
        try {
            if (file.type.startsWith('image/')) {
                file = await compressImage(file, 1920, 0.8);
            }
        } catch (err) {
            console.error("Compression error:", err);
            // Continue with original file if compression fails
        }

        // Check file size (max 5MB after compression)
        if (file.size > 5 * 1024 * 1024) {
            alert("File quá lớn! Vui lòng chọn ảnh dưới 5MB.");
            return;
        }

        setUploading(true);
        const { data, error } = await uploadEvidence(studentCode, taskId, file);
        setUploading(false);

        if (error) {
            alert("Lỗi upload: " + (error.message || error));
        } else {
            // Refresh list
            fetchEvidence();
        }
    };

    const handleDelete = async (id: number, url: string) => {
        if (!window.confirm("Bạn có chắc muốn xóa ảnh này?")) return;
        const { error } = await deleteEvidence(id, url);
        if (error) {
            alert("Lỗi xóa ảnh: " + error);
        } else {
            fetchEvidence();
        }
    };

    return (
        <div className="mt-2">
            {/* Mini Preview & Button */}
            <div className="flex items-center gap-2">
                {evidences.length > 0 ? (
                    <div
                        className="relative cursor-pointer group"
                        onClick={() => setShowModal(true)}
                    >
                        <img
                            src={evidences[0].image_url}
                            alt="Minh chứng"
                            className="w-10 h-10 object-cover rounded-lg border border-gray-300"
                        />
                        {evidences.length > 1 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                                {evidences.length}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-10 h-10 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                        <ImageIcon size={16} />
                    </div>
                )}

                <label className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition ${uploading || disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer'}`}>
                    {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    {evidences.length > 0 ? 'Thêm ảnh' : 'Up ảnh'}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={uploading || disabled}
                    />
                </label>
            </div>

            {/* Full Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setShowModal(false)}>
                    <div className={`relative w-full max-w-2xl rounded-2xl p-4 overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                        >
                            <X size={20} />
                        </button>

                        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Ảnh minh chứng</h3>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto">
                            {evidences.map((e) => (
                                <div key={e.id} className="relative group">
                                    <img
                                        src={e.image_url}
                                        alt="Evidence"
                                        className="w-full aspect-square object-cover rounded-xl shadow-sm border"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-xl"></div>
                                    <a
                                        href={e.image_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="absolute bottom-2 right-2 bg-white/90 text-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition shadow-sm"
                                    >
                                        Xem full
                                    </a>
                                    <button
                                        onClick={(evt) => {
                                            evt.stopPropagation();
                                            handleDelete(e.id, e.image_url);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-red-600"
                                        title="Xóa ảnh"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex justify-between items-center border-t pt-4">
                            <span className="text-sm text-gray-500">{evidences.length} ảnh đã tải lên</span>
                            <label className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm cursor-pointer hover:bg-blue-700 flex items-center gap-2">
                                <Upload size={16} /> Tải thêm ảnh
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EvidenceUpload;
