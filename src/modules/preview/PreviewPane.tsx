import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Monitor, Tablet, Smartphone, ExternalLink, RefreshCw, AlertTriangle, Eye,
  Code2, Terminal, Loader2,
} from 'lucide-react'
import type { ProjectFile } from '../../shared/types'
import { buildPreview, resolveRef } from './preview'
import { detectProjectKind } from './projectKind'
import { buildReactPreview } from './reactPreview'

type VP = 'desktop' | 'tablet' | 'mobile'
const SIZES: Record<VP, { w: number; h: number }> = {
  desktop: { w: 1280, h: 800 }, tablet: { w: 768, h: 1024 }, mobile: { w: 390, h: 780 },
}

export default function PreviewPane({ files, dirty, isFa, resetKey }: {
  files: ProjectFile[]; dirty: boolean; isFa: boolean; resetKey: number
}) {
  const [vp, setVp] = useState<VP>('desktop')
  const [page, setPage] = useState<string | undefined>(undefined)
  const [nonce, setNonce] = useState(0)
  const [errors, setErrors] = useState<string[]>([])
  const [width, setWidth] = useState(0)
  const [forceStatic, setForceStatic] = useState(false)
  const [reactHtml, setReactHtml] = useState<string | null>(null)
  const [reactError, setReactError] = useState<string | null>(null)
  const [reactLoading, setReactLoading] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)

  const kindInfo = useMemo(() => detectProjectKind(files), [files])
  const staticResult = useMemo(() => buildPreview(files, page), [files, page])
  const isPro = kindInfo.previewMode === 'professional' && !forceStatic

  // Build React preview when professional project
  useEffect(() => {
    if (!isPro) {
      setReactHtml(null)
      setReactError(null)
      setReactLoading(false)
      return
    }
    let cancelled = false
    setReactLoading(true)
    setReactError(null)
    void buildReactPreview(files).then(res => {
      if (cancelled) return
      setReactLoading(false)
      if (res.ok) {
        setReactHtml(res.html)
        setReactError(null)
      } else {
        setReactHtml(null)
        setReactError(res.error)
      }
    })
    return () => { cancelled = true }
  }, [files, isPro, nonce, resetKey])

  useEffect(() => { setPage(undefined); setErrors([]); setForceStatic(false) }, [resetKey])
  useEffect(() => { setErrors([]) }, [staticResult?.html, reactHtml, nonce])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => setWidth(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  })

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (!frameRef.current || e.source !== frameRef.current.contentWindow) return
      const d = e.data
      if (!d || d.source !== 'rahsaz-preview') return
      if (d.type === 'error') setErrors(prev => (prev.length > 20 ? prev : [...prev, String(d.message).slice(0, 300)]))
      if (d.type === 'nav' && staticResult) {
        const p = resolveRef(String(d.href), staticResult.entry)
        if (p && staticResult.pages.includes(p)) setPage(p)
        else setErrors(prev => [...prev, (isFa ? 'صفحه پیدا نشد: ' : 'Page not found: ') + d.href])
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [staticResult, isFa])

  const size = SIZES[vp]
  const scale = width > 0 ? Math.min(1, (width - 8) / size.w) : 1

  const activeHtml = isPro ? reactHtml : staticResult?.html

  const openNewTab = () => {
    if (!activeHtml) return
    const w = window.open('', '_blank')
    if (w) {
      w.document.open()
      w.document.write(activeHtml)
      w.document.close()
    }
  }

  // —— Professional React preview path ——
  if (isPro) {
    return (
      <div>
        <div className="ai-block" style={{ marginBottom: 12 }}>
          <h3 className="ai-block-title" style={{ marginTop: 0 }}>
            <Code2 size={18} style={{ verticalAlign: 'middle', marginInlineEnd: 8 }} />
            {isFa ? 'پیش‌نمایش حرفه‌ای (باندل در مرورگر)' : 'Professional preview (in-browser bundle)'}
          </h3>
          <p className="ai-hint" style={{ margin: 0 }}>
            {isFa
              ? 'راه‌ساز با esbuild در مرورگر کد React/TS را باندل می‌کند. وابستگی‌ها از CDN بارگذاری می‌شوند. پروژه‌های خیلی پیچیده ممکن است کامل اجرا نشوند.'
              : 'Rahsaz bundles React/TS in the browser with esbuild. Dependencies load from a CDN. Very complex projects may not run fully.'}
          </p>
          <p className="ai-hint">
            {isFa ? 'تشخیص: ' : 'Detected: '}
            <strong>{isFa ? kindInfo.labelFa : kindInfo.labelEn}</strong>
            {kindInfo.reasons.length ? ` · ${kindInfo.reasons.join(' · ')}` : ''}
          </p>
        </div>

        <div className="preview-toolbar">
          {([
            ['desktop', Monitor],
            ['tablet', Tablet],
            ['mobile', Smartphone],
          ] as const).map(([id, Icon]) => (
            <button key={id} type="button" className={`secondary-button ${vp === id ? 'active' : ''}`} onClick={() => setVp(id)}>
              <Icon size={14} />
            </button>
          ))}
          <button type="button" className="secondary-button" onClick={() => setNonce(n => n + 1)} disabled={reactLoading}>
            {reactLoading ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />}
            {isFa ? 'تازه‌سازی باندل' : 'Rebuild'}
          </button>
          <button type="button" className="secondary-button" onClick={openNewTab} disabled={!reactHtml}>
            <ExternalLink size={14} />{isFa ? 'تب جدید' : 'New tab'}
          </button>
          <button type="button" className="text-button" onClick={() => setForceStatic(true)}>
            {isFa ? 'حالت HTML خام' : 'Raw HTML mode'}
          </button>
        </div>

        {dirty && (
          <div className="ai-warn" style={{ marginTop: 10 }}>
            <AlertTriangle size={16} />
            <span>{isFa ? 'تغییرات ذخیره‌نشده در باندل نیست. اول ذخیره کنید.' : 'Unsaved changes are not in the bundle. Save first.'}</span>
          </div>
        )}

        {reactLoading && (
          <div className="empty-state" style={{ marginTop: 16 }}>
            <Loader2 size={22} className="spin" />
            <strong>{isFa ? 'در حال باندل پروژه در مرورگر…' : 'Bundling project in the browser…'}</strong>
          </div>
        )}

        {!reactLoading && reactError && (
          <div className="ai-block" style={{ marginTop: 12 }}>
            <div className="ai-warn">
              <AlertTriangle size={16} />
              <span>{isFa ? 'باندل ناموفق بود' : 'Bundle failed'}</span>
            </div>
            <pre className="prompt-preview" style={{ marginTop: 10, maxHeight: 200, overflow: 'auto' }}>{reactError}</pre>
            <div className="ai-block" style={{ marginTop: 12 }}>
              <h3 className="ai-block-title"><Terminal size={16} /> {isFa ? 'اجرای محلی' : 'Local run'}</h3>
              <ol style={{ lineHeight: 1.8 }}>
                <li>npm install</li>
                <li>npm run dev</li>
              </ol>
            </div>
          </div>
        )}

        {!reactLoading && reactHtml && (
          <>
            <p className="ai-hint" style={{ marginTop: 8 }}>
              {isFa
                ? `عرض ${size.w}px${scale < 1 ? ` (مقیاس ${Math.round(scale * 100)}٪)` : ''}`
                : `${size.w}px wide${scale < 1 ? ` (scaled ${Math.round(scale * 100)}%)` : ''}`}
            </p>
            <div className="preview-stage" ref={wrapRef}>
              <div style={{ width: size.w * scale, height: size.h * scale, margin: '0 auto', overflow: 'hidden', borderRadius: 10, border: '1px solid var(--line)', background: '#fff' }}>
                <iframe
                  ref={frameRef}
                  key={`react-${nonce}`}
                  title="react-preview"
                  sandbox="allow-scripts allow-popups"
                  srcDoc={reactHtml}
                  style={{ width: size.w, height: size.h, border: 0, transform: `scale(${scale})`, transformOrigin: 'top left', background: '#fff', display: 'block' }}
                />
              </div>
            </div>
          </>
        )}

        <div className="ai-block" style={{ marginTop: 16 }}>
          <h3 className="ai-block-title" style={{ fontSize: 14 }}>{isFa ? 'خطاهای اجرا' : 'Runtime errors'} ({errors.length})</h3>
          {errors.length === 0
            ? <p className="ai-hint" style={{ margin: 0 }}>{isFa ? 'خطایی از iframe ثبت نشده.' : 'No iframe errors logged.'}</p>
            : <ul style={{ margin: 0, paddingInlineStart: 20, fontSize: 12, lineHeight: 1.8, color: '#f87171' }} dir="ltr">{errors.map((er, i) => <li key={i}>{er}</li>)}</ul>}
        </div>
      </div>
    )
  }

  // —— Static HTML path ——
  if (!staticResult || !staticResult.html) {
    return (
      <div className="empty-state" style={{ marginTop: 16 }}>
        <div className="empty-icon"><Eye size={22} /></div>
        <strong>
          {isFa
            ? 'فایل HTML قابل‌پیش‌نمایش نیست. index.html بسازید یا پروژه React را import کنید.'
            : 'No previewable HTML. Create index.html or import a React project.'}
        </strong>
      </div>
    )
  }

  return (
    <div>
      {forceStatic && kindInfo.kind === 'react_vite' && (
        <div className="ai-warn" style={{ marginBottom: 10 }}>
          <AlertTriangle size={16} />
          <span>{isFa ? 'حالت HTML خام' : 'Raw HTML mode'}</span>
          <button type="button" className="text-button" onClick={() => setForceStatic(false)}>
            {isFa ? 'پیش‌نمایش React' : 'React preview'}
          </button>
        </div>
      )}

      <div className="preview-toolbar">
        {([
          ['desktop', Monitor],
          ['tablet', Tablet],
          ['mobile', Smartphone],
        ] as const).map(([id, Icon]) => (
          <button key={id} type="button" className={`secondary-button ${vp === id ? 'active' : ''}`} onClick={() => setVp(id)}>
            <Icon size={14} />
          </button>
        ))}
        {staticResult.pages.length > 1 && (
          <select value={staticResult.entry} onChange={e => setPage(e.target.value)} aria-label="page">
            {staticResult.pages.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        )}
        <button type="button" className="secondary-button" onClick={() => setNonce(n => n + 1)}><RefreshCw size={14} />{isFa ? 'تازه‌سازی' : 'Refresh'}</button>
        <button type="button" className="secondary-button" onClick={openNewTab}><ExternalLink size={14} />{isFa ? 'تب جدید' : 'New tab'}</button>
      </div>

      {dirty && (
        <div className="ai-warn" style={{ marginTop: 10 }}>
          <AlertTriangle size={16} />
          <span>{isFa ? 'تغییرات ذخیره‌نشده را اول ذخیره کنید.' : 'Save unsaved changes first.'}</span>
        </div>
      )}

      <div className="preview-stage" ref={wrapRef} style={{ marginTop: 8 }}>
        <div style={{ width: size.w * scale, height: size.h * scale, margin: '0 auto', overflow: 'hidden', borderRadius: 10, border: '1px solid var(--line)', background: '#fff' }}>
          <iframe
            ref={frameRef}
            key={`static-${nonce}-${staticResult.entry}`}
            title="preview"
            sandbox="allow-scripts allow-popups"
            srcDoc={staticResult.html}
            style={{ width: size.w, height: size.h, border: 0, transform: `scale(${scale})`, transformOrigin: 'top left', background: '#fff', display: 'block' }}
          />
        </div>
      </div>

      <div className="ai-block" style={{ marginTop: 16 }}>
        <h3 className="ai-block-title" style={{ fontSize: 14 }}>{isFa ? 'خطاهای اجرا' : 'Runtime errors'} ({errors.length})</h3>
        {errors.length === 0
          ? <p className="ai-hint" style={{ margin: 0 }}>{isFa ? 'خطایی ثبت نشده.' : 'No errors logged.'}</p>
          : <ul style={{ margin: 0, paddingInlineStart: 20, fontSize: 12, lineHeight: 1.8, color: '#f87171' }} dir="ltr">{errors.map((er, i) => <li key={i}>{er}</li>)}</ul>}
      </div>
    </div>
  )
}
