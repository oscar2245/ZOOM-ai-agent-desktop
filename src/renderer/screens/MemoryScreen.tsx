import { useSettingsStore } from '../store';

export default function MemoryScreen() {
  const { language } = useSettingsStore();

  return (
    <div className="flex flex-col h-full bg-[#121212] p-8">
      <h1 className="text-2xl font-semibold text-gray-100 mb-2">{language === 'ar' ? 'الذاكرة بعيدة المدى' : 'Long-Term Memory'}</h1>
      <p className="text-gray-400 text-sm mb-8">{language === 'ar' ? 'إدارة قاعدة الذاكرة الدلالية للملف النشط.' : 'Manage the semantic memory database for the active profile.'}</p>
      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center text-gray-500">
        {language === 'ar' ? 'واجهة الإدارة قريباً.' : 'Memory management interface coming soon.'}
      </div>
    </div>
  );
}
