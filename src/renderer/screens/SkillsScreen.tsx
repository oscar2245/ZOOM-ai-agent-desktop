import { useState } from 'react';
import { Globe, Terminal, Image as ImageIcon, FileText, Cloud, MoreVertical, Zap, Search, Download, Star, ExternalLink, Filter, ChevronDown, Check, AlertTriangle, History } from 'lucide-react';
import { useToastStore, useSettingsStore } from '../store';

const ALL_SKILLS = [
  { 
    id: '1', icon: Globe, name: 'Web Search', desc: 'Browse the web for real-time information.', 
    version: '2.1.0', active: true, installed: true, dependencies: [],
    category: 'Data Analysis', vendor: 'AgentCore', reliabilityScore: 98, popularity: 15400, rating: 4.8, releaseDate: '2025-10-01',
    versions: [
      { version: '2.1.0', date: '2025-10-01', changes: 'Improved parsing engine.' },
      { version: '2.0.0', date: '2025-08-15', changes: 'Major overhaul of search logic.' },
      { version: '1.5.0', date: '2025-04-10', changes: 'Added proxy support.' }
    ]
  },
  { 
    id: '2', icon: Terminal, name: 'Python Runner', desc: 'Execute Python scripts in a secure sandbox.', 
    version: '1.4.2', active: true, installed: true, dependencies: ['5'], // Depends on S3 Connector fake
    category: 'Development', vendor: 'DataWorks', reliabilityScore: 95, popularity: 8200, rating: 4.6, releaseDate: '2025-09-12',
    versions: [
      { version: '1.4.2', date: '2025-09-12', changes: 'Fixed pandas import bug.' },
      { version: '1.4.0', date: '2025-07-20', changes: 'Added matplotlib support.' }
    ]
  },
  { 
    id: '3', icon: ImageIcon, name: 'DALL-E 3', desc: 'Generate high-quality images from text descriptions.', 
    version: '1.0.0', active: false, installed: true, dependencies: [],
    category: 'Media', vendor: 'OpenAI', reliabilityScore: 99, popularity: 21000, rating: 4.9, releaseDate: '2026-01-05',
    versions: [
      { version: '1.0.0', date: '2026-01-05', changes: 'Initial release.' }
    ]
  },
  { 
    id: '4', icon: FileText, name: 'File Parser', desc: 'Intelligently extract and summarize content.', 
    version: '3.0.1', active: false, installed: false, dependencies: [],
    category: 'Data Analysis', vendor: 'DocuTech', reliabilityScore: 91, popularity: 5600, rating: 4.2, releaseDate: '2025-11-20',
    versions: [
      { version: '3.0.1', date: '2025-11-20', changes: 'Fixed PDF parsing.' },
      { version: '3.0.0', date: '2025-11-01', changes: 'Added DOCX support.' }
    ]
  },
  { 
    id: '5', icon: Cloud, name: 'S3 Connector', desc: 'Read and write data to AWS S3 buckets.', 
    version: '0.9.5', active: false, installed: true, dependencies: [],
    category: 'Infrastructure', vendor: 'CloudSystems', reliabilityScore: 88, popularity: 3400, rating: 3.9, releaseDate: '2025-06-30',
    versions: [
      { version: '0.9.5', date: '2025-06-30', changes: 'Beta release for S3.' }
    ]
  },
  { 
    id: '6', icon: Zap, name: 'Auto Optimizer', desc: 'Automatically optimizes prompt engineering.', 
    version: '1.2.0', active: false, installed: false, dependencies: ['1'], // Depends on Web Search
    category: 'Development', vendor: 'AgentCore', reliabilityScore: 94, popularity: 12000, rating: 4.5, releaseDate: '2026-03-15',
    versions: [
      { version: '1.2.0', date: '2026-03-15', changes: 'Added generic task optimization.' },
      { version: '1.0.0', date: '2025-12-01', changes: 'Initial release.' }
    ]
  }
];

