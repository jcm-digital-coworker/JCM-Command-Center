import type { TapCode, ThreadFamily } from "./types";

export type TapCodeData = {
  tapCode: TapCode;
  label: string;
  family: ThreadFamily;
  tpi: number;
  majorX: number;
  minorX: number;
  drillDiaX: number;
  threadSfm: number;
};

export const TAP_CODE_DATA: Record<TapCode, TapCodeData> = {
  6:  { tapCode: 6,  label: "3/4 IP/NPT",     family: "NPT",  tpi: 14,   majorX: 1.0247, minorX: 0.9105, drillDiaX: 0.906,  threadSfm: 200 },
  7:  { tapCode: 7,  label: "3/4 CC/AWWA",    family: "AWWA", tpi: 14,   majorX: 1.1040, minorX: 0.9900, drillDiaX: 0.906,  threadSfm: 200 },
  8:  { tapCode: 8,  label: "1 IP/NPT",       family: "NPT",  tpi: 11.5, majorX: 1.2833, minorX: 1.1441, drillDiaX: 0.906,  threadSfm: 200 },
  9:  { tapCode: 9,  label: "1 CC/AWWA",      family: "AWWA", tpi: 12,   majorX: 1.3320, minorX: 1.1980, drillDiaX: 0.906,  threadSfm: 200 },
  10: { tapCode: 10, label: "1-1/4 IP/NPT",   family: "NPT",  tpi: 11.5, majorX: 1.6268, minorX: 1.4876, drillDiaX: 1.456,  threadSfm: 200 },
  11: { tapCode: 11, label: "1-1/4 CC/AWWA",  family: "AWWA", tpi: 11.5, majorX: 1.7280, minorX: 1.5880, drillDiaX: 1.456,  threadSfm: 200 },
  12: { tapCode: 12, label: "1-1/2 IP/NPT",   family: "NPT",  tpi: 11.5, majorX: 1.8657, minorX: 1.7265, drillDiaX: 1.450,  threadSfm: 200 },
  13: { tapCode: 13, label: "1-1/2 CC/AWWA",  family: "AWWA", tpi: 11.5, majorX: 2.0040, minorX: 1.8640, drillDiaX: 1.750,  threadSfm: 200 },
  14: { tapCode: 14, label: "2 IP/NPT",       family: "NPT",  tpi: 11.5, majorX: 2.3387, minorX: 2.1995, drillDiaX: 1.750,  threadSfm: 200 },
  15: { tapCode: 15, label: "2 CC/AWWA",      family: "AWWA", tpi: 11.5, majorX: 2.5770, minorX: 2.4370, drillDiaX: 1.750,  threadSfm: 200 },
  16: { tapCode: 16, label: "2-1/2 IP/NPT",   family: "NPT",  tpi: 8,    majorX: 2.8195, minorX: 2.6195, drillDiaX: 1.750,  threadSfm: 200 },
};
