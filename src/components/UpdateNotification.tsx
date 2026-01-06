import React, { useState, useEffect } from 'react';

interface UpdateInfo {
    version: string;
    releaseDate?: string;
    releaseNotes?: string;
}

interface DownloadProgress {
    percent: number;
    transferred: number;
    total: number;
    bytesPerSecond: number;
}

declare global {
    interface Window {
        electronAPI?: {
            onUpdateAvailable: (callback: (info: UpdateInfo) => void) => void;
            onUpdateProgress: (callback: (progress: DownloadProgress) => void) => void;
            onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => void;
            onUpdateError: (callback: (error: string) => void) => void;
            downloadUpdate: () => Promise<{ success: boolean; error?: string }>;
            installUpdate: () => void;
            getAppVersion: () => Promise<string>;
            isElectron: boolean;
        };
    }
}

const UpdateNotification: React.FC = () => {
    const [updateAvailable, setUpdateAvailable] = useState<UpdateInfo | null>(null);
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
    const [updateDownloaded, setUpdateDownloaded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentVersion, setCurrentVersion] = useState<string>('');

    useEffect(() => {
        const api = window.electronAPI;
        if (!api?.isElectron) return;

        // Get current version
        api.getAppVersion().then(version => setCurrentVersion(version));

        // Listen for update available
        api.onUpdateAvailable((info) => {
            setUpdateAvailable(info);
            setError(null);
        });

        // Listen for download progress
        api.onUpdateProgress((progress) => {
            setDownloadProgress(Math.round(progress.percent));
        });

        // Listen for update downloaded
        api.onUpdateDownloaded(() => {
            setUpdateDownloaded(true);
            setIsDownloading(false);
            setDownloadProgress(null);
        });

        // Listen for errors
        api.onUpdateError((err) => {
            setError(err);
            setIsDownloading(false);
        });
    }, []);

    const handleDownload = async () => {
        const api = window.electronAPI;
        if (!api) return;

        setIsDownloading(true);
        setError(null);
        const result = await api.downloadUpdate();
        if (!result.success) {
            setError(result.error || 'Không thể tải bản cập nhật');
            setIsDownloading(false);
        }
    };

    const handleInstall = () => {
        const api = window.electronAPI;
        if (api) {
            api.installUpdate();
        }
    };

    // Don't show if not in Electron or no update available
    if (!window.electronAPI?.isElectron || !updateAvailable) {
        return null;
    }

    return (
        <div style={styles.overlay}>
            <div style={styles.container}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.iconWrapper}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </div>
                    <div>
                        <h2 style={styles.title}>
                            {updateDownloaded ? '🎉 Sẵn sàng cài đặt!' : '⚡ Có bản cập nhật mới!'}
                        </h2>
                        <p style={styles.subtitle}>
                            Phiên bản {updateAvailable.version}
                            {currentVersion && ` (hiện tại: ${currentVersion})`}
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                {isDownloading && downloadProgress !== null && (
                    <div style={styles.progressContainer}>
                        <div style={styles.progressBar}>
                            <div style={{ ...styles.progressFill, width: `${downloadProgress}%` }} />
                        </div>
                        <span style={styles.progressText}>Đang tải... {downloadProgress}%</span>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div style={styles.errorBox}>
                        <span>⚠️ {error}</span>
                    </div>
                )}

                {/* Actions */}
                <div style={styles.actions}>
                    {!updateDownloaded ? (
                        <button
                            style={isDownloading ? styles.downloadButtonDisabled : styles.downloadButton}
                            onClick={handleDownload}
                            disabled={isDownloading}
                        >
                            {isDownloading ? 'Đang tải...' : '📥 Tải xuống ngay'}
                        </button>
                    ) : (
                        <button style={styles.installButton} onClick={handleInstall}>
                            🚀 Cài đặt và khởi động lại
                        </button>
                    )}
                </div>

                {/* Mandatory Notice */}
                <div style={styles.notice}>
                    <span>⚠️ Việc cập nhật là <strong style={{ color: '#ef4444' }}>BẮT BUỘC</strong> để đảm bảo tính năng mới nhất.</span>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(8px)',
    },
    container: {
        background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '480px',
        width: '90%',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
    },
    iconWrapper: {
        width: '60px',
        height: '60px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
    },
    title: {
        margin: 0,
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#ffffff',
    },
    subtitle: {
        margin: '6px 0 0',
        fontSize: '0.95rem',
        color: '#a0a0b0',
    },
    progressContainer: {
        marginBottom: '20px',
    },
    progressBar: {
        height: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '5px',
        overflow: 'hidden',
        marginBottom: '8px',
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)',
        borderRadius: '5px',
        transition: 'width 0.3s ease',
    },
    progressText: {
        fontSize: '0.9rem',
        color: '#a0a0b0',
    },
    errorBox: {
        background: 'rgba(239, 68, 68, 0.2)',
        border: '1px solid rgba(239, 68, 68, 0.5)',
        borderRadius: '10px',
        padding: '14px',
        marginBottom: '20px',
        color: '#fca5a5',
        fontSize: '0.9rem',
    },
    actions: {
        display: 'flex',
        gap: '12px',
    },
    downloadButton: {
        flex: 1,
        padding: '14px 24px',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: 'white',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
    },
    downloadButtonDisabled: {
        flex: 1,
        padding: '14px 24px',
        borderRadius: '12px',
        border: 'none',
        background: '#4b5563',
        color: '#9ca3af',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: 'not-allowed',
    },
    installButton: {
        flex: 1,
        padding: '16px 32px',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        fontSize: '1.1rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
    },
    notice: {
        marginTop: '20px',
        textAlign: 'center' as const,
        fontSize: '0.85rem',
        color: '#9ca3af',
    },
};

export default UpdateNotification;
