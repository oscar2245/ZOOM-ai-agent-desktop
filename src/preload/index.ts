import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {
  checkInstalled: () => ipcRenderer.invoke('zoom:check-installed'),
  install: () => ipcRenderer.send('zoom:install'),
  onInstallProgress: (callback) => ipcRenderer.on('zoom:install-progress', callback),
  chat: (message) => ipcRenderer.send('zoom:chat', message),
  onChatToken: (callback) => ipcRenderer.on('zoom:chat-token', callback),
  onChatEnd: (callback) => ipcRenderer.on('zoom:chat-end', callback),
  removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),
  getSessions: () => ipcRenderer.invoke('zoom:get-sessions'),
  loadSession: (sessionId) => ipcRenderer.invoke('zoom:load-session', sessionId),
  getProfiles: () => ipcRenderer.invoke('zoom:get-profiles'),
  switchProfile: (profileId) => ipcRenderer.invoke('zoom:switch-profile', profileId),
  getSkills: () => ipcRenderer.invoke('zoom:get-skills'),
  toggleSkill: (skillId, enabled) => ipcRenderer.invoke('zoom:toggle-skill', skillId, enabled),
  readConfig: () => ipcRenderer.invoke('config:read'),
  writeConfig: (config) => ipcRenderer.invoke('config:write', config),
  getProviders: () => ipcRenderer.invoke('config:get-providers'),
  setProvider: (provider, key) => ipcRenderer.invoke('config:set-provider', provider, key)
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
