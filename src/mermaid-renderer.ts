import { deflateSync } from 'node:zlib'
import { writeFile } from 'node:fs/promises'

const MERMAID_INK_BASE = 'https://mermaid.ink'

export type ImageFormat = 'png' | 'svg'

export type MermaidTheme = 'default' | 'dark' | 'forest' | 'neutral'

export interface RenderOptions {
  format?: ImageFormat
  theme?: MermaidTheme
  backgroundColor?: string
  width?: number
  height?: number
}

function toUrlSafeBase64(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

export function encodeMermaid(
  code: string,
  theme: MermaidTheme = 'default',
): string {
  const state = JSON.stringify({
    code: code.trim(),
    mermaid: { theme },
  })
  const compressed = deflateSync(Buffer.from(state, 'utf-8'), { level: 9 })
  return `pako:${toUrlSafeBase64(compressed)}`
}

export function getMermaidUrl(
  code: string,
  options: RenderOptions = {},
): string {
  const {
    format = 'png',
    theme = 'default',
    backgroundColor,
    width,
    height,
  } = options

  const endpoint = format === 'svg' ? 'svg' : 'img'
  const encoded = encodeMermaid(code, theme)

  const params = new URLSearchParams()
  if (backgroundColor) params.set('bgColor', backgroundColor)
  if (width) params.set('width', String(width))
  if (height) params.set('height', String(height))

  const query = params.toString()
  return `${MERMAID_INK_BASE}/${endpoint}/${encoded}${query ? `?${query}` : ''}`
}

export function toMarkdown(
  code: string,
  alt = 'Flow Diagram',
  options: RenderOptions = {},
): string {
  const url = getMermaidUrl(code, options)
  return `![${alt}](${url})`
}

export async function downloadImage(
  code: string,
  outputPath: string,
  options: RenderOptions = {},
): Promise<string> {
  const url = getMermaidUrl(code, options)

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      `Failed to generate image: ${response.status} ${response.statusText}`,
    )
  }

  const arrayBuffer = await response.arrayBuffer()
  await writeFile(outputPath, Buffer.from(arrayBuffer))

  return outputPath
}
