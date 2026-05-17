# GitHub Operations Playbook

Purpose: run JCM Command Center repo work with speed, proof, and low drama. This playbook is designed for ChatGPT, Codex, Claude, Cursor, local agents, GitHub UI work, and future coding agents.

This file is process documentation only. It does not change app behavior.

## Core Principles

```text
Repo truth beats chat memory.
GitHub Actions beats status vibes.
PR patch beats verbal summaries.
Small branches beat giant rewrites.
Risk track decides inspection depth.
Unknown plant truth stays conservative.
```

Use GitHub as the operations desk:

```text
Issue -> branch -> PR -> patch review -> Actions -> merge -> main verification -> context refresh when needed
```

## Source-of-Truth Hierarchy

For build and repo state:

1. GitHub Actions job steps.
2. Current `main` files.
3. PR patch / diff.
4. `docs/LATEST_ACTION_RUN.md`.
5. `docs/CURRENT_BUILD_STATE.md`.
6. `docs/CURRENT_CONTEXT.md`.
7. Chat memory.

For plant truth:

1. User-confirmed plant facts.
2. Current source data/rules.
3. JCM product manuals/directories.
4. Inferred classification logic.
5. Guesses. Guesses must not become dispatch rules.

If sources disagree, stop and name the conflict.

## Risk Tracks

Every task gets a risk track before work starts.

### Track 0: Docs-only

Examples:

- Markdown docs.
- Issue templates.
- Process playbooks.
- Context cleanup.

Required checks:

- Changed files are docs/templates only.
- No source files changed.
- CI green if workflow runs.
- Docs do not contradict latest verified build state.

Definition of done:

```text
PR merged, main verified, docs reflect current repo truth.
```

### Track 1: Copy-only / labels

Examples:

- Button labels.
- Card titles.
- Drawer checklist wording.
- Operator-facing wording that does not change behavior.

Required checks:

- PR patch shows copy-only changes.
- Existing click handlers and routes are unchanged.
- No reducer/action mutation changed.
- CI green.

Definition of done:

```text
Labels describe behavior honestly, handlers unchanged, main verified after merge.
```

### Track 2: UI-only layout

Examples:

- Spacing.
- Card layout.
- Visual grouping.
- Non-behavioral component display changes.

Required checks:

- Patch does not touch logic or runtime state.
- Component display only.
- CI green.
- Smoke test required if visible behavior could confuse operators.

Definition of done:

```text
UI renders/builds, no behavior moved, smoke note added when needed.
```

### Track 3: Data / plant-truth hints

Examples:

- Product family data.
- Route hints.
- Department metadata.
- Progress checklist items.

Required checks:

- Source of plant fact identified.
- Unconfirmed routes stay conservative.
- Required departments still override classifier hints.
- QA remains conditional.
- Shipping remains final, but readiness is not automatic.
- CI green.

Definition of done:

```text
Data reflects confirmed truth or explicitly preserves uncertainty.
```

### Track 4: Route logic / selectors

Examples:

- Dynamic traveler routing.
- Product classification.
- Department ownership selectors.
- Handoff readiness.

Required checks:

- Current route logic inspected before editing.
- Classifier output remains guidance unless explicitly promoted.
- Dispatch authority remains with confirmed fields/contracts.
- PR patch reviewed fully.
- CI green.
- Context docs refreshed after green if route truth changes.

Definition of done:

```text
Route behavior is explicit, conservative, verified, and documented.
```

### Track 5: Runtime action mutation

Examples:

- Start work.
- Complete order.
- Send to next department.
- Blocker resolution.
- Maintenance/QA/material action handlers.

Required checks:

- Typed action contract inspected.
- Visible label matches behavior.
- Review/no-op actions do not mutate state.
- Runtime reducer changes reviewed fully.
- CI green.
- Smoke test note required.

Definition of done:

```text
State mutation is intentional, typed, auditable, and not triggered by display copy.
```

### Track 6: CNC / simulator / macro-adjacent

Examples:

- LV4500 estimator logic.
- Macro mapping references.
- Cycle-time math.
- Machine command language.
- Uploaded CNC macro files.

Required checks:

- No real machine command behavior changes unless explicitly requested.
- Simulator remains guidance-only unless mission says otherwise.
- Macro file changes require explicit user instruction.
- Math/logic inspected with before/after behavior.
- CI green.
- User smoke test required for visible simulator behavior.

Definition of done:

```text
Guidance remains separate from machine authority, and visible behavior is smoke-confirmed when changed.
```

## High-Caution Files

Touching any of these raises the minimum risk track to MEDIUM or higher:

```text
src/App.tsx
src/logic/workflowRuntimeState.ts
src/logic/dynamicTraveler.ts
src/logic/productClassification.ts
src/logic/orderStatusTruth.ts
src/pages/departments/DepartmentPageTools.tsx
src/components/shell/AppDrawer.tsx
src/components/shell/AppHeader.tsx
src/components/shell/DevToolkitFlyout.tsx
CNC macro files
```

