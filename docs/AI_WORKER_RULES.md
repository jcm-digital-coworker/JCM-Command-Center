# AI Worker Rules and Patch Relay Workflow

This repo allows AI helpers, but main must stay protected by PR review and GitHub Actions.

## Why This Exists

Some coding agents can edit files but fail to push because of local hooks, container tests, network proxy errors, missing remotes, or authentication limits.

That should not force the agent to keep changing unrelated files just to satisfy its own container.

The safe workaround is a branch-or-patch relay:

```text
AI worker edits feature branch
-> pushes branch when possible
-> opens PR when possible
-> GitHub Actions judges build
-> if push fails, AI worker returns patch
-> ChatGPT/GitHub connector or human applies patch to a branch
-> PR stays the merge gate
```

## Preferred Branch Flow

```bash
git checkout -b war-room/<short-task-name>
git status --short
npm run build
git add <files>
git commit -m "Short imperative summary"
git push --no-verify -u origin war-room/<short-task-name>
```

Then open a PR to `main`.

## When Local Build Fails

If `npm run build` fails:

1. Check whether the failure is related to the files you touched.
2. If unrelated, pre-existing, or environment-specific, do not keep changing files.
3. Commit the intended patch.
4. Push the feature branch anyway.
5. Include the local failure in PR notes.

Required PR note format:

```text
Local build result:
- Command: npm run build
- Result: failed
- Error summary: <copy exact relevant error>
- Assessment: unrelated / pre-existing / environment-specific / related
```

## When Push Fails

If push fails due to proxy, auth, missing remote, or network access, return this packet:

```bash
git branch --show-current
git status --short
git remote -v
git log --oneline -n 3
git show --stat HEAD
git show --patch --no-ext-diff HEAD
```

Do not summarize only. Return the actual patch.

## Forbidden Shortcut

Do not push directly to `main`.

Do not force-push shared branches unless explicitly instructed.

Do not bypass GitHub Actions as the source of truth.

## Success Definition

A task is complete only when:

```text
feature branch or patch exists
PR is opened
GitHub Actions result is known
main is merged only after green or explicit human exception
Pages deploy is verified after merge when applicable
```
