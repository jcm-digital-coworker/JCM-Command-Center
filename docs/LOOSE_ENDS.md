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

## Recommended App Direction From These Loose Ends

Best next code move:

```text
Add a Classification Review Summary surface.
```

Purpose:

- List travelers/orders where classification needs human review.
- Surface low-confidence route/product/coating warnings.
- Keep unknowns visible before automatic dispatch logic exists.
- Prevent hidden route assumptions from spreading.

Suggested summary fields:

```text
Order number
Product family/model signal
Confidence
Review reason
Finish hint
Suggested route
QA required
Current department
```

Guardrails:

- Display-only first.
- No write actions.
- No automatic route approval.
- No route confidence increases without confirmed plant facts.
