import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      checkInstalled: () => Promise<boolean>;
      install: () => void;
      onInstallProgress: (callback: (event: any, msg: string) => void) => void;
      chat: (message: string, sessionId?: string) => void;
      onChatToken: (callback: (event: any, token: any) => void) => void;
      onChatEnd: (callback: (event: any) => void) => void;
      onChatError: (callback: (event: any, error: string) => void) => void;
      removeAllListeners: (channel: string) => void;
      getSessions: () => Promise<any[]>;
      loadSession: (sessionId: string) => Promise<any>;
      saveSession: (session: any) => Promise<boolean>;
      deleteSession: (sessionId: string) => Promise<boolean>;
      getProfiles: () => Promise<any[]>;
      switchProfile: (profileId: string) => Promise<boolean>;
      getMemories: (profileId: string) => Promise<any[]>;
      addMemory: (profileId: string, content: string) => Promise<string>;
      updateMemory: (profileId: string, id: string, content: string) => Promise<boolean>;
      deleteMemory: (profileId: string, id: string) => Promise<boolean>;
      getSkills: () => Promise<any[]>;
      toggleSkill: (skillId: string, enabled: boolean) => Promise<boolean>;
      toggleTool: (toolId: string, enabled: boolean) => Promise<boolean>;
      readConfig: () => Promise<any>;
      writeConfig: (config: any) => Promise<boolean>;
      getProviders: () => Promise<any[]>;
      setProvider: (provider: string, key?: string, model?: string, localUrl?: string) => Promise<boolean>;
    };
  }
}
