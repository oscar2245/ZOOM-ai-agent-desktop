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

import { spawn } from 'child_process';
import { homedir } from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import YAML from 'js-yaml';

const ZOOM_HOME = join(homedir(), '.zoom');
const CONFIG_PATH = join(ZOOM_HOME, 'config.yaml');
const SESSIONS_DIR = join(ZOOM_HOME, 'sessions');
const PROFILES_DIR = join(ZOOM_HOME, 'profiles');
const SKILLS_DIR = join(ZOOM_HOME, 'skills');

// Ensure directories exist
function ensureZoomDirs() {
  [ZOOM_HOME, SESSIONS_DIR, PROFILES_DIR, SKILLS_DIR].forEach(dir => {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  });
}

/** Check if Zoom CLI is installed in ~/.zoom */
ipcMain.handle('zoom:check-installed', async () => {
  return existsSync(join(ZOOM_HOME, 'zoom-agent'));
});

/** Install Zoom CLI */
ipcMain.on('zoom:install', async (event) => {
  const installScript = join(ZOOM_HOME, 'install.sh');
  
  // Download and run official installer
  const child = spawn('bash', [installScript, '--skip-setup'], {
    cwd: homedir()
  });

  child.stdout.on('data', (data) => {
    event.reply('zoom:install-progress', data.toString());
  });

  child.stderr.on('data', (data) => {
    event.reply('zoom:install-error', data.toString());
  });

  child.on('close', (code) => {
    event.reply('zoom:install-complete', code === 0);
  });
});

/** Chat stream via CLI spawn */
ipcMain.on('zoom:chat', (event, message: string, sessionId?: string) => {
  const cliPath = join(ZOOM_HOME, 'zoom-agent');
  
  if (!existsSync(cliPath)) {
    event.reply('zoom:chat-error', 'ZOOM CLI not found. Please run setup first.');
    return;
  }

  const args = ['chat', '--message', message];
  if (sessionId) args.push('--session', sessionId);

  const child = spawn(cliPath, args, {
    env: { ...process.env, ZOOM_HOME }
  });

  let buffer = '';

  child.stdout.on('data', (data) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep incomplete line in buffer

    for (const line of lines) {
      if (line.trim().startsWith('data: ')) {
        try {
          const json = JSON.parse(line.trim().slice(6));
          event.reply('zoom:chat-token', json);
        } catch {
          event.reply('zoom:chat-token', { token: line.trim().slice(6) });
        }
      }
    }
  });

  child.stderr.on('data', (data) => {
    event.reply('zoom:chat-error', data.toString());
  });

  child.on('close', () => {
    if (buffer.trim().startsWith('data: ')) {
      try {
        const json = JSON.parse(buffer.trim().slice(6));
        event.reply('zoom:chat-token', json);
      } catch { /* ignore */ }
    }
    event.reply('zoom:chat-end');
  });

  child.on('error', (err) => {
    event.reply('zoom:chat-error', `Failed to start CLI: ${err.message}`);
    event.reply('zoom:chat-end');
  });
});

/** Get sessions */
ipcMain.handle('zoom:get-sessions', async () => {
  ensureZoomDirs();
  if (!existsSync(SESSIONS_DIR)) return [];
  
  const files = readdirSync(SESSIONS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const content = JSON.parse(readFileSync(join(SESSIONS_DIR, f), 'utf8'));
      return {
        id: content.id,
        title: content.title || content.messages?.[0]?.text?.slice(0, 50) || 'Untitled',
        time: content.updatedAt || content.createdAt || new Date().toISOString(),
        active: content.active || false,
        count: content.messages?.length || 0
      };
    })
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  
  return files;
});

/** Load session */
ipcMain.handle('zoom:load-session', async (event, sessionId: string) => {
  const sessionPath = join(SESSIONS_DIR, `${sessionId}.json`);
  if (!existsSync(sessionPath)) return { id: sessionId, messages: [] };
  
  return JSON.parse(readFileSync(sessionPath, 'utf8'));
});

/** Save session */
ipcMain.handle('zoom:save-session', async (event, session: any) => {
  ensureZoomDirs();
  const sessionPath = join(SESSIONS_DIR, `${session.id}.json`);
  writeFileSync(sessionPath, JSON.stringify(session, null, 2));
  return true;
});

/** Delete session */
ipcMain.handle('zoom:delete-session', async (event, sessionId: string) => {
  const sessionPath = join(SESSIONS_DIR, `${sessionId}.json`);
  if (existsSync(sessionPath)) {
    const { rmSync } = require('fs');
    rmSync(sessionPath);
  }
  return true;
});

/** Get profiles */
ipcMain.handle('zoom:get-profiles', async () => {
  ensureZoomDirs();
  if (!existsSync(PROFILES_DIR)) return [];
  
  return readdirSync(PROFILES_DIR)
    .filter(f => statSync(join(PROFILES_DIR, f)).isDirectory())
    .map(id => {
      const personaPath = join(PROFILES_DIR, id, 'persona.md');
      const configPath = join(PROFILES_DIR, id, 'config.json');
      const config = existsSync(configPath) 
        ? JSON.parse(readFileSync(configPath, 'utf8')) 
        : {};
      
      return {
        id,
        name: config.name || id,
        initials: config.initials || id.slice(0, 2).toUpperCase(),
        color: config.color || 'bg-blue-600',
        description: config.description || '',
        active: config.active || false,
        tags: config.tags || [],
        avatarUrl: config.avatarUrl
      };
    });
});

