# Work Center Tablet Validation

Purpose: validate the live Work Center Tablet flow before adding more UI collapse, reordering, or route certainty.

Last updated: 2026-05-03

## Current Tablet Capabilities To Validate

The Work Center Tablet currently includes:

- Back to Command Center.
- Copy Station Link for `?wc=<workCenterId>` station deep-links.
- Work center hero and status.
- Digital Co-worker flyout.
- Operator Next Best Action console.
- Tablet Operating Mode strip.
- Lane drill-ins: Run Now, Needs Help, Review Needed, Next Handoff.
- Review Needed lane target storage and workflow-panel highlight.
- `WorkCenterWorkflowPanelV2` runtime workflow panel.
- Lower support panels for material, daily focus, station actions, assets, blockers, maintenance, and support tools.

## Validation Goal

Determine whether the current tablet already feels fast enough before hiding more information.

Do not assume lower panels should be collapsed. Validate whether workers actually use them.

## Core Operator Questions

For each tested work center, answer:

```text
Can the operator tell what to do first within 5 seconds?
```

```text
Can the operator tell what needs help or review?
```

```text
Can the operator jump to the right area without hunting?
```

```text
Does the Digital Co-worker flyout stay out of the way?
```

```text
Does Copy Station Link create the expected station URL?
```

```text
Which lower panels are used during actual work, and which are ignored?
```

## Test Passes

### 1. Normal Ready Work Center

Use a work center with ready work and no obvious blocker.

Check:

- Operating mode should read `RUN READY WORK` when ready count is present and no higher-priority help/review signal leads.
- Run Now lane should be understandable.
- Go to workflow should land near the work panel.
- Lower panels should not distract from the next action.

### 2. Help / Blocker Work Center

Use a work center with active risk, blocker, machine issue, or maintenance signal.

Check:

- Operating mode should read `HELP FIRST` when help count is present.
- Needs Help lane should explain the leading support signal.
- Go to help should land near blockers/assets/support context.
- The operator should not need to search for why the area needs help.

### 3. Review-Needed Work Center

Use a work center with a classification review warning.

Check:

- Operating mode should read `REVIEW FIRST` if review is the leading unresolved signal and no help-first signal leads.
- Review Needed lane should show the leading review target.
- Go to review should store the review target and highlight/preselect it in `WorkCenterWorkflowPanelV2`.
- Clear Target should only clear navigation context, not warnings or confirmations.

### 4. Handoff-Oriented Work Center

Use a work center where next handoff is the key signal.

Check:

- Next Handoff lane should name the destination or clearly state no handoff is ready.
- Go to handoff should move to useful handoff/local action context.
- Handoff wording should not imply dispatch approval.

### 5. Station Link / QR Flow

For at least two work centers:

- Tap Copy Station Link.
- Paste/open the link.
- Confirm URL includes `?wc=<workCenterId>`.
- Confirm the expected station/work center opens or is selected.

## Lower Panel Decision Rules

Only collapse, reorder, or move panels behind action buttons after validation.

Collapse candidate if:

- Operators never use it during live work.
- It duplicates a lane or workflow-panel action.
- It pushes more important next-action content down.
- It is useful only to supervisors, not station operators.

Do not collapse if:

- It explains a blocker.
- It supports material requests.
- It supports maintenance/service context.
- It prevents hallway-report drift.
- It is needed for handoff clarity.

## Guardrails

- No automatic route approval.
- No classifier mutation.
- No confidence increases without confirmed plant facts.
- No free-text-driven logic.
- Structured selections remain the source of truth.
- Notes explain exceptions only.
- Guidance before control.

## Output Of Validation

After testing, record:

```text
Work center tested
Role/view used
Operating mode shown
Lane clicked
Expected result
Actual result
Confusing panels
Useful panels
Recommended change
```

Recommended change should be one of:

```text
Leave as-is
Reorder panel
Collapse panel
Move panel behind action button
Improve lane target
Clarify text
Fix bug
```
