import type { TimeStudyInputs } from "./types";

export function validateTimeStudyInput(input: TimeStudyInputs): string[] {
  const warnings: string[] = [];

  if (input.bossType === "small" && input.tapCode > 10) {
    warnings.push("Small boss does not support this tap code in production mode.");
  }

  if (Math.abs(input.threadDepthZ) > Math.abs(input.bossDepthZ)) {
    warnings.push("Thread depth exceeds bore/boss relief depth.");
  }

  if (input.tapCode === 16 && Math.abs(input.bossDepthZ) < 1.3) {
    warnings.push("2-1/2 NPT may need deeper thread/bore envelope than this bossDepthZ.");
  }

  if (input.modelMode === "asProgrammed") {
    warnings.push("As Programmed mode may preserve macro behavior that differs from standards-corrected geometry.");
  }

  if (input.calibrationFactor !== 1) {
    warnings.push(`Global calibration factor is active: ${input.calibrationFactor}.`);
  }

  return warnings;
}
