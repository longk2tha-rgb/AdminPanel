import React, { useState, useEffect } from 'react';
import { db } from '../services/firebaseConfig';
import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy,
    updateDoc,
    Timestamp
} from 'firebase/firestore';

interface Feedback {
    id: string;
    name: string;
    email: string;
    title: string;
    message: string;
    createdAt: Timestamp;
    isRead?: boolean;
}

const FeedbackManager: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFeedbacks, setSelectedFeedbacks] = useState<string[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Fetch feedbacks
    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const q = query(
                collection(db, 'feedbacks'),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const feedbackList: Feedback[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Feedback));

            setFeedbacks(feedbackList);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    // Format date
    const formatDate = (timestamp: Timestamp): string => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate();
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Mark as read
    const markAsRead = async (feedbackId: string) => {
        try {
            await updateDoc(doc(db, 'feedbacks', feedbackId), {
                isRead: true
            });
            setFeedbacks(prev => prev.map(f =>
                f.id === feedbackId ? { ...f, isRead: true } : f
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    // Delete single feedback
    const deleteFeedback = async (feedbackId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa góp ý này?')) return;

        try {
            await deleteDoc(doc(db, 'feedbacks', feedbackId));
            setFeedbacks(prev => prev.filter(f => f.id !== feedbackId));
            setSelectedFeedbacks(prev => prev.filter(id => id !== feedbackId));
        } catch (error) {
            console.error('Error deleting feedback:', error);
            alert('Lỗi khi xóa góp ý!');
        }
    };

    // Delete selected feedbacks
    const deleteSelectedFeedbacks = async () => {
        if (selectedFeedbacks.length === 0) return;
        if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedFeedbacks.length} góp ý đã chọn?`)) return;

        try {
            await Promise.all(
                selectedFeedbacks.map(id => deleteDoc(doc(db, 'feedbacks', id)))
            );
            setFeedbacks(prev => prev.filter(f => !selectedFeedbacks.includes(f.id)));
            setSelectedFeedbacks([]);
        } catch (error) {
            console.error('Error deleting feedbacks:', error);
            alert('Lỗi khi xóa góp ý!');
        }
    };

    // Toggle selection
    const toggleSelection = (feedbackId: string) => {
        setSelectedFeedbacks(prev =>
            prev.includes(feedbackId)
                ? prev.filter(id => id !== feedbackId)
                : [...prev, feedbackId]
        );
    };

    // Select all
    const selectAll = () => {
        const filteredIds = filteredFeedbacks.map(f => f.id);
        if (selectedFeedbacks.length === filteredIds.length) {
            setSelectedFeedbacks([]);
        } else {
            setSelectedFeedbacks(filteredIds);
        }
    };

    // Filter feedbacks
    const filteredFeedbacks = feedbacks.filter(f => {
        if (filter === 'unread') return !f.isRead;
        if (filter === 'read') return f.isRead;
        return true;
    });

    const unreadCount = feedbacks.filter(f => !f.isRead).length;

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Đang tải góp ý...</p>
            </div>
        );
    }

    return (
        <div className="feedback-manager">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <h1>📬 Hòm Thư Góp Ý</h1>
                    <p className="subtitle">
                        Tổng: {feedbacks.length} góp ý •
                        <span className="unread-badge">{unreadCount} chưa đọc</span>
                    </p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={fetchFeedbacks}
                    >
                        🔄 Làm mới
                    </button>
                    {selectedFeedbacks.length > 0 && (
                        <button
                            className="btn btn-danger"
                            onClick={deleteSelectedFeedbacks}
                        >
                            🗑️ Xóa ({selectedFeedbacks.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Tất cả ({feedbacks.length})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
                        onClick={() => setFilter('unread')}
                    >
                        Chưa đọc ({unreadCount})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
                        onClick={() => setFilter('read')}
                    >
                        Đã đọc ({feedbacks.length - unreadCount})
                    </button>
                </div>

                <label className="select-all-checkbox">
                    <input
                        type="checkbox"
                        checked={selectedFeedbacks.length === filteredFeedbacks.length && filteredFeedbacks.length > 0}
                        onChange={selectAll}
                    />
                    Chọn tất cả
                </label>
            </div>

            {/* Feedback List */}
            {filteredFeedbacks.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>Không có góp ý nào</h3>
                    <p>Chưa có góp ý nào trong danh mục này</p>
                </div>
            ) : (
                <div className="feedback-list">
                    {filteredFeedbacks.map(feedback => (
                        <div
                            key={feedback.id}
                            className={`feedback-card ${!feedback.isRead ? 'unread' : ''} ${expandedId === feedback.id ? 'expanded' : ''}`}
                        >
                            <div className="feedback-header">
                                <label className="checkbox-wrapper">
                                    <input
                                        type="checkbox"
                                        checked={selectedFeedbacks.includes(feedback.id)}
                                        onChange={() => toggleSelection(feedback.id)}
                                    />
                                </label>

                                <div
                                    className="feedback-info"
                                    onClick={() => {
                                        setExpandedId(expandedId === feedback.id ? null : feedback.id);
                                        if (!feedback.isRead) {
                                            markAsRead(feedback.id);
                                        }
                                    }}
                                >
                                    <div className="feedback-meta">
                                        {!feedback.isRead && <span className="new-badge">MỚI</span>}
                                        <span className="feedback-name">{feedback.name}</span>
                                        <span className="feedback-email">({feedback.email})</span>
                                    </div>
                                    <div className="feedback-title">{feedback.title}</div>
                                    <div className="feedback-time">
                                        🕐 {formatDate(feedback.createdAt)}
                                    </div>
                                </div>

                                <button
                                    className="btn-icon btn-delete"
                                    onClick={() => deleteFeedback(feedback.id)}
                                    title="Xóa"
                                >
                                    🗑️
                                </button>
                            </div>

                            {expandedId === feedback.id && (
                                <div className="feedback-body">
                                    <div className="message-content">
                                        {feedback.message}
                                    </div>
                                    <div className="feedback-actions">
                                        <a
                                            href={`mailto:${feedback.email}?subject=Re: ${feedback.title}`}
                                            className="btn btn-primary"
                                        >
                                            ✉️ Trả lời qua Email
                                        </a>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => deleteFeedback(feedback.id)}
                                        >
                                            🗑️ Xóa góp ý
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .feedback-manager {
                    padding: 24px;
                }
                
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 24px;
                }
                
                .page-header h1 {
                    font-size: 28px;
                    margin: 0 0 8px 0;
                }
                
                .subtitle {
                    color: var(--text-secondary);
                    margin: 0;
                }
                
                .unread-badge {
                    color: var(--accent-primary);
                    font-weight: 600;
                    margin-left: 8px;
                }
                
                .header-actions {
                    display: flex;
                    gap: 12px;
                }
                
                .filters-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding: 12px 16px;
                    background: var(--bg-secondary);
                    border-radius: 12px;
                }
                
                .filter-tabs {
                    display: flex;
                    gap: 8px;
                }
                
                .filter-tab {
                    padding: 8px 16px;
                    background: transparent;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .filter-tab:hover {
                    background: var(--bg-tertiary);
                }
                
                .filter-tab.active {
                    background: var(--accent-primary);
                    color: white;
                    border-color: var(--accent-primary);
                }
                
                .select-all-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    color: var(--text-secondary);
                }
                
                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    background: var(--bg-secondary);
                    border-radius: 16px;
                }
                
                .empty-icon {
                    font-size: 64px;
                    margin-bottom: 16px;
                }
                
                .empty-state h3 {
                    margin: 0 0 8px 0;
                    color: var(--text-primary);
                }
                
                .empty-state p {
                    color: var(--text-secondary);
                    margin: 0;
                }
                
                .feedback-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .feedback-card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    overflow: hidden;
                    transition: all 0.2s;
                }
                
                .feedback-card:hover {
                    border-color: var(--accent-primary);
                }
                
                .feedback-card.unread {
                    border-left: 4px solid var(--accent-primary);
                    background: linear-gradient(to right, rgba(99, 102, 241, 0.05), transparent);
                }
                
                .feedback-header {
                    display: flex;
                    align-items: center;
                    padding: 16px;
                    gap: 12px;
                }
                
                .checkbox-wrapper {
                    display: flex;
                    align-items: center;
                }
                
                .checkbox-wrapper input {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                }
                
                .feedback-info {
                    flex: 1;
                    cursor: pointer;
                }
                
                .feedback-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 4px;
                }
                
                .new-badge {
                    background: var(--accent-primary);
                    color: white;
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 600;
                }
                
                .feedback-name {
                    font-weight: 600;
                    color: var(--text-primary);
                }
                
                .feedback-email {
                    color: var(--text-secondary);
                    font-size: 14px;
                }
                
                .feedback-title {
                    color: var(--text-primary);
                    font-size: 15px;
                    margin-bottom: 4px;
                }
                
                .feedback-time {
                    color: var(--text-secondary);
                    font-size: 13px;
                }
                
                .btn-icon {
                    width: 36px;
                    height: 36px;
                    border: none;
                    border-radius: 8px;
                    background: transparent;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                
                .btn-delete:hover {
                    background: rgba(239, 68, 68, 0.1);
                }
                
                .feedback-body {
                    padding: 0 16px 16px 46px;
                    border-top: 1px solid var(--border-color);
                    padding-top: 16px;
                    margin-top: -1px;
                }
                
                .message-content {
                    background: var(--bg-tertiary);
                    padding: 16px;
                    border-radius: 8px;
                    white-space: pre-wrap;
                    color: var(--text-primary);
                    line-height: 1.6;
                    margin-bottom: 16px;
                }
                
                .feedback-actions {
                    display: flex;
                    gap: 12px;
                }
                
                .btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .btn-primary {
                    background: var(--accent-primary);
                    color: white;
                }
                
                .btn-primary:hover {
                    background: var(--accent-secondary);
                }
                
                .btn-secondary {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                    border: 1px solid var(--border-color);
                }
                
                .btn-secondary:hover {
                    background: var(--bg-secondary);
                }
                
                .btn-danger {
                    background: #ef4444;
                    color: white;
                }
                
                .btn-danger:hover {
                    background: #dc2626;
                }
                
                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px;
                    gap: 16px;
                }
            `}</style>
        </div>
    );
};

export default FeedbackManager;
