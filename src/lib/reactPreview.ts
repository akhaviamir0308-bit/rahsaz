/**
 * In-browser React/Vite-style preview using esbuild-wasm.
 * Bundles the virtual file tree; bare imports load from esm.sh.
 */
import type { ProjectFile } from '../shared/types'

export type ReactPreviewResult =
  | { ok: true; html: string }
  | { ok: false; error: string }

let esbuildReady: Promise<typeof import('esbuild-wasm')> | null = null

async function getEsbuild() {
  if (!esbuildReady) {
    esbuildReady = (async () => {
      const esbuild = await import('esbuild-wasm')
      // initialize once; ignore "already initialized" on HMR
      try {
        await esbuild.initialize({
          wasmURL: 'https://unpkg.com/esbuild-wasm@0.25.0/esbuild.wasm',
          worker: false,
        })
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        if (!/already been initialized/i.test(msg)) throw e
      }
      return esbuild
    })()
  }
  return esbuildReady
}

function buildFs(files: ProjectFile[]): Map<string, string> {
  const fs = new Map<string, string>()
  for (const f of files) {
    if (f.kind !== 'file') continue
    const p = f.path.replace(/^\/+/, '').replace(/\\/g, '/')
    fs.set(p, f.content || '')
  }
  return fs
}

function normalizePath(p: string): string {
  const parts = p.replace(/\\/g, '/').split('/')
  const out: string[] = []
  for (const part of parts) {
    if (!part || part === '.') continue
    if (part === '..') out.pop()
    else out.push(part)
  }
  return out.join('/')
}

function pickLoader(path: string): 'tsx' | 'ts' | 'jsx' | 'js' | 'css' | 'json' | 'text' {
  if (path.endsWith('.tsx')) return 'tsx'
  if (path.endsWith('.ts')) return 'ts'
  if (path.endsWith('.jsx')) return 'jsx'
  if (path.endsWith('.css')) return 'css'
  if (path.endsWith('.json')) return 'json'
  if (path.endsWith('.js') || path.endsWith('.mjs')) return 'js'
  return 'text'
}

function pickEntry(fs: Map<string, string>): string | null {
  const candidates = [
    'src/main.tsx', 'src/main.jsx', 'src/main.ts', 'src/main.js',
    'src/index.tsx', 'src/index.jsx', 'src/index.ts', 'src/index.js',
    'main.tsx', 'main.jsx', 'index.tsx', 'index.jsx',
  ]
  for (const c of candidates) {
    if (fs.has(c)) return c
  }
  if (fs.has('src/App.tsx') || fs.has('src/App.jsx')) return '__rahsaz_entry.tsx'
  return null
}

function resolveInFs(fs: Map<string, string>, request: string, importer: string): string | null {
  const clean = request.split('?')[0].split('#')[0]
  if (!clean) return null

  const baseDir = importer.includes('/')
    ? importer.slice(0, importer.lastIndexOf('/') + 1)
    : ''

  const joined = clean.startsWith('.')
    ? normalizePath(baseDir + clean)
    : normalizePath(clean.replace(/^\/+/, ''))

  const tries = [
    joined,
    joined + '.tsx',
    joined + '.ts',
    joined + '.jsx',
    joined + '.js',
    joined + '.css',
    joined + '.json',
    joined + '/index.tsx',
    joined + '/index.ts',
    joined + '/index.jsx',
    joined + '/index.js',
  ]

  for (const t of tries) {
    if (fs.has(t)) return t
  }
  return null
}

