import React, { useState } from 'react';
import { DURGA_CHAPTERS, DURGA_ANGAS } from '../data/durgaSaptashatiData';
import { localizeAnga, localizeChapter, saptUi } from '../data/saptashatiLocale';
import durgaPath from '../data/durgaPath.json';
import {
  BookOpen,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Share2,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  Award,
  Sun,
  ShieldCheck
} from 'lucide-react';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import { speakUma, stopUmaSpeech } from '../lib/umaSpeech';
import { useLanguage } from '../i18n';

const PATH = durgaPath.chapters as Record<string, { n: number; text: string }[]>;
const PAGE_SIZE = 10;

export const DurgaSaptashatiView: React.FC = () => {
  const { language, t } = useLanguage();
  const ui = saptUi(language);
  const [activeTab, setActiveTab] = useState<'chapters' | 'angas' | 'kunjika' | 'aarti'>('chapters');
  const [selectedChapterId, setSelectedChapterId] = useState<number>(1);
  const [selectedAngaId, setSelectedAngaId] = useState<string>('kavach');
  const [fontSize, setFontSize] = useState<number>(15);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [versePage, setVersePage] = useState(0);

  const currentChapter = DURGA_CHAPTERS.find((c) => c.id === selectedChapterId) || DURGA_CHAPTERS[0];
  const currentAnga = DURGA_ANGAS.find((a) => a.id === selectedAngaId) || DURGA_ANGAS[0];
  const chapterText = localizeChapter(currentChapter, language);
  const angaText = localizeAnga(currentAnga, language);
  const chapterVerses = PATH[String(selectedChapterId)] || [];
  const pageCount = Math.max(1, Math.ceil(chapterVerses.length / PAGE_SIZE));
  const safePage = Math.min(versePage, pageCount - 1);
  const visibleVerses = chapterVerses.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const chapterPathText = chapterVerses.map((v) => v.text.replace(/\n/g, ' ')).join(' । ');

  const handleCopyText = (text: string) => {
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => done());
      return;
    }
    done();
  };

  const handleShareWhatsApp = (title: string, summary: string) => {
    const text = `🔱 *${ui.shareTitle} - ${title}* 🔱\n\n${summary}\n\n(${t('common.appName', 'शक्ति पंचांग')})`;
    openWhatsAppShare(text);
  };

  // Text to Speech playback for Sanskrit/Hindi
  const handleToggleSpeech = (textToRead: string) => {
    if (isPlayingAudio) {
      stopUmaSpeech();
      setIsPlayingAudio(false);
      return;
    }
    setIsPlayingAudio(true);
    void speakUma(textToRead, {
      rate: 0.85,
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Header Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#5C3A21] via-[#8C6239] to-[#5C3A21] text-[#FAF2E4] shadow-md border border-[#FFD88A]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FAF2E4]/10 border border-[#FFD88A]/40 flex items-center justify-center shrink-0">
            <span className="text-2xl">🔱</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold font-granth text-[#FFD88A]">
                {ui.title}
              </h2>
              <span className="text-[10px] bg-[#B56A00] text-white px-2 py-0.5 rounded-full font-bold">
                {ui.badge}
              </span>
            </div>
            <p className="text-xs text-[#FAF2E4]/80 mt-0.5">
              {ui.subtitle}
            </p>
          </div>
        </div>

        {/* Text Size & Audio Actions */}
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setFontSize((s) => Math.max(13, s - 1))}
            className="p-1.5 rounded-lg bg-[#FAF2E4]/10 hover:bg-[#FAF2E4]/20 text-[#FAF2E4] text-xs flex items-center gap-1"
            title={ui.zoomOut}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setFontSize((s) => Math.min(22, s + 1))}
            className="p-1.5 rounded-lg bg-[#FAF2E4]/10 hover:bg-[#FAF2E4]/20 text-[#FAF2E4] text-xs flex items-center gap-1"
            title={ui.zoomIn}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#8C6239]/20 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('chapters')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'chapters'
              ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
              : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EADBCC]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-[#FFD88A]" />
          <span>{ui.tabChapters}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('angas')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'angas'
              ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
              : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EADBCC]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#FFD88A]" />
          <span>{ui.tabAngas}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('kunjika');
            setSelectedAngaId('kunjika');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'kunjika'
              ? 'bg-[#B56A00] text-white shadow-xs'
              : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EADBCC]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          <span>{ui.tabKunjika}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('aarti');
            setSelectedAngaId('aarti');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'aarti'
              ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
              : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EADBCC]'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>{ui.tabAarti}</span>
        </button>
      </div>


      {/* CHAPTERS TAB */}
      {activeTab === 'chapters' && (
        <div className="space-y-4">
          {/* Chapter Selector Ribbon */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {DURGA_CHAPTERS.map((chap) => (
              <button
                key={chap.id}
                type="button"
                onClick={() => {
                  setSelectedChapterId(chap.id);
                  setVersePage(0);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedChapterId === chap.id
                    ? 'bg-[#B56A00] text-white shadow-xs'
                    : 'bg-[#FAF2E4] text-[#5C3A21] border border-[#8C6239]/20 hover:bg-[#F4E8D1]'
                }`}
              >
                {ui.chapter(chap.id)}
              </button>
            ))}
          </div>

          {/* Active Chapter Reading Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF2E4] border border-[#8C6239]/25 shadow-xs space-y-4">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#8C6239]/20 gap-2">
              <div>
                <span className="text-[11px] font-bold text-[#B56A00] tracking-wider uppercase">
                  {chapterText.charitra} • {chapterVerses.length} {ui.versesMeta}
                </span>
                <h3 className="text-lg font-bold font-granth text-[#5C3A21]">
                  {chapterText.title}: {chapterText.heading}
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleToggleSpeech(chapterPathText || chapterText.summary)
                  }
                  className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-rose-700 text-white animate-pulse'
                      : 'bg-[#EADBCC] text-[#5C3A21] hover:bg-[#D9C4A9]'
                  }`}
                  title={isPlayingAudio ? 'Stop Audio' : 'Listen Audio'}
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>{ui.stop}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{ui.listen}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleShareWhatsApp(
                      chapterText.title + ' ' + chapterText.heading,
                      chapterText.summary
                    )
                  }
                  className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Share on WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Phala / Benefit Banner */}
            <div className="p-3 rounded-xl bg-[#FBF0DD] border border-[#B56A00]/30 text-xs text-[#5C3A21] flex items-start gap-2.5">
              <Award className="w-4 h-4 text-[#B56A00] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#8C6239]">
                  {ui.fruit}
                </span>
                <span>{chapterText.phala}</span>
              </div>
            </div>

            {/* Chapter Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#8C6239] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
                <span>
                  {ui.summaryHead}
                </span>
              </h4>
              <p
                style={{ fontSize: `${fontSize}px` }}
                className="text-[#3E2714] leading-relaxed bg-white/70 p-3.5 rounded-xl border border-[#8C6239]/15"
              >
                {chapterText.summary}
              </p>
            </div>

            {/* Sanskrit Shloka Highlights */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-[#8C6239] uppercase tracking-wider flex items-center gap-1.5">
                  <span>ॐ</span>
                  <span>
                    {ui.path(safePage + 1, pageCount)}
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={() =>
                    handleToggleSpeech(visibleVerses.map((v) => v.text.replace(/\n/g, ' ')).join(' । '))
                  }
                  className="px-2 py-1 rounded-lg bg-[#EADBCC] text-[#5C3A21] text-[11px] font-bold"
                >
                  {ui.recitePage}
                </button>
              </div>
              <p className="text-[11px] text-[#735133]">
                {ui.angaNote}
              </p>

              <div className="space-y-2.5">
                {visibleVerses.map((shloka) => (
                  <div
                    key={shloka.n}
                    className="p-3.5 rounded-xl bg-gradient-to-b from-[#FFFDF9] to-[#FAF2E4] border border-[#8C6239]/20 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p
                        style={{ fontSize: `${fontSize + 1}px` }}
                        className="font-granth font-bold text-[#5C3A21] whitespace-pre-line leading-relaxed"
                      >
                        <span className="text-[#B56A00] mr-2">{shloka.n}.</span>
                        {shloka.text}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopyText(shloka.text)}
                        className="p-1 rounded text-[#8C6239] hover:text-[#5C3A21] shrink-0"
                        title={ui.copy}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <button
                  type="button"
                  disabled={safePage === 0}
                  onClick={() => setVersePage((p) => Math.max(0, p - 1))}
                  className="px-3 py-1.5 rounded-lg bg-[#EADBCC] text-[#5C3A21] disabled:opacity-40"
                >
                  {ui.prevVerses}
                </button>
                <span className="text-[#8C6239]">
                  {ui.range(
                    safePage * PAGE_SIZE + 1,
                    Math.min(chapterVerses.length, (safePage + 1) * PAGE_SIZE),
                    chapterVerses.length
                  )}
                </span>
                <button
                  type="button"
                  disabled={safePage >= pageCount - 1}
                  onClick={() => setVersePage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg bg-[#5C3A21] text-[#FAF2E4] disabled:opacity-40"
                >
                  {ui.nextVerses}
                </button>
              </div>

            </div>

            {/* Detailed Narrative points */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#8C6239] uppercase tracking-wider">
                {ui.points}
              </h4>
              <ul className="space-y-1.5 text-xs text-[#3E2714] list-disc list-inside bg-white/50 p-3 rounded-xl border border-[#8C6239]/15">
                {chapterText.details.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Chapter Switcher */}
            <div className="flex items-center justify-between pt-3 border-t border-[#8C6239]/20 text-xs font-bold">
              <button
                type="button"
                disabled={selectedChapterId === 1}
                onClick={() => {
                  setSelectedChapterId((id) => Math.max(1, id - 1));
                  setVersePage(0);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#EADBCC] text-[#5C3A21] disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{ui.prevChapter}</span>
              </button>

              <span className="text-[#8C6239]">
                {ui.chapterOf(selectedChapterId, DURGA_CHAPTERS.length)}
              </span>

              <button
                type="button"
                disabled={selectedChapterId === DURGA_CHAPTERS.length}
                onClick={() => {
                  setSelectedChapterId((id) => Math.min(DURGA_CHAPTERS.length, id + 1));
                  setVersePage(0);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#5C3A21] text-[#FAF2E4] disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <span>{ui.nextChapter}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ANGAS TAB (कवच, अर्गला, कीलक) */}
      {(activeTab === 'angas' || activeTab === 'kunjika' || activeTab === 'aarti') && (
        <div className="space-y-4">
          {/* Sub-selector for angas */}
          {activeTab === 'angas' && (
            <div className="flex items-center gap-2">
              {['kavach', 'argala', 'keelak'].map((id) => {
                const anga = DURGA_ANGAS.find((a) => a.id === id);
                if (!anga) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedAngaId(id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedAngaId === id
                        ? 'bg-[#B56A00] text-white shadow-xs'
                        : 'bg-[#FAF2E4] text-[#5C3A21] border border-[#8C6239]/25 hover:bg-[#F4E8D1]'
                    }`}
                  >
                    {localizeAnga(anga, language).name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Active Anga Content Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF2E4] border border-[#8C6239]/25 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#8C6239]/20 gap-2">
              <div>
                <h3 className="text-lg font-bold font-granth text-[#5C3A21]">
                  {currentAnga.title}
                </h3>
                <p className="text-xs text-[#735133] mt-0.5">{angaText.desc}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleToggleSpeech(
                      currentAnga.title +
                        '।' +
                        angaText.verses.map((v) => v.sanskrit + '। ' + v.meaning).join('। ')
                    )
                  }
                  className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-rose-700 text-white animate-pulse'
                      : 'bg-[#EADBCC] text-[#5C3A21] hover:bg-[#D9C4A9]'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>{ui.stop}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{ui.listen}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleShareWhatsApp(currentAnga.title, angaText.desc)}
                  className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                  title="Share"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Significance Banner */}
            <div className="p-3 rounded-xl bg-[#FBF0DD] border border-[#B56A00]/30 text-xs text-[#5C3A21] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#B56A00] shrink-0" />
              <div>
                <span className="font-bold text-[#8C6239]">
                  {ui.significance}
                </span>
                <span>{angaText.significance}</span>
              </div>
            </div>


            {/* Verses list */}
            <div className="space-y-3">
              {angaText.verses.map((verse, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white border border-[#8C6239]/20 space-y-2 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      style={{ fontSize: `${fontSize + 1}px` }}
                      className="font-granth font-bold text-[#5C3A21] whitespace-pre-line leading-relaxed"
                    >
                      {verse.sanskrit}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCopyText(verse.sanskrit + '\n\n' + verse.meaning)}
                      className="p-1 rounded text-[#8C6239] hover:text-[#5C3A21] shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p
                    style={{ fontSize: `${fontSize - 1}px` }}
                    className="text-[#735133] leading-relaxed pt-2 border-t border-[#8C6239]/15"
                  >
                    <strong className="text-[#5C3A21]">
                      {ui.meaning}
                    </strong>
                    {verse.meaning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {copied && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-full shadow-lg">
          {ui.copied}
        </div>
      )}
    </div>
  );
};
