import type { ProjectFile } from '../../shared/types'

export type ProjectKind = 'empty' | 'static' | 'react_vite' | 'mixed'

export interface ProjectKindInfo {
  kind: ProjectKind
  labelFa: string
  labelEn: string
  reasons: string[]
  hasHtml: boolean
  hasPackageJson: boolean
  hasTsx: boolean
  entryHtml?: string
  previewMode: 'iframe' | 'professional' | 'none'
}

function read(files: ProjectFile[], path: string): string {
  return files.find(f => f.kind === 'file' && f.path === path)?.content || ''
}

/**
 * Detect whether the virtual project is static HTML or a toolchain project (Vite/React).
 */
export function detectProjectKind(files: ProjectFile[]): ProjectKindInfo {
  const list = files.filter(f => f.kind === 'file')
  const paths = list.map(f => f.path)
  const hasHtml = paths.some(p => /\.html?$/i.test(p))
  const hasPackageJson = paths.includes('package.json')
  const hasTsx = paths.some(p => /\.tsx?$/i.test(p))
  const hasVite =
    paths.some(p => /^vite\.config\./i.test(p.split('/').pop() || '')) ||
    /"vite"\s*:/.test(read(files, 'package.json'))
  const hasReact =
    hasTsx ||
    /"react"\s*:/.test(read(files, 'package.json')) ||
    paths.some(p => p === 'src/main.tsx' || p === 'src/App.tsx' || p === 'src/main.jsx')

  const index = read(files, 'index.html') || list.find(f => /\.html?$/i.test(f.path))?.content || ''
  const viteShell =
    /type\s*=\s*["']module["']/i.test(index) &&
    (/src\/main\.(t|j)sx?/i.test(index) || /@vite|vite\/client/i.test(index) || /\/src\//i.test(index))

  const reasons: string[] = []
  if (hasPackageJson) reasons.push('package.json')
  if (hasVite) reasons.push('Vite')
  if (hasReact) reasons.push('React/TSX')
  if (viteShell) reasons.push('index.html → module entry')

  let kind: ProjectKind = 'empty'
  if (list.length === 0) kind = 'empty'
  else if ((hasVite || hasReact || viteShell) && hasHtml) kind = hasHtml && !viteShell && !hasTsx ? 'static' : 'react_vite'
  else if (hasVite || hasReact || viteShell) kind = 'react_vite'
  else if (hasHtml) kind = 'static'
  else if (hasPackageJson || hasTsx) kind = 'react_vite'
  else kind = 'mixed'

  // Prefer professional mode when toolchain signals dominate
  const professional = kind === 'react_vite' || (viteShell && hasPackageJson)

  return {
    kind: professional ? 'react_vite' : kind,
    labelFa: professional
      ? 'پروژه حرفه‌ای (Vite / React)'
      : kind === 'static'
        ? 'سایت استاتیک (HTML/CSS/JS)'
        : kind === 'empty'
          ? 'بدون فایل'
          : 'ترکیبی / نامشخص',
    labelEn: professional
      ? 'Professional project (Vite / React)'
      : kind === 'static'
        ? 'Static site (HTML/CSS/JS)'
        : kind === 'empty'
          ? 'No files'
          : 'Mixed / unknown',
    reasons,
    hasHtml,
    hasPackageJson,
    hasTsx,
    entryHtml: paths.includes('index.html')
      ? 'index.html'
      : list.find(f => /\.html?$/i.test(f.path))?.path,
    previewMode: professional ? 'professional' : hasHtml ? 'iframe' : 'none',
  }
}
