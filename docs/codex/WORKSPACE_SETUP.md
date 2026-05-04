# Codex Workspace Setup

Purpose: give Codex or any local coding agent a reliable repo-local handoff so large-file edits can happen from a full checkout instead of through a truncated connector.

## Why this exists

`src/components/WorkCenterWorkflowPanelV2.tsx` is large enough that the current ChatGPT GitHub connector may truncate file reads. That makes full-file rewrites unsafe from chat. Codex, Codespaces, or a local checkout can safely read and patch the full file.

## Recommended workspace paths

Codex may ask for a local repo at one of these paths:

```bash
/workspace/JCM-Command-Center
/workspaces/JCM-Command-Center
```

Use the path that exists in your environment. Do not clone into an empty nested folder if the repo is already checked out.

## Local setup

From the repo root:

```bash
npm install
npm run build
```

If Codex starts in `/workspace`, use:

```bash
cd /workspace/JCM-Command-Center
npm install
npm run build
```

If Codespaces starts in `/workspaces`, use:

```bash
cd /workspaces/JCM-Command-Center
npm install
npm run build
```

## GitHub setup

Use the normal GitHub authorization or Codespaces flow. Do not paste credentials into chat, docs, issues, or prompts.

## Current target task

Use `docs/codex/WORKFLOW_ACTION_REFACTOR_TASK.md` as the current Codex task.

## Validation required

Before opening or merging a PR:

```bash
npm run build
```

The PR summary should include:

- files changed
- behavior changed
- guardrails preserved
- build result
