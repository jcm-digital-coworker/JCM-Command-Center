# QA Reality Map

Purpose: preserve real JCM QA routing and inspection logic so Dynamic Travelers do not force every order through QA, but still route engineered orders, returns, and assigned inspections correctly.

## Core Correction

QA is not a universal mandatory stop for every production order.

QA is required for:

- Engineered orders.
- Returns.
- Specific assigned cases.

For regular production, QA is primarily a spot-check function unless QA is assigned or required by the order/product/customer/issue.

## QA Role

QA owns or strongly influences:

- Engineered order inspection / review.
- Return inspection / review.
- Production spot checks.
- Assigned inspection cases.
- Holds or release decisions when QA is required.

## Route Rules

### Engineered Orders

All engineered orders go through QA.

Generic route concept:

```text
Engineered production route
↓
QA
↓
Shipping
```

Exact upstream route depends on product family and department path.

### Returns

Returns come to QA.

Generic route concept:

```text
Return received
↓
QA
↓
Disposition / next action
```

Needs confirmation:

- Whether returns enter through Receiving before QA.
- Whether QA decides scrap, rework, repair, credit, or return-to-customer path.
- Whether Engineering, Sales, or Management must be involved in some return dispositions.

### Regular Production

Regular production does not automatically go through QA as a full route step.

QA may spot-check production.

QA should be assignable for specific cases when inspection, release, hold, or investigation is needed.

## Dynamic Traveler Implications

Plant Travelers need QA logic that is conditional, not automatic.

Potential QA route fields:

```text
qaRequired: true | false
qaAssigned: true | false
qaReason: engineered | return | spot_check | assigned | hold | customer_requirement | issue
qaStatus: not_required | assigned | waiting | active | hold | passed | failed | released
```

A traveler should not blindly show:

```text
Assembly → QA → Shipping
```

unless QA is actually required or assigned.

Instead, regular production may route:

```text
Final production step
↓
Shipping
```

while engineered work routes:

```text
Final production step
↓
QA
↓
Shipping
```

## QA Assignment Rule

QA needs to be assignable.

This means supervisors, management, QA, or authorized users may need to add QA to an order route when a specific case requires it.

Examples:

- engineered order
- return
- production issue
- customer requirement
- first article / special inspection
- suspected defect
- documentation requirement
- spot check selected by QA

## QA Traveler Questions

A QA Department Traveler should answer:

1. Why is QA required or assigned?
2. Is this engineered, a return, a spot check, or a special assigned case?
3. What order/product is being inspected?
4. What upstream department sent it?
5. What must QA verify?
6. Is the order released, held, failed, or waiting?
7. Where does it go next: Shipping, rework, Engineering, Sales/Management, or another department?

## Shipping Relationship

Shipping depends on QA only when QA is required or assigned.

For engineered orders and returns, Shipping should not treat the order as ready until QA has released it.

For regular production without QA assignment, Shipping can be the next final funnel after the last production/assembly step.

## Priority / JIT Implications

Because JCM runs under just-in-time pressure and expedited orders are common, QA-assigned work can become a shipping blocker.

Traveler priority should eventually account for:

- engineered order waiting on QA
- expedited order waiting on QA
- return waiting on QA disposition
- completed order blocked before Shipping by QA hold
- paperwork/documentation waiting on QA release

## Known Unknowns / Needs Confirmation

- Who can assign QA to an order.
- How QA assignment happens today.
- Whether engineered QA happens before or after final assembly/coating for every engineered product.
- Whether QA owns paperwork/certification packets.
- Whether returns enter through Receiving first.
- Return disposition paths.
- What spot-check criteria are used.
- Whether spot checks should appear in Plant Traveler routes or as separate QA tasks.
- What QA status labels are used today.

## Immediate App Correction

Do not force all production orders through QA by default.

QA should be conditional:

- required for engineered orders
- required for returns
- assignable for special cases and spot checks
- otherwise not required for normal production routes
