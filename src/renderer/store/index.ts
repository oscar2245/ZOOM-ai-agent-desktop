import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Date.now().toString() + Math.random();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 5000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export interface AppUser {
  id: string;
  name: string;
  pin: string;
  avatarUrl?: string;
}

interface AuthState {
  users: AppUser[];
  currentUser: AppUser | null;
  addUser: (user: AppUser) => void;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;
  login: (id: string, pin: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  users: [],
  currentUser: null,
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (id, updates) => set((state) => ({
    users: state.users.map(u => u.id === id ? { ...u, ...updates } : u),
    currentUser: state.currentUser?.id === id ? { ...state.currentUser, ...updates } : state.currentUser
  })),
  deleteUser: (id) => set((state) => ({
    users: state.users.filter(u => u.id !== id),
    currentUser: state.currentUser?.id === id ? null : state.currentUser
  })),
  login: (id, pin) => {
    const user = get().users.find(u => u.id === id);
    if (user && user.pin === pin) {
      set({ currentUser: user });
      return true;
    }
    return false;
  },
  logout: () => set({ currentUser: null })
}));

interface ChatState {
  messages: { id: string; role: 'user' | 'assistant'; text: string; timestamp?: string }[];
  isTyping: boolean;
  addMessage: (msg: { id: string; role: 'user' | 'assistant'; text: string }) => void;
  setTyping: (status: boolean) => void;
  clearMessages: () => void;
  loadSession: (sessionId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isTyping: false,
  addMessage: (msg) => set((state) => ({ 
    messages: [...state.messages, { ...msg, timestamp: new Date().toISOString() }] 
  })),
  setTyping: (status) => set({ isTyping: status }),
  clearMessages: () => set({ messages: [] }),
  loadSession: async (sessionId) => {
    const session = await window.api?.loadSession?.(sessionId);
    if (session?.messages) {
      set({ messages: session.messages });
    }
  }
}));

export interface Session {
  id: string;
  title: string;
  time: string;
  active: boolean;
  count: number;
}

// Sessions Store
interface SessionsState {
  sessions: Session[];
  activeSession?: string;
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  deleteSession: (id: string) => void;
  setActiveSession: (id: string) => void;
}
export const useSessionsStore = create<SessionsState>((set) => ({
  sessions: [
    { id: '1', title: 'Project Alpha Research', time: '2m ago', active: true, count: 12 },
    { id: '2', title: 'Marketing Copy Generation', time: '1h ago', active: false, count: 5 },
    { id: '3', title: 'Bug Analysis #442', time: 'Yesterday', active: false, count: 24 },
    { id: '4', title: 'Travel Planning', time: '3 days ago', active: false, count: 8 },
  ],
  activeSession: '1',
  setSessions: (sessions) => set({ sessions }),
  addSession: (session) => set((state) => ({ sessions: [session, ...state.sessions] })),
  deleteSession: (id) => set((state) => ({ sessions: state.sessions.filter(s => s.id !== id) })),
  setActiveSession: (id) => set((state) => ({
    activeSession: id,
    sessions: state.sessions.map(s => ({ ...s, active: s.id === id }))
  }))
}));

export interface Profile {
  id: string;
  initials: string;
  color: string;
  name: string;
  desc: string;
  active: boolean;
  tags: string[];
  avatarUrl?: string;
}

// Profiles Store
interface ProfilesState {
  profiles: Profile[];
  activeProfile: string | null;
  setProfiles: (profiles: Profile[]) => void;
  addProfile: (profile: Profile) => void;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
  setActiveProfile: (id: string) => void;
}
export const useProfilesStore = create<ProfilesState>((set) => ({
  profiles: [
    { id: '1', initials: 'RE', color: 'bg-blue-600', name: 'Researcher', desc: 'Specializes in data analysis and technical writing.', active: true, tags: ['PDF_ANALYST', 'WEB_BROWSE'] },
    { id: '2', initials: 'CR', color: 'bg-indigo-600', name: 'Creative', desc: 'Ideation, copywriting, and visual concepting.', active: false, tags: ['DALL-E_3', 'GPT-4O'] },
    { id: '3', initials: 'CO', color: 'bg-orange-600', name: 'Coder', desc: 'Python, React, and system architecture expert.', active: false, tags: ['PYTHON_VENV', 'SHELL'] }
  ],
  activeProfile: '1',
  setProfiles: (profiles) => set({ profiles }),
  addProfile: (profile) => set((state) => ({ profiles: [...state.profiles, profile] })),
  updateProfile: (id, updates) => set((state) => ({
    profiles: state.profiles.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  deleteProfile: (id) => set((state) => ({
    profiles: state.profiles.filter(p => p.id !== id)
  })),
  setActiveProfile: (id) => set((state) => ({
    activeProfile: id,
    profiles: state.profiles.map(p => ({ ...p, active: p.id === id }))
  }))
}));

// Skills Store
interface SkillsState {
  skills: any[];
  setSkills: (skills: any[]) => void;
}
export const useSkillsStore = create<SkillsState>((set) => ({
  skills: [],
  setSkills: (skills) => set({ skills })
}));

// Settings Store
interface SettingsState {
  provider: string;
  model: string;
  theme: 'dark' | 'light';
  language: 'en' | 'ar';
  updateSettings: (settings: Partial<SettingsState>) => void;
}
export const useSettingsStore = create<SettingsState>((set) => ({
  provider: 'OpenRouter',
  model: 'anthropic/claude-3.5-sonnet:beta',
  theme: 'dark',
  language: 'en',
  updateSettings: (newSettings) => set((state) => ({ ...state, ...newSettings }))
}));
