import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  GraduationCap, Check, CheckCircle2, Circle, Copy, Search, ChevronRight, ChevronLeft,
  Lightbulb, AlertTriangle, ArrowUpLeft, Clock, BookMarked, Terminal, Library,
} from 'lucide-react'
import { MODULES, LESSONS, PROMPT_BANK, GLOSSARY, type Block, type L, type ActionId } from '../../data/learn'

type Lang = 'fa' | 'en'
type View = 'path' | 'prompts' | 'glossary'

const PROGRESS_KEY = 'rahsaz.learn.v1'

interface Saved { done: string[]; last: string }

function loadSaved(): Saved {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      return { done: Array.isArray(p.done) ? p.done.filter((x: unknown) => typeof x === 'string') : [], last: typeof p.last === 'string' ? p.last : LESSONS[0].id }
    }
  } catch { /* storage may be unavailable */ }
  return { done: [], last: LESSONS[0].id }
}

const UI = {
  fa: {
    title: 'آکادمی راه‌ساز', sub: 'آموزش از صفر تا صد: ابزارها، روش کار و یک پروژه کامل',
    path: 'مسیر یادگیری', prompts: 'بانک پرامپت', glossary: 'واژه‌نامه',
    search: 'جست‌وجو در درس‌ها…', progress: 'پیشرفت شما', lessons: 'درس', min: 'دقیقه',
    markDone: 'این درس را تمام کردم', done: 'تمام شد', undo: 'برگرداندن',
    next: 'درس بعدی', prev: 'درس قبلی', copy: 'کپی', copied: 'کپی شد', noResults: 'نتیجه‌ای پیدا نشد.',
    startHere: 'شروع از اینجا', cont: 'ادامه از آخرین درس', promptsSub: 'پرامپت‌های آماده؛ بخش‌های [داخل کروشه] را با اطلاعات خودتان عوض کنید.',
    glossarySub: 'اصطلاحات فنی به زبان ساده.', when: 'کاربرد', allDone: 'همه درس‌ها را تمام کردید. تبریک!',
  },
  en: {
    title: 'Rahsaz Academy', sub: 'From zero to hero: tools, method and a complete project',
    path: 'Learning path', prompts: 'Prompt bank', glossary: 'Glossary',
    search: 'Search lessons…', progress: 'Your progress', lessons: 'lessons', min: 'min',
    markDone: 'I finished this lesson', done: 'Done', undo: 'Undo',
    next: 'Next lesson', prev: 'Previous lesson', copy: 'Copy', copied: 'Copied', noResults: 'Nothing found.',
    startHere: 'Start here', cont: 'Continue where you left off', promptsSub: 'Ready prompts; replace the [bracketed] parts with your own information.',
    glossarySub: 'Technical terms in plain language.', when: 'Use', allDone: 'You finished every lesson. Congratulations!',
  },
} as const

function blockText(b: Block, lang: Lang): string {
  switch (b.k) {
    case 'p': case 'h': case 'tip': case 'warn': return b.t[lang]
    case 'prompt': return b.title[lang] + ' ' + b.t[lang]
    case 'ul': case 'ol': case 'check': return b.items.map(i => i[lang]).join(' ')
    case 'table': return b.rows.flat().map(c => c[lang]).join(' ')
    case 'action': return b.label[lang]
  }
}

function CopyButton({ text, lang }: { text: string; lang: Lang }) {
  const [ok, setOk] = useState(false)
  const u = UI[lang]
  return (
    <button
      type="button"
      className="secondary-button ac-copy"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
        } catch {
          const ta = document.createElement('textarea')
          ta.value = text; document.body.appendChild(ta); ta.select()
          try { document.execCommand('copy') } catch { /* ignore */ }
          ta.remove()
        }
        setOk(true); setTimeout(() => setOk(false), 1800)
      }}
    >
      {ok ? <Check size={14} /> : <Copy size={14} />}{ok ? u.copied : u.copy}
    </button>
  )
}

