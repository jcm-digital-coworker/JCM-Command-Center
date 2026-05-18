import { clearWorkflowActionLog } from './workflowActions';
import { clearWorkflowRuntimeState } from './workflowRuntimeState';
import { resetPlantSimulation, PLANT_SIMULATION_UPDATED_EVENT } from '../simulation/plantSimulation';
import { resetMaintenanceRequests } from '../data/maintenanceRequests';

export const DEMO_SESSION_RESET_EVENT = 'jcm-demo-session-reset';

const DRIFT_PRONE_STORAGE_KEYS = [
  'jcm-classification-review-target-v1',
  'jcm_coverage_people',
  'jcm_workflow_action_log',
  'jcm_workflow_runtime_state',
  'jcm_plant_simulation_session',
  'jcm_plant_simulation_events',
  'jcm_maintenance_requests',
];

export function resetDemoSessionState() {
  DRIFT_PRONE_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  clearWorkflowActionLog();
  clearWorkflowRuntimeState();
  resetMaintenanceRequests();
  resetPlantSimulation();
  clearWorkCenterQueryParam();

  window.dispatchEvent(new Event(DEMO_SESSION_RESET_EVENT));
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event(PLANT_SIMULATION_UPDATED_EVENT));
}

function clearWorkCenterQueryParam() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('wc')) return;
  url.searchParams.delete('wc');
  window.history.replaceState({}, '', url.toString());
}
