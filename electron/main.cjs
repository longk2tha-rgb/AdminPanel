const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

// Keep reference to main window
let mainWindow;

// Auto-updater configuration
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1100,
        minHeight: 700,
        title: 'Unified Admin Panel',
        icon: path.join(__dirname, '..', 'build', 'icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs'),
        },
        autoHideMenuBar: true,
        backgroundColor: '#0f172a',
        show: false,
    });

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        // Check for updates (only in production)
        if (app.isPackaged) {
            setTimeout(() => {
                checkForUpdates();
            }, 3000);
        }
    });

    // Load the app
    if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
        mainWindow.loadURL('http://localhost:5174');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// ============ AUTO-UPDATER ============
function checkForUpdates() {
    console.log('Checking for updates...');
    autoUpdater.checkForUpdates().catch(err => {
        console.log('Update check failed:', err.message);
    });
}

// Update available
autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
    if (mainWindow) {
        mainWindow.webContents.send('update-available', {
            version: info.version,
            releaseDate: info.releaseDate,
            releaseNotes: info.releaseNotes
        });
    }
});

// No update available
autoUpdater.on('update-not-available', () => {
    console.log('App is up to date');
});

// Download progress
autoUpdater.on('download-progress', (progressObj) => {
    if (mainWindow) {
        mainWindow.webContents.send('update-progress', {
            percent: progressObj.percent,
            transferred: progressObj.transferred,
            total: progressObj.total,
            bytesPerSecond: progressObj.bytesPerSecond
        });
    }
});

// Update downloaded
autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version);
    if (mainWindow) {
        mainWindow.webContents.send('update-downloaded', {
            version: info.version
        });
    }
});

// Update error
autoUpdater.on('error', (err) => {
    console.error('Auto-updater error:', err.message);
    if (mainWindow) {
        mainWindow.webContents.send('update-error', err.message);
    }
});

// ============ IPC HANDLERS ============

// Download update
ipcMain.handle('download-update', async () => {
    try {
        await autoUpdater.downloadUpdate();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Install update (quit and install)
ipcMain.handle('install-update', () => {
    autoUpdater.quitAndInstall(false, true);
});

// Get app version
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

// Check for updates manually
ipcMain.handle('check-for-updates', () => {
    checkForUpdates();
});

// ============ APP LIFECYCLE ============
app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