function Blocks({ blocks, lang, onAction }: { blocks: Block[]; lang: Lang; onAction: (id: ActionId) => void }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.k) {
          case 'p': return <p key={i} className="ac-p">{b.t[lang]}</p>
          case 'h': return <h3 key={i} className="ac-h">{b.t[lang]}</h3>
          case 'ul': return <ul key={i} className="ac-ul">{b.items.map((it, j) => <li key={j}>{it[lang]}</li>)}</ul>
          case 'ol': return <ol key={i} className="ac-ol">{b.items.map((it, j) => <li key={j}>{it[lang]}</li>)}</ol>
          case 'check': return (
            <ul key={i} className="ac-check">{b.items.map((it, j) => <li key={j}><Circle size={15} />{it[lang]}</li>)}</ul>
          )
          case 'tip': return <div key={i} className="ac-note ac-tip"><Lightbulb size={17} /><span>{b.t[lang]}</span></div>
          case 'warn': return <div key={i} className="ac-note ac-warn"><AlertTriangle size={17} /><span>{b.t[lang]}</span></div>
          case 'prompt': return (
            <div key={i} className="ac-prompt">
              <div className="ac-prompt-head"><strong><Terminal size={14} /> {b.title[lang]}</strong><CopyButton text={b.t[lang]} lang={lang} /></div>
              <pre dir={lang === 'fa' ? 'rtl' : 'ltr'}>{b.t[lang]}</pre>
            </div>
          )
          case 'table': return (
            <div key={i} className="ac-table-wrap">
              <table className="ac-table">
                <thead><tr>{b.head.map((h, j) => <th key={j}>{h[lang]}</th>)}</tr></thead>
                <tbody>{b.rows.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k}>{c[lang]}</td>)}</tr>)}</tbody>
              </table>
            </div>
          )
          case 'action': return (
            <button key={i} type="button" className="primary-button ac-action" onClick={() => onAction(b.id)}>
              {b.label[lang]}<ArrowUpLeft size={16} />
            </button>
          )
        }
      })}
    </>
  )
}

