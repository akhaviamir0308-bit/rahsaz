/**
 * Extract proposed files from an AI response (markdown fences with optional path).
 * Examples:
 * ```html index.html
 * ```tsx src/App.tsx
 * ```index.html
 */

export interface ProposedFile {
  path: string
  content: string
}

const FENCE =
  /```([a-zA-Z0-9_+.-]*)[ \t]*([^\n`]*)\n([\s\S]*?)```/g

function looksLikePath(s: string): boolean {
  const t = s.trim().replace(/^["']|["']$/g, '')
  if (!t || t.length > 180) return false
  if (t.includes('..')) return false
  if (/^[a-zA-Z0-9_./-]+$/.test(t) && (t.includes('/') || /\.[a-zA-Z0-9]+$/.test(t))) return true
  return false
}

export function parseAiProposedFiles(text: string): ProposedFile[] {
  const out: ProposedFile[] = []
  const seen = new Set<string>()
  let m: RegExpExecArray | null
  const re = new RegExp(FENCE.source, 'g')
  while ((m = re.exec(text)) !== null) {
    const lang = (m[1] || '').trim()
    const meta = (m[2] || '').trim()
    const body = (m[3] || '').replace(/\n$/, '')
    let path = ''
    if (looksLikePath(meta)) path = meta.trim().replace(/^["']|["']$/g, '')
    else if (looksLikePath(lang)) path = lang
    else if (lang === 'html' || lang === 'htm') path = 'index.html'
    else if (lang === 'css') path = 'styles.css'
    else if (lang === 'js' || lang === 'javascript') path = 'main.js'
    else if (lang === 'ts' || lang === 'tsx') path = 'src/App.tsx'
    if (!path || seen.has(path)) continue
    if (path.includes('..') || path.startsWith('/')) continue
    seen.add(path)
    out.push({ path, content: body })
  }
  return out
}
