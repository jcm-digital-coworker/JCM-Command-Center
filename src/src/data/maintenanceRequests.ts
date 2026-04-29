import type { MaintenanceRequest } from "../types/maintenanceRequest";

const STORAGE_KEY = "jcm_maintenance_requests";

// Default mock data
const defaultRequests: MaintenanceRequest[] = [
  {
    id: "REQ-001",
    machineId: "wia-kh80g",
    machineName: "Wia KH80G",
    department: "Machine Shop",
    priority: "URGENT",
    problem: "Coolant leak at spindle, affecting part quality",
    submittedBy: "John (Machine Operator)",
    submittedAt: new Date().toISOString(),
    status: "NEW",
  },
  {
    id: "REQ-002",
    machineId: "yama-gv1200",
    machineName: "Yama Seiki GV-1200",
    department: "Machine Shop",
    priority: "NORMAL",
    problem: "Tool changer running slower than usual",
    submittedBy: "Mike (Machine Operator)",
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: "CLAIMED",
    claimedBy: "Steve (Maintenance)",
    claimedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "REQ-003",
    machineId: "dmg-nlx4000",
    machineName: "DMG Mori NLX 4000/750",
    department: "Machine Shop",
    priority: "LINE_DOWN",
    problem: "Chuck not gripping parts, production stopped",
    submittedBy: "Sarah (Machine Operator)",
    submittedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: "NEW",
  },
];

// Load from localStorage or use defaults
function loadRequests(): MaintenanceRequest[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load requests from localStorage:", error);
  }
  return defaultRequests;
}

// Save to localStorage
function saveRequests(requests: MaintenanceRequest[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (error) {
    console.error("Failed to save requests to localStorage:", error);
  }
}

// Initialize with loaded data
export let maintenanceRequests: MaintenanceRequest[] = loadRequests();

export function addMaintenanceRequest(request: MaintenanceRequest) {
  maintenanceRequests.push(request);
  saveRequests(maintenanceRequests);
}

export function updateMaintenanceRequest(id: string, updates: Partial<MaintenanceRequest>) {
  const index = maintenanceRequests.findIndex(r => r.id === id);
  if (index !== -1) {
    maintenanceRequests[index] = { ...maintenanceRequests[index], ...updates };
    saveRequests(maintenanceRequests);
  }
}

export function getMaintenanceRequestsByMachine(machineId: string) {
  return maintenanceRequests.filter(r => r.machineId === machineId);
}

// Reset to default data (useful for demos)
export function resetMaintenanceRequests() {
  maintenanceRequests = [...defaultRequests];
  saveRequests(maintenanceRequests);
  return maintenanceRequests;
}

// Get fresh data from storage
export function reloadMaintenanceRequests() {
  maintenanceRequests = loadRequests();
  return maintenanceRequests;
}