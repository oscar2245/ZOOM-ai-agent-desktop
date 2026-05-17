import { useState } from 'react';
import { Shield, Database, Cpu } from 'lucide-react';
import { useSettingsStore } from '../store';
import { useNavigate } from 'react-router-dom';

export default function SettingsScreen() {
  const { provider, model, theme, language, updateSettings } = useSettingsStore();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleExport = () => {
    const configData = JSON.stringify({ provider, model, theme }, null, 2);
    const blob = new Blob([configData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'zoom-config.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    localStorage.clear();
    setShowModal(false);
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] p-8 overflow-y-auto">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold text-gray-100 mb-2">{language === 'ar' ? 'الإعدادات' : 'Configuration'}</h1>
        <p className="text-gray-400 text-sm mb-12">{language === 'ar' ? 'إدارة إعدادات المنسق العام واتصالات واجهة برمجة التطبيقات (API).' : 'Manage your global orchestrator settings and API connections.'}</p>

        <section className="mb-12">
          <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-6">{language === 'ar' ? 'الاستدلال' : 'Inference'}</h2>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{language === 'ar' ? 'مقدم الذكاء الاصطناعي' : 'AI Provider'}</label>
              <select 
                value={provider}
                onChange={(e) => updateSettings({ provider: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-blue-500 appearance-none"
              >
                <option>OpenRouter</option>
                <option>Anthropic</option>
                <option>OpenAI</option>
                <option>Local LLM</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{language === 'ar' ? 'مفتاح واجهة برمجة التطبيقات' : 'API Key'}</label>
              <div className="relative">
                <input 
                  type="password" 
                  defaultValue="sk-or-v1-************************" 
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-blue-500" 
                />
              </div>
            </div>
          </div>
          <div className="mb-6">
             <label className="block text-sm font-medium text-gray-300 mb-2">{language === 'ar' ? 'النموذج' : 'Model'}</label>
              <select 
                value={model}
                onChange={(e) => updateSettings({ model: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-blue-500 appearance-none"
              >
                <option>anthropic/claude-3.5-sonnet:beta</option>
                <option>openai/gpt-4o</option>
                <option>meta-llama/llama-3-70b-instruct</option>
              </select>
          </div>
        </section>

        <section className="mb-12 border-t border-gray-800 pt-12">
          <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-6">{language === 'ar' ? 'المظهر' : 'Appearance'}</h2>
          <div className="flex items-center justify-between py-3">
             <span className="text-gray-300 font-medium">{language === 'ar' ? 'اختيار المظهر' : 'Theme Selection'}</span>
             <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
                <button 
                  onClick={() => updateSettings({ theme: 'dark' })}
                  className={`px-4 py-1.5 rounded-md font-medium text-sm transition-colors ${theme === 'dark' ? 'bg-blue-600/20 text-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
                >{language === 'ar' ? 'داكن' : 'Dark'}</button>
                <button 
                  onClick={() => updateSettings({ theme: 'light' })}
                  className={`px-4 py-1.5 rounded-md font-medium text-sm transition-colors ${theme === 'light' ? 'bg-blue-600/20 text-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
                >{language === 'ar' ? 'فاتح' : 'Light'}</button>
             </div>
          </div>
        </section>

        <section className="mb-12 border-t border-gray-800 pt-12">
          <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-6">{language === 'ar' ? 'خيارات متقدمة' : 'Advanced'}</h2>
          <div className="flex items-center justify-between py-4 border-b border-gray-800/50">
             <div>
               <span className="block text-gray-300 font-medium mb-1">{language === 'ar' ? 'تصدير الإعدادات' : 'Export Configuration'}</span>
               <span className="block text-gray-500 text-sm">{language === 'ar' ? 'قم بتنزيل نسخة احتياطية من إعداداتك بتنسيق JSON.' : 'Download a JSON backup of your settings.'}</span>
             </div>
             <button onClick={handleExport} className="px-4 py-2 border border-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-800 transition-colors">{language === 'ar' ? 'تصدير' : 'Export Config'}</button>
          </div>
          <div className="flex items-center justify-between py-4">
             <div>
               <span className="block text-gray-300 font-medium mb-1">{language === 'ar' ? 'منطقة الخطر' : 'Danger Zone'}</span>
               <span className="block text-gray-500 text-sm">{language === 'ar' ? 'مسح بيانات الاتصال والوكيل نهائيًا.' : 'Permanently wipe all agent and connection data.'}</span>
             </div>
             <button 
               onClick={() => setShowModal(true)}
               className="px-4 py-2 bg-red-900/20 text-red-500 border border-red-900/50 rounded-lg text-sm hover:bg-red-900/40 transition-colors"
             >
               {language === 'ar' ? 'إعادة ضبط المصنع' : 'Hard Reset Installation'}
             </button>
          </div>
        </section>
      </div>

      <div className={`fixed bottom-0 ${language === 'ar' ? 'right-64 left-0' : 'left-64 right-0'} p-4 border-t border-gray-800 bg-[#121212]/90 backdrop-blur flex justify-between items-center text-xs font-mono text-gray-500 z-10`}>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            {language === 'ar' ? 'حالة النظام: مشفر وجاهز' : 'SYSTEM STATUS: ENCRYPTED & READY'}
         </div>
         <div className="flex gap-4">
            <Shield size={14} />
            <Database size={14} />
            <Cpu size={14} />
         </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
           <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                 <Shield size={20} />
               </div>
               <h3 className="text-lg font-semibold text-gray-200">{language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?'}</h3>
             </div>
             <p className="text-gray-400 text-sm mb-6 pb-6 border-b border-gray-800">
               {language === 'ar' ? 'هذا الإجراء لا يمكن التراجع عنه. سيقوم بحذف جميع البيانات المحلية، بما في ذلك المفاتيح، والملفات الشخصية للوكلاء، وسجل المحادثات.' : 'This action cannot be undone. This will delete all local data, including API keys, custom agent personalities, and message history.'}
             </p>
             <div className="flex justify-end gap-3 mt-4">
               <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg font-medium text-sm transition-colors">{language === 'ar' ? 'إلغاء' : 'Cancel'}</button>
               <button onClick={handleReset} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm shadow-md shadow-red-500/20 transition-colors">{language === 'ar' ? 'إعادة ضبط' : 'Reset'}</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
