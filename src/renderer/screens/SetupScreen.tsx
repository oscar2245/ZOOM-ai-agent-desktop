import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SetupScreen() {
  const [step, setStep] = useState(1);
  const [isInstalling, setIsInstalling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if installed on mount
    window.api?.checkInstalled().then(isInstalled => {
      if (isInstalled) navigate('/chat');
    });

    const handleInstallDone = () => {
      setIsInstalling(false);
      setStep(2);
    };

    window.addEventListener('mock-install-done', handleInstallDone);
    return () => window.removeEventListener('mock-install-done', handleInstallDone);
  }, [navigate]);

  const startInstall = () => {
    setIsInstalling(true);
    window.api?.install();
  };

  const handleFinish = () => {
    window.api?.setProvider('OpenRouter', 'demo-key');
    navigate('/chat');
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-950 text-gray-100">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <span className="text-2xl font-bold tracking-widest text-white">ZM</span>
          </div>
          <h1 className="text-2xl font-semibold mb-2">Welcome to ZOOM</h1>
          <p className="text-gray-400 text-center text-sm">
            Supercharge your workflow with autonomous AI agents.
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
               <h3 className="font-medium text-gray-200 mb-1">CLI Installation Required</h3>
               <p className="text-sm text-gray-400">
                 ZOOM needs to install the underlying command-line agent to your system (~/.zoom).
               </p>
            </div>
            <button 
              onClick={startInstall} 
              disabled={isInstalling}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors flex justify-center items-center disabled:opacity-50"
            >
              {isInstalling ? 'Installing...' : 'Install ZOOM Agent'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Primary AI Provider</label>
              <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-blue-500 appearance-none">
                <option>OpenRouter (Recommended)</option>
                <option>Anthropic</option>
                <option>OpenAI</option>
                <option>Local (LM Studio / Ollama)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
              <input 
                type="password" 
                placeholder="sk-or-v1-..." 
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-blue-500" 
              />
            </div>
            <button 
              onClick={handleFinish} 
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
            >
              Complete Setup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
