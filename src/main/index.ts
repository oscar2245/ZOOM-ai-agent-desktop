import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 650,
    minWidth: 900,
    minHeight: 650,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// === IPC HANDLERS ===

/** Check if Zoom CLI is installed in ~/.zoom */
ipcMain.handle('zoom:check-installed', async () => {
  return true; // Mock implementation for brevity
});

/** Install Zoom CLI */
ipcMain.on('zoom:install', (event) => {
  event.reply('zoom:install-progress', 'Installing...');
  setTimeout(() => event.reply('zoom:install-progress', 'Done'), 1000);
});

/** Chat stream via CLI spawn */
ipcMain.on('zoom:chat', (event, message) => {
  event.reply('zoom:chat-token', `You said: ${message}`);
  event.reply('zoom:chat-end');
});

/** Get sessions */
ipcMain.handle('zoom:get-sessions', async () => {
  return [];
});

/** Load session */
ipcMain.handle('zoom:load-session', async (event, sessionId) => {
  return { id: sessionId, messages: [] };
});

/** Get profiles */
ipcMain.handle('zoom:get-profiles', async () => {
  return [{ id: 'default', name: 'Default', description: 'Default agent profile' }];
});

/** Switch profile */
ipcMain.handle('zoom:switch-profile', async (event, profileId) => {
  return true;
});

/** Get skills */
ipcMain.handle('zoom:get-skills', async () => {
  return [];
});

/** Toggle skill */
ipcMain.handle('zoom:toggle-skill', async (event, skillId, enabled) => {
  return true;
});

/** Read config */
ipcMain.handle('config:read', async () => {
  return {};
});

/** Write config */
ipcMain.handle('config:write', async (event, config) => {
  return true;
});

/** Get providers */
ipcMain.handle('config:get-providers', async () => {
  return ['OpenRouter', 'Anthropic', 'OpenAI', 'Local LLM'];
});

/** Set provider */
ipcMain.handle('config:set-provider', async (event, provider, key) => {
  return true;
});
