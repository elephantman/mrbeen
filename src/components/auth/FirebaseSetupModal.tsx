import React, { useState } from 'react';
import { 
  X, 
  Flame, 
  ExternalLink, 
  Check, 
  KeyRound, 
  Copy, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { 
  firebaseConfig, 
  isFirebaseConfigured, 
  saveCustomFirebaseConfig, 
  clearCustomFirebaseConfig,
  getStoredFirebaseConfig
} from '../../services/firebase';

interface FirebaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseSetupModal: React.FC<FirebaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState(firebaseConfig.apiKey || '');
  const [authDomain, setAuthDomain] = useState(firebaseConfig.authDomain || '');
  const [projectId, setProjectId] = useState(firebaseConfig.projectId || '');
  const [storageBucket, setStorageBucket] = useState(firebaseConfig.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(firebaseConfig.messagingSenderId || '');
  const [appId, setAppId] = useState(firebaseConfig.appId || '');

  const [rawConfigInput, setRawConfigInput] = useState('');
  const [parseError, setParseError] = useState('');
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  const isConfigured = isFirebaseConfigured();
  const hasStoredCustom = Boolean(getStoredFirebaseConfig());

  // Smart parser: User can paste the whole JS object from Firebase console:
  // const firebaseConfig = { apiKey: "...", authDomain: "...", ... }
  const handleParseRaw = () => {
    setParseError('');
    try {
      const text = rawConfigInput;
      const getVal = (key: string) => {
        const match = text.match(new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`));
        return match ? match[1] : '';
      };

      const extractedApiKey = getVal('apiKey');
      const extractedAuthDomain = getVal('authDomain');
      const extractedProjectId = getVal('projectId');
      const extractedStorageBucket = getVal('storageBucket');
      const extractedMessagingSenderId = getVal('messagingSenderId');
      const extractedAppId = getVal('appId');

      if (extractedApiKey && extractedProjectId) {
        setApiKey(extractedApiKey);
        setAuthDomain(extractedAuthDomain);
        setProjectId(extractedProjectId);
        setStorageBucket(extractedStorageBucket);
        setMessagingSenderId(extractedMessagingSenderId);
        setAppId(extractedAppId);
        setRawConfigInput('');
      } else {
        setParseError('Could not find apiKey or projectId in pasted snippet.');
      }
    } catch (err: any) {
      setParseError('Failed to parse config: ' + err.message);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !projectId) return;

    saveCustomFirebaseConfig({
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim() || `${projectId.trim()}.firebasestorage.app`,
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    });
  };

  const envSnippet = `VITE_FIREBASE_API_KEY=${apiKey || 'YOUR_API_KEY'}
VITE_FIREBASE_AUTH_DOMAIN=${authDomain || `${projectId || 'YOUR_PROJECT'}.firebaseapp.com`}
VITE_FIREBASE_PROJECT_ID=${projectId || 'YOUR_PROJECT_ID'}
VITE_FIREBASE_STORAGE_BUCKET=${storageBucket || `${projectId || 'YOUR_PROJECT'}.firebasestorage.app`}
VITE_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId || 'YOUR_SENDER_ID'}
VITE_FIREBASE_APP_ID=${appId || 'YOUR_APP_ID'}`;

  const copyEnvSnippet = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-md">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white font-display">
                  Firebase & Google Auth Kurulumu
                </h3>
                {isConfigured ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Aktif & Bağlı
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    Kurulum Bekleniyor
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Google ile giriş ve bulut eşitlemesi için Firebase anahtarlarınızı girin
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Quick Steps Guide */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>3 Dakikalık Kurulum Adımları</span>
              </span>
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Firebase Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Firebase Console'da ücretsiz bir proje açın.</li>
              <li><strong>Authentication &gt; Sign-in method &gt; Google</strong> seçeneğini aktif edin.</li>
              <li><strong>Firestore Database</strong> oluşturun (test veya production modunda).</li>
              <li><strong>Project Settings (⚙️) &gt; Web App (&lt;/&gt;)</strong> ekleyip config anahtarlarınızı buraya yapıştırın.</li>
            </ol>
          </div>

          {/* Quick Paste Snippet */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              ⚡ Hızlı Yapıştırma (Firebase Kod Parçacığını Yapıştırın)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={rawConfigInput}
                onChange={(e) => setRawConfigInput(e.target.value)}
                placeholder='const firebaseConfig = { apiKey: "AIza...", projectId: "...", ... }'
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                type="button"
                onClick={handleParseRaw}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all"
              >
                Ayrıştır
              </button>
            </div>
            {parseError && <p className="text-xs text-rose-400">{parseError}</p>}
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">API Key (apiKey) *</label>
                <input
                  type="text"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Project ID (projectId) *</label>
                <input
                  type="text"
                  required
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="mrbeen-travel"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Auth Domain (authDomain)</label>
                <input
                  type="text"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  placeholder="mrbeen-travel.firebaseapp.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">App ID (appId)</label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="1:123456789:web:..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between gap-3">
              {hasStoredCustom && (
                <button
                  type="button"
                  onClick={clearCustomFirebaseConfig}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Ayarları Sıfırla
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={copyEnvSnippet}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
                >
                  {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEnv ? 'Kopyalandı!' : '.env Formatını Kopyala'}</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg transition-all"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Kaydet ve Sayfayı Yenile</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Anahtarlar tarayıcınızda veya Vercel ortam değişkenlerinde güvenle saklanır.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
