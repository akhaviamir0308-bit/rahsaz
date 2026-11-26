/**
 * Minimal ZIP reader for importing project files in the browser.
 * Supports store (0) and deflate (8). Package D: size/count limits + path checks.
 */

export interface ImportedZipFile {
  path: string
  content: string
}

const MAX_ENTRIES = 400
const MAX_UNCOMPRESSED_TOTAL = 8 * 1024 * 1024 // 8MB text total
const MAX_SINGLE_FILE = 1.5 * 1024 * 1024

function u16(view: DataView, off: number): number {
  return view.getUint16(off, true)
}
function u32(view: DataView, off: number): number {
  return view.getUint32(off, true)
}

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('deflate')
  }
  const copy = new ArrayBuffer(data.byteLength)
  new Uint8Array(copy).set(data)
  const ds = new DecompressionStream('deflate-raw')
  const stream = new Blob([copy]).stream().pipeThrough(ds)
  const ab = await new Response(stream).arrayBuffer()
  return new Uint8Array(ab)
}

function safePath(path: string): string | null {
  let p = path.replace(/\\/g, '/').replace(/^\/+/, '')
  if (!p || p.endsWith('/')) return null
  if (p.includes('\0')) return null
  if (p.startsWith('__MACOSX/') || p.includes('/.')) return null
  const parts = p.split('/')
  if (parts.some(seg => seg === '..' || seg === '.' || seg === '')) return null
  if (parts.length > 12) return null
  if (p.length > 200) return null
  return parts.join('/')
}

export async function importZipFiles(buffer: ArrayBuffer): Promise<ImportedZipFile[]> {
  if (buffer.byteLength > 15 * 1024 * 1024) {
    throw new Error('zip_too_large')
  }
  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)
  const out: ImportedZipFile[] = []
  const decoder = new TextDecoder('utf-8', { fatal: false })

  let eocd = -1
  for (let i = bytes.length - 22; i >= 0; i--) {
    if (u32(view, i) === 0x06054b50) {
      eocd = i
      break
    }
  }
  if (eocd < 0) throw new Error('not_zip')

  const totalEntries = Math.min(u16(view, eocd + 10), MAX_ENTRIES + 5)
  let centralOffset = u32(view, eocd + 16)
  let count = 0
  let totalUncompressed = 0

  while (count < totalEntries && centralOffset + 46 <= bytes.length) {
    if (u32(view, centralOffset) !== 0x02014b50) break
    const method = u16(view, centralOffset + 10)
    const compSize = u32(view, centralOffset + 20)
    const uncompSize = u32(view, centralOffset + 24)
    const nameLen = u16(view, centralOffset + 28)
    const extraLen = u16(view, centralOffset + 30)
    const commentLen = u16(view, centralOffset + 32)
    const localHeaderOffset = u32(view, centralOffset + 42)
    const nameBytes = bytes.subarray(centralOffset + 46, centralOffset + 46 + nameLen)
    const rawName = decoder.decode(nameBytes)
    centralOffset += 46 + nameLen + extraLen + commentLen
    count++

    if (count > MAX_ENTRIES) break
    const path = safePath(rawName)
    if (!path) continue
    if (uncompSize > MAX_SINGLE_FILE) continue

    if (localHeaderOffset + 30 > bytes.length) continue
    if (u32(view, localHeaderOffset) !== 0x04034b50) continue
    const localNameLen = u16(view, localHeaderOffset + 26)
    const localExtraLen = u16(view, localHeaderOffset + 28)
    const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen
    if (dataStart + compSize > bytes.length) continue
    const compressed = bytes.subarray(dataStart, dataStart + compSize)

    let raw: Uint8Array
    if (method === 0) {
      raw = compressed
    } else if (method === 8) {
      try {
        raw = await inflateRaw(compressed)
      } catch {
        continue
      }
    } else {
      continue
    }

    if (raw.byteLength > MAX_SINGLE_FILE) continue
    totalUncompressed += raw.byteLength
    if (totalUncompressed > MAX_UNCOMPRESSED_TOTAL) break

    const sample = raw.subarray(0, Math.min(512, raw.length))
    if (sample.some(b => b === 0)) continue

    out.push({ path, content: decoder.decode(raw) })
  }

  return out
}
