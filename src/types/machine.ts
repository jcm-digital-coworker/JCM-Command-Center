export type Tool = {
  toolNumber: string;
  description: string;
  weight: "LIGHT" | "MEDIUM" | "HEAVY";
};

export type Department =
  | "Receiving"
  | "Machine Shop"
  | "Material Handling"
  | "Fab"
  | "Coating"
  | "Assembly"
  | "Saddles Dept"
  | "Patch Clamps"
  | "Clamps"
  | "QA"
  | "Shipping"
  | "Maintenance"
  | "Office";

export type SpindleLoadEvent = {
  time: string;
  percent: number;
  label: string;
};

export type MachineEvent = {
  time: string;
  type: "TOOL_CHANGE" | "ALARM" | "SETUP" | "RUN" | "OFFLINE";
  text: string;
};

export type SimulationStatus = "READY" | "CAUTION" | "BLOCKED";

export type Machine = {
  id: string;
  name: string;
  department: Department;
  control: string;
  suite: string;
  state: "RUNNING" | "IDLE" | "ALARM" | "OFFLINE";
  program: string;
  alarmPriority: "NORMAL" | "RESET" | "ALARM" | "ESTOP";
  lastTool: Tool;
  behaviorTags: string[];
  lastKnownState: string;
  machinePatterns: string[];
  recentSpindleLoad: SpindleLoadEvent[];
  recentEvents: MachineEvent[];
  simulationStatus: SimulationStatus;
  simulationSummary: string;
  sourcedNotes: string[];
  lastActivity?: string;
};