/** Switch profile */
ipcMain.handle('zoom:switch-profile', async (event, profileId: string) => {
  const profiles = await ipcMain.emit('zoom:get-profiles') as any[];
  for (const profile of profiles) {
    const configPath = join(PROFILES_DIR, profile.id, 'config.json');
    if (existsSync(configPath)) {
      const config = JSON.parse(readFileSync(configPath, 'utf8'));
      config.active = profile.id === profileId;
      writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
  }
  return true;
});

/** Get memories */
ipcMain.handle('zoom:get-memories', async (event, profileId: string) => {
  const memoryDir = join(PROFILES_DIR, profileId, 'memory');
  if (!existsSync(memoryDir)) return [];
  
  return readdirSync(memoryDir)
    .filter(f => f.endsWith('.md'))
    .map(f => ({
      id: f.replace('.md', ''),
      content: readFileSync(join(memoryDir, f), 'utf8'),
      updatedAt: statSync(join(memoryDir, f)).mtime.toISOString()
    }));
});

/** Add memory */
ipcMain.handle('zoom:add-memory', async (event, profileId: string, content: string) => {
  const memoryDir = join(PROFILES_DIR, profileId, 'memory');
  if (!existsSync(memoryDir)) mkdirSync(memoryDir, { recursive: true });
  const id = Date.now().toString();
  writeFileSync(join(memoryDir, `${id}.md`), content);
  return id;
});

/** Update memory */
ipcMain.handle('zoom:update-memory', async (event, profileId: string, id: string, content: string) => {
  const memoryPath = join(PROFILES_DIR, profileId, 'memory', `${id}.md`);
  writeFileSync(memoryPath, content);
  return true;
});

/** Delete memory */
ipcMain.handle('zoom:delete-memory', async (event, profileId: string, id: string) => {
  const memoryPath = join(PROFILES_DIR, profileId, 'memory', `${id}.md`);
  if (existsSync(memoryPath)) {
    const { rmSync } = require('fs');
    rmSync(memoryPath);
  }
  return true;
});

/** Get skills */
ipcMain.handle('zoom:get-skills', async () => {
  ensureZoomDirs();
  if (!existsSync(SKILLS_DIR)) return [];
  
  return readdirSync(SKILLS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const content = JSON.parse(readFileSync(join(SKILLS_DIR, f), 'utf8'));
      return {
        id: content.id || f.replace('.json', ''),
        name: content.name || content.id,
        description: content.description || '',
        version: content.version || '1.0.0',
        enabled: content.enabled !== false
      };
    });
});

/** Toggle skill */
ipcMain.handle('zoom:toggle-skill', async (event, skillId: string, enabled: boolean) => {
  const skillPath = join(SKILLS_DIR, `${skillId}.json`);
  if (!existsSync(skillPath)) return false;
  
  const content = JSON.parse(readFileSync(skillPath, 'utf8'));
  content.enabled = enabled;
  writeFileSync(skillPath, JSON.stringify(content, null, 2));
  return true;
});

/** Toggle tool */
ipcMain.handle('zoom:toggle-tool', async (event, toolId: string, enabled: boolean) => {
  const config = await ipcMain.emit('config:read') as any;
  if (!config.tools) config.tools = [];
  
  const tool = config.tools.find((t: any) => t.id === toolId);
  if (tool) {
    tool.enabled = enabled;
  } else {
    config.tools.push({ id: toolId, enabled });
  }
  
  await ipcMain.emit('config:write', config);
  return true;
});

/** Read config */
ipcMain.handle('config:read', async () => {
  if (!existsSync(CONFIG_PATH)) {
    return {
      provider: 'OpenRouter',
      model: 'anthropic/claude-3.5-sonnet',
      apiKey: '',
      localUrl: 'http://localhost:11434/v1'
    };
  }
  
  const content = readFileSync(CONFIG_PATH, 'utf8');
  return YAML.load(content) || {};
});

/** Write config */
ipcMain.handle('config:write', async (event, config: any) => {
  ensureZoomDirs();
  writeFileSync(CONFIG_PATH, YAML.dump(config, { indent: 2 }));
  return true;
});

/** Get providers */
ipcMain.handle('config:get-providers', async () => {
  return [
    { id: 'openrouter', name: 'OpenRouter', requiresKey: true },
    { id: 'anthropic', name: 'Anthropic', requiresKey: true },
    { id: 'openai', name: 'OpenAI', requiresKey: true },
    { id: 'local', name: 'Local LLM', requiresKey: false, urlRequired: true }
  ];
});

/** Set provider */
ipcMain.handle('config:set-provider', async (event, provider: string, apiKey?: string, model?: string, localUrl?: string) => {
  const config = await ipcMain.emit('config:read') as any;
  config.provider = provider;
  if (apiKey) config.apiKey = apiKey;
  if (model) config.model = model;
  if (localUrl) config.localUrl = localUrl;
  
  await ipcMain.emit('config:write', config);
  return true;
});
