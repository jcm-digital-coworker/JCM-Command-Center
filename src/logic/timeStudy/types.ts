export type BossType = "small" | "large";
export type ThreadFamily = "NPT" | "AWWA";
export type ModelMode = "asProgrammed" | "standardCorrected" | "shopCalibrated";
export type TapCode = 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

export type TimeStudyInputs = {
  bossType: BossType;
  tapCode: TapCode;
  bossDepthZ: number;
  threadDepthZ: number;
  rapidIpm: number;
  g28XTravel: number;
  g28ZTravel: number;
  g28Count: number;
  toolIndexSec: number;
  toolIndexCount: number;
  chipDwellSec: number;
  calibrationFactor: number;
  boreCalibrationFactor: number;
  threadCalibrationFactor: number;
  modelMode: ModelMode;
};

export type CycleTimeResult = {
  tapCode: TapCode;
  label: string;
  bossType: BossType;
  drillTimeSec: number;
  boreTimeSec: number;
  threadTimeSec: number;
  overheadSec: number;
  g71Passes: number;
  g76Passes: number;
  g28TimeSec: number;
  totalSec: number;
  totalMin: number;
  partsPerHour: number;
  warnings: string[];
  confidence: {
    overhead: "high";
    drill: "medium";
    bore: "medium";
    thread: "medium-low";
  };
};
