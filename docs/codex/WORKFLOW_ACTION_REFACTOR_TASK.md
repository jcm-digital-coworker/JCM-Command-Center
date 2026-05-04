# Codex Task: Refactor Work Center Workflow Actions

## Objective

Refactor `src/components/WorkCenterWorkflowPanelV2.tsx` so workflow button clicks use typed `WorkflowButtonAction` IDs from `src/logic/workflowPanelSelectors.ts` instead of parsing button display labels.

This is the follow-up to the selector-side contract added in PR #24.

## Background

`src/logic/workflowPanelSelectors.ts` now emits this contract on each workflow card:

```ts
export type WorkflowButtonAction =
  | 'NO_ACTION'
  | 'START_WORK'
  | 'ESCALATE_ENGINEERING'
  | 'HOLD_STATION'
  | 'REQUEST_MATERIAL'
  | 'OPEN_MAINTENANCE'
  | 'REVIEW_BLOCKER'
  | 'NOTIFY_LEAD';
```

The current component still infers behavior from button label text. That bug class previously allowed view/no-op labels to flow into fallback runtime mutation.

## Required change

Change the component-side dispatch from label-text parsing to typed action IDs.

Target shape:

```ts
runAction(actionId, label, orderNumber)
WorkflowCard onAction(actionId, label, orderNumber)
switch (actionId) in act/runAction
```

Expected wiring:

- primary button uses `card.buttons.primaryAction`
- secondary button uses `card.buttons.secondaryAction`
- label text is only display/log copy, not behavior authority

## Guardrails

- `NO_ACTION` must not mutate runtime state.
- `START_WORK` is the only path that calls runtime `START_WORK`.
- `ESCALATE_ENGINEERING` keeps existing Engineering escalation behavior.
- `REQUEST_MATERIAL` keeps existing material request behavior.
- `OPEN_MAINTENANCE` opens Maintenance only.
- `REVIEW_BLOCKER` must not clear blockers.
- `NOTIFY_LEAD` must not clear blockers.
- `HOLD_STATION` must not approve, dispatch, or clear blockers.
- Do not change classifier confidence.
- Do not approve routes automatically.
- Do not rewrite unrelated UI or style code.

## Suggested implementation outline

1. Import `type WorkflowButtonAction` from `../logic/workflowPanelSelectors` or the correct relative path.
2. Update the action handler signature from label-only to action ID plus label.
3. Update button callbacks to pass `primaryAction` and `secondaryAction`.
4. Replace `label.includes(...)` behavior inference with a `switch(actionId)`.
5. Preserve existing local logging/navigation behavior where the typed action corresponds to the previous intended behavior.
6. Ensure `NO_ACTION` returns without side effects.
7. Run build.

## Validation

```bash
npm install
npm run build
```

## PR title suggestion

```text
Use typed workflow button actions
```

## PR summary checklist

- Removed label-text behavior inference from workflow action dispatch.
- Preserved Engineering, Material, Maintenance, and Start Work behavior through typed action IDs.
- Confirmed no-op/review/notify actions do not mutate blockers or runtime state.
- `npm run build` passes.
