/**
 * In-browser React/Vite-style preview using esbuild-wasm.
 * Bundles the virtual file tree and loads bare imports from esm.sh.
 */
import type { ProjectFile } from '../types'

export type ReactPreviewResult =
  | { ok: true; html: string }
  | { ok: false; error: string }

let esbuildReady: Promise<typeof import('esbuild-wasm')> | null = null

async function getEsbuild() {
  if (!esbuildReady) {
    esbuildReady = (async () => {
      const esbuild = await import('esbuild-wasm')
      await esbuild.initialize({
        wasmURL: 'https://unpkg.com/esbuild-wasm@0.25.0/esbuild.wasm',
        worker: false,
      })
      return esbuild
    })()
  }
  return esbuildReady
}

function buildFs(files: ProjectFile[]): Map<string, string> {
  const fs = new Map<string, string>()
  for (const f of files) {
    if (f.kind !== 'file') continue
    const p = f.path.replace(/^\/+/, '')
    fs.set(p, f.content || '')
    fs.set('/' + p, f.content || '')
  }
  return fs
}

function pickEntry(fs: Map<string, string>): string | null {
  const candidates = [
    'src/main.tsx', 'src/main.jsx', 'src/main.ts', 'src/main.js',
    'src/index.tsx', 'src/index.jsx', 'src/index.ts', 'src/index.js',
    'main.tsx', 'main.jsx', 'index.tsx', 'index.jsx',
  ]
  for (const c of candidates) {
    if (fs.has(c) || fs.has('/' + c)) return c
  }
  // App.tsx only — synthesize a tiny entry
  if (fs.has('src/App.tsx') || fs.has('/src/App.tsx') || fs.has('src/App.jsx')) {
    return '__rahsaz_entry.tsx'
  }
  return null
}

export async function buildReactPreview(files: ProjectFile[]): Promise<ReactPreviewResult> {
  try {
    const esbuild = await getEsbuild()
    const fs = buildFs(files)
    let entry = pickEntry(fs)
    if (!entry) {
      return {
        ok: false,
        error: 'no_entry',
      }
    }

    if (entry === '__rahsaz_entry.tsx') {
      const appPath = fs.has('src/App.tsx') || fs.has('/src/App.tsx') ? './src/App.tsx' : './src/App.jsx'
      fs.set('__rahsaz_entry.tsx', `import { createRoot } from 'react-dom/client'\nimport App from '${appPath}'\nconst el = document.getElementById('root')\nif (el) createRoot(el).render(<App />)\n`)
    }

    const result = await esbuild.build({
      entryPoints: [entry],
      bundle: true,
      write: false,
      format: 'esm',
      jsx: 'automatic',
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
        '.jsx': 'jsx',
        '.js': 'js',
        '.css': 'css',
        '.json': 'json',
      },
      define: {
        'process.env.NODE_ENV': '"development"',
        'import.meta.env': '{}',
        'import.meta.env.DEV': 'true',
        'import.meta.env.PROD': 'false',
        'import.meta.env.BASE_URL': '"/"',
      },
      plugins: [
        {
          name: 'rahsaz-virtual',
          setup(build) {
            // bare module → esm.sh
            build.onResolve({ filter: /^[^./]/ }, args => {
              if (args.path.startsWith('http')) return { path: args.path, external: true }
              const url = `https://esm.sh/${args.path}`
              return { path: url, external: true }
            })

            build.onResolve({ filter: /.*/ }, args => {
              if (args.path.startsWith('http')) return { path: args.path, external: true }
              if (args.path.startsWith('data:')) return { path: args.path, external: true }

              let rel = args.path
              if (rel.startsWith('/')) {
                const key = rel.replace(/^\/+/, '')
                if (fs.has(key) || fs.has(rel)) return { path: key, namespace: 'virtual' }
              }

              const importer = (args.importer || '').replace(/^\//, '')
              const baseDir = importer.includes('/')
                ? importer.slice(0, importer.lastIndexOf('/') + 1)
                : ''

              // try resolve with extensions
              const tryPaths: string[] = []
              const joined = rel.startsWith('.')
                ? normalizePath(baseDir + rel)
                : normalizePath(rel.replace(/^\//, ''))

              tryPaths.push(joined)
              for (const ext of ['.tsx', '.ts', '.jsx', '.js', '.css', '.json', '/index.tsx', '/index.ts', '/index.jsx', '/index.js']) {
                tryPaths.push(joined + ext)
              }

              for (const p of tryPaths) {
                if (fs.has(p) || fs.has('/' + p)) {
                  return { path: p.replace(/^\//, ''), namespace: 'virtual' }
                }
              }

              // CSS side-effect empty
              if (rel.endsWith('.css')) {
                return { path: rel, namespace: 'virtual-empty-css' }
              }

              return { path: `https://esm.sh/${args.path}`, external: true }
            })

            build.onLoad({ filter: /.*/, namespace: 'virtual' }, args => {
              const key = args.path.replace(/^\//, '')
              const text = fs.get(key) ?? fs.get('/' + key)
              if (text === undefined) return { errors: [{ text: `Missing file: ${key}` }] }
              const loader = pickLoader(key)
              return { contents: text, loader }
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
    if (!code) return { ok: false, error: 'empty_bundle' }

    const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Rahsaz React Preview</title>
<style>
  html,body,#root{margin:0;padding:0;min-height:100%}
  body{font-family:system-ui,sans-serif}
  .rahsaz-boot-error{padding:16px;color:#b91c1c;white-space:pre-wrap;font:12px/1.5 ui-monospace,monospace}
</style>
</head>
<body>
<div id="root"></div>
<script type="module">
${code.replace(/<\/script/gi, '<\\/script')}
</script>
<script>
window.addEventListener('error', function(e){
  try {
    parent.postMessage({ source: 'rahsaz-preview', type: 'error', message: String(e.message || e.error || 'error') }, '*')
  } catch(err) {}
});
window.addEventListener('unhandledrejection', function(e){
  try {
    parent.postMessage({ source: 'rahsaz-preview', type: 'error', message: String(e.reason || 'rejection') }, '*')
  } catch(err) {}
});
</script>
</body>
</html>`

    return { ok: true, html }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
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

function pickLoader(path: string): 'tsx' | 'ts' | 'jsx' | 'js' | 'css' | 'json' {
  if (path.endsWith('.tsx')) return 'tsx'
  if (path.endsWith('.ts')) return 'ts'
  if (path.endsWith('.jsx')) return 'jsx'
  if (path.endsWith('.css')) return 'css'
  if (path.endsWith('.json')) return 'json'
  return 'js'
}
