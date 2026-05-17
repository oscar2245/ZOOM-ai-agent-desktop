import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Mock electron APIs for web preview if not running in electron
if (!window.api) {
  window.api = {
    checkInstalled: async () => false,
    install: () => { setTimeout(() => window.dispatchEvent(new CustomEvent('mock-install-done')), 1000); },
    onInstallProgress: () => {},
    chat: (msg) => { setTimeout(() => window.dispatchEvent(new CustomEvent('mock-chat', {detail: `Echo: ${msg}`})), 500); },
    onChatToken: () => {},
    onChatEnd: () => {},
    removeAllListeners: () => {},
    getSessions: async () => [{ id: '1', title: 'Test Session', timestamp: Date.now(), messageCount: 2 }],
    loadSession: async () => ({ id: '1', messages: [] }),
    getProfiles: async () => [{ id: 'p1', name: 'Default', description: 'Agent profile', avatar: '' }],
    switchProfile: async () => true,
    getSkills: async () => [{ id: 's1', name: 'Web Search', description: 'Search the web', version: '1.0', enabled: true }],
    toggleSkill: async () => true,
    readConfig: async () => ({}),
    writeConfig: async () => true,
    getProviders: async () => ['OpenRouter', 'Anthropic', 'OpenAI', 'Local LLM'],
    setProvider: async () => true,
  } as any;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
