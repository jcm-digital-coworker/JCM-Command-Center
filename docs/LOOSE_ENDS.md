# Loose Ends

Purpose: preserve unanswered plant-confirmation questions and unresolved build assumptions so the Command Center does not accidentally turn unknowns into fake certainty.

Last updated: 2026-05-03

## Dynamic Traveler / Product Classification Loose Ends

Current decision:

```text
Do not refine 432 / 452 / stainless / coating sub-lanes yet.
Do not raise 412 confidence.
Do not remove review warnings.
Do not expand automatic dispatch behavior.
```

Reason:

The currently missing answers are real plant-confirmation items. Until confirmed, the app should surface them as review warnings rather than treating them as route truth.

## Highest-Priority Confirmation Items

### 412 Carbon Tapping Sleeve

Open questions:

```text
Does 412 always route:
Material Handling / Machine Shop -> 412 Fab -> Coating -> 412 Assembly?
```

```text
Is the 12 inch outlet threshold inclusive?
Meaning: 12 inch and under = 412 Fab, but over 12 inch goes elsewhere?
```

```text
Which exact coating lane handles normal 412 shop coat?
- continuous line?
- large-part paint booth?
- enamel booth?
- something else?
```

```text
Is optional fusion epoxy for 412 done in-house, outsourced, or order-specific?
```

Current app stance:

- 412 confidence remains MEDIUM.
- 12 inch threshold review warning stays active.
- Coating lane review warning stays active.
- Do not generalize this route to 432 or 452.

### 405-408 Coated Service Saddles

Open questions:

```text
Does fusion plastic coating mean:
pizza oven -> fluidized bed?
```

```text
Are saddle straps coated?
If yes, are straps coated before Saddles Dept or after Saddles Dept / LV4500 work?
```

Current app stance:

- 405-408 route is confirmed as Receiving -> Coating -> Saddles Dept.
- Confidence stays MEDIUM until coating sub-lane is confirmed.
- Review warning stays active for fusion plastic coating process.

### 401-404 Standard Service Saddles

Open questions:

```text
What exact shop-coat sub-lane handles standard service saddles?
```

```text
When are straps coated, if at all?
```

Current app stance:

- 401-404 route is confirmed as Receiving -> Coating -> Saddles Dept.
- Confidence is HIGH for route confidence.
- Review warning stays active for shop-coat sub-lane and strap timing.

### 502 Stainless Service Saddle

Open questions:

```text
Does 502 follow the same general Saddles Dept path?
Receiving -> Coating/passivation -> Saddles Dept
```

```text
Is 502 passivated in the Coating/passivation room?
```

```text
Does the Press Building strap dependency apply to 502?
```

Current app stance:

- 502 remains LOW confidence.
- 502 remains human-review-required.
- Do not assume standard Saddles route until confirmed.

## Route Families Not Ready For Expansion

Do not expand or raise confidence yet for:

```text
432 stainless tapping sleeve
452 stainless tapping sleeve
stainless/passivation-wide logic
Couplings
Clamps
Patch Clamp
```

Reason:

These routes still have unresolved department ownership, coating/passivation, or timing questions.

## Review Surfaces Already Built

The earlier recommended code move was:

```text
Add a Classification Review Summary surface.
```

That direction is now complete enough to stop treating it as the next build target.

Built review visibility now includes:

- Classification Review Summary in `WorkCenterWorkflowPanelV2`.
- Plant-wide Classification Review Queue on the dashboard.
- Safe drill-in from the global queue to matching work center review capture.
- Review-target storage under `jcm-classification-review-target-v1`.
- Review-target preselection/highlight in the workflow panel.
- User-controlled Clear Target action.
- Plant Truth Checklist inside the existing Classification Review Queue.
- Structured local confirmation capture saved under `jcm-classification-review-confirmations-v1`.
- Work Center Tablet Review Needed lane targeting the leading review-needed traveler.

Important guardrail:

- These surfaces are visibility, navigation, and structured confirmation support.
- They do not approve routes.
- They do not dispatch work.
- They do not mutate classifier rules.
- They do not raise confidence automatically.

## Best Current App Direction From These Loose Ends

Best next move is not another automatic classification UI surface.

Best next move:

```text
Collect plant facts and validate live tablet use before adding more route certainty or collapsing more tablet panels.
```

Why:

- The review surfaces already expose uncertain orders and product-family warnings.
- The Work Center Tablet now has Operator Next Best Action, lane drill-ins, review targeting, Digital Co-worker flyout, Copy Station Link, and operating-mode emphasis.
- The remaining uncertainty is mostly real plant truth, not missing UI chrome.
- Collapsing lower tablet panels may help, but should follow live-use validation instead of being assumed.

Suggested validation questions:

```text
Can the operator tell what to do first?
Can the operator tell what needs help?
Can the operator tell what needs review?
Can the operator jump to the right panel quickly?
Does Copy Station Link create the expected station URL?
Does the Digital Co-worker flyout stay out of the way?
Which lower tablet panels are actually used during work?
```

Suggested plant-fact intake priorities:

```text
412 outlet threshold and exact coating lane.
412 optional fusion epoxy source.
405-408 fusion plastic coating process.
401-408 strap coating/timing.
502 stainless saddle route, passivation, and strap dependency.
Couplings, Clamps, and Patch Clamp department ownership/timing.
```

Guardrails:

- Display/navigation first.
- No automatic route approval.
- No route confidence increases without confirmed plant facts.
- No classifier mutation from free text.
- Structured selections remain the source of truth.
- Notes explain exceptions only.
