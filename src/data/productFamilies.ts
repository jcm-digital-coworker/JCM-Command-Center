import type { ProductFamily } from '../types/productionOrder';

export type ProductFamilyInfo = {
  id: ProductFamily;
  label: string;
  productLine: 'Repair' | 'Connection' | 'Branching' | 'Engineered' | 'Support';
  description: string;
  exampleSeries: string[];
  certifications?: string[];
  materialOptions?: string[];
};

export const productFamilies: ProductFamilyInfo[] = [
  {
    id: 'REPAIR_FITTING',
    label: 'Repair Fittings',
    productLine: 'Repair',
    description: 'Universal clamp couplings, patch clamps, repair sleeves, and bell joint leak clamps used to repair damaged pipe. Covers single-band and multi-band UCCs, full-circle clamps, and fabricated repair sleeves.',
    exampleSeries: ['101', '102', '103', '104', '105', '106', '108', '110', '111', '112', '113', '114', '116', '118', '131', '132', '136', '143'],
    certifications: ['AWWA C219', 'NSF 61', 'NSF 372'],
    materialOptions: ['Ductile Iron', 'Carbon Steel', '304 Stainless Steel', '316 Stainless Steel'],
  },
  {
    id: 'COUPLING',
    label: 'Couplings / Connection Fittings',
    productLine: 'Connection',
    description: 'Steel and ductile iron bolted couplings, flanged adapters, reducing couplings, and dismantling joints for plain-end pipe connection. Covers AWWA C219-compliant sleeve-type couplings and fabricated connection fittings.',
    exampleSeries: ['201', '202', '210', '213', '230', '242', '262', '303', '309', '362', '4262', '6262', '631'],
    certifications: ['AWWA C219', 'AWWA C800', 'NSF 61', 'NSF 372'],
    materialOptions: ['Carbon Steel', 'Ductile Iron', '304 Stainless Steel', '316 Stainless Steel'],
  },
  {
    id: 'SERVICE_SADDLE',
    label: 'Service Saddles',
    productLine: 'Branching',
    description: 'Ductile iron and stainless steel saddle products for creating service outlets on water and wastewater pipe. Includes single-strap, double-strap, wide-body, coated, and electro-galvanized variants for standard and CSCPP applications.',
    exampleSeries: ['401', '402', '403', '404', '405', '406', '407', '408', '425', '502'],
    certifications: ['AWWA C800', 'NSF 61', 'NSF 372'],
    materialOptions: ['Ductile Iron', '304 Stainless Steel', '316 Stainless Steel'],
  },
  {
    id: 'TAPPING_SLEEVE',
    label: 'Tapping Sleeves',
    productLine: 'Branching',
    description: 'Fabricated carbon steel and stainless steel tapping sleeves for branching from existing distribution and transmission pipe. Includes plain outlet, MJ outlet, threaded outlet, weld-on, full circumferential gasket, and outlet seal gasket variants.',
    exampleSeries: ['411', '412', '414', '415', '416', '417', '418', '419', '422', '429', '432', '438', '439', '440', '452', '459', '462', '464', '465', '469', '6432', '6438', '6439', '6452', '6459'],
    certifications: ['NSF 61', 'NSF 372', 'AWWA C800'],
    materialOptions: ['Carbon Steel (ASTM A516 Gr.70)', '304 Stainless Steel', '316 Stainless Steel'],
  },
  {
    id: 'RESTRAINER',
    label: 'Restrainers & Anchors',
    productLine: 'Support',
    description: 'Pipe restraining products, asbestos cement coupling restrainers, and anchoring devices used to control thrust and pipe movement in pressurized systems.',
    exampleSeries: ['600', '607', '617', '630', '631', '650'],
    certifications: ['NSF 61'],
    materialOptions: ['Ductile Iron', 'Carbon Steel'],
  },
  {
    id: 'PIPE_FABRICATION',
    label: 'Pipe Fabrications & Engineered Spools',
    productLine: 'Engineered',
    description: 'Custom fabricated tees, spools, flanged adapters, dismantling joints, wall fittings, and expansion joints. Engineered-to-order for transmission, distribution, and large-diameter applications. Includes flange x flange, flange x plain end, and bypass tee configurations.',
    exampleSeries: ['800', '801', '802', '820', '822', '823', '831', '832', '833', '834', '910', '920'],
    certifications: ['NSF 61', 'NSF 372', 'AWWA'],
    materialOptions: ['Carbon Steel', '304 Stainless Steel', 'HDPE'],
  },
  {
    id: 'ENGINEERED_FITTING',
    label: 'Engineered Fittings',
    productLine: 'Engineered',
    description: 'Non-standard or application-specific fittings requiring engineering review, custom design, or exotic pipe diameters. Includes line stop fittings, large-diameter applications, high-pressure configurations, and customer-designed piping appurtenances.',
    exampleSeries: ['114', '116', '118', '136', '414', '415', '440', '801', '802'],
    certifications: ['NSF 61', 'NSF 372', 'AWWA', 'AIS / Buy American'],
    materialOptions: ['Carbon Steel', '304 Stainless Steel', '316 Stainless Steel', 'Ductile Iron', 'HDPE'],
  },
];
