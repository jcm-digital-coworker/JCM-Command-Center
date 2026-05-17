export type ProgressChecklistStatus = 'planned' | 'needs-smoke-test' | 'not-wired-yet' | 'cleanup';

export type ProgressChecklistItem = {
  id: string;
  title: string;
  detail: string;
  status: ProgressChecklistStatus;
};

export const progressChecklistItems: ProgressChecklistItem[] = [
  {
    id: 'route-truth-open-items',
    title: 'Plant route truth gaps',
    detail: 'Coating lanes, couplings, clamps, patch clamps, 412/432/452, QA conditions, and shipping readiness still need confirmation.',
    status: 'not-wired-yet',
  },
];

export function progressChecklistStatusLabel(status: ProgressChecklistStatus): string {
  const labels: Record<ProgressChecklistStatus, string> = {
    planned: 'Planned',
    'needs-smoke-test': 'Needs smoke test',
    'not-wired-yet': 'Not wired yet',
    cleanup: 'Cleanup',
  };
  return labels[status];
}
