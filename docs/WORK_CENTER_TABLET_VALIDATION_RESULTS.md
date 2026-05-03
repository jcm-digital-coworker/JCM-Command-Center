# Work Center Tablet Validation Results

Purpose: record source-grounded validation findings before making more tablet UI collapse, panel reordering, or route-certainty changes.

Last updated: 2026-05-03

## Pass Type

This is a source validation pass, not a live floor/device test.

Checked source areas:

- `src/pages/WorkCenterDetailPage.tsx`
- `src/logic/operatorNextBestActions.ts`
- `src/data/productionOrders.ts`
- `docs/WORK_CENTER_TABLET_VALIDATION.md`

## Source-Verified Findings

### 1. Tablet speed features exist

Confirmed in source:

- Copy Station Link builds `?wc=<workCenter.id>` station URLs.
- Digital Co-worker is a flyout, not a full-width main-flow panel.
- Operator Next Best Action renders before the main workflow panel.
- Tablet Operating Mode is visible inside the action console.
- Lane buttons exist for workflow, help, review, and handoff.
- Review Needed reuses the existing review-target storage/event path.

Source result:

```text
PASS - core clickerboard-speed structure exists in source.
```

### 2. Operating mode is deterministic

Current priority order:

```text
helpCount > 0 -> HELP FIRST
pendingReviewCount > 0 -> REVIEW FIRST
readyCount > 0 -> RUN READY WORK
else -> MONITOR / STAGE
```

Source result:

```text
PASS - operating mode is simple and predictable.
```

Live-use question:

```text
Does HELP FIRST make sense when a department also has ready work?
```

### 3. Real test scenarios already exist

Production orders contain useful validation cases without inventing demo data.

Good candidates:

- Machine Shop / order 2509: blocked machine-alarm help case.
- Machine Shop / order 2510: ready coupling case.
- Assembly / order 2606: ready assembly case.
- Assembly / order 2512: blocked material-shortage case.
- Fab / order 2503: blocked material case.
- Fab / order 2504: ready handoff-to-coating case.
- Shipping / orders 2515 and 2516: ready and blocked shipping cases.

Source result:

```text
PASS - validation can use existing productionOrders data.
```

### 4. Review targeting is the most mature precision path

Review Needed stores a selected review traveler under:

```text
jcm-classification-review-target-v1
```

and dispatches:

```text
jcm-classification-review-target-updated
```

Source result:

```text
PASS - review targeting uses the existing review-target system.
```

Live-use question:

```text
Is the highlight/preselection inside WorkCenterWorkflowPanelV2 obvious enough on tablet?
```

## Findings That Need Live Validation

The source cannot prove these:

- whether the operator can tell what to do first within 5 seconds.
- whether the flyout covers important controls on tablet/mobile viewport sizes.
- whether Copy Station Link opens the expected work center in the deployed app.
- whether Go to Help lands close enough to the actual blocker.
- whether lower panels are useful or distracting during real work.
- whether mixed departments need clearer text when both ready work and blockers exist.

## Recommendation

Do not collapse or hide lower tablet panels yet.

Reason:

- lower panels still carry material requests, blockers, assets, maintenance/service context, daily focus, station actions, and supervisor tools.
- hiding them before live validation could remove useful shop-floor context.

Next best move:

```text
Run the live Work Center Tablet validation checklist on deployed/tablet view.
```

Use at least:

```text
Machine Shop - help/blocker and ready cases.
Assembly - mixed ready and blocked cases.
Fab - blocker and handoff cases.
Shipping - ready and blocked final-flow cases.
Saddles Dept - saddle/product-review-sensitive case.
```

Allowed post-validation outcomes:

```text
Leave as-is
Reorder panel
Collapse panel
Move panel behind action button
Improve lane target
Clarify text
Fix bug
```

## Guardrails

- No automatic route approval.
- No dispatch behavior from validation.
- No classifier mutation.
- No confidence increase without confirmed plant facts.
- Structured selections remain source of truth.
- Notes explain exceptions only.
