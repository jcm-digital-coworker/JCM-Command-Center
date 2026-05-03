# Shipping and Just-In-Time Reality Map

Purpose: preserve the real JCM shipping and order-pressure model so Dynamic Traveler routing and priority logic account for the fact that everything ultimately funnels to Shipping and expedited work is common.

## Core Correction

Everything eventually funnels to Shipping to be sent out.

JCM operates with a just-in-time model, so expedited orders are common. Expedited work should not be treated as a rare exception in traveler logic.

## Shipping Role

Shipping is the final outbound gate for plant work.

Shipping owns or strongly influences:

- Final outbound staging.
- Shipment readiness.
- Sending completed product out.
- Final visibility into what is ready, late, expedited, blocked, or missing before shipment.

## Plant-Wide Funnel Rule

Every product route should eventually resolve to Shipping unless specifically marked as non-shipping/internal.

Generic route concept:

```text
Department-specific production route
↓
Final completion / release
↓
Shipping
↓
Sent out
```

The exact prior step may differ by product family:

- Fab-lane assemblies may go through matching assembly lanes, QA, then Shipping.
- Saddles, Clamps, Patch Clamps, and Couplings may have product-line-specific paths before Shipping.
- Engineered or industrial work may have extra QA/documentation before Shipping.

## Just-In-Time / Expedited Reality

JCM has a just-in-time operating model.

Expedited orders are common enough that the app should treat them as normal operating pressure, not an oddball scenario.

Traveler priority logic should eventually account for:

- expedited status
- customer pressure
- ship date pressure
- downstream Shipping readiness
- whether a late upstream step will starve Shipping
- whether an order is close to completion but blocked before Shipping
- whether documentation/QA/material is blocking outbound shipment

## Dynamic Traveler Implications

Plant Travelers should expose Shipping impact.

A traveler should eventually answer:

1. Is this order expedited?
2. Is Shipping waiting on this order?
3. What department is preventing the order from reaching Shipping?
4. Is the order complete except for QA/documentation/packaging/staging?
5. What is the latest safe handoff time, if known?
6. What blocker is threatening the ship date?

## Priority Implications

Simple due-date sorting is not enough.

A later-stage order that is blocked one step before Shipping may need higher priority than an earlier-stage order with the same due date.

Future priority scoring should consider:

```text
Expedited flag
+ Ship date pressure
+ Current route position
+ Remaining steps
+ Blocking department
+ Shipping readiness
+ QA/documentation readiness
+ Customer/management priority
```

## Shipping Traveler Questions

A Shipping Department Traveler should answer:

1. Is this order ready to ship?
2. What product/order is it?
3. Has the final upstream department released it?
4. Is QA/documentation complete if required?
5. Is packaging/staging complete?
6. Is the order expedited?
7. What is blocking shipment?

## Known Unknowns / Needs Confirmation

- Shipping sub-areas or staging lanes.
- Whether Shipping owns packaging, documentation, or only final outbound movement.
- Relationship between QA release and Shipping release.
- How expedited orders are identified today.
- Whether there are hard ship windows or carrier pickup times.
- What information Shipping needs first on the app screen.
- Which products can bypass QA, if any.
- Which paperwork or certification packets commonly block shipment.

## Immediate App Correction

Traveler logic should recognize Shipping as the final plant funnel and treat expedited/JIT pressure as common operating reality.

Do not build traveler priority as if every order calmly follows a standard schedule.
