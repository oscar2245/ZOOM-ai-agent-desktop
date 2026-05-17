import { useEffect, useState, useRef } from 'react';
import { Send, Bot, User, Copy, Paperclip, Mic, X, Search, Pin, ChevronDown, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { useProfilesStore, useSettingsStore, useChatStore, useSessionsStore } from '../store';

export default function ChatScreen() {
  const [input, setInput] = useState('');
  const { messages, addMessage, isTyping, setTyping, clearMessages } = useChatStore();
  const { activeSession } = useSessionsStore();
  
  const [isListening, setIsListening] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPinned, setShowPinned] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  
  // Local state for pinned messages (since it's not in ChatStore UI requirements explicitly)
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const { profiles, activeProfile } = useProfilesStore();
  const currentProfile = profiles.find(p => p.id === activeProfile) || { name: 'ZOOM', initials: 'Z', color: 'bg-blue-600', avatarUrl: undefined };
  const { language } = useSettingsStore();

  useEffect(() => {
    // Setup Speech Recognition
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setInput(prev => {
            const separator = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
            return prev + separator + finalTranscript;
          });
        }
      };

      recognition.onerror = (e: any) => {
        console.error("Speech recognition error", e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Speech recognition is not supported in this browser.");
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.lang = language === 'ar' ? 'ar-SA' : 'en-US';
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  useEffect(() => {
    const handleToken = (e: any, data: any) => {
      const token = typeof data === 'string' ? data : data.token;
      
      useChatStore.setState((state) => {
        const newMsgs = [...state.messages];
        const last = newMsgs[newMsgs.length - 1];
        
        if (last && last.role === 'assistant') {
          // modify last message in place to avoid full array recreation
          last.text += token;
        } else {
          newMsgs.push({ 
            id: Date.now().toString(), 
            role: 'assistant', 
            text: token 
          });
        }
        
        return { messages: newMsgs };
      });
    };
    
    const handleEnd = () => setTyping(false);
    
    const handleError = (e: any, error: string) => {
      setTyping(false);
      // Optional: show error message
    };

    window.api?.onChatToken?.(handleToken);
    window.api?.onChatEnd?.(handleEnd);
    window.api?.onChatError?.(handleError);

    return () => {
      window.api?.removeAllListeners?.('zoom:chat-token');
      window.api?.removeAllListeners?.('zoom:chat-end');
      window.api?.removeAllListeners?.('zoom:chat-error');
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() && files.length === 0) return;
    
    let msgText = input;
    if (files.length > 0) {
      msgText += `\n\nAttached ${files.length} file(s):\n${files.map(f => `- ${f.name}`).join('\n')}`;
    }
    
    setInput('');
    const id = Date.now().toString();
    addMessage({ id, role: 'user', text: msgText.trim() });
    setTyping(true);
    setFiles([]); // Clear files
    
    window.api?.chat?.(msgText.trim(), activeSession);
  };

  const handleNewChat = () => {
    clearMessages();
    setInput('');
    setFiles([]);
    setPinnedIds(new Set());
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const togglePin = (id: string) => {
    setPinnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredMessages = messages.filter(m => 
    searchQuery === '' ? true : m.text.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const pinnedMessages = messages.filter(m => pinnedIds.has(m.id));

  return (
    <div 
      className="flex flex-col h-full bg-[#121212] relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-blue-500/20 backdrop-blur-sm border-2 border-blue-500 border-dashed rounded-lg flex items-center justify-center pointer-events-none">
          <div className="bg-gray-900 border border-blue-500/50 p-6 rounded-xl shadow-2xl flex flex-col items-center">
            <Paperclip className="w-12 h-12 text-blue-400 mb-3" />
            <h2 className="text-xl font-bold text-white mb-1">{language === 'ar' ? 'أفلت الملفات هنا' : 'Drop files here'}</h2>
            <p className="text-gray-400 text-sm">{language === 'ar' ? 'أرفق الملفات برسالتك' : 'Attach files to your message'}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/50 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-100">{currentProfile.name || (language === 'ar' ? 'المحادثة' : 'Chat')}</h1>
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
            {language === 'ar' ? 'نشط' : 'ACTIVE'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder={language === 'ar' ? 'بحث في المحادثة...' : 'Search chat...'} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800/80 border border-gray-700 rounded-lg pl-9 pr-4 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 w-48 transition-all focus:w-64"
            />
          </div>
          {pinnedMessages.length > 0 && (
            <button
              onClick={() => setShowPinned(!showPinned)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showPinned ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
              aria-expanded={showPinned}
            >
               <Pin size={14} className={showPinned ? "fill-white" : "fill-gray-400"} />
               {pinnedMessages.length} {language === 'ar' ? 'مثبتة' : 'Pinned'}
               {showPinned ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          <button 
            onClick={handleNewChat}
            className="px-4 py-1.5 bg-transparent hover:bg-gray-800 text-gray-300 font-medium rounded-md transition-colors border border-gray-700"
          >
            {language === 'ar' ? '+ محادثة جديدة' : '+ New Chat'}
          </button>
        </div>
      </header>

      {/* Pinned Messages Drawer */}
      {showPinned && pinnedMessages.length > 0 && (
        <div className="bg-gray-900/80 border-b border-gray-800 p-4 max-h-48 overflow-y-auto shrink-0 shadow-inner">
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{language === 'ar' ? 'الرسائل المثبتة' : 'Pinned Messages'}</h3>
           <div className="flex flex-col gap-2">
             {pinnedMessages.map((pm, i) => (
               <div key={i} className="flex gap-3 bg-gray-800/50 p-2.5 rounded-lg border border-gray-700/50 hover:border-blue-500/50 transition-colors group cursor-pointer" onClick={() => {/* Could scroll to msg */}}>
                  {pm.role === 'assistant' ? (
                     <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                       <Bot size={12} className="text-white" />
                     </div>
                  ) : (
                     <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                       <User size={12} className="text-gray-300" />
                     </div>
                  )}
                  <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">{pm.text}</p>
                  <button onClick={(e) => { e.stopPropagation(); togglePin(pm.id); }} className="ml-auto p-1 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400">
                    <X size={14} />
                  </button>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8" ref={scrollRef}>
        {filteredMessages.map((m, i) => (
          <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : ''}`}>
            {m.role === 'assistant' && (
              currentProfile.avatarUrl ? (
                <img src={currentProfile.avatarUrl} alt={currentProfile.name} className="w-8 h-8 rounded-full border border-gray-700 bg-gray-900 object-cover shrink-0" />
              ) : (
                <div className={`w-8 h-8 rounded-full ${currentProfile.color || 'bg-blue-600'} flex items-center justify-center shrink-0`}>
                  <Bot size={18} className="text-white" />
                </div>
              )
            )}
            <div className={`max-w-[80%] rounded-2xl px-5 py-4 relative group ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm' 
                : 'bg-gray-800 text-gray-200 rounded-tl-sm border border-gray-700'
            }`}>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{m.text}</ReactMarkdown>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 z-10 transition-opacity">
                <button 
                  onClick={() => togglePin(m.id)}
                  className={`p-1.5 rounded transition-all ${pinnedIds.has(m.id) ? 'text-blue-400 bg-gray-800/80 shadow-sm' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                  title={pinnedIds.has(m.id) ? "Unpin message" : "Pin message"}
                >
                  <Pin size={14} className={pinnedIds.has(m.id) ? "fill-blue-400" : ""} />
                </button>
                <button 
                  onClick={() => handleCopy(m.text)}
                  className="p-1.5 hover:bg-gray-700 rounded transition-all text-gray-400 hover:text-white"
                  title="Copy message"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                <User size={18} className="text-gray-300" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-4">
              {currentProfile.avatarUrl ? (
                <img src={currentProfile.avatarUrl} alt={currentProfile.name} className="w-8 h-8 rounded-full border border-gray-700 bg-gray-900 object-cover shrink-0" />
              ) : (
                <div className={`w-8 h-8 rounded-full ${currentProfile.color || 'bg-blue-600'} flex items-center justify-center shrink-0`}>
                  <Bot size={18} className="text-white" />
                </div>
              )}
              <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-5 py-4 flex flex-col justify-center gap-2">
                <span className="text-xs font-semibold text-gray-400">{currentProfile.name} {language === 'ar' ? 'يكتب...' : 'is typing...'}</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                </div>
              </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-[#121212] relative shrink-0">
        {isListening && (
          <div className="absolute left-1/2 -translate-x-1/2 -top-12 bg-gray-900 border border-gray-700 rounded-full px-4 py-2 flex items-center gap-3 shadow-2xl pointer-events-none z-10">
            <Mic className="text-red-500 animate-pulse" size={16} />
            <span className="text-sm font-medium text-red-500">{language === 'ar' ? 'يستمع...' : 'Listening...'}</span>
            <div className="flex gap-1 items-end h-4">
              <div className="w-1 bg-red-400 animate-[bounce_1s_infinite_0ms] h-full" style={{ animationDuration: '0.7s'}}></div>
              <div className="w-1 bg-red-400 animate-[bounce_1s_infinite_200ms] h-full" style={{ animationDuration: '0.9s'}}></div>
              <div className="w-1 bg-red-400 animate-[bounce_1s_infinite_400ms] h-full" style={{ animationDuration: '0.8s'}}></div>
              <div className="w-1 bg-red-400 animate-[bounce_1s_infinite_100ms] h-full" style={{ animationDuration: '0.6s'}}></div>
            </div>
          </div>
        )}
        <div className="max-w-4xl mx-auto relative group">
          {files.length > 0 && (
            <div className="absolute bottom-[100%] left-0 w-full flex gap-2 mb-2 flex-wrap">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 shadow-md">
                  <Paperclip size={14} className="text-blue-400" />
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button onClick={() => removeFile(index)} className="text-gray-500 hover:text-red-400 transition-colors ml-1 z-10 relative">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={language === 'ar' ? 'اكتب رسالة لـ ZOOM...' : 'Message ZOOM...'}
            className={`w-full bg-gray-900 border border-gray-700 rounded-xl py-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none max-h-48 overflow-y-auto transition-all ${language === 'ar' ? 'pr-20 pl-16' : 'pl-20 pr-16'}`}
            rows={2}
          />
          <div className={`absolute bottom-3 ${language === 'ar' ? 'right-3' : 'left-3'} flex items-center gap-1 z-10`}>
             <button 
               onClick={() => document.getElementById('chat-file-upload')?.click()}
               className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer" 
               aria-label="Attach File"
             >
               <Paperclip size={18} />
             </button>
             <input 
               id="chat-file-upload"
               type="file" 
               multiple 
               className="hidden" 
               onChange={(e) => {
                 if (e.target.files && e.target.files.length > 0) {
                   const newFiles = Array.from(e.target.files);
                   setFiles(prev => [...prev, ...newFiles]);
                 }
                 e.target.value = '';
               }} 
             />
             <button 
               onClick={toggleListen}
               className={`p-2 rounded-lg transition-colors ${isListening ? 'text-red-400 bg-red-900/30' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
               aria-label={isListening ? "Stop listening" : "Start speaking"}
             >
               <Mic size={18} className={isListening ? "animate-pulse" : ""} />
             </button>
          </div>
          <button 
            onClick={handleSend}
            disabled={(!input.trim() && files.length === 0) || isTyping}
            className={`absolute bottom-3 ${language === 'ar' ? 'left-3' : 'right-3'} p-2.5 bg-blue-600 text-white flex justify-center items-center rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors`}
          >
            <Send size={18} className={language === 'ar' ? 'transform rotate-180' : ''} />
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 mt-3 font-medium">
          {language === 'ar' ? 'قد يقدم ZOOM معلومات غير دقيقة. تحقق من المعلومات المهمة.' : 'ZOOM may provide inaccurate information. Check important info.'}
        </p>
      </div>
    </div>
  );
}
