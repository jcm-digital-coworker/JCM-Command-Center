import type { ProductFamily } from '../types/productionOrder';

export type ProductFamilyInfo = {
  id: ProductFamily;
  label: string;
  productLine: 'Repair' | 'Connection' | 'Branching' | 'Engineered' | 'Support';
  description: string;
  exampleSeries: string[];
};

export const productFamilies: ProductFamilyInfo[] = [
  {
    id: 'REPAIR_FITTING',
    label: 'Repair Fittings',
    productLine: 'Repair',
    description: 'Clamps, patch clamps, repair sleeves, and fittings used to repair damaged pipe.',
    exampleSeries: ['101', '102', '110', '112', '113', '114', '116', '118', '136'],
  },
  {
    id: 'COUPLING',
    label: 'Couplings / FCAs',
    productLine: 'Connection',
    description: 'Products that connect pipe, adapt flanges, transition pipe sizes, or support line connection work.',
    exampleSeries: ['201', '202', '203', '204', '210', '211', '301', '303', '304', '309'],
  },
  {
    id: 'SERVICE_SADDLE',
    label: 'Service Saddles',
    productLine: 'Branching',
    description: 'Saddle products used to create service outlets on pipe.',
    exampleSeries: ['401', '402', '403', '404', '405', '406', '407', '408', '425', '502'],
  },
  {
    id: 'TAPPING_SLEEVE',
    label: 'Tapping Sleeves',
    productLine: 'Branching',
    description: 'Fabricated and stainless tapping sleeves used to branch from existing pipe.',
    exampleSeries: ['412', '414', '415', '432', '440', '452', '459', '462', '464', '469'],
  },
  {
    id: 'RESTRAINER',
    label: 'Restrainers',
    productLine: 'Support',
    description: 'Restraining products and anchors used to control pipe movement.',
    exampleSeries: ['600', '607', '617', '630', '631', '650'],
  },
  {
    id: 'PIPE_FABRICATION',
    label: 'Pipe Fabrications',
    productLine: 'Engineered',
    description: 'Fabricated tees, spools, wall fittings, expansion joints, tools, and accessories.',
    exampleSeries: ['800', '801', '802', '910', '920'],
  },
  {
    id: 'ENGINEERED_FITTING',
    label: 'Engineered Fittings',
    productLine: 'Engineered',
    description: 'Non-standard or application-specific fittings requiring engineering review or custom design.',
    exampleSeries: ['114', '116', '118', '136', '414', '415', '440', '800', '801', '802'],
  },
];
