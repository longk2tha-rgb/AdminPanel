const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods for renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // ============ PLATFORM INFO ============
    platform: process.platform,
    isElectron: true,

    // ============ AUTO-UPDATE APIs ============

    // Listen for update available
    onUpdateAvailable: (callback) => {
        ipcRenderer.on('update-available', (_, info) => callback(info));
    },

    // Listen for download progress
    onUpdateProgress: (callback) => {
        ipcRenderer.on('update-progress', (_, progress) => callback(progress));
    },

    // Listen for update downloaded
    onUpdateDownloaded: (callback) => {
        ipcRenderer.on('update-downloaded', (_, info) => callback(info));
    },

    // Listen for update error
    onUpdateError: (callback) => {
        ipcRenderer.on('update-error', (_, error) => callback(error));
    },

    // Trigger download update
    downloadUpdate: () => ipcRenderer.invoke('download-update'),

    // Trigger install update (quit and install)
    installUpdate: () => ipcRenderer.invoke('install-update'),

    // Check for updates manually
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),

    // Get app version
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
});