export async function buildReactPreview(files: ProjectFile[]): Promise<ReactPreviewResult> {
  try {
    const esbuild = await getEsbuild()
    const fs = buildFs(files)
    let entry = pickEntry(fs)
    if (!entry) {
      return { ok: false, error: 'No entry file (src/main.tsx or src/App.tsx) found.' }
    }

    if (entry === '__rahsaz_entry.tsx') {
      const app = fs.has('src/App.tsx') ? './src/App.tsx' : './src/App.jsx'
      fs.set(
        '__rahsaz_entry.tsx',
        `import { createRoot } from 'react-dom/client'\nimport App from '${app}'\nconst el = document.getElementById('root')\nif (el) createRoot(el).render(<App />)\n`,
      )
    }

    const result = await esbuild.build({
      entryPoints: [entry],
      bundle: true,
      write: false,
      format: 'esm',
      jsx: 'automatic',
      logLevel: 'silent',
      define: {
        'process.env.NODE_ENV': '"development"',
        'import.meta.env.DEV': 'true',
        'import.meta.env.PROD': 'false',
        'import.meta.env.BASE_URL': '"/"',
        'import.meta.env.MODE': '"development"',
      },
      plugins: [
        {
          name: 'rahsaz-virtual',
          setup(build) {
            // Entry point must always load from virtual FS (never external)
            build.onResolve({ filter: /.*/ }, args => {
              if (args.kind === 'entry-point') {
                const key = args.path.replace(/^\/+/, '')
                if (fs.has(key)) return { path: key, namespace: 'virtual' }
                return { path: key, namespace: 'virtual' }
              }

              const req = args.path

              // Already a URL
              if (/^https?:\/\//.test(req) || req.startsWith('data:')) {
                return { path: req, external: true }
              }

              // Relative / absolute project paths
              if (req.startsWith('.') || req.startsWith('/')) {
                const importer = (args.importer || '').replace(/^virtual:/, '').replace(/^\/+/, '')
                const resolved = resolveInFs(fs, req, importer)
                if (resolved) return { path: resolved, namespace: 'virtual' }
                // missing relative file
                if (req.endsWith('.css')) {
                  return { path: req, namespace: 'virtual-empty-css' }
                }
                return {
                  path: req,
                  namespace: 'virtual',
                  pluginData: { missing: true },
                }
              }

              // Bare package import → CDN
              return {
                path: `https://esm.sh/${req}`,
                external: true,
              }
            })

            build.onLoad({ filter: /.*/, namespace: 'virtual' }, args => {
              if (args.pluginData?.missing) {
                return {
                  errors: [{ text: `Missing virtual file: ${args.path}` }],
                }
              }
              const key = args.path.replace(/^\/+/, '')
              const text = fs.get(key)
              if (text === undefined) {
                return { errors: [{ text: `Missing file: ${key}` }] }
              }
              // CSS imported from JS/TS cannot use css loader with write:false
              // Inject as a <style> tag at runtime instead.
              if (key.endsWith('.css')) {
                return {
                  contents: `
const css = ${JSON.stringify(text)};
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.setAttribute('data-rahsaz-href', ${JSON.stringify(key)});
  style.textContent = css;
  document.head.appendChild(style);
}
export default css;
`,
                  loader: 'js',
                }
              }
              return { contents: text, loader: pickLoader(key) }
            })

            build.onLoad({ filter: /.*/, namespace: 'virtual-empty-css' }, () => ({
              contents: '/* missing css */',
              loader: 'css',
            }))
          },
        },
      ],
    })

    if (result.errors?.length) {
      return { ok: false, error: result.errors.map(e => e.text).join('\n') }
    }

    const code = result.outputFiles?.[0]?.text
    if (!code) return { ok: false, error: 'Empty bundle output.' }

    // Avoid breaking out of script tag
    const safeCode = code.replace(/<\/script/gi, '<\\/script')

    const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Rahsaz React Preview</title>
<style>
html,body,#root{margin:0;padding:0;min-height:100%}
body{font-family:system-ui,sans-serif;background:#0b1020;color:#e5e7eb}
</style>
</head>
<body>
<div id="root"></div>
<script type="module">
${safeCode}
</script>
<script>
window.addEventListener('error', function (e) {
  try {
    parent.postMessage({ source: 'rahsaz-preview', type: 'error', message: String(e.message || e.error || 'error') }, '*');
  } catch (err) {}
});
window.addEventListener('unhandledrejection', function (e) {
  try {
    parent.postMessage({ source: 'rahsaz-preview', type: 'error', message: String(e.reason || 'rejection') }, '*');
  } catch (err) {}
});
</script>
</body>
</html>`

    return { ok: true, html }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}
