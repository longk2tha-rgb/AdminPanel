// DeCuongMate Admin Panel - Entry Component
import React, { useState, useEffect } from 'react';
import {
    FirebaseUser,
    subscribeToAllUsers,
    createUser,
    updateUser,
    deleteUser,
    addCredits,
    toggleProTier,
    resetAllCredits,
    upgradeAllToPro,
} from './services/firebaseService';

type Tier = 'free' | 'pro';

const DeCuongMateAdmin: React.FC = () => {
    const [users, setUsers] = useState<FirebaseUser[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<FirebaseUser | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState<Partial<FirebaseUser>>({});
    const [stats, setStats] = useState({ totalUsers: 0, proUsers: 0, totalCredits: 0 });
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUserForm, setNewUserForm] = useState({ email: '', password: '', name: '', credits: 3 });
    const [isLoading, setIsLoading] = useState(true);

    // Subscribe to real-time updates from Firebase
    useEffect(() => {
        const unsubscribe = subscribeToAllUsers((firebaseUsers) => {
            setUsers(firebaseUsers);

            // Calculate stats
            const proCount = firebaseUsers.filter(u => u.tier === 'pro').length;
            const totalCreds = firebaseUsers.reduce((sum, u) => sum + (u.credits || 0), 0);
            setStats({
                totalUsers: firebaseUsers.length,
                proUsers: proCount,
                totalCredits: totalCreds,
            });
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleEditUser = (user: FirebaseUser) => {
        setSelectedUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            password: user.password,
            credits: user.credits,
            downloadsLeft: user.downloadsLeft,
            tier: user.tier,
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedUser) return;

        const updates: Partial<FirebaseUser> = {
            name: editForm.name || selectedUser.name,
            credits: Number(editForm.credits) || 0,
            downloadsLeft: editForm.tier === 'pro' ? 999999 : (Number(editForm.downloadsLeft) || 0),
            tier: (editForm.tier as Tier) || selectedUser.tier,
        };

        if (editForm.email) {
            updates.email = editForm.email;
        }

        if (editForm.password) {
            updates.password = editForm.password;
        }

        const success = await updateUser(selectedUser.id, updates);

        if (success) {
            setIsEditModalOpen(false);
            setSelectedUser(null);
            showNotification('success', '✅ Cập nhật thành công! (Real-time sync)');
        } else {
            showNotification('error', 'Lỗi khi cập nhật!');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Bạn có chắc muốn xóa user này?')) return;

        const success = await deleteUser(userId);
        if (success) {
            showNotification('success', '🗑️ Đã xóa user!');
        } else {
            showNotification('error', 'Lỗi khi xóa!');
        }
    };

    const handleAddCredits = async (userId: string, amount: number) => {
        const success = await addCredits(userId, amount);
        if (success) {
            showNotification('success', `💰 Đã thêm ${amount} credits!`);
        } else {
            showNotification('error', 'Lỗi khi thêm credits!');
        }
    };

    const handleTogglePro = async (userId: string) => {
        const success = await toggleProTier(userId);
        if (success) {
            showNotification('success', '⭐ Đã cập nhật tier!');
        } else {
            showNotification('error', 'Lỗi khi cập nhật tier!');
        }
    };

    const handleAddNewUser = async () => {
        if (!newUserForm.email || !newUserForm.password) {
            showNotification('error', 'Vui lòng nhập đủ thông tin!');
            return;
        }

        if (users.some(u => u.email === newUserForm.email)) {
            showNotification('error', 'Email đã tồn tại!');
            return;
        }

        const newUser = await createUser({
            email: newUserForm.email,
            password: newUserForm.password,
            name: newUserForm.name || newUserForm.email,
            tier: 'free',
            credits: newUserForm.credits || 3,
            downloadsLeft: 3,
            createdAt: Date.now(),
        });

        if (newUser) {
            setIsAddUserModalOpen(false);
            setNewUserForm({ email: '', password: '', name: '', credits: 3 });
            showNotification('success', '👤 Đã thêm user mới!');
        } else {
            showNotification('error', 'Lỗi khi tạo user!');
        }
    };

    const handleResetAllCredits = async () => {
        if (!confirm('Bạn có chắc muốn reset credits của TẤT CẢ users về 3?')) return;

        const success = await resetAllCredits(3);
        if (success) {
            showNotification('success', '🔄 Đã reset tất cả credits!');
        } else {
            showNotification('error', 'Lỗi khi reset!');
        }
    };

    const handleUpgradeAllToPro = async () => {
        if (!confirm('Bạn có chắc muốn nâng TẤT CẢ users lên PRO?')) return;

        const success = await upgradeAllToPro();
        if (success) {
            showNotification('success', '👑 Đã nâng tất cả lên PRO!');
        } else {
            showNotification('error', 'Lỗi khi nâng cấp!');
        }
    };

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('vi-VN');
    };

    if (isLoading) {
        return (
            <div className="decuong-loading">
                <div className="loading-spinner"></div>
                <p>Đang kết nối Firebase...</p>
                <span>Real-time sync enabled 🔥</span>
            </div>
        );
    }

    return (
        <div className="decuong-admin">
            {/* Notification */}
            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.type === 'success' ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                    {notification.message}
                </div>
            )}

            {/* Header */}
            <header className="decuong-header">
                <div className="header-content">
                    <div className="header-title">
                        <div className="header-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h1>
                                DeCuong Mate Admin
                                <span className="badge">🔥 Firebase</span>
                            </h1>
                            <p>Real-time sync • Giải Đề Cương Cho Sinh Viên</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="decuong-main">
                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card blue">
                        <div className="stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <p>Tổng Users</p>
                            <h3>{stats.totalUsers}</h3>
                        </div>
                    </div>

                    <div className="stat-card purple">
                        <div className="stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <p>Users PRO</p>
                            <h3>{stats.proUsers}</h3>
                        </div>
                    </div>

                    <div className="stat-card green">
                        <div className="stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <p>Tổng Credits</p>
                            <h3>{stats.totalCredits}</h3>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <h3>⚡ Hành động nhanh</h3>
                    <div className="actions-row">
                        <button className="action-btn green" onClick={() => setIsAddUserModalOpen(true)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Thêm User
                        </button>
                        <button className="action-btn yellow" onClick={handleResetAllCredits}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reset All Credits
                        </button>
                        <button className="action-btn purple" onClick={handleUpgradeAllToPro}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            Nâng All lên PRO
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="🔍 Tìm kiếm theo email, tên, ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Users Table */}
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th className="center">Tier</th>
                                <th className="center">Credits</th>
                                <th className="center">Downloads</th>
                                <th>Ngày tạo</th>
                                <th className="center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="empty-state">
                                        <div className="empty-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <p>Không tìm thấy user nào</p>
                                        <span>Thử thêm user mới hoặc tìm kiếm khác</span>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar">
                                                    {(user.name || user.email || 'U')[0].toUpperCase()}
                                                </div>
                                                <div className="user-info">
                                                    <p className="name">{user.name || 'Chưa đặt tên'}</p>
                                                    <p className="id" title={user.id}>{user.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="email">{user.email}</td>
                                        <td className="center">
                                            <span className={`tier-badge ${user.tier}`}>
                                                {user.tier === 'pro' && '⭐ '}
                                                {user.tier?.toUpperCase() || 'FREE'}
                                            </span>
                                        </td>
                                        <td className="center credits">{user.credits || 0}</td>
                                        <td className="center downloads">
                                            {user.tier === 'pro' ? '∞' : (user.downloadsLeft || 0)}
                                        </td>
                                        <td className="date">
                                            {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                                        </td>
                                        <td className="center">
                                            <div className="actions">
                                                <button className="icon-btn green" onClick={() => handleAddCredits(user.id, 10)} title="Thêm 10 credits">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                </button>
                                                <button className={`icon-btn ${user.tier === 'pro' ? 'yellow' : 'gray'}`} onClick={() => handleTogglePro(user.id)} title={user.tier === 'pro' ? 'Hạ xuống Free' : 'Nâng lên Pro'}>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                    </svg>
                                                </button>
                                                <button className="icon-btn blue" onClick={() => handleEditUser(user)} title="Chỉnh sửa">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button className="icon-btn red" onClick={() => handleDeleteUser(user.id)} title="Xóa">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className="table-footer">
                        <p>Hiển thị {filteredUsers.length} / {users.length} users • 🔥 Real-time sync enabled</p>
                    </div>
                </div>
            </main>

            {/* Edit Modal */}
            {isEditModalOpen && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>✏️ Chỉnh sửa User</h3>
                            <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Tên</label>
                                <input type="text" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu</label>
                                <input type="text" value={editForm.password || ''} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Credits</label>
                                    <input type="number" value={editForm.credits || 0} onChange={(e) => setEditForm({ ...editForm, credits: parseInt(e.target.value) || 0 })} />
                                </div>
                                <div className="form-group">
                                    <label>Downloads</label>
                                    <input type="number" value={editForm.tier === 'pro' ? 999 : (editForm.downloadsLeft || 0)} disabled={editForm.tier === 'pro'} onChange={(e) => setEditForm({ ...editForm, downloadsLeft: parseInt(e.target.value) || 0 })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Tier</label>
                                <select value={editForm.tier || 'free'} onChange={(e) => setEditForm({ ...editForm, tier: e.target.value as Tier })}>
                                    <option value="free">Free</option>
                                    <option value="pro">Pro</option>
                                </select>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn secondary" onClick={() => setIsEditModalOpen(false)}>Hủy</button>
                            <button className="btn primary" onClick={handleSaveEdit}>💾 Lưu thay đổi</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {isAddUserModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>➕ Thêm User mới</h3>
                            <button className="close-btn" onClick={() => setIsAddUserModalOpen(false)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Email *</label>
                                <input type="email" value={newUserForm.email} onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })} placeholder="user@example.com" />
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu *</label>
                                <input type="text" value={newUserForm.password} onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })} placeholder="Nhập mật khẩu" />
                            </div>
                            <div className="form-group">
                                <label>Tên (tùy chọn)</label>
                                <input type="text" value={newUserForm.name} onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })} placeholder="Tên hiển thị" />
                            </div>
                            <div className="form-group">
                                <label>Credits ban đầu</label>
                                <input type="number" value={newUserForm.credits} onChange={(e) => setNewUserForm({ ...newUserForm, credits: parseInt(e.target.value) || 0 })} />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn secondary" onClick={() => setIsAddUserModalOpen(false)}>Hủy</button>
                            <button className="btn success" onClick={handleAddNewUser}>✓ Tạo User</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeCuongMateAdmin;
