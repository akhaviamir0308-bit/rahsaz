/**
 * Preview builder: turns the virtual project files into one self-contained HTML
 * document for a sandboxed iframe (srcDoc) or a standalone browser tab.
 *  - resolves css/js/images relative to the HTML page (./, ../, /abs, ?query, #hash)
 *  - inlines local text assets (css, js, svg) — images as data URIs
 *  - rewrites url(...) inside inlined CSS
 *  - injects a small bridge: in-page anchors, page-to-page navigation,
 *    external links in a new tab, form-submit guard, runtime error reporting
 */
import type { ProjectFile } from '../../shared/types'

const MIME: Record<string, string> = {
  svg: 'image/svg+xml', css: 'text/css', js: 'text/javascript', json: 'application/json', txt: 'text/plain',
}
const isExternal = (u: string) => /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(u)

function dirOf(path: string) { const i = path.lastIndexOf('/'); return i === -1 ? '' : path.slice(0, i + 1) }

/** Resolve a reference found inside `fromFile` to a project path (or null if external / not resolvable). */
export function resolveRef(ref: string, fromFile: string): string | null {
  let r = ref.trim().replace(/[?#].*$/, '')
  if (!r || isExternal(r)) return null
  try { r = decodeURIComponent(r) } catch { /* keep raw */ }
  const parts = (r.startsWith('/') ? r.slice(1) : dirOf(fromFile) + r).split('/')
  const out: string[] = []
  for (const part of parts) {
    if (part === '' || part === '.') continue
    if (part === '..') { out.pop(); continue }
    out.push(part)
  }
  return out.join('/')
}

const toDataUri = (mime: string, text: string) =>
  `data:${mime};charset=utf-8,${encodeURIComponent(text)}`

export interface PreviewResult { html: string; entry: string; pages: string[] }

export function listPages(files: ProjectFile[]): string[] {
  return files.filter(f => f.kind === 'file' && /\.html?$/i.test(f.path)).map(f => f.path)
    .sort((a, b) => (a === 'index.html' ? -1 : b === 'index.html' ? 1 : a.localeCompare(b)))
}

function inlineCssUrls(css: string, cssPath: string, byPath: Map<string, string>): string {
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (m, _q: string, ref: string) => {
    const p = resolveRef(ref, cssPath)
    const content = p !== null ? byPath.get(p) : undefined
    if (p === null || content === undefined) return m
    const ext = p.split('.').pop()!.toLowerCase()
    return MIME[ext] ? `url("${toDataUri(MIME[ext], content)}")` : m
  })
}

const BRIDGE = `<script>(function(){
function post(m){try{parent.postMessage(Object.assign({source:'rahsaz-preview'},m),'*')}catch(e){}}
window.addEventListener('error',function(e){post({type:'error',message:(e.message||'Error')+(e.lineno?' (line '+e.lineno+')':'')})});
window.addEventListener('unhandledrejection',function(e){post({type:'error',message:'Promise: '+(e.reason&&e.reason.message||e.reason)})});
var ce=console.error;console.error=function(){try{post({type:'error',message:Array.prototype.slice.call(arguments).join(' ')})}catch(x){}ce.apply(console,arguments)};
document.addEventListener('click',function(ev){
  var a=ev.target&&ev.target.closest&&ev.target.closest('a[href]');if(!a)return;
  var h=a.getAttribute('href')||'';
  if(h.charAt(0)==='#'){ev.preventDefault();if(h.length>1){var el=document.getElementById(decodeURIComponent(h.slice(1)))||document.getElementsByName(decodeURIComponent(h.slice(1)))[0];if(el)el.scrollIntoView({behavior:'smooth'})}else{window.scrollTo({top:0,behavior:'smooth'})}return}
  if(/^(mailto:|tel:|sms:)/i.test(h)){ev.preventDefault();post({type:'info',message:h});return}
  if(/^(https?:)?\\/\\//i.test(h)){ev.preventDefault();window.open(h,'_blank','noopener');return}
  if(/^javascript:/i.test(h))return;
  ev.preventDefault();post({type:'nav',href:h});
},true);
document.addEventListener('submit',function(ev){ev.preventDefault();post({type:'info',message:'form submit blocked in preview'});
  var t=document.createElement('div');t.textContent='✓ (preview) form submit is disabled';t.style.cssText='position:fixed;bottom:12px;left:50%;transform:translateX(-50%);background:#222;color:#fff;padding:8px 14px;border-radius:8px;font:13px sans-serif;z-index:99999';document.body.appendChild(t);setTimeout(function(){t.remove()},2200)},true);
})();</script>`

export function buildPreview(files: ProjectFile[], requested?: string, opts: { bridge?: boolean } = {}): PreviewResult | null {
  const list = files.filter(f => f.kind === 'file')
  const byPath = new Map<string, string>(list.map(f => [f.path, f.content || '']))
  const pages = listPages(files)
  if (pages.length === 0) return null
  const entry = requested && byPath.has(requested) ? requested : pages[0]
  let html = byPath.get(entry) || ''

  // <link rel=stylesheet href=local.css>
  html = html.replace(/<link\b[^>]*>/gi, (tag: string) => {
    if (!/rel\s*=\s*["']?stylesheet/i.test(tag)) {
      // favicon / other local links → data URI when it is a text asset, else drop broken local favicon
      const m = /href\s*=\s*["']([^"']+)["']/i.exec(tag)
      if (m && /rel\s*=\s*["'][^"']*icon/i.test(tag)) {
        const p = resolveRef(m[1], entry); const c = p !== null ? byPath.get(p) : undefined
        if (p !== null && c !== undefined && p.endsWith('.svg')) return tag.replace(m[1], toDataUri(MIME.svg, c))
      }
      return tag
    }
    const m = /href\s*=\s*["']([^"']+)["']/i.exec(tag)
    if (!m) return tag
    const p = resolveRef(m[1], entry)
    const css = p !== null ? byPath.get(p) : undefined
    if (p === null || css === undefined) return tag
    return `<style data-src="${p}">\n${inlineCssUrls(css, p, byPath).replace(/<\/style/gi, '<\\/style')}\n</style>`
  })

  // <script src=local.js></script>
  html = html.replace(/<script\b([^>]*?)\bsrc\s*=\s*["']([^"']+)["']([^>]*)>\s*<\/script>/gi,
    (tag: string, pre: string, src: string, post: string) => {
      const p = resolveRef(src, entry)
      const js = p !== null ? byPath.get(p) : undefined
      if (p === null || js === undefined) return tag
      const attrs = (pre + ' ' + post).replace(/\b(defer|async)\b/gi, '').trim()
      return `<script ${attrs}>\n${js.replace(/<\/script/gi, '<\\/script')}\n</script>`
    })

  // <img src>, <source src>, <video poster>, <image href> pointing to local SVG/text assets
  html = html.replace(/(<(?:img|source|image|use)\b[^>]*?\b(?:src|href|srcset)\s*=\s*["'])([^"']+)(["'])/gi,
    (m: string, pre: string, ref: string, q: string) => {
      const p = resolveRef(ref, entry)
      const c = p !== null ? byPath.get(p) : undefined
      if (p === null || c === undefined) return m
      const ext = p.split('.').pop()!.toLowerCase()
      return MIME[ext] ? pre + toDataUri(MIME[ext], c) + q : m
    })

  // inline <style> blocks with url(local)
  html = html.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi, (m: string, attrs: string, css: string) =>
    /data-src=/.test(attrs) ? m : `<style${attrs}>${inlineCssUrls(css, entry, byPath)}</style>`)

  const inject = (opts.bridge === false ? '' : BRIDGE)
  if (/<head[^>]*>/i.test(html)) html = html.replace(/<head[^>]*>/i, m => m + inject)
  else if (/<html[^>]*>/i.test(html)) html = html.replace(/<html[^>]*>/i, m => m + '<head>' + inject + '</head>')
  else html = inject + html

  return { html, entry, pages }
}

/** Static check used by tests + preview hints: local references that point to nothing. */
export function findBrokenRefs(files: ProjectFile[], page: string): string[] {
  const byPath = new Set(files.filter(f => f.kind === 'file').map(f => f.path))
  const content = files.find(f => f.path === page)?.content || ''
  const refs = [...content.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)].map(m => m[1])
  const out: string[] = []
  for (const r of refs) {
    if (r.startsWith('#') || /^(mailto:|tel:|sms:|javascript:|data:)/i.test(r)) continue
    const p = resolveRef(r, page)
    if (p === null) continue
    if (p === '' ) continue
    if (!byPath.has(p)) out.push(r)
  }
  return [...new Set(out)]
}
