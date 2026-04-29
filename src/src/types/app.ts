import type { Department } from "./machine";

export type AppTab =
  | "dashboard"
  | "machines"
  | "alerts"
  | "simulation"
  | "maintenance"
  | "receiving"
  | "coverage"
  | "orders"
  | "plantMap"
  | "materialHandling"
  | "fab"
  | "coating"
  | "assembly"
  | "shipping"
  | "qa"
  | "documents"
  | "risk";

export type DepartmentFilter = Department | "All";

export type RoleView =
  | "Operator"
  | "Forklift / Receiving"
  | "Maintenance"
  | "Lead / Supervisor"
  | "Manager";
