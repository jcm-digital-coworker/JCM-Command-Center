# JCM Command Center AI Worker Rules

These rules apply to any AI coding helper working in this repository, including Codex, Claude, Cursor, Copilot-style agents, local assistants, or patch-only tools.

## Prime Directive

Do not push directly to `main`.

Use a feature branch, open a pull request, and let GitHub Actions be the final build judge.

## Required Workflow

1. Inspect current repo state before editing.
2. Create or use a small feature branch.
3. Touch only the files needed for the mission.
4. Commit the change.
5. Run `npm run build` when available.
6. Push the feature branch.
7. Open a PR.
8. Include any local build failure in the PR notes.

If local build/test fails because of the container, proxy, missing dependency cache, or a known pre-existing issue, stop changing files and still push the feature branch when possible.

Use this when local hooks block a branch push:

```bash
git push --no-verify -u origin <branch-name>
```

`--no-verify` bypasses local Git hooks only. It does not bypass GitHub branch protection, credentials, network/proxy failures, or required CI checks.

If push is blocked by network/auth/proxy, return a patch instead:

```bash
git show --patch --no-ext-diff HEAD
```

## Architecture Rules

- `App.tsx` routes.
- Pages compose.
- Logic modules think.
- Components display.
- Data files describe plant truth.
- Selectors translate data into UI-ready facts.
- Runtime state changes only through explicit typed actions.

Do not infer behavior from button labels. Do not let visible copy secretly decide runtime behavior.

## Guardrails

Do not change these unless explicitly requested:

- CNC macro files.
- Machine command behavior.
- Department routing rules.
- Runtime reducer/action mutation behavior.
- Large shared shell files.

Protected shared files require extra caution:

- `src/App.tsx`
- `src/components/shell/AppDrawer.tsx`
- `src/components/shell/AppHeader.tsx`
- `src/components/shell/DevToolkitFlyout.tsx`

Avoid giant one-file rewrites. If a file is large, patch the smallest seam or extract a small helper instead.

## JCM Plant Truth

Preserve these durable truths unless the user explicitly updates them:

- Receiving stands alone and feeds other departments.
- Machine Shop is fed by Receiving and makes components.
- Material Handling is production, not support.
- Fab has lanes, not one generic bucket.
- Coating is complex and must not be modeled as one bucket.
- Assembly is lane/product specific.
- Saddles route is Receiving -> Coating -> Saddles Dept.
- LV4500s are in Saddles Dept, not Machine Shop.
- QA is conditional, not universal.
- Everything eventually funnels to Shipping.
- Maintenance is stand-alone.

## Action Safety

- `Review blocker` must not clear a blocker.
- `Notify lead` must not change route or order state.
- `Open maintenance` must not clear maintenance blockers.
- `Open QA`, `Open alerts`, and `Open coverage` are navigation/review actions unless typed action contracts say otherwise.
- `Start work`, `Complete order`, and `Send to next department` are high-risk runtime transitions.

When in doubt, make copy more honest and state mutation less magical.

## PR Notes Must Include

- Summary of changes.
- Files touched.
- Build/test result.
- Any local failure and whether it appears related, pre-existing, or environmental.
- Guardrails preserved.

## Fallback Patch Mode

If the agent cannot push, output:

```bash
git branch --show-current
git status --short
git log --oneline -n 3
git show --stat HEAD
git show --patch --no-ext-diff HEAD
```

A human or ChatGPT GitHub connector can recreate the branch and PR from that patch.
