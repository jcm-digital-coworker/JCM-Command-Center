export type ClassificationReviewQuestion =
  | 'ROUTE_CONFIRMED'
  | 'OUTLET_THRESHOLD_CONFIRMED'
  | 'COATING_LANE_CONFIRMED'
  | 'FUSION_EPOXY_CONFIRMED'
  | 'PASSIVATION_CONFIRMED'
  | 'STRAP_TIMING_CONFIRMED'
  | 'NOT_ENOUGH_INFO';

export type ClassificationReviewAnswer =
  | 'CONFIRMED'
  | 'NOT_CONFIRMED'
  | 'NEEDS_REVIEW'
  | 'NOT_APPLICABLE'
  | 'UNKNOWN';

export type ClassificationReviewConfirmation = {
  id: string;
  orderId: string;
  orderNumber: string;
  modelSignal?: string;
  productFamily: string;
  question: ClassificationReviewQuestion;
  answer: ClassificationReviewAnswer;
  reviewedBy: 'Floor Review' | 'Lead Review' | 'Engineering Review' | 'QA Review' | 'Unknown';
  createdAt: string;
  note?: string;
};

export type ClassificationReviewDraft = {
  question: ClassificationReviewQuestion;
  answer: ClassificationReviewAnswer;
  reviewedBy: ClassificationReviewConfirmation['reviewedBy'];
  note?: string;
};