Rules:

```text
Do not edit high-caution files from stale chat memory.
Do not edit large high-caution files from truncated output.
Do not bundle high-caution edits with unrelated cleanup.
```

## GitHub API Capability Map

Use the connector as a repo operations bench.

### Discovery

```text
get_profile
get_user_login
list_repositories
list_installations
get_repo
get_repo_collaborator_permission
```

Use for:

```text
confirm access, repo identity, permissions, and installed scope
```

### Search

```text
search
search_branches
search_commits
search_issues
search_prs
list_recent_issues
get_users_recent_prs_in_repo
```

Use for:

```text
find seams, branches, prior work, stale PRs, and regression history
```

### File inspection

```text
fetch_file
fetch_blob
fetch
fetch_commit
fetch_pr_patch
fetch_pr_file_patch
get_pr_diff
list_pr_changed_filenames
compare_commits
```

Use for:

```text
read current truth, inspect large files safely, review exact PR scope
```

### File writes

```text
create_branch
create_file
update_file
delete_file
create_blob
create_commit
update_ref
```

Use for:

```text
small branch patches, file creation, file deletion, branch repair
```

Warning:

```text
update_file is full-file replacement. There is no true line-range patch tool exposed.
```

### Issues and PRs

```text
create_issue
update_issue
add_issue_labels
add_comment_to_issue
create_pull_request
update_pull_request
convert_pull_request_to_draft
mark_pull_request_ready_for_review
merge_pull_request
request_pull_request_reviewers
```

Use for:

```text
mission packets, PR workflow, draft parking brake, review routing, controlled merge
```

### Review trail

```text
add_review_to_pr
list_pull_request_review_threads
reply_to_review_comment
resolve_review_thread
unresolve_review_thread
list_pull_request_reviews
fetch_pr_comments
```

Use for:

```text
permanent audit notes, inline concerns, resolved/unresolved review tracking
```

### Actions / CI

```text
fetch_commit_workflow_runs
fetch_workflow_run_jobs
fetch_workflow_job_steps
fetch_workflow_job_logs
fetch_workflow_run_artifacts
download_workflow_artifact
get_commit_combined_status
rerun_failed_workflow_run_jobs
rerun_workflow_job
```

Use for:

```text
green/red proof, log-based failure diagnosis, artifact inspection, retrying flaky jobs
```

## Large File Protocol

Do not treat large files as chat text.

Required workflow:

```text
1. Search for the exact target symbol/text.
2. Fetch nearby lines with start_line/end_line.
3. If editing is needed, fetch the complete blob by SHA.
4. Update only from complete known content.
5. Re-fetch the edited line range.
6. Open PR.
7. Verify exact changed hunk with fetch_pr_file_patch or fetch_pr_patch.
```

Hard stop:

```text
If only truncated content is available, do not update the large file.
Use patch relay, GitHub UI, Codespace, or a smaller extracted seam.
```

## Pull It Protocol

Use when the user says `pull it`.

For an open PR:

```text
1. get_pr_info.
2. Record PR number, title, head SHA, base, mergeability, changed file count.
3. list_pr_changed_filenames.
4. fetch_pr_patch or fetch_pr_file_patch for high-risk files.
5. fetch workflow runs/jobs for the PR head SHA.
6. Verify build job steps.
7. Report status as green, red, or unknown.
8. State scope and guardrails.
```

For main after merge:

```text
1. Fetch docs/LATEST_ACTION_RUN.md.
2. Confirm run ID, commit, branch, workflow, timestamp.
3. Fetch workflow run jobs.
4. Verify build and Pages deploy steps.
5. If breadcrumb is stale, check the merge commit directly.
6. Report status as green, red, or unknown.
```

Never claim green from memory.

## Merge It Protocol

Use when the user says `merge it`.

Required workflow:

```text
1. Confirm PR is open and mergeable.
2. Confirm latest verified head SHA.
3. Confirm build job steps are green.
4. Confirm expected risk-track checks are satisfied.
5. Merge with expected_head_sha.
6. Report merge commit.
7. Ask for or proceed to pull main verification.
```

Required merge guard:

```text
Always use expected_head_sha.
```

If the PR head changes after verification, do not merge. Pull it again.

## Try Again Protocol

Use when a run was queued, in progress, missing, or breadcrumb-stale.

```text
1. Re-check direct commit workflow runs.
2. Re-fetch docs/LATEST_ACTION_RUN.md.
3. If breadcrumb caught up, fetch jobs.
4. If still missing, report unknown rather than green.
```

## Red Build Protocol

When CI fails:

```text
1. Fetch failing job steps.
2. Fetch job logs.
3. Classify failure.
4. Rerun failed jobs if flaky or infrastructure-like.
5. Patch only if logs indicate a code issue.
6. Keep patch scoped to the failing seam.
```

Failure taxonomy:

