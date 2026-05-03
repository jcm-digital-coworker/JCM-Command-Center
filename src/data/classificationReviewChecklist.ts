import type { ClassificationReviewQuestion } from '../types/classificationReview';

export type ClassificationReviewChecklistItem = {
  id: string;
  title: string;
  modelSignals: string[];
  productFamily: string;
  department: string;
  question: ClassificationReviewQuestion;
  prompt: string;
  whyItMatters: string;
  currentAppStance: string;
};

export const classificationReviewChecklist: ClassificationReviewChecklistItem[] = [
  {
    id: '412-route',
    title: '412 route path',
    modelSignals: ['412'],
    productFamily: 'TAPPING_SLEEVE',
    department: '412 Fab / Coating / 412 Assembly',
    question: 'ROUTE_CONFIRMED',
    prompt: 'Does 412 always route Material Handling / Machine Shop -> 412 Fab -> Coating -> 412 Assembly?',
    whyItMatters: 'This decides whether 412 route hints can become stronger without pretending the plant path is fully known.',
    currentAppStance: 'Keep 412 confidence at MEDIUM and keep route review warnings active.',
  },
  {
    id: '412-outlet-threshold',
    title: '412 outlet threshold',
    modelSignals: ['412'],
    productFamily: 'TAPPING_SLEEVE',
    department: '412 Fab',
    question: 'OUTLET_THRESHOLD_CONFIRMED',
    prompt: 'Is the 12 inch outlet threshold inclusive, meaning 12 inch and under stays in 412 Fab?',
    whyItMatters: 'This controls whether travelers can safely assign small-body 412 work to the 412 lane.',
    currentAppStance: 'Keep the 12 inch threshold warning active.',
  },
  {
    id: '412-shop-coat-lane',
    title: '412 shop coat lane',
    modelSignals: ['412'],
    productFamily: 'TAPPING_SLEEVE',
    department: 'Coating',
    question: 'COATING_LANE_CONFIRMED',
    prompt: 'Which exact Coating lane handles normal 412 shop coat: continuous line, large-part paint booth, enamel booth, or something else?',
    whyItMatters: 'Coating travelers need process-specific guidance, not a generic Send to Coating instruction.',
    currentAppStance: 'Keep the 412 coating lane warning active.',
  },
  {
    id: '412-fusion-epoxy-source',
    title: '412 optional fusion epoxy source',
    modelSignals: ['412'],
    productFamily: 'TAPPING_SLEEVE',
    department: 'Coating / Outsource Review',
    question: 'FUSION_EPOXY_CONFIRMED',
    prompt: 'Is optional fusion epoxy for 412 done in-house, outsourced, or order-specific?',
    whyItMatters: 'Optional finish logic must not become automatic route truth.',
    currentAppStance: 'Treat optional fusion epoxy as review-required.',
  },
  {
    id: '405-408-fusion-plastic-process',
    title: '405-408 fusion plastic process',
    modelSignals: ['405', '406', '407', '408'],
    productFamily: 'SERVICE_SADDLE',
    department: 'Coating',
    question: 'COATING_LANE_CONFIRMED',
    prompt: 'Does fusion plastic coating for 405-408 mean pizza oven -> fluidized bed?',
    whyItMatters: 'This would let coated saddle travelers name the actual plastic coating path instead of only showing a finish hint.',
    currentAppStance: 'Keep 405-408 confidence at MEDIUM until the coating sub-lane is confirmed.',
  },
  {
    id: '405-408-strap-timing',
    title: '405-408 strap coating timing',
    modelSignals: ['405', '406', '407', '408'],
    productFamily: 'SERVICE_SADDLE',
    department: 'Coating / Saddles Dept',
    question: 'STRAP_TIMING_CONFIRMED',
    prompt: 'Are coated saddle straps coated, and if yes are they coated before Saddles Dept or after Saddles Dept / LV4500 work?',
    whyItMatters: 'Strap timing changes the handoff between Coating, Press Building, and Saddles Dept.',
    currentAppStance: 'Keep strap timing as a review warning.',
  },
  {
    id: '401-404-shop-coat-lane',
    title: '401-404 shop coat lane',
    modelSignals: ['401', '402', '403', '404'],
    productFamily: 'SERVICE_SADDLE',
    department: 'Coating',
    question: 'COATING_LANE_CONFIRMED',
    prompt: 'What exact shop-coat sub-lane handles standard service saddles?',
    whyItMatters: 'The route is known, but the Coating instruction still needs lane-level clarity.',
    currentAppStance: 'Route confidence can stay HIGH, but shop-coat sub-lane review remains active.',
  },
  {
    id: '401-404-strap-timing',
    title: '401-404 strap timing',
    modelSignals: ['401', '402', '403', '404'],
    productFamily: 'SERVICE_SADDLE',
    department: 'Coating / Saddles Dept',
    question: 'STRAP_TIMING_CONFIRMED',
    prompt: 'When are 401-404 saddle straps coated, if at all?',
    whyItMatters: 'This affects whether the strap dependency is visible before or after Saddles Dept work.',
    currentAppStance: 'Keep strap timing as a review warning.',
  },
  {
    id: '502-route',
    title: '502 stainless saddle route',
    modelSignals: ['502'],
    productFamily: 'SERVICE_SADDLE',
    department: 'Receiving / Coating / Saddles Dept',
    question: 'ROUTE_CONFIRMED',
    prompt: 'Does 502 follow Receiving -> Coating/passivation -> Saddles Dept?',
    whyItMatters: '502 should not inherit the standard saddle route until its stainless/passivation path is confirmed.',
    currentAppStance: 'Keep 502 LOW confidence and human-review-required.',
  },
  {
    id: '502-passivation',
    title: '502 passivation path',
    modelSignals: ['502'],
    productFamily: 'SERVICE_SADDLE',
    department: 'Coating / Passivation Room',
    question: 'PASSIVATION_CONFIRMED',
    prompt: 'Is 502 passivated in the Coating/passivation room?',
    whyItMatters: 'Passivation must become a confirmed internal process before travelers point to it as a lane.',
    currentAppStance: 'Keep passivation as a review-required finish hint.',
  },
  {
    id: '502-strap-dependency',
    title: '502 strap dependency',
    modelSignals: ['502'],
    productFamily: 'SERVICE_SADDLE',
    department: 'Press Building / Saddles Dept',
    question: 'STRAP_TIMING_CONFIRMED',
    prompt: 'Does the Press Building strap dependency apply to 502?',
    whyItMatters: 'This decides whether 502 needs the same strap dependency visibility as other saddle families.',
    currentAppStance: 'Do not assume standard Saddles route or strap dependency until confirmed.',
  },
];
