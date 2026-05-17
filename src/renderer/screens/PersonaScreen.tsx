import { useState, useEffect } from 'react';
import { useProfilesStore, useToastStore, useSettingsStore } from '../store';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PersonaScreen() {
  const { profiles, activeProfile, updateProfile } = useProfilesStore();
  const currentProfile = profiles.find(p => p.id === activeProfile);
  const [prompt, setPrompt] = useState('');
  const { addToast } = useToastStore();
  const { language } = useSettingsStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentProfile) {
      setPrompt(currentProfile.desc || "You are a helpful, brilliant AI assistant.\n\nYour primary directive is to serve the user efficiently.");
    }
  }, [currentProfile]);

  const handleSave = () => {
    if (currentProfile) {
      updateProfile(currentProfile.id, { desc: prompt });
      addToast(language === 'ar' ? 'تم حفظ الشخصية بنجاح!' : 'Persona saved successfully!', 'success');
    }
  };

  const handleAddPersona = () => {
    navigate('/profiles');
    setTimeout(() => {
      addToast(language === 'ar' ? 'أنشئ ملفاً جديداً لإضافة شخصية أخرى.' : 'Create a new profile to add another persona.', 'info');
    }, 100);
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100 mb-2">{language === 'ar' ? 'إعدادات الشخصية' : 'Persona Configuration'}</h1>
          <p className="text-gray-400 text-sm">{language === 'ar' ? 'قم بتعديل التوجيهات الأساسية وملف الروح للملف الشخصي النشط.' : 'Edit the active profile\'s system prompt and soul file.'}</p>
        </div>
        <button onClick={handleAddPersona} className="px-4 py-2 bg-transparent border border-gray-700 hover:bg-gray-800 text-gray-200 font-medium rounded-lg transition-colors flex items-center gap-2">
          <Plus size={18} /> {language === 'ar' ? 'إضافة شخصية جديدة' : 'Add New Persona'}
        </button>
      </div>
      {currentProfile ? (
        <textarea 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-6 text-gray-200 font-mono text-sm focus:outline-none focus:border-blue-500 resize-none" 
          aria-label="Persona system prompt"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 border border-dashed border-gray-800 rounded-xl">
          {language === 'ar' ? 'حدد أو أنشئ ملفًا شخصيًا نشطًا أولاً.' : 'Select or create an active profile first.'}
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={!currentProfile}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
        >
          {language === 'ar' ? 'حفظ الشخصية' : 'Save Persona'}
        </button>
      </div>
    </div>
  );
}