```text
Code failure: TypeScript/build/test error from touched source.
Environment failure: dependency, proxy, auth, missing remote, container mismatch.
Workflow failure: Actions config, Pages deploy, artifact upload, permissions.
Process failure: wrong branch, stale SHA, PR changed after verification.
Truth failure: docs/context says something repo or Actions disproves.
```

## Rollback / Revert Protocol

If main goes red after merge:

```text
1. Identify the merge commit.
2. Fetch failing job logs.
3. If quick fix is obvious, branch from main and patch.
4. If not obvious, revert the merge commit on a new branch.
5. Open PR.
6. Verify Actions.
7. Merge with expected_head_sha.
8. Refresh context docs if needed.
```

Never panic-patch unrelated files.

## Patch Relay Protocol

Use when an external agent can edit code but cannot push.

Required packet from the agent:

```bash
git branch --show-current
git status --short
git remote -v
git log --oneline -n 3
git show --stat HEAD
git show --patch --no-ext-diff HEAD
```

Apply relay safely:

```text
1. Read patch.
2. Identify files touched.
3. Classify risk track.
4. Recreate branch from current main.
5. Apply smallest safe equivalent patch.
6. Open PR with original local failure notes.
7. Verify Actions.
```

## Artifact Inspection Protocol

Artifacts prove build output exists. They do not prove behavior is correct.

Use artifacts when:

```text
build passed but deploy looks questionable
need to confirm demo build output exists
need to inspect packaged static output
```

Workflow:

```text
1. fetch_workflow_run_artifacts.
2. download_workflow_artifact.
3. Inspect artifact contents if needed.
4. Treat as deploy evidence, not smoke-test evidence.
```

Visible workflow changes still need smoke testing.

## Issue-Based Mission Control

Use issues for durable work packets, especially for future agents.

Issue body should include:

```text
Mission
Risk track
Files allowed to touch
Files forbidden to touch
Guardrails
Build/test command
Failure policy
Definition of done
Return packet
```

Recommended labels:

```text
ai-worker
docs-only
copy-only
ui-only
plant-truth
route-risk
action-risk
simulator-risk
needs-smoke-test
blocked
green-verified
```

If a label does not exist, record the intended label in the issue body or PR body. The connector may not be able to create new labels.

## PR Body Template

Use this structure for every PR:

```markdown
## Summary

## Files Changed

## Risk Track

## Guardrails

## What Did Not Change

## Build/Test

## Smoke Test

## Notes / Known Limits
```

For low-risk docs-only PRs, `Smoke Test` may be `Not applicable`.

For high-risk PRs, `What Did Not Change` is required.

## Chat Command Map

The user often uses short commands. Treat them consistently.

### Next

Choose the next safest corrective action from current repo context.

### Proceed

Create the branch, patch, and PR for the chosen task.

### Pull it

Verify PR or main status from Actions, patch, mergeability, and guardrails.

### Merge it

Merge only after verified green and stable head SHA.

### Try again

Re-check a previously unknown, missing, queued, or running workflow.

### What's left

Summarize remaining tracked tasks from current repo context and open issues/PRs.

### Handoff

Produce a mission packet for an external worker.

## Context Refresh Rules

Refresh memory docs only after verified truth changes.

Refresh candidates:

```text
docs/CURRENT_CONTEXT.md
docs/CURRENT_BUILD_STATE.md
docs/ACTIVE_BAND_AIDS.md
docs/LOOSE_ENDS.md
```

Do not update green markdown before checking the actual run.

Use context refresh after:

```text
major mission completion
route-truth changes
runtime action behavior changes
simulator behavior changes
band-aid cleanup
red-to-green recovery
```

## Agent Adaptation Rules

Future agents should read this file plus `AGENTS.md` before editing.

Agent requirements:

```text
Use feature branches.
Do not push directly to main.
Prefer small patches.
Report local build failures honestly.
Return exact patch if push fails.
Respect risk tracks.
Respect high-caution files.
Do not convert uncertain plant facts into dispatch authority.
```

If a new tool becomes available, add it to the relevant section rather than rewriting the whole playbook.

Scalable extension pattern:

```text
Add capability -> map to protocol -> define guardrail -> define done condition
```

## Forbidden Shortcuts

```text
Do not claim green from stale markdown.
Do not edit large files from truncated output.
Do not push directly to main.
Do not merge without expected_head_sha.
Do not hide failed or unknown runs behind optimistic wording.
Do not treat display text as runtime behavior.
Do not increase route confidence without confirmed plant truth.
Do not let simulator guidance become machine authority by accident.
```

## Minimal Daily Operating Loop

```text
1. Pull current truth.
2. Choose risk track.
3. Create small branch.
4. Patch smallest safe seam.
5. Verify patch scope.
6. Verify CI.
7. Merge with expected_head_sha.
8. Verify main and Pages.
9. Refresh context only when needed.
```

That is the standard bench setup. Keep the bench clean.
