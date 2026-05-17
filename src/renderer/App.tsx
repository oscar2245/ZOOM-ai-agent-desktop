/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { Bot, MessageSquare, Clock, Users, Zap, User, Database, Wrench, Settings } from 'lucide-react';
import { useEffect } from 'react';

import ToastContainer from './components/ToastContainer';
import AuthScreen from './components/AuthScreen';
import { useAuthStore, useSettingsStore } from './store';
import ChatScreen from './screens/ChatScreen';
import SetupScreen from './screens/SetupScreen';
import SessionsScreen from './screens/SessionsScreen';
import ProfilesScreen from './screens/ProfilesScreen';
import SkillsScreen from './screens/SkillsScreen';
import PersonaScreen from './screens/PersonaScreen';
import MemoryScreen from './screens/MemoryScreen';
import ToolsScreen from './screens/ToolsScreen';
import SettingsScreen from './screens/SettingsScreen';

function Sidebar() {
  const { currentUser, logout } = useAuthStore();
  const { language, updateSettings } = useSettingsStore();

  const navItems = [
    { to: "/chat", icon: MessageSquare, label: language === 'ar' ? 'المحادثة' : 'Chat' },
    { to: "/sessions", icon: Clock, label: language === 'ar' ? 'الجلسات' : 'Sessions' },
    { to: "/profiles", icon: Users, label: language === 'ar' ? 'الوكلاء' : 'Agents' },
    { to: "/skills", icon: Zap, label: language === 'ar' ? 'المهارات' : 'Skills' },
    { to: "/persona", icon: User, label: language === 'ar' ? 'الشخصية' : 'Persona' },
    { to: "/memory", icon: Database, label: language === 'ar' ? 'الذاكرة' : 'Memory' },
    { to: "/tools", icon: Wrench, label: language === 'ar' ? 'الأدوات' : 'Tools' },
    { to: "/settings", icon: Settings, label: language === 'ar' ? 'الإعدادات' : 'Settings' }
  ];

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col pt-6 shrink-0 z-20">
      <div className="px-6 mb-8 flex items-center gap-3 text-white">
        <Bot className="w-8 h-8 text-blue-500" />
        <span className="text-xl font-bold tracking-wider">ZOOM</span>
      </div>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? "bg-blue-600/10 text-blue-500" 
                  : "text-gray-400 hover:text-gray-100 hover:bg-gray-800/50"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800 flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
           <span className="text-xs text-gray-400 font-medium">{language === 'ar' ? 'اللغة' : 'Language'}</span>
           <select 
             value={language} 
             onChange={(e) => updateSettings({ language: e.target.value as 'en' | 'ar' })}
             className="bg-gray-800 text-xs text-gray-300 rounded px-2 py-1 outline-none border border-gray-700 focus:border-blue-500 cursor-pointer"
           >
             <option value="en">English</option>
             <option value="ar">العربية</option>
           </select>
        </div>
        <div className="flex items-center gap-3 px-3 py-2 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors group cursor-pointer" onClick={logout} title={language === 'ar' ? 'تسجيل الخروج' : 'Click to logout'}>
          {currentUser?.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full border border-gray-700 bg-gray-800" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {currentUser?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          )}
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-gray-200 truncate">{currentUser?.name || (language === 'ar' ? 'مدير' : 'Admin User')}</span>
            <span className="text-xs text-gray-500 truncate group-hover:text-red-400 transition-colors">{language === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MainLayout() {
  const { currentUser } = useAuthStore();
  const { language } = useSettingsStore();

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="flex h-screen w-full bg-gray-950 overflow-hidden font-sans text-gray-200">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0" role="main">
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/chat" element={<ChatScreen />} />
          <Route path="/sessions" element={<SessionsScreen />} />
          <Route path="/profiles" element={<ProfilesScreen />} />
          <Route path="/skills" element={<SkillsScreen />} />
          <Route path="/persona" element={<PersonaScreen />} />
          <Route path="/memory" element={<MemoryScreen />} />
          <Route path="/tools" element={<ToolsScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
      </main>
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/setup" element={<SetupScreen />} />
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </Router>
  );
}

