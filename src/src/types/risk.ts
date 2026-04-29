export type RiskLevel = "INFO" | "WATCH" | "CAUTION" | "HIGH_RISK" | "STOP";

export type SignoffRole =
  | "None"
  | "Operator"
  | "Co-worker"
  | "Supervisor"
  | "Maintenance"
  | "Engineering";

export type SignoffStatus = "Not Required" | "Pending" | "Signed" | "Escalated";

import type { Department } from "./machine";

export type RiskItem = {
  id: string;
  machineId?: string;
  department: Department;
  title: string;
  level: RiskLevel;
  source: "Simulation" | "Maintenance" | "Setup" | "Material" | "Program" | "System";
  description: string;
  recommendedAction: string;
  status?: "OPEN" | "IN_PROGRESS" | "CLOSED" | "RESOLVED";
  severity?: string;
  category?: string;
  mitigation?: string;
  requiredSignoff: SignoffRole;
  signoffStatus: SignoffStatus;
};