import type { PartBlueprint } from '../types/partBlueprint';

export const partBlueprints: PartBlueprint[] = [
  {
    id: 'bp-118-0690',
    partNumber: '118-0690',
    revision: 'B',
    description: 'Fabricated Repair Sleeve',
    drawingTitle: 'Repair Sleeve Body Assembly',
    materials: ['Plate steel', 'Weld wire', 'Hardware kit'],
    routing: [
      {
        department: 'Fab',
        operation: 'Fit and weld sleeve body',
        instructions: ['Verify drawing revision before fit-up.', 'Fit plate to sleeve body.', 'Tack weld and complete weld passes.'],
        requiredChecks: ['Visual weld inspection', 'Fit-up verification'],
        handoffTo: 'Assembly',
      },
      {
        department: 'Assembly',
        operation: 'Assemble sleeve hardware',
        instructions: ['Confirm all components are present.', 'Install hardware kit.', 'Complete assembly checkoff.'],
        requiredChecks: ['Component count', 'Final assembly check'],
        handoffTo: 'QA',
      },
      {
        department: 'QA',
        operation: 'Inspect release requirements',
        instructions: ['Verify drawing revision.', 'Check required dimensions.', 'Release or hold order.'],
        requiredChecks: ['Dimensional inspection', 'Documentation check'],
        handoffTo: 'Shipping',
      },
      {
        department: 'Shipping',
        operation: 'Pack and stage shipment',
        instructions: ['Verify QA release.', 'Protect finished surfaces.', 'Stage for outbound shipment.'],
        requiredChecks: ['QA release confirmed', 'Packing check'],
      },
    ],
    qaRequirements: ['Dimensional inspection', 'Visual weld verification', 'Release signoff'],
    safetyNotes: ['Wear required PPE.', 'Use safe handling for large fabricated parts.'],
    shippingNotes: ['Protect finished surfaces.', 'Confirm paperwork before shipment.'],
  },
];
