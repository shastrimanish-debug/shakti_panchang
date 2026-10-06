import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, ChevronLeft, Copy, Check, Search, Share2, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n';
import { CATEGORIES, DIFFICULTIES, matchesWeekday, UPAY, type Upay } from '../data/saral/catalog';
import { formatNum, isLang, type LangCode } from '../data/saral/languages';
import { UI, type UiKey } from '../data/saral/ui';
import { gloss } from '../data/saral/glossary';
import { viewOf } from '../data/saral/view';
import { loadSadhana, saveSadhana, todayISO, weekdayName, type SadhanaMap } from '../data/saral/sadhana';

function useSaralLang(): LangCode {
  const { language } = useLanguage();
  const base = (language || 'hi').split('-')[0];
  return isLang(base) ? base : 'hi';
}

export function SaralUpayPanel() {
  const lang = useSaralLang();
  const t = (key: UiKey) => UI[lang][key];
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [today, setToday] = useState<string | null>(null);
  const [todayName, setTodayName] = useState<string | null>(null);
  const [sadhana, setSadhana] = useState<SadhanaMap>({});
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setToday(todayISO());
    setTodayName(weekdayName());
    setSadhana(loadSadhana());
  }, []);

  function updateSadhana(next: SadhanaMap) {
    setSadhana(next);
    saveSadhana(next);
  }

  const needle = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    return UPAY.filter((item) => {
      if (filter === 'mine' && !sadhana[String(item.id)]) return false;
      if (filter !== 'all' && filter !== 'mine' && item.category !== filter) return false;
      if (difficulty !== 'all' && item.difficulty !== difficulty) return false;
      if (!needle) return true;
      const view = viewOf(item, lang);
      return [
        item.title,
        item.problem,
        item.mantra,
        item.method,
        item.category,
        view.title,
        view.problem,
        view.method,
        view.category,
      ]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [filter, difficulty, needle, sadhana, lang]);

  const todayList = useMemo(() => {
    if (!todayName) return [];
    return UPAY.filter((item) => matchesWeekday(item.day, todayName));
  }, [todayName]);

  const selected = UPAY.find((item) => item.id === selectedId) ?? null;

  async function copyText(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    setCopied(key);
    window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1800);
  }

  async function share(item: Upay) {
    const view = viewOf(item, lang);
    const mantra = item.mantra ? `${t('mantra')}: ${item.mantra}\n` : '';
    const text = `${view.title}\n${view.problem}\n${mantra}${t('method')}: ${view.method}\n${t('day')}: ${view.day} · ${t('time')}: ${view.time}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: view.title, text });
        return;
      } catch {
        /* dismissed */
      }
    }
    await copyText(`share-${item.id}`, text);
  }

  function startSadhana(item: Upay) {
    if (!today || sadhana[String(item.id)]) return;
    updateSadhana({ ...sadhana, [String(item.id)]: { startedOn: today, done: [] } });
  }

  function toggleToday(item: Upay) {
    if (!today) return;
    const key = String(item.id);
    const current = sadhana[key] ?? { startedOn: today, done: [] };
    const done = current.done.includes(today)
      ? current.done.filter((day) => day !== today)
      : [...current.done, today];
    updateSadhana({ ...sadhana, [key]: { startedOn: current.startedOn, done } });
  }

  function stopSadhana(item: Upay) {
    const next = { ...sadhana };
    delete next[String(item.id)];
    updateSadhana(next);
  }

  if (selected) {
    const view = viewOf(selected, lang);
    const entry = sadhana[String(selected.id)];
    const doneToday = Boolean(today && entry?.done.includes(today));
    const doneCount = entry?.done.length ?? 0;
    const progress = entry ? Math.min(100, Math.round((doneCount / selected.duration_days) * 100)) : 0;
    return (
      <article className="space-y-4 rounded-2xl border border-[#8C6239]/20 bg-[#FAF2E4] p-4 shadow-xs">
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#8C6239] cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('back')}
        </button>
        <header>
          <p className="text-[11px] font-bold text-[#B56A00]">
            {formatNum(selected.id, lang)} · {view.category}
          </p>
          <h3 className="text-lg font-bold font-granth text-[#5C3A21]">{view.title}</h3>
          <p className="mt-1 text-sm text-[#735133]">{view.problem}</p>
        </header>
        {selected.mantra ? (
          <div className="rounded-xl border border-[#8C6239]/20 bg-[#F4E8D1] p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="font-granth text-base leading-relaxed text-[#5C3A21]">{selected.mantra}</p>
              <button
                type="button"
                onClick={() => copyText(`mantra-${selected.id}`, selected.mantra)}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#FAF2E4] px-2.5 py-1.5 text-[11px] font-bold text-[#5C3A21] cursor-pointer"
              >
                {copied === `mantra-${selected.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === `mantra-${selected.id}` ? t('copied') : t('mantra')}
              </button>
            </div>
            {view.mantraMeaning ? <p className="mt-2 text-sm leading-relaxed text-[#5C3A21]">{view.mantraMeaning}</p> : null}
            <p className="mt-1 text-xs text-[#735133]">
              {!selected.count
                ? t('japaNone')
                : selected.count === 1
                  ? t('japaOnce')
                  : t('japaTimes').replace('{n}', formatNum(selected.count, lang))}
            </p>
          </div>
        ) : (
          <p className="text-sm text-[#735133]">{t('noMantra')}</p>
        )}
        <section>
          <h4 className="text-xs font-bold text-[#5C3A21]">{t('method')}</h4>
          <p className="mt-1 text-sm leading-relaxed text-[#2C180C]">{view.method}</p>
        </section>
        <dl className="grid grid-cols-2 gap-2 text-xs">
          <Fact label={t('day')} value={view.day} />
          <Fact label={t('time')} value={view.time} />
          <Fact label={t('duration')} value={`${formatNum(selected.duration_days, lang)} ${t('dayWord')}`} />
          <Fact label={t('difficulty')} value={view.difficulty} />
          <Fact label={t('cost')} value={view.cost} />
          <Fact label={t('basis')} value={view.basis} />
        </dl>
        <section>
          <h4 className="text-xs font-bold text-[#5C3A21]">{t('materials')}</h4>
          {view.materials.length === 0 ? (
            <p className="mt-1 text-xs text-[#735133]">{t('noMaterials')}</p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {view.materials.map((material) => (
                <li key={material} className="rounded-full border border-[#8C6239]/25 px-2.5 py-1 text-xs text-[#5C3A21]">
                  {material}
                </li>
              ))}
            </ul>
          )}
        </section>
        <p className="flex gap-2 rounded-xl border border-amber-700/20 bg-[#F4E8D1] p-3 text-xs text-[#735133]">
          <AlertTriangle className="mt-0.5 w-4 h-4 shrink-0" />
          <span>
            <span className="font-bold">{t('caution')} </span>
            {view.caution}
          </span>
        </p>
        <section className="rounded-xl border border-[#8C6239]/20 p-3">
          <div className="flex items-baseline justify-between">
            <h4 className="font-granth text-base text-[#5C3A21]">{t('practice')}</h4>
            {entry ? (
              <p className="text-xs text-[#735133]">
                {formatNum(doneCount, lang)} / {formatNum(selected.duration_days, lang)} {t('dayWord')}
              </p>
            ) : null}
          </div>
          {entry ? (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EADBCC]">
              <div className="h-full bg-[#5C3A21]" style={{ width: `${progress}%` }} />
            </div>
          ) : null}
          <div className="mt-3 flex flex-col gap-2">
            {!entry ? (
              <button
                type="button"
                onClick={() => startSadhana(selected)}
                className="rounded-xl bg-[#5C3A21] px-4 py-2 text-xs font-bold text-[#FAF2E4] cursor-pointer"
              >
                {t('start')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => toggleToday(selected)}
                className="rounded-xl bg-[#B56A00] px-4 py-2 text-xs font-bold text-white cursor-pointer"
              >
                {doneCount >= selected.duration_days ? t('finished') : doneToday ? t('marked') : t('markToday')}
              </button>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => share(selected)}
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-[#8C6239]/30 px-3 py-2 text-xs font-bold text-[#5C3A21] cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                {copied === `share-${selected.id}` ? t('copied') : t('share')}
              </button>
              {entry ? (
                <button
                  type="button"
                  onClick={() => stopSadhana(selected)}
                  className="flex-1 rounded-xl border border-[#8C6239]/30 px-3 py-2 text-xs text-[#735133] cursor-pointer"
                >
                  {t('leave')}
                </button>
              ) : null}
            </div>
          </div>
        </section>
        <p className="text-[11px] leading-relaxed text-[#735133]">{t('disclaimer')}</p>
      </article>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] leading-relaxed text-[#735133]">{t('disclaimer')}</p>
      <label className="relative block">
        <Search className="pointer-events-none absolute top-1/2 left-3 w-4 h-4 -translate-y-1/2 text-[#8C6239]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('search')}
          className="w-full rounded-xl border border-[#8C6239]/25 bg-[#FAF2E4] py-2.5 pr-3 pl-9 text-sm text-[#2C180C] outline-none"
        />
      </label>
      {todayName && filter === 'all' && !needle && difficulty === 'all' && todayList.length > 0 ? (
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="font-granth text-sm font-bold text-[#5C3A21]">
              {t('today')} {gloss(lang, todayName)}
            </h3>
            <p className="text-[11px] text-[#735133]">
              {formatNum(todayList.length, lang)} {t('suitable')}
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {todayList.slice(0, 12).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className="shrink-0 rounded-xl border border-[#8C6239]/20 bg-[#FAF2E4] px-3 py-2 text-left cursor-pointer"
              >
                <span className="block text-xs font-bold text-[#5C3A21]">{viewOf(item, lang).title}</span>
                <span className="block text-[11px] text-[#735133]">{viewOf(item, lang).time}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
          {t('all')}
        </Chip>
        <Chip active={filter === 'mine'} onClick={() => setFilter('mine')}>
          {t('mine')} · {formatNum(Object.keys(sadhana).length, lang)}
        </Chip>
        {CATEGORIES.map((category) => (
          <Chip key={category} active={filter === category} onClick={() => setFilter(category)}>
            {gloss(lang, category)}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Chip active={difficulty === 'all'} onClick={() => setDifficulty('all')}>
          {t('anyLevel')}
        </Chip>
        {DIFFICULTIES.map((level) => (
          <Chip key={level} active={difficulty === level} onClick={() => setDifficulty(level)}>
            {gloss(lang, level)}
          </Chip>
        ))}
      </div>
      <p className="text-[11px] text-[#735133]">
        {formatNum(filtered.length, lang)} {t('results')}
      </p>
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#735133]">{t('empty')}</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((item) => {
            const view = viewOf(item, lang);
            const entry = sadhana[String(item.id)];
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className="w-full rounded-xl border border-[#8C6239]/15 bg-[#FAF2E4] px-3 py-2.5 text-left cursor-pointer"
                >
                  <span className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-bold text-[#B56A00]">
                      {formatNum(item.id, lang)} · {view.category}
                    </span>
                    <span className="text-[#735133]">{view.difficulty}</span>
                  </span>
                  <span className="mt-0.5 block font-granth text-sm font-bold text-[#5C3A21]">{view.title}</span>
                  <span className="block text-xs text-[#735133]">{view.problem}</span>
                  <span className="mt-0.5 block text-[11px] text-[#5C3A21]">
                    <Sparkles className="mr-1 inline w-3 h-3 text-[#B56A00]" />
                    {item.mantra || t('withoutMantra')}
                    {view.mantraMeaning ? ` · ${view.mantraMeaning}` : ''} · {view.day}
                  </span>
                  {entry ? (
                    <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-[#EADBCC]">
                      <span
                        className="block h-full bg-[#5C3A21]"
                        style={{ width: `${Math.min(100, Math.round((entry.done.length / item.duration_days) * 100))}%` }}
                      />
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold cursor-pointer ${
        active ? 'bg-[#5C3A21] text-[#FAF2E4]' : 'bg-[#F4E8D1] text-[#5C3A21]'
      }`}
    >
      {children}
    </button>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#8C6239]/15 px-2.5 py-2">
      <dt className="text-[10px] text-[#8C6239]">{label}</dt>
      <dd className="mt-0.5 font-bold text-[#5C3A21]">{value}</dd>
    </div>
  );
}
