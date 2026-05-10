import { findTapCode } from "./lv4500JcmSimulator";
import { simulateCycleTime } from "./timeStudy/simulateCycleTime";
import type { Lv4500CycleTimeOptions } from "../types/lv4500Jcm";
import type { BossType } from "../types/lv4500Jcm";
import type { TapCode } from "./timeStudy/types";

export type CycleTimeEstimate = {
  totalMinutes: number;
  cuttingMinutes: number;
  rapidMinutes: number;
  overheadMinutes: number;
  confidence: "rough" | "medium";
  notes: string[];
  rapidRateIpm: number;
  g28TravelX: number;
  g28TravelZ: number;
  indexingSeconds: number;
};

export const LV4500R_RAPID_RATE_IPM = 945;
export const LV4500R_G28_TRAVEL_X = 23.4;
export const LV4500R_G28_TRAVEL_Z = 10.431;
export const LV4500R_INDEX_SECONDS_PER_STEP = 0.2;

const G28_COUNT_PER_CYCLE = 6;
const TOOL_INDEX_COUNT_PER_CYCLE = 3;
const CHIP_DWELL_SECONDS = 3;

function secondsToMinutes(seconds: number) {
  return seconds / 60;
}

function normalizeDepthOverride(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  if (value === 0) return undefined;
  return Math.abs(value);
}

function parseTapCode(tapCode: string): TapCode | undefined {
  const parsed = Number(tapCode);
  if (
    parsed === 6 ||
    parsed === 7 ||
    parsed === 8 ||
    parsed === 9 ||
    parsed === 10 ||
    parsed === 11 ||
    parsed === 12 ||
    parsed === 13 ||
    parsed === 14 ||
    parsed === 15 ||
    parsed === 16
  ) {
    return parsed;
  }

  return undefined;
}

function bossTypeOrDefault(value?: BossType): BossType {
  return value ?? "large";
}

export function estimateLv4500CycleTime(
  tapCode: string,
  options: Lv4500CycleTimeOptions = {},
): CycleTimeEstimate {
  const tap = findTapCode(tapCode);
  const numericTapCode = parseTapCode(tapCode);

  if (!tap || !numericTapCode) {
    return {
      totalMinutes: 0,
      cuttingMinutes: 0,
      rapidMinutes: 0,
      overheadMinutes: 0,
      confidence: "rough",
      notes: ["Cannot estimate cycle time because tap code data is missing."],
      rapidRateIpm: LV4500R_RAPID_RATE_IPM,
      g28TravelX: LV4500R_G28_TRAVEL_X,
      g28TravelZ: LV4500R_G28_TRAVEL_Z,
      indexingSeconds: LV4500R_INDEX_SECONDS_PER_STEP,
    };
  }

  const overrideDepth = normalizeDepthOverride(options.zDepthOverride);
  const defaultThreadDepth = Math.abs(tap.threadDepth);
  const threadEndDepth = overrideDepth ?? defaultThreadDepth;
  const bossType = bossTypeOrDefault(options.bossType);

  const timeStudy = simulateCycleTime({
    bossType,
    tapCode: numericTapCode,
    bossDepthZ: tap.reliefEndZ,
    threadDepthZ: threadEndDepth,
    rapidIpm: LV4500R_RAPID_RATE_IPM,
    g28XTravel: LV4500R_G28_TRAVEL_X,
    g28ZTravel: LV4500R_G28_TRAVEL_Z,
    g28Count: G28_COUNT_PER_CYCLE,
    toolIndexSec: LV4500R_INDEX_SECONDS_PER_STEP,
    toolIndexCount: TOOL_INDEX_COUNT_PER_CYCLE,
    chipDwellSec: CHIP_DWELL_SECONDS,
    calibrationFactor: 1,
    boreCalibrationFactor: 1,
    threadCalibrationFactor: 1,
    modelMode: "shopCalibrated",
  });

  const rapidMinutes = secondsToMinutes(timeStudy.g28TimeSec);
  const overheadMinutes = secondsToMinutes(timeStudy.overheadSec);
  const cuttingMinutes = secondsToMinutes(
    timeStudy.drillTimeSec + timeStudy.boreTimeSec + timeStudy.threadTimeSec,
  );

  const notes = [
    "Uses deterministic LV4500 time-study engine from the handoff packet.",
    `Boss timing mode: ${bossType}.`,
    `Estimated G71 passes: ${timeStudy.g71Passes}.`,
    `Estimated G76 passes: ${timeStudy.g76Passes}.`,
    "Uses measured LV4500R rapid rate: 945 IPM.",
    "Uses measured G28 travel: X23.400 / Z10.431.",
    "Uses turret indexing allowance: 0.2 seconds per step.",
    ...timeStudy.warnings,
  ];

  if (overrideDepth) {
    notes.push(
      `Z-depth override adjusted from macro default ${defaultThreadDepth.toFixed(3)} in to ${threadEndDepth.toFixed(3)} in.`,
    );
  }

  notes.push("Estimate excludes operator stops, gauge hold time, manual inspection, and interruption recovery.");

  return {
    totalMinutes: timeStudy.totalMin,
    cuttingMinutes,
    rapidMinutes,
    overheadMinutes,
    confidence: "medium",
    notes,
    rapidRateIpm: LV4500R_RAPID_RATE_IPM,
    g28TravelX: LV4500R_G28_TRAVEL_X,
    g28TravelZ: LV4500R_G28_TRAVEL_Z,
    indexingSeconds: LV4500R_INDEX_SECONDS_PER_STEP,
  };
}
