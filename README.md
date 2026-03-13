# mer-inkdrop

A CLI tool that generates rendered Mermaid flow diagram images for GitHub PRs. Instead of embedding raw Mermaid code blocks in PR descriptions, `mer-inkdrop` encodes diagrams and returns a `mermaid.ink` hosted image URL — ready to paste as a markdown image tag.

![Flow Diagram](https://mermaid.ink/img/pako:eNpNkc1ugzAQhF9l5UNOTR-AQ6oE8kOaqFWanFwOVrwhVv2DjBGVgHevvCDRk-X9xrMzcsfuTiJLWOlF9YRr9m0B1jy3VRMSqINUFpyHgL8hng-lsYDlcgUbnp5yqISvce3LuojvNkTS7ss1_o5vQ5ylcdbT-4cWZQ8Zz61WFsmzmCUqrpw0W35BIeHVGDmunGUUqYfdqKAb0QwWsIUF7CjDnl-9MmDQG6Fk6uRosSd44Ghj6_NIiRyI5LzEMI1vXhPJiRy7jybEgMbJqdmR8hjhf6RrbQ_v_NMrG0AZUSIEURazqvG6h9Mk8KKF2-X0D7vRO1bt4cwz11rthBytCvbCpiIs6Vh4ookfJvEhGh3YMPwBcxWUDA==)

## Install

The package is not yet published to npm. Install locally from source:

```bash
git clone <this-repo>
cd mer-inkdrop
pnpm install
pnpm run build
pnpm link          # makes `mer-inkdrop` available in PATH
# or: pnpm install -g .
```

Verify:

```bash
which mer-inkdrop
mer-inkdrop --help
```

## Usage

```bash
# Inline diagram → markdown image tag (default output)
mer-inkdrop -t "graph TD; A-->B" --markdown

# From a .mmd file
mer-inkdrop -i flow.mmd --markdown

# Pipe from stdin
echo "graph TD; A-->B" | mer-inkdrop

# Output options
mer-inkdrop -i flow.mmd --url           # print raw URL
mer-inkdrop -i flow.mmd -o flow.png     # download image locally

# Styling
mer-inkdrop -i flow.mmd --format svg --theme dark --alt "Order Flow" --markdown
mer-inkdrop -i flow.mmd --bg white --width 800 --height 600
```

### Options

| Flag              | Short | Description                             | Default        |
| ----------------- | ----- | --------------------------------------- | -------------- |
| `--input <file>`  | `-i`  | Path to `.mmd` file                     | —              |
| `--text <text>`   | `-t`  | Inline Mermaid diagram                  | —              |
| `--output <file>` | `-o`  | Download image to file                  | —              |
| `--url`           |       | Print raw image URL                     | —              |
| `--markdown`      |       | Print markdown image tag                | ✓              |
| `--format <fmt>`  | `-f`  | `png` or `svg`                          | `png`          |
| `--theme <theme>` |       | `default`, `dark`, `forest`, `neutral`  | `default`      |
| `--alt <text>`    |       | Alt text for markdown image             | `Flow Diagram` |
| `--bg <color>`    |       | Background color (e.g. `white`, `!fff`) | —              |
| `--width <px>`    |       | Image width in pixels                   | —              |
| `--height <px>`   |       | Image height in pixels                  | —              |

## Claude Code Skill

`mer-inkdrop` is designed to be used with the `/pr-automation` Claude Code skill, which automates PR creation with structured descriptions and optional flow diagrams.

The skill file is included in this repo at `.claude/commands/pr-automation.md`. To install it globally so it works across all your projects:

```bash
cp .claude/commands/pr-automation.md ~/.claude/commands/pr-automation.md
```

`mer-inkdrop` must be in your PATH for the skill to work (see [Install](#install) above).

Once installed, use `/pr-automation` in Claude Code to:

- Commit, push, and open a PR in one step
- Auto-generate a Mermaid flow diagram for PRs that introduce new workflows or API patterns
- Produce consistent PR descriptions with overview, changes table, and testing notes

## Development

Built with [Vite+](https://viteplus.dev/guide/) for blazing-fast builds and type checking.

```bash
pnpm install
pnpm test                 # run tests (vitest)
pnpm run typecheck        # type check (tsc)
pnpm run build            # bundle to dist/
```
