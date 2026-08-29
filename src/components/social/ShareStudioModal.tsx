import React, { useState, useRef } from 'react';
import { useTravel } from '../../context/TravelContext';
import { CardFormat, CardTheme, ShareCardPreview } from './ShareCardPreview';
import { downloadElementAsPNG, copyElementImageToClipboard, shareElementAsImage } from '../../utils/imageExport';
import { 
  X, 
  Download, 
  Copy, 
  Share2, 
  Check, 
  Sparkles, 
  Layers, 
  Smartphone, 
  Square, 
  Monitor,
  Loader2
} from 'lucide-react';

const CARD_THEMES: { id: CardTheme; name: string; color: string }[] = [
  { id: 'classic', name: 'Been Orange', color: '#f97316' },
  { id: 'luxury', name: 'Midnight Gold', color: '#eab308' },
  { id: 'cyber', name: 'Cyber Neon', color: '#06b6d4' },
  { id: 'sunset', name: 'Sunset Bloom', color: '#ec4899' },
  { id: 'passport', name: 'Emerald Vintage', color: '#10b981' },
];

export const ShareStudioModal: React.FC = () => {
  const {
    isShareOpen,
    setIsShareOpen,
    data,
    activeTheme,
    stats,
    t,
  } = useTravel();

  const [format, setFormat] = useState<CardFormat>('story');
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('classic');
  const [title, setTitle] = useState<string>(data.userName || 'World Traveler');
  const [subtitle, setSubtitle] = useState<string>(data.tagline || 'My Travel Journey');
  const [showStats, setShowStats] = useState(true);
  const [showFlags, setShowFlags] = useState(true);
  const [showLevel, setShowLevel] = useState(true);

  const [isExporting, setIsExporting] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  if (!isShareOpen) return null;

  const handleDownload = async () => {
    if (!cardRef.current || isExporting) return;
    try {
      setIsExporting(true);
      await downloadElementAsPNG(cardRef.current, `been-travel-${format}-${Date.now()}.png`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    if (!cardRef.current || isExporting) return;
    try {
      setIsExporting(true);
      const res = await copyElementImageToClipboard(cardRef.current);
      if (res.success) {
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current || isExporting) return;
    try {
      setIsExporting(true);
      await shareElementAsImage(
        cardRef.current,
        'My Travel Journey',
        `I've explored ${stats.worldPercentage}% of the world across ${stats.visitedCountriesCount} countries with Been!`
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div 
        className="w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Studio Top Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: activeTheme.primaryColor }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white font-display">
                {t('social_studio_title')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('social_studio_desc')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsShareOpen(false)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Body: Controls + Live Preview Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1">
          {/* Controls Side Panel */}
          <div className="lg:col-span-5 p-6 border-b lg:border-b-0 lg:border-r border-slate-800 space-y-6 overflow-y-auto">
            {/* Step 1: Format */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
                {t('step_format')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setFormat('story')}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                    format === 'story'
                      ? 'bg-orange-500/15 border-orange-500 text-white font-bold'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="text-xs">{t('format_story')}</span>
                </button>

                <button
                  onClick={() => setFormat('square')}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                    format === 'square'
                      ? 'bg-orange-500/15 border-orange-500 text-white font-bold'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Square className="w-5 h-5" />
                  <span className="text-xs">{t('format_square')}</span>
                </button>

                <button
                  onClick={() => setFormat('banner')}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                    format === 'banner'
                      ? 'bg-orange-500/15 border-orange-500 text-white font-bold'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Monitor className="w-5 h-5" />
                  <span className="text-xs">{t('format_banner')}</span>
                </button>
              </div>
            </div>

            {/* Step 2: Theme Presets */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
                {t('step_theme')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CARD_THEMES.map((th) => {
                  const isSelected = th.id === selectedTheme;
                  return (
                    <button
                      key={th.id}
                      onClick={() => setSelectedTheme(th.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                        isSelected
                          ? 'bg-slate-800 border-orange-500/60 text-white font-bold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: th.color }}
                        />
                        <span className="text-xs truncate">{th.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-orange-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Text Customization */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                {t('step_personalize')}
              </label>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">{t('name_title_label')}</span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">{t('tagline_subtitle_label')}</span>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Exploring the World, One City at a Time"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Step 4: Overlays */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
                {t('step_overlays')}
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showStats}
                    onChange={(e) => setShowStats(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-orange-500 focus:ring-0"
                  />
                  <span>{t('overlay_stats')}</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showFlags}
                    onChange={(e) => setShowFlags(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-orange-500 focus:ring-0"
                  />
                  <span>{t('overlay_flags')}</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showLevel}
                    onChange={(e) => setShowLevel(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-orange-500 focus:ring-0"
                  />
                  <span>{t('overlay_level')}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Live Preview Side Panel */}
          <div className="lg:col-span-7 p-6 bg-slate-950/60 flex flex-col items-center justify-center overflow-y-auto">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Live Card Canvas ({format.toUpperCase()})</span>
            </div>

            {/* Scaled Preview Wrapper */}
            <div className="w-full flex items-center justify-center overflow-hidden py-2 max-h-[500px]">
              <div className="scale-[0.55] sm:scale-[0.65] md:scale-[0.75] origin-center shadow-2xl rounded-3xl overflow-hidden border border-slate-800">
                <ShareCardPreview
                  cardRef={cardRef}
                  format={format}
                  theme={selectedTheme}
                  customName={title}
                  customTagline={subtitle}
                  showFlags={showFlags}
                  showStats={showStats}
                  showLevel={showLevel}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {copiedToast && (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> {t('copied_toast')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{t('copy_image')}</span>
            </button>

            <button
              onClick={handleShare}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t('share_btn')}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-lg transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('generating_btn')}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('save_png_btn')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
