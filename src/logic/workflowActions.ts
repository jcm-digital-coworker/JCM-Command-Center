export type WorkflowActionType =
  | 'ENGINEERING_ESCALATION'
  | 'MATERIAL_REQUEST'
  | 'BLOCKER_RESOLUTION'
  | 'WORK_STARTED'
  | 'NOTIFICATION';

export type WorkflowActionRecord = {
  id: string;
  orderNumber: string;
  actionType: WorkflowActionType;
  department: string;
  note: string;
  createdAt: string;
};

const STORAGE_KEY = 'jcm_workflow_action_log';

export function getWorkflowActionLog(): WorkflowActionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WorkflowActionRecord[]) : [];
  } catch {
    return [];
  }
}

export function addWorkflowAction(record: Omit<WorkflowActionRecord, 'id' | 'createdAt'>) {
  const next: WorkflowActionRecord = {
    ...record,
    id: `workflow-action-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const current = getWorkflowActionLog();
  const updated = [next, ...current].slice(0, 100);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('jcm-workflow-action-log-updated'));
  return next;
}

export function clearWorkflowActionLog() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('jcm-workflow-action-log-updated'));
}
