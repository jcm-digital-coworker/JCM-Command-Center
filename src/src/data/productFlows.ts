import type { ProductFlow } from '../types/productFlow';

export const productFlows: ProductFlow[] = [
  {
    lane: 'SERVICE_SADDLE',
    label: 'Service Saddles',
    departments: ['Receiving', 'Material Handling', 'Saddles Dept', 'QA', 'Shipping'],
    dependencies: [
      { name: 'Receiving Material Readiness', kind: 'MATERIAL', required: true },
      { name: 'HK FS-1200 Laser Table', kind: 'MACHINE', required: true },
      { name: 'Press Building', kind: 'BUILDING', required: true },
    ],
    bypassCapability: false,
    commandNote: 'Core product lane. Laser or press-building trouble blocks flow quickly.',
  },
  {
    lane: 'CLAMP',
    label: 'Clamps',
    departments: ['Receiving', 'Material Handling', 'Clamps', 'QA', 'Shipping'],
    dependencies: [
      { name: 'Receiving Material Readiness', kind: 'MATERIAL', required: true },
      { name: 'HK FS-1200 Laser Table', kind: 'MACHINE', required: true },
      { name: 'Press Building', kind: 'BUILDING', required: true },
    ],
    bypassCapability: false,
    commandNote: 'Shares the same Material Handling choke points as saddles.',
  },
  {
    lane: 'PATCH_CLAMP',
    label: 'Patch Clamps',
    departments: ['Receiving', 'Patch Clamps', 'QA', 'Shipping'],
    dependencies: [{ name: 'Receiving Material Readiness', kind: 'MATERIAL', required: true }],
    bypassCapability: true,
    commandNote: 'Bypass lane. Can stay runnable when laser/press flow is constrained.',
  },
  {
    lane: 'COUPLING',
    label: 'Couplings',
    departments: ['Receiving', 'Material Handling', 'Machine Shop', 'Assembly', 'QA', 'Shipping'],
    dependencies: [
      { name: 'Receiving Material Readiness', kind: 'MATERIAL', required: true },
      { name: 'Rollers / Expander Capacity', kind: 'MACHINE', required: true },
      { name: 'Coupling Assembly', kind: 'WORK_CELL', required: true },
    ],
    bypassCapability: false,
    commandNote: 'Diameter-critical flow. Roller and expander capacity matter.',
  },
  {
    lane: 'TAPPING_SLEEVE',
    label: 'Tapping Sleeves',
    departments: ['Receiving', 'Material Handling', 'Fab', 'Assembly', 'QA', 'Shipping'],
    dependencies: [
      { name: 'Receiving Material Readiness', kind: 'MATERIAL', required: true },
      { name: 'Correct Fab Cell', kind: 'WORK_CELL', required: true },
      { name: 'QA / Compliance Review', kind: 'QA', required: true },
    ],
    bypassCapability: false,
    commandNote: 'Fab-cell routing must match material, size, and skill level.',
  },
  {
    lane: 'ENGINEERED_FITTING',
    label: 'Engineered Fittings',
    departments: ['Receiving', 'Office', 'Material Handling', 'Fab', 'Assembly', 'QA', 'Shipping'],
    dependencies: [
      { name: 'Engineering Review', kind: 'WORK_CELL', required: true },
      { name: 'Receiving Material Readiness', kind: 'MATERIAL', required: true },
      { name: 'Special Fab', kind: 'WORK_CELL', required: true },
      { name: 'QA / Compliance Review', kind: 'QA', required: true },
    ],
    bypassCapability: false,
    commandNote: 'Technical-risk lane. Engineering uncertainty and QA holds are expected blockers.',
  },
  {
    lane: 'PIPE_FABRICATION',
    label: 'Pipe Fabrications',
    departments: ['Receiving', 'Material Handling', 'Fab', 'QA', 'Shipping'],
    dependencies: [
      { name: 'Receiving Material Readiness', kind: 'MATERIAL', required: true },
      { name: 'Correct Fab Cell', kind: 'WORK_CELL', required: true },
    ],
    bypassCapability: false,
    commandNote: 'Custom fabrication route. Treat as variable until verified.',
  },
];
