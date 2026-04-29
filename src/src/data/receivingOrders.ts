import type { ReceivingOrder } from '../types/receiving';

export const seedReceivingOrders: ReceivingOrder[] = [
  {
    id: 'recv-001',
    itemName: 'Hydraulic oil drums',
    description: 'Two drums for machine shop fluid top-off and spare stock.',
    quantity: '2 drums',
    orderedBy: 'Machine Shop Lead',
    requesterDepartment: 'Machine Shop',
    destinationDepartment: 'Machine Shop',
    destinationDetail: 'Machine Shop fluid storage cage',
    expectedDate: new Date().toISOString().slice(0, 10),
    supplier: 'Industrial Supply',
    poOrReceiver: 'PO-10482',
    priority: 'HOT',
    status: 'ARRIVING_TODAY',
    notificationLog: [
      {
        id: 'note-001',
        at: new Date().toISOString(),
        audience: 'Receiving',
        message: 'Order submitted and expected today.',
      },
    ],
  },
  {
    id: 'recv-002',
    itemName: 'Copy paper and printer toner',
    description: 'Office supply restock for front office and production printers.',
    quantity: '1 pallet mixed supplies',
    orderedBy: 'Office Admin',
    requesterDepartment: 'Office',
    destinationDepartment: 'Office',
    destinationDetail: 'Front office supply closet',
    expectedDate: new Date().toISOString().slice(0, 10),
    supplier: 'Office Vendor',
    poOrReceiver: 'REC-2217',
    priority: 'NORMAL',
    status: 'ARRIVING_TODAY',
    notificationLog: [
      {
        id: 'note-002',
        at: new Date().toISOString(),
        audience: 'Receiving',
        message: 'Order submitted and expected today.',
      },
    ],
  },
];
