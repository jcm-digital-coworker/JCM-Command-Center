import type { Department } from './machine';

export type ProductLine =
  | 'REPAIR'
  | 'CONNECTION'
  | 'BRANCHING'
  | 'ENGINEERED'
  | 'TOOLS_ACCESSORIES'
  | 'UNKNOWN';

export type ClassifiedProductFamily =
  | 'SERVICE_SADDLE'
  | 'TAPPING_SLEEVE'
  | 'UNIVERSAL_CLAMP_COUPLING'
  | 'PATCH_CLAMP'
  | 'REPAIR_SLEEVE'
  | 'COUPLING'
  | 'FLANGED_ADAPTER'
  | 'SPOOL_OR_TEE'
  | 'EXPANSION_JOINT'
  | 'RESTRAINER'
  | 'LINE_STOP'
  | 'CAP_SLEEVE'
  | 'CUSTOM_ENGINEERED'
  | 'UNKNOWN';

export type ProductMaterialClass =
  | 'CARBON_STEEL'
  | 'STAINLESS'
  | 'DUCTILE_IRON'
  | 'CASTING'
  | 'MIXED_MATERIAL'
  | 'UNKNOWN';

export type ProductSizeClass = 'SMALL' | 'MEDIUM' | 'LARGE' | 'CUSTOM' | 'UNKNOWN';

export type ProductOutletClass =
  | 'UNDER_12_INCH'
  | 'OVER_12_INCH'
  | 'LARGE_OUTLET'
  | 'NO_OUTLET'
  | 'UNKNOWN';

export type FinishHint =
  | 'STANDARD_SHOP_COAT'
  | 'FUSION_PLASTIC_COATING'
  | 'FUSION_EPOXY_COATING'
  | 'OPTIONAL_FUSION_EPOXY'
  | 'PASSIVATION'
  | 'STAINLESS_NO_PAINT_ASSUMED'
  | 'PASSIVATION_CONFIRM'
  | 'MIXED_MATERIAL_REVIEW'
  | 'CUSTOM_FINISH_REVIEW'
  | 'UNKNOWN_CONFIRM';

export type ClassificationConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'REVIEW';

export type QaReason =
  | 'engineered'
  | 'return'
  | 'spot_check'
  | 'assigned'
  | 'hold'
  | 'customer_requirement'
  | 'issue'
  | 'not_required'
  | 'unknown';

export type ProductClassificationRule = {
  modelSignals: string[];
  label: string;
  productLine: ProductLine;
  productFamily: ClassifiedProductFamily;
  materialClass: ProductMaterialClass;
  sizeClass?: ProductSizeClass;
  outletClass?: ProductOutletClass;
  finishHints: FinishHint[];
  routeHint: Department[];
  departmentOwnershipHint: string[];
  engineeredRequired?: boolean;
  qaRequired?: boolean;
  qaReason?: QaReason;
  confidence: ClassificationConfidence;
  needsHumanReview?: boolean;
  reviewReason?: string;
};

export type ProductClassification = {
  modelSignal?: string;
  matchedRule?: ProductClassificationRule;
  productLine: ProductLine;
  productFamily: ClassifiedProductFamily;
  materialClass: ProductMaterialClass;
  sizeClass: ProductSizeClass;
  outletClass: ProductOutletClass;
  finishHints: FinishHint[];
  engineeredRequired: boolean;
  qaRequired: boolean;
  qaReason: QaReason;
  routeHint: Department[];
  departmentOwnershipHint: string[];
  confidence: ClassificationConfidence;
  needsHumanReview: boolean;
  reviewReasons: string[];
};
