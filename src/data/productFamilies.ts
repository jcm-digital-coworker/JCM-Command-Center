import type { ProductFamily } from '../types/productionOrder';

export type RouteConfidence = 'CONFIRMED' | 'LIKELY' | 'NEEDS_REVIEW';

export type ProductFamilySourceType =
  | 'public_website'
  | 'public_catalog'
  | 'uploaded_manual'
  | 'plant_confirmed';

export type RouteConfidenceDisplay = {
  label: string;
  operatorCopy: string;
  badgeTone: 'green' | 'blue' | 'orange';
};

export type ProductFamilyInfo = {
  id: ProductFamily;
  label: string;
  productLine: 'Repair' | 'Connection' | 'Branching' | 'Engineered' | 'Support';
  description: string;
  exampleSeries: string[];
  certifications?: string[];
  materialOptions?: string[];
  likelyPlantArea?: string;
  routeConfidence: RouteConfidence;
  sourceType: ProductFamilySourceType;
  routeNote: string;
  needsConfirmation: string[];
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
    likelyPlantArea: 'Clamps / Patch Clamps / Fab',
    routeConfidence: 'NEEDS_REVIEW',
    sourceType: 'public_catalog',
    routeNote: 'Catalog grouping is solid. Internal ownership splits between Clamps, Patch Clamps, and engineered Fab need confirmation before dispatch.',
    needsConfirmation: [
      'Confirm Clamps ownership for 101-104 and stainless clamp variants.',
      'Confirm Patch Clamps ownership for 110-113.',
      'Confirm engineered repair fitting route for 114, 116, 118, and 136.',
      'Confirm coating, QA, and shipping readiness rules by family.',
    ],
  },
  {
    id: 'COUPLING',
    label: 'Couplings / Connection Fittings',
    productLine: 'Connection',
    description: 'Steel and ductile iron bolted couplings, flanged adapters, reducing couplings, and dismantling joints for plain-end pipe connection. Covers AWWA C219-compliant sleeve-type couplings and fabricated connection fittings.',
    exampleSeries: ['201', '202', '210', '213', '230', '242', '262', '303', '309', '362', '4262', '6262', '631'],
    certifications: ['AWWA C219', 'AWWA C800', 'NSF 61', 'NSF 372'],
    materialOptions: ['Carbon Steel', 'Ductile Iron', '304 Stainless Steel', '316 Stainless Steel'],
    likelyPlantArea: 'Couplings',
    routeConfidence: 'NEEDS_REVIEW',
    sourceType: 'public_catalog',
    routeNote: 'Connection product grouping is solid. Internal route relative to Coating is not confirmed.',
    needsConfirmation: [
      'Confirm Couplings department ownership.',
      'Confirm which coupling and adapter models route through Coating.',
      'Confirm QA and shipping readiness rules.',
    ],
  },
  {
    id: 'SERVICE_SADDLE',
    label: 'Service Saddles',
    productLine: 'Branching',
    description: 'Ductile iron and stainless steel saddle products for creating service outlets on water and wastewater pipe. Includes single-strap, double-strap, wide-body, coated, and electro-galvanized variants for standard and CSCPP applications.',
    exampleSeries: ['401', '402', '403', '404', '405', '406', '407', '408', '425', '502'],
    certifications: ['AWWA C800', 'NSF 61', 'NSF 372'],
    materialOptions: ['Ductile Iron', '304 Stainless Steel', '316 Stainless Steel'],
    likelyPlantArea: 'Saddles Dept',
    routeConfidence: 'LIKELY',
    sourceType: 'plant_confirmed',
    routeNote: 'Saddles route is confirmed at the family level as Receiving -> Coating -> Saddles Dept. Model-level exceptions and downstream gates still need confirmation.',
    needsConfirmation: [
      'Confirm model-level exceptions.',
      'Confirm downstream handoff after Saddles Dept.',
      'Confirm QA conditions.',
    ],
  },
  {
    id: 'TAPPING_SLEEVE',
    label: 'Tapping Sleeves',
    productLine: 'Branching',
    description: 'Fabricated carbon steel and stainless steel tapping sleeves for branching from existing distribution and transmission pipe. Includes plain outlet, MJ outlet, threaded outlet, weld-on, full circumferential gasket, and outlet seal gasket variants.',
    exampleSeries: ['411', '412', '414', '415', '416', '417', '418', '419', '422', '429', '432', '438', '439', '440', '452', '459', '462', '464', '465', '469', '6432', '6438', '6439', '6452', '6459'],
    certifications: ['NSF 61', 'NSF 372', 'AWWA C800'],
    materialOptions: ['Carbon Steel (ASTM A516 Gr.70)', '304 Stainless Steel', '316 Stainless Steel'],
    likelyPlantArea: '412 Fab / 432 Fab / 452 / Fab',
    routeConfidence: 'NEEDS_REVIEW',
    sourceType: 'public_website',
    routeNote: 'Public product grouping is solid. Internal lane ownership for 412, 432, 452, and related sleeve variants must stay review-only until confirmed.',
    needsConfirmation: [
      'Confirm 412 Fab ownership and exceptions.',
      'Confirm 432 Fab ownership and exceptions.',
      'Confirm what 452 means internally: lane, department, product family, or shorthand.',
      'Confirm coating, QA, and shipping readiness rules.',
    ],
  },
  {
    id: 'RESTRAINER',
    label: 'Restrainers & Anchors',
    productLine: 'Support',
    description: 'Pipe restraining products, asbestos cement coupling restrainers, and anchoring devices used to control thrust and pipe movement in pressurized systems.',
    exampleSeries: ['600', '607', '617', '630', '631', '650'],
    certifications: ['NSF 61'],
    materialOptions: ['Ductile Iron', 'Carbon Steel'],
    routeConfidence: 'NEEDS_REVIEW',
    sourceType: 'public_catalog',
    routeNote: 'Product grouping is available, but no internal plant area is confirmed.',
    needsConfirmation: [
      'Confirm whether restrainers route through Fab, Assembly, Shipping-only handling, or another area.',
      'Confirm whether restrainers need a dedicated department page or product-intelligence-only treatment.',
    ],
  },
  {
    id: 'PIPE_FABRICATION',
    label: 'Pipe Fabrications & Engineered Spools',
    productLine: 'Engineered',
    description: 'Custom fabricated tees, spools, flanged adapters, dismantling joints, wall fittings, and expansion joints. Engineered-to-order for transmission, distribution, and large-diameter applications. Includes flange x flange, flange x plain end, and bypass tee configurations.',
    exampleSeries: ['800', '801', '802', '820', '822', '823', '831', '832', '833', '834', '910', '920'],
    certifications: ['NSF 61', 'NSF 372', 'AWWA'],
    materialOptions: ['Carbon Steel', '304 Stainless Steel', 'HDPE'],
    likelyPlantArea: 'Fab',
    routeConfidence: 'NEEDS_REVIEW',
    sourceType: 'uploaded_manual',
    routeNote: 'Engineered fabrication grouping is solid. Exact Fab lane, coating path, QA gate, and shipping readiness need confirmation.',
    needsConfirmation: [
      'Confirm exact Fab lane or engineered area ownership.',
      'Confirm coating, QA, and shipping readiness rules.',
    ],
  },
  {
    id: 'ENGINEERED_FITTING',
    label: 'Engineered Fittings',
    productLine: 'Engineered',
    description: 'Non-standard or application-specific fittings requiring engineering review, custom design, or exotic pipe diameters. Includes line stop fittings, large-diameter applications, high-pressure configurations, and customer-designed piping appurtenances.',
    exampleSeries: ['114', '116', '118', '136', '414', '415', '440', '801', '802'],
    certifications: ['NSF 61', 'NSF 372', 'AWWA', 'AIS / Buy American'],
    materialOptions: ['Carbon Steel', '304 Stainless Steel', '316 Stainless Steel', 'Ductile Iron', 'HDPE'],
    likelyPlantArea: 'Engineering / Fab',
    routeConfidence: 'NEEDS_REVIEW',
    sourceType: 'uploaded_manual',
    routeNote: 'Engineering review need is clear. Internal production routing must be confirmed by model and order requirements.',
    needsConfirmation: [
      'Confirm when Engineering owns review versus when Fab owns active production.',
      'Confirm model-specific routing for 114, 116, 118, 136, 414, 415, 440, 801, and 802.',
      'Confirm QA and shipping readiness rules.',
    ],
  },
];

