import { useSettingsStore } from '../store';

export default function ToolsScreen() {
  const { language } = useSettingsStore();

  return (
    <div className="flex flex-col h-full bg-[#121212] p-8">
      <h1 className="text-2xl font-semibold text-gray-100 mb-2">{language === 'ar' ? 'الأدوات المدمجة' : 'Native Tools'}</h1>
      <p className="text-gray-400 text-sm mb-8">{language === 'ar' ? 'تفعيل أو تعطيل القدرات المدمجة والتكاملات.' : 'Enable or disable built-in capabilities and gateway integrations.'}</p>
      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center text-gray-500">
        {language === 'ar' ? 'واجهة التكوين قريباً.' : 'Tools configuration interface coming soon.'}
      </div>
    </div>
  );
}
