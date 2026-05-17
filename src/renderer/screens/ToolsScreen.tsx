import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store';
import { Wrench, ToggleLeft, ToggleRight, Info } from 'lucide-react';

interface Tool {
  id: string;
  name?: string;
  description?: string;
  icon?: string;
  enabled: boolean;
}

export default function ToolsScreen() {
  const { language } = useSettingsStore();
  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    const config = await window.api?.readConfig?.();
    setTools(config?.tools || []);
  };

  const toggleTool = async (toolId: string, enabled: boolean) => {
    await window.api?.toggleTool?.(toolId, enabled);
    loadTools();
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-100 mb-2 flex items-center gap-2">
          <Wrench className="text-blue-500" />
          {language === 'ar' ? 'الأدوات المدمجة' : 'Native Tools'}
        </h1>
        <p className="text-gray-400 text-sm">
          {language === 'ar' ? 'تفعيل أو تعطيل القدرات المدمجة والتكاملات.' : 'Enable or disable built-in capabilities and gateway integrations.'}
        </p>
      </div>
      
      {tools.length === 0 ? (
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center text-gray-500 flex-col gap-3">
           <Info size={24} className="text-gray-600" />
           <p>{language === 'ar' ? 'لا توجد أدوات متاحة حالياً.' : 'No tools available currently.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map(tool => (
            <div key={tool.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col hover:border-gray-700 transition-colors">
               <div className="flex justify-between items-start mb-4">
                 <h3 className="text-lg font-medium text-gray-200">{tool.name || tool.id}</h3>
                 <button 
                   onClick={() => toggleTool(tool.id, !tool.enabled)}
                   className={`transition-colors flex-shrink-0 ${tool.enabled ? 'text-green-500' : 'text-gray-600 hover:text-gray-400'}`}
                 >
                   {tool.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                 </button>
               </div>
               <p className="text-sm text-gray-400 mb-4 flex-1">
                 {tool.description || (language === 'ar' ? 'لا يوجد وصف متاح.' : 'No description available.')}
               </p>
               <div className="flex items-center gap-2 mt-auto">
                 <span className={`px-2 py-1 rounded text-xs font-semibold ${tool.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                   {tool.enabled ? (language === 'ar' ? 'نشط' : 'ENABLED') : (language === 'ar' ? 'معطل' : 'DISABLED')}
                 </span>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
