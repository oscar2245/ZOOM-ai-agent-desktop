import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      checkInstalled: () => Promise<boolean>;
      install: () => void;
      onInstallProgress: (callback: (event: any, msg: string) => void) => void;
      chat: (message: string) => void;
      onChatToken: (callback: (event: any, token: string) => void) => void;
      onChatEnd: (callback: (event: any) => void) => void;
      removeAllListeners: (channel: string) => void;
      getSessions: () => Promise<any[]>;
      loadSession: (sessionId: string) => Promise<any>;
      getProfiles: () => Promise<any[]>;
      switchProfile: (profileId: string) => Promise<boolean>;
      getSkills: () => Promise<any[]>;
      toggleSkill: (skillId: string, enabled: boolean) => Promise<boolean>;
      readConfig: () => Promise<any>;
      writeConfig: (config: any) => Promise<boolean>;
      getProviders: () => Promise<string[]>;
      setProvider: (provider: string, key: string) => Promise<boolean>;
    };
  }
}
