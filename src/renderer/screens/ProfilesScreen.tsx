import { useState, useRef } from 'react';
import { Plus, Settings, X, Upload, Trash2 } from 'lucide-react';
import { useProfilesStore, Profile, useSettingsStore } from '../store';
import ConfirmModal from '../components/ConfirmModal';

export default function ProfilesScreen() {
  const { profiles, activeProfile, setActiveProfile, addProfile, updateProfile, deleteProfile } = useProfilesStore();
  const { language } = useSettingsStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openNewModal = () => {
    setEditingId(null);
    setName('');
    setDesc('');
    setTags('');
    setAvatarUrl(null);
    setShowModal(true);
  };

  const openEditModal = (profile: Profile) => {
    setEditingId(profile.id);
    setName(profile.name);
    setDesc(profile.desc);
    setTags(profile.tags.join(', '));
    setAvatarUrl(profile.avatarUrl || null);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    const initials = name.substring(0, 2).toUpperCase();
    const colors = ['bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-teal-600', 'bg-rose-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Auto-generate avatar if none uploaded
    const finalAvatar = avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`;

    if (editingId) {
      updateProfile(editingId, {
        name,
        desc,
        tags: tagsArray,
        avatarUrl: finalAvatar
      });
    } else {
      addProfile({
        id: Date.now().toString(),
        name,
        desc,
        initials,
        color: randomColor,
        active: false,
        tags: tagsArray,
        avatarUrl: finalAvatar
      });
    }

    setShowModal(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteProfile(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100 mb-1">{language === 'ar' ? 'ملفات الوكلاء' : 'Agent Profiles'}</h1>
          <p className="text-gray-400 text-sm">{language === 'ar' ? 'أدر وبدّل بين هويات الذكاء الاصطناعي المتخصصة.' : 'Manage and switch between your specialized AI identities.'}</p>
        </div>
        <button onClick={openNewModal} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2" aria-label="Create New Profile">
          <Plus size={18} /> {language === 'ar' ? 'ملف جديد' : 'New Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" role="list">
        {profiles.map(p => {
          const isActive = p.id === activeProfile;
          return (
           <div key={p.id} className={`p-6 rounded-2xl border flex flex-col items-center text-center transition-all relative group ${isActive ? 'bg-blue-600/5 border-blue-500/50' : 'bg-gray-900 border-gray-800'}`} role="listitem">
             <button 
               onClick={(e) => handleDelete(p.id, e)}
               className="absolute top-3 right-3 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
               title="Delete Profile"
               aria-label={`Delete profile ${p.name}`}
             >
               <Trash2 size={16} />
             </button>
             
             <div 
               className="relative mb-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
               onClick={() => openEditModal(p)}
               title="Edit Profile"
               tabIndex={0}
               onKeyDown={(e) => e.key === 'Enter' && openEditModal(p)}
               aria-label={`Edit profile ${p.name}`}
             >
               {p.avatarUrl ? (
                 <img src={p.avatarUrl} alt={p.name} className="w-16 h-16 rounded-full object-cover shadow-lg border border-gray-700" />
               ) : (
                 <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg ${p.color}`} aria-hidden="true">
                   {p.initials}
                 </div>
               )}
               {isActive && <div className="absolute -top-1 -right-4 bg-green-500 border-2 border-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow animate-pulse" aria-label="Active Profile Marker">{language === 'ar' ? 'نشط' : 'ACTIVE'}</div>}
             </div>
             <h3 className="text-lg font-semibold text-gray-100 mb-2 cursor-pointer hover:underline decoration-gray-500" onClick={() => openEditModal(p)}>{p.name}</h3>
             <p className="text-sm text-gray-400 mb-6 flex-1">{p.desc}</p>
             <button 
               onClick={() => setActiveProfile(p.id)}
               aria-label={isActive ? `Profile ${p.name} is active` : `Switch to profile ${p.name}`}
               className={`w-full py-2.5 rounded-xl font-medium transition-colors mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700'}`}>
               {isActive ? (language === 'ar' ? 'الملف الشخصي النشط' : 'Active Profile') : (language === 'ar' ? 'التبديل' : 'Switch')}
             </button>
             <div className="flex flex-wrap items-center justify-center gap-2" aria-label="Profile tags">
               {p.tags.map(t => (
                 <span key={t} className="px-2 py-1 bg-gray-800/50 text-gray-500 rounded text-xs font-mono border border-gray-800">{t}</span>
               ))}
             </div>
           </div>
          )
        })}
        <button onClick={openNewModal} aria-label="Create new profile" className="p-6 rounded-2xl border-2 border-dashed border-gray-800 hover:border-gray-600 hover:bg-gray-900/50 flex flex-col items-center justify-center text-center transition-colors cursor-pointer min-h-[300px] focus:outline-none focus:border-blue-500">
           <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-500 mb-4" aria-hidden="true">
             <Plus size={24} />
           </div>
           <h3 className="text-lg font-semibold text-gray-300 mb-2">{language === 'ar' ? 'إنشاء ملف' : 'Create Profile'}</h3>
           <p className="text-sm text-gray-500 max-w-[200px]">{language === 'ar' ? 'قم بإعداد وكيل مخصص بمجموعات أدوات وتوجيهات محددة.' : 'Configure a custom agent with specific toolsets and system prompts.'}</p>
        </button>
      </div>

      {/* Inference Logs (Mock) */}
      <div className="bg-black border border-gray-800 rounded-xl p-4 font-mono text-sm text-gray-400 h-64 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-3">
          <span className="flex items-center gap-2 text-xs text-gray-500"><Settings size={14} /> {language === 'ar' ? 'سجلات الاستدلال النشطة' : 'ACTIVE INFERENCE LOGS'}</span>
          <span className="text-xs text-green-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            {language === 'ar' ? 'وقت التشغيل' : 'UPTIME'}: 142:12:05
          </span>
        </div>
        <div className="space-y-1">
          <div><span className="text-gray-500">14:02:11</span> <span className="text-blue-400">[SYS]</span> {language === 'ar' ? 'تمت مزامنة ملف الباحث مع الذاكرة السحابية.' : 'Researcher profile synchronized with cloud memory.'}</div>
          <div><span className="text-gray-500">14:02:15</span> <span className="text-green-400">[INF]</span> {language === 'ar' ? 'معالجة استعلام اللغة الطبيعية: "قارن نتائج الربع الثالث..."' : 'Processing natural language query: "Compare Q3 results..."'}</div>
          <div><span className="text-gray-500">14:02:18</span> <span className="text-blue-400">[LLM]</span> {language === 'ar' ? 'تم إنشاء تيار الرموز. زمن الاستجابة: 42 مللي ثانية.' : 'Token stream established. Latency: 42ms.'}</div>
          <div><span className="text-gray-500">14:03:01</span> <span className="text-blue-400">[SYS]</span> {language === 'ar' ? 'تم تحديث بيانات الملف الإبداعي. تم مسح الذاكرة المخبأة.' : 'Creative profile metadata updated. Local cache cleared.'}</div>
          <div className="text-gray-200"><span className="text-gray-500">14:05:22</span> <span className="text-green-400">[ACT]</span> {language === 'ar' ? 'الوكيل الباحث يقوم حاليا بتحليل مصدر البيانات الخارجي #42..._' : 'RESEARCHER agent is currently analyzing external data source #42..._'}</div>
        </div>
      </div>

      {/* New/Edit Profile Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/50">
              <h3 className="text-lg font-semibold text-gray-100">{editingId ? (language === 'ar' ? 'تعديل الملف' : 'Edit Profile') : (language === 'ar' ? 'ملف جديد' : 'New Profile')}</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center justify-center">
                <div 
                  className="relative w-20 h-20 rounded-full border border-gray-700 bg-gray-800 flex items-center justify-center overflow-hidden cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={24} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-semibold text-white">{language === 'ar' ? 'رفع' : 'Upload'}</span>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/webp" 
                  onChange={handleAvatarUpload} 
                />
                <button 
                  onClick={() => setAvatarUrl(null)}
                  className={`mt-2 text-xs text-red-500 hover:text-red-400 ${avatarUrl ? 'block' : 'hidden'}`}
                >
                  {language === 'ar' ? 'إزالة الصورة' : 'Remove Avatar'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{language === 'ar' ? 'الاسم' : 'Name'}</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: عالم بيانات' : 'e.g. Data Scientist'} 
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{language === 'ar' ? 'الوصف' : 'Description'}</label>
                <textarea 
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder={language === 'ar' ? 'ماذا يفعل هذا الوكيل؟' : 'What does this agent do?'}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-blue-500 resize-none h-20" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{language === 'ar' ? 'الكلمات الدالة (مفصولة بفواصل)' : 'Tags (Comma separated)'}</label>
                <input 
                  type="text" 
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: برمجة، بصري' : 'e.g. CODING, VISUAL'} 
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-blue-500" 
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-800 bg-gray-950/50 flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg font-medium text-sm transition-colors">{language === 'ar' ? 'إلغاء' : 'Cancel'}</button>
              <button 
                onClick={handleSave} 
                disabled={!name.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm shadow-md shadow-blue-500/20 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
              >
                {editingId ? (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes') : (language === 'ar' ? 'إنشاء ملف' : 'Create Profile')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title={language === 'ar' ? 'حذف الملف' : 'Delete Profile'}
        message={language === 'ar' ? 'هل أنت متأكد من حذف هذا الملف؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this profile? This action cannot be undone.'}
        isDestructive={true}
        confirmLabel={language === 'ar' ? 'حذف' : 'Delete'}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
