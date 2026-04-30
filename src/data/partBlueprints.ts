import type { PartBlueprint } from '../types/partBlueprint';

export const partBlueprints: PartBlueprint[] = [
  {
    id: 'bp-118-0690',
    partNumber: '118-0690',
    revision: 'B',
    description: 'Fabricated Repair Sleeve',
    drawingTitle: 'Repair Sleeve Body Assembly',
    materials: ['Plate steel', 'Weld wire'],
    routing: [
      { department: 'Fab', operation: 'Fit and weld', instructions: ['Fit parts', 'Weld'], requiredChecks: ['Visual weld'], handoffTo: 'Assembly' },
      { department: 'Assembly', operation: 'Assemble', instructions: ['Install components'], requiredChecks: ['Check fit'], handoffTo: 'QA' }
    ],
    qaRequirements: ['Inspection'],
    safetyNotes: ['Wear PPE'],
    shippingNotes: ['Protect surfaces']
  }
];
