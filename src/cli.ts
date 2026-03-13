#!/usr/bin/env node
/* eslint-disable no-console */
import { parseArgs } from 'node:util'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import {
  getMermaidUrl,
  toMarkdown,
  downloadImage,
  type RenderOptions,
  type ImageFormat,
  type MermaidTheme,
} from './mermaid-renderer.js'

const HELP = `
mer-inkdrop — Generate Mermaid flow diagram images for GitHub PRs

Usage:
  mer-inkdrop [options]

Input (one required):
  -i, --input <file>       Path to .mmd file containing Mermaid diagram
  -t, --text <text>        Inline Mermaid diagram text
  (stdin)                  Pipe Mermaid text via stdin

Output (pick one, default: --markdown):
  -o, --output <file>      Download image to local file
  --url                    Print only the image URL
  --markdown               Print markdown image tag (default)

Options:
  -f, --format <fmt>       Image format: png | svg (default: png)
  --theme <theme>          Mermaid theme: default | dark | forest | neutral
  --alt <text>             Alt text for markdown image (default: "Flow Diagram")
  --bg <color>             Background color (e.g. "white", "!fff")
  --width <px>             Image width in pixels
  --height <px>            Image height in pixels
  -h, --help               Show this help message

Examples:
  mer-inkdrop -t "graph TD; A-->B" --markdown
  mer-inkdrop -i flow.mmd --url
  mer-inkdrop -i flow.mmd -o flow.png
  echo "graph TD; A-->B" | mer-inkdrop
  cat flow.mmd | mer-inkdrop --format svg --theme dark
`

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks).toString('utf-8')
}

function resolveInput(values: {
  text?: string
  input?: string
}): string | null {
  if (values.text) return values.text
  if (values.input) {
    const filePath = resolve(values.input)
    return readFileSync(filePath, 'utf-8')
  }
  return null
}

export async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      input: { type: 'string', short: 'i' },
      text: { type: 'string', short: 't' },
      output: { type: 'string', short: 'o' },
      format: { type: 'string', short: 'f', default: 'png' },
      theme: { type: 'string', default: 'default' },
      alt: { type: 'string', default: 'Flow Diagram' },
      bg: { type: 'string' },
      width: { type: 'string' },
      height: { type: 'string' },
      url: { type: 'boolean', default: false },
      markdown: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
    strict: true,
  })

  if (values.help) {
    console.log(HELP)
    process.exit(0)
  }

  let mermaidCode = resolveInput(values)

  if (!mermaidCode && !process.stdin.isTTY) {
    mermaidCode = await readStdin()
  }

  if (!mermaidCode || !mermaidCode.trim()) {
    console.error(
      'Error: No input provided. Use --text, --input, or pipe via stdin.',
    )
    console.error('Run with --help for usage information.')
    process.exit(1)
  }

  mermaidCode = mermaidCode.trim()

  const renderOptions: RenderOptions = {
    format: values.format as ImageFormat,
    theme: values.theme as MermaidTheme,
    backgroundColor: values.bg,
    width: values.width ? parseInt(values.width, 10) : undefined,
    height: values.height ? parseInt(values.height, 10) : undefined,
  }

  if (values.output) {
    const outputPath = resolve(values.output)
    await downloadImage(mermaidCode, outputPath, renderOptions)
    console.log(`Image saved to: ${outputPath}`)
    return
  }

  if (values.url) {
    console.log(getMermaidUrl(mermaidCode, renderOptions))
    return
  }

  console.log(toMarkdown(mermaidCode, values.alt, renderOptions))
}

