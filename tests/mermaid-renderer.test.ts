import { inflateSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import {
  encodeMermaid,
  getMermaidUrl,
  toMarkdown,
} from '../src/mermaid-renderer.js'

const SIMPLE_DIAGRAM = `graph TD
    A[Start] --> B[Process]
    B --> C[End]`

const COMPLEX_DIAGRAM = `graph TD
    A([User Request]) --> B{Auth Check}
    B -->|Authenticated| C[Load User Profile]
    B -->|Unauthenticated| D[/Redirect to Login/]
    C --> E{Feature Flag?}
    E -->|Enabled| F[New Pipeline]
    E -->|Disabled| G[Legacy Pipeline]
    F --> H[(Write to DB)]
    G --> H
    H --> I{Write OK?}
    I -->|Success| J[Emit Event]
    I -->|Failure| K[/Return 500/]
    J --> L([Response 200])
    D --> M([Response 302])`

function fromUrlSafeBase64(str: string): Buffer {
  const standard = str.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(standard, 'base64')
}

describe('mermaid-renderer', () => {
  describe('encodeMermaid', () => {
    it('should produce a pako-prefixed string', () => {
      const encoded = encodeMermaid(SIMPLE_DIAGRAM)
      expect(encoded).toMatch(/^pako:/)
    })

    it('should produce URL-safe base64 (no + or / characters)', () => {
      const encoded = encodeMermaid(SIMPLE_DIAGRAM)
      const base64Part = encoded.replace('pako:', '')
      expect(base64Part).not.toMatch(/[+/]/)
    })

    it('should produce deterministic output for the same input', () => {
      const first = encodeMermaid(SIMPLE_DIAGRAM)
      const second = encodeMermaid(SIMPLE_DIAGRAM)
      expect(first).toBe(second)
    })

    it('should roundtrip through decompress and parse', () => {
      const encoded = encodeMermaid(SIMPLE_DIAGRAM, 'dark')
      const base64Part = encoded.replace('pako:', '')
      const decompressed = inflateSync(fromUrlSafeBase64(base64Part))
      const parsed = JSON.parse(decompressed.toString('utf-8')) as {
        code: string
        mermaid: { theme: string }
      }

      expect(parsed.code).toBe(SIMPLE_DIAGRAM.trim())
      expect(parsed.mermaid.theme).toBe('dark')
    })

    it('should embed theme in the compressed payload', () => {
      const defaultTheme = encodeMermaid(SIMPLE_DIAGRAM, 'default')
      const darkTheme = encodeMermaid(SIMPLE_DIAGRAM, 'dark')
      expect(defaultTheme).not.toBe(darkTheme)
    })
  })

  describe('getMermaidUrl', () => {
    it('should return a mermaid.ink URL with /img/ endpoint by default', () => {
      const url = getMermaidUrl(SIMPLE_DIAGRAM)
      expect(url).toMatch(/^https:\/\/mermaid\.ink\/img\/pako:/)
    })

    it('should use /svg/ endpoint when format is svg', () => {
      const url = getMermaidUrl(SIMPLE_DIAGRAM, { format: 'svg' })
      expect(url).toMatch(/^https:\/\/mermaid\.ink\/svg\/pako:/)
    })

    it('should append background color as query param', () => {
      const url = getMermaidUrl(SIMPLE_DIAGRAM, { backgroundColor: 'white' })
      expect(url).toContain('?bgColor=white')
    })

    it('should append width and height as query params', () => {
      const url = getMermaidUrl(SIMPLE_DIAGRAM, { width: 800, height: 600 })
      expect(url).toContain('width=800')
      expect(url).toContain('height=600')
    })

    it('should not include query string when no extra options set', () => {
      const url = getMermaidUrl(SIMPLE_DIAGRAM)
      expect(url).not.toContain('?')
    })
  })

  describe('toMarkdown', () => {
    it('should wrap the URL in markdown image syntax with default alt', () => {
      const md = toMarkdown(SIMPLE_DIAGRAM)
      expect(md).toMatch(/^!\[Flow Diagram\]\(https:\/\/mermaid\.ink\/img\//)
      expect(md).toMatch(/\)$/)
    })

    it('should use custom alt text', () => {
      const md = toMarkdown(SIMPLE_DIAGRAM, 'Order Flow')
      expect(md).toMatch(/^!\[Order Flow\]\(/)
    })

    it('should pass render options through to URL generation', () => {
      const md = toMarkdown(SIMPLE_DIAGRAM, 'Test', { format: 'svg' })
      expect(md).toContain('mermaid.ink/svg/')
    })

    it('should render a complex multi-branch diagram with all options combined', () => {
      const md = toMarkdown(COMPLEX_DIAGRAM, 'PR Auth Flow', {
        format: 'svg',
        theme: 'forest',
        backgroundColor: 'transparent',
        width: 1200,
        height: 900,
      })

      expect(md).toMatch(/^!\[PR Auth Flow\]\(https:\/\/mermaid\.ink\/svg\/pako:/)
      expect(md).toContain('bgColor=transparent')
      expect(md).toContain('width=1200')
      expect(md).toContain('height=900')
      expect(md).toMatch(/\)$/)
    })

    it('should produce a different encoded payload for the complex diagram vs simple', () => {
      const simple = toMarkdown(SIMPLE_DIAGRAM)
      const complex = toMarkdown(COMPLEX_DIAGRAM)
      expect(simple).not.toBe(complex)
    })

    it('should roundtrip the complex diagram through encode/decode', () => {
      const encoded = encodeMermaid(COMPLEX_DIAGRAM, 'dark')
      const base64Part = encoded.replace('pako:', '')
      const decompressed = inflateSync(fromUrlSafeBase64(base64Part))
      const parsed = JSON.parse(decompressed.toString('utf-8')) as {
        code: string
        mermaid: { theme: string }
      }

      expect(parsed.code).toBe(COMPLEX_DIAGRAM.trim())
      expect(parsed.mermaid.theme).toBe('dark')
    })
  })
})
