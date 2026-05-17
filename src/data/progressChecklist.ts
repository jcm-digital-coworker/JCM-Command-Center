export type ProgressChecklistStatus = 'planned' | 'needs-smoke-test' | 'plant-truth-review' | 'cleanup';

export type ProgressChecklistItem = {
  id: string;
  title: string;
  detail: string;
  status: ProgressChecklistStatus;
};

export const progressChecklistItems: ProgressChecklistItem[] = [
  {
    id: 'route-truth-open-items',
    title: 'Plant route validation',
    detail: 'Coating lanes, couplings, clamps, patch clamps, 412/432/452, QA conditions, and shipping readiness are being validated before routing guidance is expanded.',
    status: 'plant-truth-review',
  },
];

export function progressChecklistStatusLabel(status: ProgressChecklistStatus): string {
  const labels: Record<ProgressChecklistStatus, string> = {
    planned: 'Planned',
    'needs-smoke-test': 'Needs smoke test',
    'plant-truth-review': 'Plant truth review',
    cleanup: 'Cleanup',
  };
  return labels[status];
}
