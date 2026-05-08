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
  const threadEndDepth = overrideDepth ?? Math.abs(tap.threadDepth);

  // Drill feed estimate.
  // The macro uses feed-per-rev drilling. We approximate from typical RPM already embedded by tap family.
  const drillRpm =
    tap.code === "16" ? 500 :
    ["13", "14", "15"].includes(tap.code) ? 654 :
    ["10", "11", "12"].includes(tap.code) ? 785 :
    1264;

  const drillFeedPerRev = ["11", "13"].includes(tap.code) ? 0.004 : 0.006;
  const drillIpm = drillRpm * drillFeedPerRev;
  const drillMinutes = tap.drillDepth / drillIpm;

  // Bore prep rough estimate.
  // G71 pass count is controller-generated, so this is intentionally approximate.
  const boreProfileLength = tap.boreTaperEndZ + tap.reliefEndZ + 0.35;
  const estimatedG71Passes =
    Number(tap.code) >= 14 ? 7 :
    Number(tap.code) >= 10 ? 5 :
    4;

  const boreFeedIpm = 10; // Macro uses F.01 in G99/G96 context; this is a practical simplified estimate.
  const boreMinutes = (boreProfileLength * estimatedG71Passes) / boreFeedIpm;

  // Threading estimate.
  // Thread feed per rev = 1 / TPI. RPM is derived in the macro from SFM and face major.
  const threadSfm = 200;

  const threadRpm = Math.floor((3.82 * threadSfm) / tap.faceMajor);
  const threadFeedIpm = threadRpm * (1 / tap.tpi);

  const springPassAllowance = 2;
  const roughThreadPasses =
    Number(tap.code) >= 16 ? 8 :
    Number(tap.code) >= 14 ? 7 :
    Number(tap.code) >= 10 ? 6 :
    5;

  const threadStroke = threadEndDepth + tap.threadStartPlane;
  const threadMinutes = (threadStroke * (roughThreadPasses + springPassAllowance)) / threadFeedIpm;

  const cuttingMinutes = drillMinutes + boreMinutes + threadMinutes;

  // Rapid travel estimate.
  // Uses measured LV4500R rapid rate and G28 travel supplied from the machine.
  const g28TravelDistance = LV4500R_G28_TRAVEL_X + LV4500R_G28_TRAVEL_Z;
  const rapidCycles = 6;
  const rapidTravelMinutes = rapidMinutes(g28TravelDistance * rapidCycles);

  // Overhead estimate.
  const indexingSeconds = LV4500R_INDEX_SECONDS_PER_STEP * INDEX_STEPS_PER_CYCLE;
  const overheadSeconds =
    TOOL_CHANGE_SECONDS * 3 +
    M_CODE_SECONDS * 10 +
    indexingSeconds +
    CHIP_CLEAN_SECONDS;

  const overheadMinutes = secondsToMinutes(overheadSeconds);

  const totalMinutes = cuttingMinutes + rapidTravelMinutes + overheadMinutes;

  notes.push("Estimate excludes operator stops, gauge hold time, and manual inspection.");
  notes.push("Uses measured LV4500R rapid rate: 945 IPM.");
  notes.push("Uses measured G28 travel: X23.400 / Z10.431.");
  notes.push("Uses turret indexing allowance: 0.2 seconds per step.");
  if (overrideDepth) notes.push(`Z-depth override included in threading stroke: ${threadEndDepth.toFixed(3)} in.`);
  notes.push("G71 and G76 pass counts are approximated because the control generates the exact motion internally.");

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
