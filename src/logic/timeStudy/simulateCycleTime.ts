import type { CycleTimeResult, TimeStudyInputs } from "./types";
import { TAP_CODE_DATA } from "./tapCodeData";
import { estimateG71Passes, estimateG76Passes, linearDistanceXZ } from "./passEstimators";
import { getDiameterTaperPerInch, rpmFromSfm } from "./standards";
import { validateTimeStudyInput } from "./validateTimeStudyInput";

const DRILL_FEED_IPR = 0.006;
const BORE_FEED_IPR = 0.01;
const RAPID_APPROACH_ALLOWANCE_SEC = 2.5;
const M_CODE_ALLOWANCE_SEC = 1.2;
const OPTIONAL_STOP_MODEL_SEC = 0;
const THREAD_HEIGHT_INCH = 0.07;
const G76_FIRST_PASS_DEPTH_INCH = 0.014;
const G76_MIN_PASS_DEPTH_INCH = 0.006;
const G76_SPRING_PASSES = 2;

function secondsFromFeed(distanceInches: number, feedIpm: number): number {
  if (feedIpm <= 0) return 0;
  return (distanceInches / feedIpm) * 60;
}

function safePositive(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function simulateCycleTime(input: TimeStudyInputs): CycleTimeResult {
  const tap = TAP_CODE_DATA[input.tapCode];
  const warnings = validateTimeStudyInput(input);
  const bossDepth = Math.abs(input.bossDepthZ);
  const threadDepth = Math.abs(input.threadDepthZ);
  const rapidDistance = Math.abs(input.g28XTravel) + Math.abs(input.g28ZTravel);
  const g28TimeSec = input.g28Count * secondsFromFeed(rapidDistance, input.rapidIpm);

  const drillRpm = rpmFromSfm(250, Math.max(tap.drillDiaX, 0.001));
  const drillFeedIpm = drillRpm * DRILL_FEED_IPR;
  const drillTimeSec = secondsFromFeed(bossDepth, drillFeedIpm);

  const taperDiameterAtDepth = tap.minorX + bossDepth * getDiameterTaperPerInch(input.tapCode);
  const g71Passes = estimateG71Passes(tap.drillDiaX, taperDiameterAtDepth);
  const borePath = linearDistanceXZ(tap.drillDiaX, 0, taperDiameterAtDepth, bossDepth);
  const boreRpm = rpmFromSfm(775, Math.max(taperDiameterAtDepth, 0.001));
  const boreFeedIpm = boreRpm * BORE_FEED_IPR;
  const boreTimeSec = secondsFromFeed(borePath * g71Passes, boreFeedIpm) * input.boreCalibrationFactor;

  const g76Passes = estimateG76Passes({
    threadHeight: THREAD_HEIGHT_INCH,
    firstPassDepth: G76_FIRST_PASS_DEPTH_INCH,
    minPassDepth: G76_MIN_PASS_DEPTH_INCH,
    springPasses: G76_SPRING_PASSES,
  });
  const threadRpm = rpmFromSfm(tap.threadSfm, Math.max(tap.majorX, 0.001));
  const threadFeedIpm = threadRpm / tap.tpi;
  const threadStroke = threadDepth + (input.tapCode === 16 ? 0.2 : 0.1);
  const threadTimeSec = secondsFromFeed(threadStroke * g76Passes, threadFeedIpm) * input.threadCalibrationFactor;

  const overheadSec =
    g28TimeSec +
    input.toolIndexSec * input.toolIndexCount +
    input.chipDwellSec +
    RAPID_APPROACH_ALLOWANCE_SEC +
    M_CODE_ALLOWANCE_SEC +
    OPTIONAL_STOP_MODEL_SEC;

  const totalSec = safePositive(
    (drillTimeSec + boreTimeSec + threadTimeSec + overheadSec) * input.calibrationFactor,
  );

  return {
    tapCode: input.tapCode,
    label: tap.label,
    bossType: input.bossType,
    drillTimeSec,
    boreTimeSec,
    threadTimeSec,
    overheadSec,
    g71Passes,
    g76Passes,
    g28TimeSec,
    totalSec,
    totalMin: totalSec / 60,
    partsPerHour: totalSec > 0 ? 3600 / totalSec : 0,
    warnings,
    confidence: {
      overhead: "high",
      drill: "medium",
      bore: "medium",
      thread: "medium-low",
    },
  };
}
