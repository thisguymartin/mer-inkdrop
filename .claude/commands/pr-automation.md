---
name: pr-automation
description: Creates or updates pull requests with overview, change summary, and optional Mermaid flow. Use when the user asks to create a PR, update a PR, or open a pull request.
---

# PR Automation

## Workflow

1. **Check branch** - Never create PRs from main/master
2. **Commit & push** - Stage, commit (conventional format), push to origin
3. **Check existing PR** - `gh pr view $(git branch --show-current)` to detect existing PRs
4. **Create or update** - Create new PR if none exists, update description if one does

## PR Description Rules

- **No code snippets** in the PR description - describe changes in plain language only
- Use conventional commit format for PR titles: `type(scope): description`
- Include a Mermaid flow diagram only if changes involve a new workflow, data pipeline, or API pattern
- Keep descriptions focused on what changed and why

## PR Body Structure

1. **Overview** - 2-3 sentence summary
2. **Changes** - Bullet list of what changed in plain language
3. **Files Modified** - Table of files with change type and description
4. **Flow** - Rendered flow image via `pr-flow-gen` (only if applicable — new workflow, data pipeline, or API pattern)
5. **Context** - Why and how (high-level approach, no code)
6. **Testing** - How it was or should be tested

## Flow Diagram Generation (mer-inkdrop)

When a PR includes a new workflow, data pipeline, or API pattern, generate a rendered image
using the `mer-inkdrop` CLI instead of raw Mermaid code blocks.

```bash
# Generate markdown image tag (default) — embed this in the PR body
mer-inkdrop -t "graph TD; A-->B" --markdown

# Generate from a .mmd file
mer-inkdrop -i flow.mmd --markdown

# Pipe from stdin
echo "graph TD; A-->B" | mer-inkdrop

# Download image locally
mer-inkdrop -t "graph TD; A-->B" -o flow.png

# Get raw URL only
mer-inkdrop -t "graph TD; A-->B" --url

# Options: --format png|svg, --theme default|dark|forest|neutral, --alt "text"
mer-inkdrop -i flow.mmd --theme dark --alt "Flow Diagram" --markdown
```

Embed the output directly in the PR body under the **Flow** section.

## Commands

```bash
# Check for existing PR
gh pr view $(git branch --show-current) --json number,title,url,state

# Create PR
gh pr create --title "type(scope): description" --body "$BODY" --base main

# Update PR
gh pr edit <number> --body "$BODY"
```

## Constraints

- Never force push
- Always commit and push before creating/updating PR
- Always check for existing PR before creating new one
- If `gh` CLI unavailable, report error clearly
