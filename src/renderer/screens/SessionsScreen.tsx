import { useState, useRef } from 'react';
import { Clock, Search, Filter, Trash2, Play, Download, Upload } from 'lucide-react';
import { useSessionsStore, useSettingsStore } from '../store';
import ConfirmModal from '../components/ConfirmModal';

export default function SessionsScreen() {
  const { sessions, addSession, deleteSession, setActiveSession } = useSessionsStore();
  const { language } = useSettingsStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNewSession = () => {
    addSession({
      id: Date.now().toString(),
      title: language === 'ar' ? `جلسة جديدة ${sessions.length + 1}` : `New Session ${sessions.length + 1}`,
      time: language === 'ar' ? 'الآن' : 'Just now',
      active: true,
      count: 0
    });
    setActiveSession(Date.now().toString());
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteSession(deleteId);
      setDeleteId(null);
    }
  };

  const handlePlay = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSession(id);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(sessions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sessions_backup.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (Array.isArray(imported)) {
             imported.forEach(s => addSession({ ...s, id: Date.now().toString() + Math.random() }));
          }
        } catch (err) {
          console.error("Failed to import sessions");
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100 mb-1">{language === 'ar' ? 'الجلسات النشطة' : 'Active Sessions'}</h1>
          <p className="text-gray-400 text-sm">{language === 'ar' ? 'إدارة وتنسيق تفاعلات وحوارات الوكلاء.' : 'Manage and orchestrate your ongoing AI agent interactions.'}</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".json" 
            className="hidden" 
          />
          <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-lg transition-colors flex items-center gap-2">
            <Upload size={18} /> {language === 'ar' ? 'استيراد' : 'Import'}
          </button>
          <button onClick={handleExport} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-lg transition-colors flex items-center gap-2">
            <Download size={18} /> {language === 'ar' ? 'تصدير' : 'Export'}
          </button>
          <button onClick={handleNewSession} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors">
            {language === 'ar' ? '+ جلسة جديدة' : '+ New Session'}
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder={language === 'ar' ? 'ابحث في الجلسات...' : 'Search all sessions, logs, and agent activity...'}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-gray-200 focus:outline-none focus:border-gray-600"
          />
        </div>
        <button className="px-4 py-2 bg-gray-900 border border-gray-800 text-gray-300 font-medium rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-colors">
          <Filter size={18} />
          {language === 'ar' ? 'تصفية' : 'Filter'}
        </button>
      </div>

      <div className="space-y-3 overflow-y-auto pb-4" role="list">
        {sessions.map(s => (
          <div key={s.id} onClick={(e) => handlePlay(s.id, e)} className="group p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors flex items-center justify-between cursor-pointer" role="listitem" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handlePlay(s.id, e as any)}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${s.active ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'bg-gray-800 text-gray-400 border-gray-700'}`} aria-hidden="true">
                <Clock size={20} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className={`font-semibold text-lg ${s.active ? 'text-blue-400' : 'text-gray-200'}`}>{s.title}</h3>
                  {s.active && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30" aria-label="Active session">{language === 'ar' ? 'نشط' : 'ACTIVE'}</span>}
                </div>
                <p className="text-sm text-gray-400 truncate max-w-lg">
                  {s.count > 0 ? (language === 'ar' ? '"لقد قمت بتحليل السجلات..."' : "\"I've analyzed the logs and found a correlation between...\"") : (language === 'ar' ? 'جلسة فارغة' : 'Empty session')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-gray-400 text-sm block mb-1">{s.time}</span>
                <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full text-xs font-medium border border-gray-700">{s.count} {language === 'ar' ? 'رسالة' : 'msgs'}</span>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => handlePlay(s.id, e)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white" title="Resume Session" aria-label={`Resume session ${s.title}`}><Play size={18} /></button>
                <button onClick={(e) => handleDelete(s.id, e)} className="p-2 hover:bg-red-900/30 rounded-lg text-gray-400 hover:text-red-400" title="Delete Session" aria-label={`Delete session ${s.title}`}><Trash2 size={18} /></button>
              </div>
            </div>
          </div>
        ))}
        {sessions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {language === 'ar' ? 'لا توجد جلسات. ابدأ جلسة جديدة!' : 'No active sessions. Start a new one!'}
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={!!deleteId}
        title={language === 'ar' ? 'حذف الجلسة' : 'Delete Session'}
        message={language === 'ar' ? 'هل أنت متأكد من حذف هذه الجلسة؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this session? This action cannot be undone.'}
        isDestructive={true}
        confirmLabel={language === 'ar' ? 'حذف' : 'Delete'}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
