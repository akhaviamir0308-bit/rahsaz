import { useEffect, useMemo, useRef, useState } from 'react'
import { Monitor, Tablet, Smartphone, ExternalLink, RefreshCw, AlertTriangle, Eye } from 'lucide-react'
import type { ProjectFile } from '../types'
import { buildPreview, resolveRef } from '../preview'

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
  const wrapRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)

  const result = useMemo(() => buildPreview(files, page), [files, page])
  const html = result?.html

  useEffect(() => { setPage(undefined); setErrors([]) }, [resetKey])
  useEffect(() => { setErrors([]) }, [html, nonce])

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
      if (d.type === 'nav' && result) {
        const p = resolveRef(String(d.href), result.entry)
        if (p && result.pages.includes(p)) setPage(p)
        else setErrors(prev => [...prev, (isFa ? 'صفحه پیدا نشد: ' : 'Page not found: ') + d.href])
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [result, isFa])

  if (!result || !html) {
    return (
      <div className="empty-state" style={{ marginTop: 16 }}>
        <div className="empty-icon"><Eye size={22} /></div>
        <strong>{isFa ? 'هنوز فایل HTML ندارید. در تب «فایل‌ها» index.html بسازید.' : 'No HTML file yet. Create index.html in the Files tab.'}</strong>
      </div>
    )
  }

  const size = SIZES[vp]
  const scale = width > 0 ? Math.min(1, (width - 2) / size.w) : 1
  const openNewTab = () => {
    const r = buildPreview(files, result.entry, { bridge: false })
    if (!r) return
    const url = URL.createObjectURL(new Blob([r.html], { type: 'text/html;charset=utf-8' }))
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  return (
    <div>
      <div className="preview-toolbar">
        <div className="segmented">
          <button type="button" className={vp === 'desktop' ? 'selected' : ''} onClick={() => setVp('desktop')}><Monitor size={14} /> {isFa ? 'دسکتاپ' : 'Desktop'} · 1280</button>
          <button type="button" className={vp === 'tablet' ? 'selected' : ''} onClick={() => setVp('tablet')}><Tablet size={14} /> {isFa ? 'تبلت' : 'Tablet'} · 768</button>
          <button type="button" className={vp === 'mobile' ? 'selected' : ''} onClick={() => setVp('mobile')}><Smartphone size={14} /> {isFa ? 'موبایل' : 'Mobile'} · 390</button>
        </div>
        {result.pages.length > 1 && (
          <select className="files-path-input" style={{ flex: '0 0 auto', minWidth: 140 }} value={result.entry} onChange={e => setPage(e.target.value)} aria-label="page">
            {result.pages.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        )}
        <button type="button" className="secondary-button" onClick={() => { setNonce(n => n + 1) }}><RefreshCw size={14} />{isFa ? 'تازه‌سازی' : 'Refresh'}</button>
        <button type="button" className="secondary-button" onClick={openNewTab}><ExternalLink size={14} />{isFa ? 'باز کردن در تب جدید' : 'Open in new tab'}</button>
      </div>

      {dirty && (
        <div className="ai-warn" style={{ marginTop: 10 }}>
          <AlertTriangle size={16} />
          <span>{isFa ? 'تغییرات ذخیره‌نشده ویرایشگر در پیش‌نمایش نیست. اول «ذخیره» (Ctrl+S) را بزنید.' : 'Unsaved editor changes are not in the preview. Save first (Ctrl+S).'}</span>
        </div>
      )}

      <p className="ai-hint" style={{ marginTop: 8 }}>
        {isFa
          ? `نمایش واقعی با عرض ${size.w} پیکسل${scale < 1 ? ` (کوچک‌شده تا ${Math.round(scale * 100)}٪ برای جا شدن)` : ''}. صفحه: ${result.entry}`
          : `True ${size.w}px-wide render${scale < 1 ? ` (scaled to ${Math.round(scale * 100)}% to fit)` : ''}. Page: ${result.entry}`}
      </p>

      <div className="preview-stage" ref={wrapRef}>
        <div style={{ width: size.w * scale, height: size.h * scale, margin: '0 auto', overflow: 'hidden', borderRadius: 10, border: '1px solid var(--line)', background: '#fff' }}>
          <iframe
            ref={frameRef}
            key={`${nonce}-${result.entry}`}
            title="preview"
            sandbox="allow-scripts allow-popups"
            srcDoc={html}
            style={{ width: size.w, height: size.h, border: 0, transform: `scale(${scale})`, transformOrigin: 'top left', background: '#fff', display: 'block' }}
          />
        </div>
      </div>

      <div className="ai-block" style={{ marginTop: 16 }}>
        <h3 className="ai-block-title" style={{ fontSize: 14 }}>{isFa ? 'خطاهای اجرا' : 'Runtime errors'} ({errors.length})</h3>
        {errors.length === 0
          ? <p className="ai-hint" style={{ margin: 0 }}>{isFa ? 'خطایی ثبت نشده. (نبودن خطا یعنی سالم بودن کامل نیست؛ خودتان هم بررسی کنید.)' : 'No errors logged. (No errors does not guarantee everything works; check it yourself too.)'}</p>
          : <ul style={{ margin: 0, paddingInlineStart: 20, fontSize: 12, lineHeight: 1.8, color: '#f87171' }} dir="ltr">{errors.map((er, i) => <li key={i}>{er}</li>)}</ul>}
      </div>
    </div>
  )
}
