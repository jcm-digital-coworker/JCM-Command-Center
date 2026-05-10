export function estimateG71Passes(
  drilledHoleX: number,
  finishX: number,
  roughDepthRadial = 0.075,
): number {
  const stockDiameter = Math.max(0, finishX - drilledHoleX);
  const diameterPerPass = roughDepthRadial * 2;
  return Math.max(1, Math.ceil(stockDiameter / diameterPerPass));
}

export function linearDistanceXZ(x1: number, z1: number, x2: number, z2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
}

export function estimateG76Passes({
  threadHeight,
  firstPassDepth,
  minPassDepth,
  springPasses,
  decay = 0.85,
}: {
  threadHeight: number;
  firstPassDepth: number;
  minPassDepth: number;
  springPasses: number;
  decay?: number;
}): number {
  let remaining = Math.max(0, threadHeight);
  let passDepth = firstPassDepth;
  let roughPasses = 0;

  while (remaining > 0.00001) {
    const cut = Math.min(Math.max(passDepth, minPassDepth), remaining);
    remaining -= cut;
    roughPasses += 1;
    passDepth *= decay;
  }

  return roughPasses + springPasses;
}
