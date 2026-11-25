/**
 * Minimal ZIP reader for importing project files in the browser.
 * Supports store (0) and deflate (8) via DecompressionStream when available.
 */

export interface ImportedZipFile {
  path: string
  content: string
}

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
  const ds = new DecompressionStream('deflate-raw')
  const stream = new Blob([data]).stream().pipeThrough(ds)
  const ab = await new Response(stream).arrayBuffer()
  return new Uint8Array(ab)
}

/**
 * Parse a ZIP ArrayBuffer into text files (skips directories and binary-looking paths optionally).
 */
export async function importZipFiles(buffer: ArrayBuffer): Promise<ImportedZipFile[]> {
  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)
  const out: ImportedZipFile[] = []
  const decoder = new TextDecoder('utf-8', { fatal: false })

  // Find End of Central Directory (search backwards for signature 0x06054b50)
  let eocd = -1
  for (let i = bytes.length - 22; i >= 0; i--) {
    if (u32(view, i) === 0x06054b50) {
      eocd = i
      break
    }
  }
  if (eocd < 0) throw new Error('not_zip')

  const totalEntries = u16(view, eocd + 10)
  let centralOffset = u32(view, eocd + 16)
  let count = 0

  while (count < totalEntries && centralOffset + 46 <= bytes.length) {
    if (u32(view, centralOffset) !== 0x02014b50) break
    const method = u16(view, centralOffset + 10)
    const compSize = u32(view, centralOffset + 20)
    const nameLen = u16(view, centralOffset + 28)
    const extraLen = u16(view, centralOffset + 30)
    const commentLen = u16(view, centralOffset + 32)
    const localHeaderOffset = u32(view, centralOffset + 42)
    const nameBytes = bytes.subarray(centralOffset + 46, centralOffset + 46 + nameLen)
    const path = decoder.decode(nameBytes).replace(/\\/g, '/').replace(/^\/+/, '')
    centralOffset += 46 + nameLen + extraLen + commentLen
    count++

    if (!path || path.endsWith('/')) continue
    // skip hidden / junk
    if (path.startsWith('__MACOSX/') || path.includes('/.')) continue

    if (localHeaderOffset + 30 > bytes.length) continue
    if (u32(view, localHeaderOffset) !== 0x04034b50) continue
    const localNameLen = u16(view, localHeaderOffset + 26)
    const localExtraLen = u16(view, localHeaderOffset + 28)
    const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen
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

    // skip likely binary (null bytes in first 512)
    const sample = raw.subarray(0, Math.min(512, raw.length))
    if (sample.some(b => b === 0)) continue

    const content = decoder.decode(raw)
    out.push({ path, content })
  }

  return out
}