export const routeConfidenceDisplay: Record<RouteConfidence, RouteConfidenceDisplay> = {
  CONFIRMED: {
    label: 'Route Confirmed',
    operatorCopy: 'Plant route is confirmed for this product family. Follow the traveler and required departments.',
    badgeTone: 'green',
  },
  LIKELY: {
    label: 'Likely Route',
    operatorCopy: 'Product family points to a likely route. Confirm model exceptions before changing department state.',
    badgeTone: 'blue',
  },
  NEEDS_REVIEW: {
    label: 'Route Review Needed',
    operatorCopy: 'Use this as product intelligence only. Confirm the owning department before dispatch or handoff.',
    badgeTone: 'orange',
  },
};

export function findProductFamilyBySeries(seriesOrPartNumber: string): ProductFamilyInfo | undefined {
  const normalized = seriesOrPartNumber.trim();

  return productFamilies.find((family) =>
    family.exampleSeries.some((series) => normalized.startsWith(series)),
  );
}

export function getProductFamilyRouteConfidence(seriesOrPartNumber: string): RouteConfidence {
  return findProductFamilyBySeries(seriesOrPartNumber)?.routeConfidence ?? 'NEEDS_REVIEW';
}

export function getProductFamilyRouteConfidenceDisplay(seriesOrPartNumber: string): RouteConfidenceDisplay {
  return routeConfidenceDisplay[getProductFamilyRouteConfidence(seriesOrPartNumber)];
}
