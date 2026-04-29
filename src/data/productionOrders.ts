import type { ProductionOrder } from '../types/productionOrder';

export const productionOrders: ProductionOrder[] = [
  {
    id: 'order-1001',
    orderNumber: '1001',
    productFamily: 'Service Saddles',
    currentDepartment: 'Saddles Dept',
    nextDepartment: 'Shipping',
    status: 'ready',
    flowStatus: 'runnable',
    requiredSkills: ['assembly', 'machine_operation'],
    blockers: [],
    priority: 'hot',
  },
  {
    id: 'order-1002',
    orderNumber: '1002',
    productFamily: 'Fabricated Repair Sleeve',
    currentDepartment: 'Fab',
    nextDepartment: 'Assembly',
    status: 'blocked',
    flowStatus: 'blocked',
    requiredSkills: ['welding', 'fitting'],
    blockers: [
      {
        type: 'material',
        message: 'Material is not staged for Fab.',
      },
    ],
    priority: 'critical',
  },
  {
    id: 'order-1003',
    orderNumber: '1003',
    productFamily: 'Clamp Assembly',
    currentDepartment: 'Assembly',
    nextDepartment: 'Shipping',
    status: 'ready',
    flowStatus: 'runnable',
    requiredSkills: ['assembly'],
    blockers: [],
    priority: 'normal',
  },
  {
    id: 'order-1004',
    orderNumber: '1004',
    productFamily: 'Machined Components',
    currentDepartment: 'Machine Shop',
    nextDepartment: 'Assembly',
    status: 'blocked',
    flowStatus: 'blocked',
    requiredSkills: ['machine_operation'],
    blockers: [
      {
        type: 'machine',
        message: 'Machine alarm or offline state is blocking flow.',
      },
    ],
    priority: 'hot',
  },
  {
    id: 'order-1005',
    orderNumber: '1005',
    productFamily: 'Outbound Shipment',
    currentDepartment: 'Shipping',
    status: 'blocked',
    flowStatus: 'blocked',
    requiredSkills: ['shipping', 'material_handling'],
    blockers: [
      {
        type: 'quality',
        message: 'QA release is not confirmed.',
      },
    ],
    priority: 'critical',
  },
];