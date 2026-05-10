import type { TapCode } from "./types";
import { TAP_CODE_DATA } from "./tapCodeData";

export const NPT_DIAMETER_TAPER_PER_INCH = 0.0625;
export const NPT_RADIAL_TAPER_PER_INCH = 0.03125;

export const AWWA_SMALL_DIAMETER_TAPER_PER_INCH = 1.75 / 12;
export const AWWA_SMALL_RADIAL_TAPER_PER_INCH = 1.75 / 24;

export const AWWA_LARGE_DIAMETER_TAPER_PER_INCH = 1.0 / 12;
export const AWWA_LARGE_RADIAL_TAPER_PER_INCH = 1.0 / 24;

export function getDiameterTaperPerInch(tapCode: TapCode): number {
  const data = TAP_CODE_DATA[tapCode];
  if (data.family === "NPT") return NPT_DIAMETER_TAPER_PER_INCH;
  if (tapCode === 7 || tapCode === 9) return AWWA_SMALL_DIAMETER_TAPER_PER_INCH;
  return AWWA_LARGE_DIAMETER_TAPER_PER_INCH;
}

export function getRadialTaperPerInch(tapCode: TapCode): number {
  const data = TAP_CODE_DATA[tapCode];
  if (data.family === "NPT") return NPT_RADIAL_TAPER_PER_INCH;
  if (tapCode === 7 || tapCode === 9) return AWWA_SMALL_RADIAL_TAPER_PER_INCH;
  return AWWA_LARGE_RADIAL_TAPER_PER_INCH;
}

export function rpmFromSfm(sfm: number, diameter: number): number {
  return (sfm * 3.82) / diameter;
}
