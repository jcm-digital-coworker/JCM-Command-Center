import type { PartBlueprint } from '../types/partBlueprint';

export const partBlueprints: PartBlueprint[] = [
  {
    id: 'bp-118-0690',
    partNumber: '118-0690',
    revision: 'B',
    description: 'Fabricated Repair Sleeve',
    drawingTitle: 'Repair Sleeve Body Assembly',
    materials: ['Plate Steel', 'Weld Wire'],
    routing: [
      {
        department: 'Fab',
        operation: 'Fit and weld sleeve body',
        instructions: ['Fit plate', 'Tack weld', 'Complete weld passes'],
        requiredChecks: ['Visual weld inspection'],
        handoffTo: 'Assembly',
      },
      {
        department: 'Assembly',
        operation: 'Assemble clamp components',
        instructions: ['Install bolts', 'Torque to spec'],
        requiredChecks: ['Torque verification'],
        handoffTo: 'QA',
      },
      {
        department: 'QA',
        operation: 'Inspect assembly',
        instructions: ['Check dimensions', 'Verify weld quality'],
        requiredChecks: ['Inspection checklist'],
        handoffTo: 'Shipping',
      },
    ],
    qaRequirements: ['Dimensional inspection', 'Weld verification'],
    safetyNotes: ['Wear PPE during welding'],
    shippingNotes: ['Protect machined surfaces'],
  },
];