export default function LearnView({ lang, initialLesson, onAction }: {
  lang: Lang
  initialLesson?: string
  onAction: (id: ActionId) => void
}) {
  const u = UI[lang]
  const isFa = lang === 'fa'
  const [view, setView] = useState<View>('path')
  const [saved, setSaved] = useState<Saved>(loadSaved)
  const [lessonId, setLessonId] = useState<string>(() => initialLesson && LESSONS.some(l => l.id === initialLesson) ? initialLesson : loadSaved().last)
  const [q, setQ] = useState('')
  const [gq, setGq] = useState('')

  useEffect(() => {
    if (initialLesson && LESSONS.some(l => l.id === initialLesson)) { setLessonId(initialLesson); setView('path') }
  }, [initialLesson])

  const persist = useCallback((next: Saved) => {
    setSaved(next)
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }, [])

  const lesson = LESSONS.find(l => l.id === lessonId) || LESSONS[0]
  const idx = LESSONS.findIndex(l => l.id === lesson.id)
  const isDone = saved.done.includes(lesson.id)
  const pct = Math.round((saved.done.filter(id => LESSONS.some(l => l.id === id)).length / LESSONS.length) * 100)

  const openLesson = useCallback((id: string) => {
    setLessonId(id)
    persist({ ...saved, last: id })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [saved, persist])

  const toggleDone = () => {
    const done = isDone ? saved.done.filter(x => x !== lesson.id) : [...saved.done, lesson.id]
    persist({ ...saved, done })
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return LESSONS
    return LESSONS.filter(l =>
      (l.title[lang] + ' ' + l.summary[lang] + ' ' + l.blocks.map(b => blockText(b, lang)).join(' ')).toLowerCase().includes(s))
  }, [q, lang])

  const groups = useMemo(() => (
    PROMPT_BANK.reduce<Record<string, typeof PROMPT_BANK>>((acc, p) => {
      const g = p.group[lang]; (acc[g] = acc[g] || []).push(p); return acc
    }, {})
  ), [lang])

  const terms = useMemo(() => {
    const s = gq.trim().toLowerCase()
    return GLOSSARY.filter(t => !s || (t.term + ' ' + t.def[lang]).toLowerCase().includes(s))
  }, [gq, lang])

  const Next = isFa ? ChevronLeft : ChevronRight
  const Prev = isFa ? ChevronRight : ChevronLeft
  const fmt = (n: number) => n.toLocaleString(isFa ? 'fa-IR' : 'en-US')

  return (
    <section className="page-section ac">
      <div className="page-title-row">
        <div>
          <div className="eyebrow"><GraduationCap size={14} /> {u.title}</div>
          <h1>{u.title}</h1>
          <p style={{ color: 'var(--muted)' }}>{u.sub}</p>
        </div>
      </div>

      <div className="ac-progress">
        <div className="ac-progress-top"><span>{u.progress}</span><strong>{fmt(pct)}٪</strong></div>
        <div className="discovery-progress-bar" style={{ margin: '8px 0 0', height: 10 }}>
          <div className="discovery-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="ac-progress-sub">
          {fmt(saved.done.filter(id => LESSONS.some(l => l.id === id)).length)} / {fmt(LESSONS.length)} {u.lessons}
          {pct === 100 && <b> — {u.allDone}</b>}
        </div>
      </div>

      <div className="segmented ac-tabs">
        <button type="button" className={view === 'path' ? 'selected' : ''} onClick={() => setView('path')}><BookMarked size={14} /> {u.path}</button>
        <button type="button" className={view === 'prompts' ? 'selected' : ''} onClick={() => setView('prompts')}><Terminal size={14} /> {u.prompts}</button>
        <button type="button" className={view === 'glossary' ? 'selected' : ''} onClick={() => setView('glossary')}><Library size={14} /> {u.glossary}</button>
      </div>

      {view === 'path' && (
        <div className="ac-layout">
          <aside className="ac-side">
            <label className="ac-search"><Search size={15} />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder={u.search} />
            </label>
            {filtered.length === 0 && <p className="ai-hint">{u.noResults}</p>}
            {MODULES.map(m => {
              const items = filtered.filter(l => l.module === m.id)
              if (items.length === 0) return null
              return (
                <div key={m.id} className="ac-module">
                  <div className="ac-module-title">{m.title[lang]}</div>
                  {items.map(l => (
                    <button key={l.id} type="button" className={`ac-lesson-link ${l.id === lesson.id ? 'active' : ''}`} onClick={() => openLesson(l.id)}>
                      {saved.done.includes(l.id) ? <CheckCircle2 size={16} className="ac-done-ic" /> : <Circle size={16} />}
                      <span>{l.title[lang]}</span>
                    </button>
                  ))}
                </div>
              )
            })}
          </aside>

          <article className="ac-main">
            <div className="ac-crumb">{MODULES.find(m => m.id === lesson.module)?.title[lang]}</div>
            <h2 className="ac-title">{lesson.title[lang]}</h2>
            <div className="ac-meta"><Clock size={13} /> {fmt(lesson.minutes)} {u.min} · {fmt(idx + 1)}/{fmt(LESSONS.length)}</div>
            <p className="ac-summary">{lesson.summary[lang]}</p>
            <Blocks blocks={lesson.blocks} lang={lang} onAction={onAction} />

            <div className="ac-footer">
              <button type="button" className={isDone ? 'secondary-button' : 'primary-button'} onClick={toggleDone}>
                {isDone ? <><CheckCircle2 size={16} /> {u.done} · {u.undo}</> : <><Check size={16} /> {u.markDone}</>}
              </button>
              <div className="ac-nav">
                {idx > 0 && <button type="button" className="secondary-button" onClick={() => openLesson(LESSONS[idx - 1].id)}><Prev size={15} />{u.prev}</button>}
                {idx < LESSONS.length - 1 && <button type="button" className="secondary-button" onClick={() => openLesson(LESSONS[idx + 1].id)}>{u.next}<Next size={15} /></button>}
              </div>
            </div>
          </article>
        </div>
      )}

      {view === 'prompts' && (
        <div>
          <p className="ai-hint">{u.promptsSub}</p>
          {Object.entries(groups).map(([g, list]) => (
            <div key={g} className="ai-block">
              <h3 className="ai-block-title">{g}</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {list.map(p => (
                  <div key={p.id} className="ac-prompt">
                    <div className="ac-prompt-head">
                      <strong>{p.title[lang]}<small> · {u.when}: {p.when[lang]}</small></strong>
                      <CopyButton text={p.text[lang]} lang={lang} />
                    </div>
                    <pre dir={isFa ? 'rtl' : 'ltr'}>{p.text[lang]}</pre>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'glossary' && (
        <div>
          <p className="ai-hint">{u.glossarySub}</p>
          <label className="ac-search" style={{ maxWidth: 360 }}><Search size={15} />
            <input value={gq} onChange={e => setGq(e.target.value)} placeholder={u.search} />
          </label>
          <div className="ac-glossary">
            {terms.map(t => (
              <div key={t.id} className="req-item"><strong dir="auto">{t.term}</strong><p>{t.def[lang]}</p></div>
            ))}
            {terms.length === 0 && <p className="ai-hint">{u.noResults}</p>}
          </div>
        </div>
      )}
    </section>
  )
}

export type { L }
