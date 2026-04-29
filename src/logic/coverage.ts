import type { Department } from '../types/machine';
import type { CoverageDraft, CoveragePerson, CoverageStatus } from '../types/coverage';

export const COVERAGE_STORAGE_KEY = 'jcm_live_coverage_v1';

export function createCoveragePerson(draft: CoverageDraft): CoveragePerson {
  return {
    id: `cov-${Date.now()}`,
    ...draft,
    status: 'AVAILABLE',
    signedInAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    skillTags: [],
  };
}

export function updateCoverageStatus(person: CoveragePerson, status: CoverageStatus): CoveragePerson {
  return {
    ...person,
    status,
    assignedTo: status === 'AVAILABLE' || status === 'OFFLINE' ? undefined : person.assignedTo,
  };
}

export function assignCoveragePerson(person: CoveragePerson, assignedTo: string): CoveragePerson {
  return {
    ...person,
    status: 'ASSIGNED',
    assignedTo: assignedTo || 'Assigned work',
  };
}

export function signOutCoveragePerson(person: CoveragePerson): CoveragePerson {
  return {
    ...person,
    status: 'OFFLINE',
    assignedTo: undefined,
  };
}

export function getCoverageSummary(people: CoveragePerson[], department?: Department) {
  const visible = department ? people.filter((person) => person.department === department) : people;
  return {
    total: visible.filter((person) => person.status !== 'OFFLINE').length,
    available: visible.filter((person) => person.status === 'AVAILABLE').length,
    assigned: visible.filter((person) => person.status === 'ASSIGNED').length,
    breakCount: visible.filter((person) => person.status === 'BREAK').length,
    offline: visible.filter((person) => person.status === 'OFFLINE').length,
  };
}

export function getCoverageNextAction(people: CoveragePerson[], department?: Department): string {
  const summary = getCoverageSummary(people, department);
  if (summary.total === 0) return 'No one is signed into this area yet. Supervisor should confirm tablet roll call.';
  if (summary.available === 0 && summary.assigned > 0) return 'Everyone is assigned. Watch for new requests that need a free person.';
  if (summary.breakCount > 0) return 'Some coverage is temporarily unavailable. Avoid stacking new delivery or support work without checking load.';
  return 'Coverage is visible. Assign the next claimed task to the right available person.';
}