export default function SkillsScreen() {
  const [skills, setSkills] = useState(ALL_SKILLS);
  const [activeTab, setActiveTab] = useState<'MySkills' | 'Marketplace'>('MySkills');
  const [searchQuery, setSearchQuery] = useState('');
  
  // My Skills filters
  const [mySkillsFilter, setMySkillsFilter] = useState<'All' | 'Enabled' | 'Disabled'>('All');
  
  // Marketplace filters
  const [marketCategory, setMarketCategory] = useState('All');
  const [marketSort, setMarketSort] = useState<'Popularity' | 'Rating' | 'ReleaseDate'>('Popularity');
  const [marketMinScore, setMarketMinScore] = useState(0);
  const [marketVendor, setMarketVendor] = useState('All');

  const [depAlert, setDepAlert] = useState<{ skillId: string, missingDeps: string[], action: 'install' | 'enable' } | null>(null);
  const [versionModal, setVersionModal] = useState<{ skillId: string } | null>(null);

  const { addToast } = useToastStore();
  const { language } = useSettingsStore();

  const handleToggleSkill = (id: string, forceEnableDeps = false) => {
    const skill = skills.find(s => s.id === id);
    if (!skill) return;

    if (!skill.active && !forceEnableDeps && skill.dependencies.length > 0) {
      // Check if deps are enabled
      const missing = skill.dependencies.filter(depId => !skills.find(s => s.id === depId)?.active);
      if (missing.length > 0) {
        setDepAlert({ skillId: id, missingDeps: missing, action: 'enable' });
        return;
      }
    }

    setSkills(prev => {
      let next = [...prev];
      const targetIndex = next.findIndex(s => s.id === id);
      next[targetIndex] = { ...next[targetIndex], active: !next[targetIndex].active };
      
      if (forceEnableDeps && !skill.active) {
        skill.dependencies.forEach(depId => {
          const depIdx = next.findIndex(s => s.id === depId);
          if (depIdx > -1) {
            next[depIdx] = { ...next[depIdx], active: true, installed: true };
          }
        });
      }
      return next;
    });
  };

  const handleInstallSkill = (id: string, forceInstallDeps = false) => {
    const skill = skills.find(s => s.id === id);
    if (!skill) return;

    if (!forceInstallDeps && skill.dependencies.length > 0) {
      const missing = skill.dependencies.filter(depId => !skills.find(s => s.id === depId)?.installed);
      if (missing.length > 0) {
        setDepAlert({ skillId: id, missingDeps: missing, action: 'install' });
        return;
      }
    }

    setSkills(prev => {
      let next = [...prev];
      const targetIndex = next.findIndex(s => s.id === id);
      next[targetIndex] = { ...next[targetIndex], installed: true, active: true };
      
      if (forceInstallDeps) {
        skill.dependencies.forEach(depId => {
          const depIdx = next.findIndex(s => s.id === depId);
          if (depIdx > -1) {
            next[depIdx] = { ...next[depIdx], installed: true, active: true };
          }
        });
      }
      return next;
    });
    addToast(`${skill.name} installed successfully!`, 'success');
  };

  const handleRevertVersion = (skillId: string, version: string) => {
    setSkills(prev => prev.map(s => s.id === skillId ? { ...s, version } : s));
    addToast(`Reverted to version ${version}`, 'success');
    setVersionModal(null);
  };

  const installedSkills = skills.filter(s => s.installed);
  
  const filteredMySkills = installedSkills.filter(s => {
    const matchesFilter = mySkillsFilter === 'All' || (mySkillsFilter === 'Enabled' && s.active) || (mySkillsFilter === 'Disabled' && !s.active);
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const uniqueCategories = ['All', ...new Set(skills.map(s => s.category))];
  const uniqueVendors = ['All', ...new Set(skills.map(s => s.vendor))];

  const filteredMarketSkills = skills.filter(s => {
    if (marketCategory !== 'All' && s.category !== marketCategory) return false;
    if (marketVendor !== 'All' && s.vendor !== marketVendor) return false;
    if (s.reliabilityScore < marketMinScore) return false;
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase()) && !s.desc.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (marketSort === 'Popularity') return b.popularity - a.popularity;
    if (marketSort === 'Rating') return b.rating - a.rating;
    if (marketSort === 'ReleaseDate') return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    return 0;
  });

  return (
    <div className="flex flex-col h-full bg-[#121212] p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
           <div className="flex items-center gap-2 text-gray-400 text-xs font-bold tracking-widest mb-2 uppercase">
              <Zap size={14} className="text-blue-500" />
              {language === 'ar' ? 'محرك المهارات' : 'Skill Engine'}
           </div>
          <h1 className="text-2xl font-semibold text-gray-100 mb-1">{language === 'ar' ? 'المهارات' : 'Agent Skills'}</h1>
          <p className="text-gray-400 text-sm">{language === 'ar' ? 'قم بتوسيع قدرات الوكلاء الخاصين بك من خلال وحدات مخصصة.' : 'Extend your agents\' capabilities with specialized modules.'}</p>
        </div>
      </div>

      <div className="flex gap-6 border-b border-gray-800 mb-6 pb-0">
        <button 
          onClick={() => { setActiveTab('MySkills'); setSearchQuery(''); }} 
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'MySkills' ? 'text-blue-500 border-blue-500' : 'text-gray-400 border-transparent hover:text-gray-200'}`}
        >{language === 'ar' ? 'مهاراتي' : 'My Skills'}</button>
        <button 
          onClick={() => { setActiveTab('Marketplace'); setSearchQuery(''); }} 
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Marketplace' ? 'text-blue-500 border-blue-500' : 'text-gray-400 border-transparent hover:text-gray-200'}`}
        >{language === 'ar' ? 'المتجر' : 'Marketplace'}</button>
      </div>

      {activeTab === 'MySkills' && (
        <>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
            <div className="flex gap-4">
              <button onClick={() => setMySkillsFilter('All')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${mySkillsFilter === 'All' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-200'}`}>{language === 'ar' ? 'الكل' : 'All'}</button>
              <button onClick={() => setMySkillsFilter('Enabled')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${mySkillsFilter === 'Enabled' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-200'}`}>{language === 'ar' ? 'مفعل' : 'Enabled'}</button>
              <button onClick={() => setMySkillsFilter('Disabled')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${mySkillsFilter === 'Disabled' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-200'}`}>{language === 'ar' ? 'معطل' : 'Disabled'}</button>
            </div>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder={language === 'ar' ? 'البحث...' : 'Search my skills...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {filteredMySkills.map(s => (
              <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col hover:border-gray-600 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-blue-400 border border-gray-700">
                    <s.icon size={24} />
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setVersionModal({ skillId: s.id })} className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-xs font-medium border border-gray-700 transition-colors">
                      <History size={12} />
                      v{s.version}
                    </button>
                    <div 
                      onClick={() => handleToggleSkill(s.id)}
                      className={`w-11 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${s.active ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${s.active ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-200 mb-2">{s.name}</h3>
                <p className="text-sm text-gray-400 flex-1">{s.desc}</p>
                <div className="pt-4 mt-6 border-t border-gray-800 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${s.active ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                    <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">{s.active ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'معطل' : 'Disabled')}</span>
                  </div>
                  {s.dependencies.length > 0 && (
                     <div className="text-xs text-gray-500 flex items-center gap-1" title={s.dependencies.map(d => skills.find(sk => sk.id === d)?.name).join(', ')}>
                       <Cloud size={14} /> {s.dependencies.length} {language === 'ar' ? 'تبعيات' : 'Dep(s)'}
                     </div>
                  )}
                </div>
              </div>
            ))}
            {filteredMySkills.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                {language === 'ar' ? 'لا توجد مهارات تطابق بحثك.' : 'No installed skills match your search.'}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'Marketplace' && (
        <>
          <div className="flex flex-col xl:flex-row gap-6 mb-6">
            <div className="flex-1 flex flex-wrap gap-4 items-center bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <span className="text-sm text-gray-300 font-medium whitespace-nowrap">{language === 'ar' ? 'تصفية حسب:' : 'Filter By:'}</span>
              </div>
              
              <select value={marketCategory} onChange={e => setMarketCategory(e.target.value)} className="bg-gray-800 border border-gray-700 text-sm text-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500">
                {uniqueCategories.map(c => <option key={c} value={c}>{c === 'All' ? (language === 'ar' ? 'جميع الفئات' : 'All Categories') : c}</option>)}
              </select>

              <select value={marketVendor} onChange={e => setMarketVendor(e.target.value)} className="bg-gray-800 border border-gray-700 text-sm text-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500">
                {uniqueVendors.map(v => <option key={v} value={v}>{v === 'All' ? (language === 'ar' ? 'جميع الموردين' : 'All Vendors') : v}</option>)}
              </select>

              <select value={marketMinScore} onChange={e => setMarketMinScore(Number(e.target.value))} className="bg-gray-800 border border-gray-700 text-sm text-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500">
                <option value={0}>{language === 'ar' ? 'أي موثوقية' : 'Any Reliability'}</option>
                <option value={80}>{language === 'ar' ? 'نقاط > 80' : 'Score > 80'}</option>
                <option value={90}>{language === 'ar' ? 'نقاط > 90' : 'Score > 90'}</option>
                <option value={95}>{language === 'ar' ? 'نقاط > 95' : 'Score > 95'}</option>
              </select>
            </div>

            <div className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4">
               <span className="text-sm text-gray-300 font-medium whitespace-nowrap">{language === 'ar' ? 'ترتيب حسب:' : 'Sort By:'}</span>
               <select value={marketSort} onChange={e => setMarketSort(e.target.value as any)} className="bg-gray-800 border border-gray-700 text-sm text-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500">
                  <option value="Popularity">{language === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}</option>
                  <option value="Rating">{language === 'ar' ? 'الأعلى تقييماً' : 'Highest Rated'}</option>
                  <option value="ReleaseDate">{language === 'ar' ? 'الأحدث' : 'Newest'}</option>
               </select>

               <div className="relative w-48 ml-auto">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                 <input 
                   type="text" 
                   placeholder={language === 'ar' ? 'البحث...' : 'Search...'} 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full bg-gray-950 border border-gray-700 rounded-lg pl-9 pr-4 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                 />
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {filteredMarketSkills.map(s => (
              <div key={s.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex flex-col hover:border-gray-700 transition-all relative overflow-hidden group">
                 {s.reliabilityScore >= 95 && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600/20 to-transparent w-32 h-32 blur-2xl rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
                 )}
                <div className="flex items-start gap-4 mb-4 z-10">
                  <div className="w-14 h-14 bg-gray-800 rounded-xl flex items-center justify-center text-blue-400 border border-gray-700 shrink-0">
                    <s.icon size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200">{s.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                       <span className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-300">{s.category}</span>
                       <span>•</span>
                       <span>{s.vendor}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 flex-1 mb-6 z-10">{s.desc}</p>
                <div className="flex flex-col gap-4 z-10">
                   <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1.5 text-yellow-500">
                         <Star size={14} className="fill-yellow-500" />
                         <span className="font-medium">{s.rating.toFixed(1)}</span>
                         <span className="text-gray-500 text-xs">({(s.popularity / 1000).toFixed(1)}k)</span>
                      </div>
                      <div className="flex items-center gap-1 5 text-green-400" title="Reliability Score">
                         <Check size={14} />
                         <span className="font-medium text-xs">{s.reliabilityScore}%</span>
                      </div>
                   </div>
                   {s.installed ? (
                      <button disabled className="w-full py-2 bg-gray-800 text-gray-400 font-medium rounded-lg text-sm border border-gray-700 flex justify-center items-center gap-2">
                        <Check size={16} /> {language === 'ar' ? 'مثبت' : 'Installed'}
                      </button>
                   ) : (
                      <button onClick={() => handleInstallSkill(s.id)} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm transition-colors flex justify-center items-center gap-2">
                        <Download size={16} /> {language === 'ar' ? 'تثبيت' : 'Install Skill'}
                      </button>
                   )}
                </div>
              </div>
            ))}
            {filteredMarketSkills.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                {language === 'ar' ? 'لم يتم العثور على مهارات في المتجر.' : 'No marketplace skills match your filters.'}
              </div>
            )}
          </div>
        </>
      )}

      {/* Dependency Modal */}
      {depAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-500 mb-4">
               <AlertTriangle size={24} />
               <h2 className="text-xl font-bold text-gray-100">{language === 'ar' ? 'تبعيات غير موجودة' : 'Missing Dependencies'}</h2>
            </div>
            <p className="text-gray-400 mb-4 content-relaxed">
              {language === 'ar' ? 'المهارة' : 'The skill'} <strong>{skills.find(s => s.id === depAlert.skillId)?.name}</strong> {language === 'ar' ? 'تتطلب المهارات التالية حتى يتم' : 'requires the following skills to be'} {depAlert.action === 'install' ? (language === 'ar' ? 'تثبيتها:' : 'installed:') : (language === 'ar' ? 'تفعيلها:' : 'enabled:')}
            </p>
            <ul className="space-y-2 mb-6">
               {depAlert.missingDeps.map(depId => {
                 const dep = skills.find(s => s.id === depId);
                 return (
                   <li key={depId} className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg border border-gray-700">
                      <dep.icon size={18} className="text-blue-400" />
                      <span className="text-gray-200 font-medium">{dep?.name}</span>
                   </li>
                 )
               })}
            </ul>
            <div className="flex justify-end gap-3">
               <button onClick={() => setDepAlert(null)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition-colors">
                 {language === 'ar' ? 'إلغاء' : 'Cancel'}
               </button>
               <button 
                 onClick={() => {
                   if (depAlert.action === 'install') {
                     handleInstallSkill(depAlert.skillId, true);
                   } else {
                     handleToggleSkill(depAlert.skillId, true);
                   }
                   setDepAlert(null);
                 }} 
                 className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
               >
                 {depAlert.action === 'install' ? (language === 'ar' ? 'تثبيت الكل' : 'Install All') : (language === 'ar' ? 'تفعيل الكل' : 'Enable All')}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {versionModal && (() => {
        const skill = skills.find(s => s.id === versionModal.skillId);
        if (!skill) return null;
        
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col max-h-[80vh]">
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-blue-400 border border-gray-700">
                     <skill.icon size={20} />
                   </div>
                   <div>
                     <h2 className="text-xl font-bold text-gray-100">{skill.name} {language === 'ar' ? 'إصدارات' : 'Versions'}</h2>
                     <p className="text-xs text-gray-500">{language === 'ar' ? 'الإصدار الحالي:' : 'Current version:'} {skill.version}</p>
                   </div>
                </div>
                <button onClick={() => setVersionModal(null)} className="text-gray-500 hover:text-gray-300">
                   <ChevronDown size={20} className="transform rotate-180" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                 {skill.versions.map((v, i) => (
                   <div key={v.version} className={`p-4 rounded-xl border ${v.version === skill.version ? 'bg-blue-900/10 border-blue-500/30' : 'bg-gray-800/50 border-gray-800'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${v.version === skill.version ? 'text-blue-400' : 'text-gray-200'}`}>v{v.version}</span>
                          {v.version === skill.version && <span className="bg-blue-600/20 text-blue-400 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">{language === 'ar' ? 'الحالي' : 'Current'}</span>}
                          {i === 0 && v.version !== skill.version && <span className="bg-green-600/20 text-green-400 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">{language === 'ar' ? 'الأحدث' : 'Latest'}</span>}
                        </div>
                        <span className="text-xs text-gray-500">{new Date(v.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-4">{v.changes}</p>
                      {v.version !== skill.version && (
                         <button 
                           onClick={() => handleRevertVersion(skill.id, v.version)}
                           className="text-xs font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded transition-colors"
                         >
                           {language === 'ar' ? `العودة للإصدار v${v.version}` : `Revert to v${v.version}`}
                         </button>
                      )}
                   </div>
                 ))}
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}

