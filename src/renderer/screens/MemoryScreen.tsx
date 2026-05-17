import { useState, useEffect } from 'react';
import { useProfilesStore, useSettingsStore } from '../store';
import { Brain, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

export default function MemoryScreen() {
  const { activeProfile } = useProfilesStore();
  const { language } = useSettingsStore();
  const [memories, setMemories] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (activeProfile) loadMemories();
  }, [activeProfile]);

  const loadMemories = async () => {
    if (!activeProfile) return;
    const data = await window.api?.getMemories?.(activeProfile);
    setMemories(data || []);
  };

  const handleSave = async (id: string) => {
    if (!activeProfile) return;
    await window.api?.updateMemory?.(activeProfile, id, editText);
    setEditing(null);
    loadMemories();
  };

  const handleDelete = async (id: string) => {
    if (!activeProfile) return;
    await window.api?.deleteMemory?.(activeProfile, id);
    loadMemories();
  };

  const handleAdd = async () => {
    if (!activeProfile) return;
    await window.api?.addMemory?.(activeProfile, 'New memory entry');
    loadMemories();
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100 mb-2 flex items-center gap-2">
            <Brain className="text-blue-500" />
            {language === 'ar' ? 'الذاكرة بعيدة المدى' : 'Long-Term Memory'}
          </h1>
          <p className="text-gray-400 text-sm">{language === 'ar' ? 'إدارة قاعدة الذاكرة الدلالية للملف النشط.' : 'Manage the semantic memory database for the active profile.'}</p>
        </div>
        <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
          <Plus size={18} /> {language === 'ar' ? 'إضافة ذاكرة' : 'Add Memory'}
        </button>
      </div>
      
      {memories.length === 0 ? (
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center text-gray-500">
          {language === 'ar' ? 'لا توجد ذكريات محفوظة. ذكرياتك ستظهر هنا.' : 'No memories saved. Memories will appear here.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 pb-10">
          {memories.map((mem) => (
            <div key={mem.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col group relative hover:border-gray-700 transition-colors">
              {editing === mem.id ? (
                <div className="flex flex-col gap-3 h-full">
                  <textarea 
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-200 focus:outline-none focus:border-blue-500 resize-none h-32"
                  />
                  <div className="flex justify-end gap-2 mt-auto">
                    <button onClick={() => setEditing(null)} className="p-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"><X size={16} /></button>
                    <button onClick={() => handleSave(mem.id)} className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"><Save size={16} /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-gray-300 text-sm whitespace-pre-wrap flex-1 mb-4 h-24 overflow-y-auto">{mem.content}</div>
                  <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-800/50">
                    <span className="text-xs text-gray-500">{new Date(mem.updatedAt).toLocaleDateString()}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditing(mem.id); setEditText(mem.content); }} className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(mem.id)} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
