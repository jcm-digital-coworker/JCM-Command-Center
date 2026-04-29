import type { WorkCenterAsset } from '../types/workCenterAsset';

export const workCenterAssets: WorkCenterAsset[] = [
  {
    id: 'recv-forklift-1',
    department: 'Receiving',
    name: 'Receiving Forklift 1',
    assetType: 'Forklift',
    status: 'AVAILABLE',
    lastKnownState: 'Ready for inbound unloads and work-center deliveries.',
    nextAction: 'Claim the next ready delivery from the receiving queue.',
  },
  {
    id: 'recv-forklift-2',
    department: 'Receiving',
    name: 'Receiving Forklift 2',
    assetType: 'Forklift',
    status: 'ASSIGNED',
    assignedTo: 'Delivery route',
    lastKnownState: 'Assigned to active material delivery route.',
    nextAction: 'Complete handoff and mark delivery finished.',
  },
  {
    id: 'recv-pallet-jack-1',
    department: 'Receiving',
    name: 'Receiving Pallet Jack',
    assetType: 'Pallet Jack',
    status: 'AVAILABLE',
    lastKnownState: 'Available for small inbound moves and staging.',
    nextAction: 'Use for light deliveries or staging cleanup.',
  },
];
