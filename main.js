const { app, BrowserWindow, Menu, ipcMain, shell, session } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 700,
    title: 'Messenger Top Call',
    backgroundColor: '#ffffff',
    autoHideMenuBar: false,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 14 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const allowInApp = [
      'https://www.messenger.com/',
      'https://messenger.com/',
      'https://www.facebook.com/messages/',
      'https://facebook.com/messages/'
    ].some((prefix) => url.startsWith(prefix));

    if (allowInApp) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 420,
          height: 720,
          titleBarStyle: 'hiddenInset',
          autoHideMenuBar: true,
          webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
          }
        }
      };
    }

    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const allowed = [
      'https://www.messenger.com/',
      'https://messenger.com/',
      'https://www.facebook.com/messages/',
      'https://facebook.com/messages/'
    ].some((prefix) => url.startsWith(prefix));

    if (!allowed) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.loadURL('https://www.messenger.com/');
}

function buildMenu() {
  const template = [
    {
      label: 'App',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Toggle Always on Top',
          accelerator: 'CommandOrControl+Shift+P',
          click: () => toggleAlwaysOnTop()
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        {
          label: 'Toggle Always on Top',
          accelerator: 'CommandOrControl+Shift+P',
          click: () => toggleAlwaysOnTop()
        },
        {
          label: 'Show/Hide Sidebar Helper',
          accelerator: 'CommandOrControl+Shift+S',
          click: () => {
            mainWindow.webContents.send('toggle-sidebar');
          }
        },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
        { type: 'separator' },
        { role: 'front' }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function toggleAlwaysOnTop() {
  if (!mainWindow) return;
  const next = !mainWindow.isAlwaysOnTop();
  mainWindow.setAlwaysOnTop(next, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(next, { visibleOnFullScreen: true });
  mainWindow.webContents.send('always-on-top-changed', next);
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') {
      callback(true);
      return;
    }
    callback(false);
  });

  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    if (permission === 'media') return true;
    return false;
  });

  buildMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('toggle-always-on-top', () => {
  toggleAlwaysOnTop();
  return mainWindow?.isAlwaysOnTop() ?? false;
});

ipcMain.handle('get-always-on-top', () => {
  return mainWindow?.isAlwaysOnTop() ?? false;
});
