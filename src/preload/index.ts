import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {
  checkInstalled: () => ipcRenderer.invoke('zoom:check-installed'),
  install: () => ipcRenderer.send('zoom:install'),
  onInstallProgress: (callback) => ipcRenderer.on('zoom:install-progress', callback),
  chat: (message, sessionId) => ipcRenderer.send('zoom:chat', message, sessionId),
  onChatToken: (callback) => ipcRenderer.on('zoom:chat-token', callback),
  onChatEnd: (callback) => ipcRenderer.on('zoom:chat-end', callback),
  onChatError: (callback) => ipcRenderer.on('zoom:chat-error', callback),
  removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),
  getSessions: () => ipcRenderer.invoke('zoom:get-sessions'),
  loadSession: (sessionId) => ipcRenderer.invoke('zoom:load-session', sessionId),
  saveSession: (session) => ipcRenderer.invoke('zoom:save-session', session),
  deleteSession: (sessionId) => ipcRenderer.invoke('zoom:delete-session', sessionId),
  getProfiles: () => ipcRenderer.invoke('zoom:get-profiles'),
  switchProfile: (profileId) => ipcRenderer.invoke('zoom:switch-profile', profileId),
  getMemories: (profileId) => ipcRenderer.invoke('zoom:get-memories', profileId),
  addMemory: (profileId, content) => ipcRenderer.invoke('zoom:add-memory', profileId, content),
  updateMemory: (profileId, id, content) => ipcRenderer.invoke('zoom:update-memory', profileId, id, content),
  deleteMemory: (profileId, id) => ipcRenderer.invoke('zoom:delete-memory', profileId, id),
  getSkills: () => ipcRenderer.invoke('zoom:get-skills'),
  toggleSkill: (skillId, enabled) => ipcRenderer.invoke('zoom:toggle-skill', skillId, enabled),
  toggleTool: (toolId, enabled) => ipcRenderer.invoke('zoom:toggle-tool', toolId, enabled),
  readConfig: () => ipcRenderer.invoke('config:read'),
  writeConfig: (config) => ipcRenderer.invoke('config:write', config),
  getProviders: () => ipcRenderer.invoke('config:get-providers'),
  setProvider: (provider, key, model, localUrl) => ipcRenderer.invoke('config:set-provider', provider, key, model, localUrl)
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
