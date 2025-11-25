import React, { useEffect, useState } from 'react';
import { Trash2, User, FileText, RefreshCw, AlertTriangle, Lock } from 'lucide-react';
import { getAllUsersWithItineraries, deleteUserData, deleteFromFirebase, UserSummary } from '../services/firebaseService';

const AdminPage: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'user' | 'file'; id: string; parentId?: string } | null>(null);

    const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            fetchUsers();
        } else {
            setError('密碼錯誤');
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllUsersWithItineraries();
            setUsers(data);
        } catch (err) {
            setError('無法載入用戶資料');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (username: string) => {
        try {
            await deleteUserData(username);
            setUsers(users.filter(u => u.username !== username));
            setDeleteConfirm(null);
        } catch (err) {
            alert('刪除失敗');
        }
    };

    const handleDeleteFile = async (username: string, fileId: string) => {
        try {
            await deleteFromFirebase(username, fileId);
            // Refresh local state
            setUsers(users.map(u => {
                if (u.username === username) {
                    return {
                        ...u,
                        itineraries: u.itineraries.filter(f => f.id !== fileId),
                        itineraryCount: u.itineraryCount - 1
                    };
                }
                return u;
            }).filter(u => u.itineraryCount > 0)); // Remove user if no files left? Optional.
            setDeleteConfirm(null);
        } catch (err) {
            alert('刪除失敗');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 font-serif">
                <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto text-stone-600">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-stone-800">管理員登入</h1>
                        <p className="text-stone-500">請輸入管理密碼以存取後台</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 outline-none"
                            placeholder="密碼"
                        />
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button
                            type="submit"
                            className="w-full py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors font-semibold"
                        >
                            登入
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 font-serif text-stone-800">
            <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <span className="w-8 h-8 bg-stone-800 text-white rounded-lg flex items-center justify-center text-sm">JX</span>
                        後台管理
                    </h1>
                    <button
                        onClick={fetchUsers}
                        disabled={loading}
                        className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                        title="重新整理"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-4 py-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-stone-600">用戶列表 ({users.length})</h2>
                </div>

                {users.length === 0 && !loading && (
                    <div className="text-center py-20 text-stone-400 bg-white rounded-xl border border-stone-200 border-dashed">
                        <p>目前沒有任何資料</p>
                    </div>
                )}

                <div className="grid gap-4">
                    {users.map((user) => (
                        <div key={user.username} className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors"
                                onClick={() => setExpandedUser(expandedUser === user.username ? null : user.username)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{user.username}</h3>
                                        <p className="text-xs text-stone-500">
                                            {user.itineraryCount} 份行程 • 最後更新：{new Date(user.lastUpdated).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteConfirm({ type: 'user', id: user.username });
                                        }}
                                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="刪除用戶"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {expandedUser === user.username && (
                                <div className="border-t border-stone-100 bg-stone-50/50 p-4 space-y-2">
                                    {user.itineraries.map((file) => (
                                        <div key={file.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-stone-200">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-4 h-4 text-stone-400" />
                                                <div>
                                                    <p className="font-medium text-sm">{file.name}</p>
                                                    <p className="text-xs text-stone-400 font-mono">{file.id}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setDeleteConfirm({ type: 'file', id: file.id, parentId: user.username })}
                                                className="text-xs text-red-500 hover:text-red-700 hover:underline px-2 py-1"
                                            >
                                                刪除
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>

            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-stone-900">確定要刪除嗎？</h3>
                            <p className="text-sm text-stone-500 mt-1">
                                {deleteConfirm.type === 'user'
                                    ? `將刪除用戶 "${deleteConfirm.id}" 及其所有行程資料，此動作無法復原。`
                                    : `將刪除行程 "${deleteConfirm.id}"，此動作無法復原。`
                                }
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-2.5 text-stone-600 font-medium hover:bg-stone-100 rounded-lg transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={() => {
                                    if (deleteConfirm.type === 'user') {
                                        handleDeleteUser(deleteConfirm.id);
                                    } else if (deleteConfirm.parentId) {
                                        handleDeleteFile(deleteConfirm.parentId, deleteConfirm.id);
                                    }
                                }}
                                className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                            >
                                確認刪除
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
