import type { Department } from "./machine";

export type ShiftCoverage = {
  days?: number;
  nights?: number;
  total?: number;
  note?: string;
};

export type WorkCenterStatus = "READY" | "WATCH" | "NEEDS_ATTENTION" | "PLANNED";

export type WorkCenter = {
  id: string;
  department: Department;
  name: Department;
  status: WorkCenterStatus;
  primaryFunction: string;
  dailyFocus: string[];
  roles: string[];
  coverage: ShiftCoverage;
  stationTabletDefault: string;
  nextBuildModules: string[];
};
