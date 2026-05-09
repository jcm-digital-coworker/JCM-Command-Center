import { findTapCode } from "./lv4500JcmSimulator";
import type { Lv4500CycleTimeOptions } from "../types/lv4500Jcm";

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

const TOOL_CHANGE_SECONDS = 8;
const M_CODE_SECONDS = 2;
const CHIP_CLEAN_SECONDS = 3;
const INDEX_STEPS_PER_CYCLE = 3;
const BASELINE_RAPID_CYCLES = 6;
const DEPTH_ADJUSTMENT_MINUTES_PER_INCH = 0.55;

function secondsToMinutes(seconds: number) {
  return seconds / 60;
}

function rapidMinutes(distanceInches: number) {
  return distanceInches / LV4500R_RAPID_RATE_IPM;
}

function normalizeDepthOverride(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  if (value === 0) return undefined;
  return Math.abs(value);
}

function estimateMeasuredMachineOverhead() {
  const indexingSeconds = LV4500R_INDEX_SECONDS_PER_STEP * INDEX_STEPS_PER_CYCLE;
  const overheadSeconds =
    TOOL_CHANGE_SECONDS * 3 +
    M_CODE_SECONDS * 10 +
    indexingSeconds +
    CHIP_CLEAN_SECONDS;

  return secondsToMinutes(overheadSeconds);
}

function estimateMeasuredRapidPortion() {
  const g28TravelDistance = LV4500R_G28_TRAVEL_X + LV4500R_G28_TRAVEL_Z;
  return rapidMinutes(g28TravelDistance * BASELINE_RAPID_CYCLES);
}

export function estimateLv4500CycleTime(
  tapCode: string,
  options: Lv4500CycleTimeOptions = {},
): CycleTimeEstimate {
  const tap = findTapCode(tapCode);

  if (!tap) {
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

  const notes: string[] = [];
  const overrideDepth = normalizeDepthOverride(options.zDepthOverride);
  const defaultThreadDepth = Math.abs(tap.threadDepth);
  const threadEndDepth = overrideDepth ?? defaultThreadDepth;
  const depthDelta = threadEndDepth - defaultThreadDepth;

  const rapidTravelMinutes = estimateMeasuredRapidPortion();
  const overheadMinutes = estimateMeasuredMachineOverhead();

  // Use the tap table's per-size baseline as the source of truth for practical estimate shape.
  // The previous formula rebuilt time from guessed G71/G76 pass counts and was not close enough.
  const baselineCycleMinutes = tap.estimatedCycleMinutes;
  const zDepthAdjustmentMinutes = depthDelta * DEPTH_ADJUSTMENT_MINUTES_PER_INCH;
  const totalMinutes = Math.max(baselineCycleMinutes + zDepthAdjustmentMinutes, 0);
  const cuttingMinutes = Math.max(totalMinutes - rapidTravelMinutes - overheadMinutes, 0);

  notes.push("Uses calibrated tap-code baseline time from the LV4500 suite table instead of guessed G71/G76 pass counts.");
  notes.push("Uses measured LV4500R rapid rate: 945 IPM.");
  notes.push("Uses measured G28 travel: X23.400 / Z10.431.");
  notes.push("Uses turret indexing allowance: 0.2 seconds per step.");
  if (overrideDepth) {
    notes.push(`Z-depth override adjusted from macro default ${defaultThreadDepth.toFixed(3)} in to ${threadEndDepth.toFixed(3)} in.`);
  }
  notes.push("For best accuracy, replace tap-code baseline minutes with stopwatch cycle data from the machine.");
  notes.push("Estimate excludes operator stops, gauge hold time, manual inspection, and interruption recovery.");

  return {
    totalMinutes,
    cuttingMinutes,
    rapidMinutes: rapidTravelMinutes,
    overheadMinutes,
    confidence: "medium",
    notes,
    rapidRateIpm: LV4500R_RAPID_RATE_IPM,
    g28TravelX: LV4500R_G28_TRAVEL_X,
    g28TravelZ: LV4500R_G28_TRAVEL_Z,
    indexingSeconds: LV4500R_INDEX_SECONDS_PER_STEP,
  };
}
