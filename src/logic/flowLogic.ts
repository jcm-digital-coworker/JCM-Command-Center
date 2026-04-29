import { productFlows } from '../data/productFlows';
import type { ProductFlow } from '../types/productFlow';
import type { ProductionOrder, ProductLane } from '../types/productionOrder';

export function getOrderLane(order: ProductionOrder): ProductLane {
  if (order.productLane) return order.productLane;
  if (order.productFamily === 'SERVICE_SADDLE') return 'SERVICE_SADDLE';
  if (order.productFamily === 'COUPLING') return 'COUPLING';
  if (order.productFamily === 'TAPPING_SLEEVE') return 'TAPPING_SLEEVE';
  if (order.productFamily === 'ENGINEERED_FITTING') return 'ENGINEERED_FITTING';
  if (order.productFamily === 'PIPE_FABRICATION') return 'PIPE_FABRICATION';
  return 'OTHER';
}

export function getProductFlow(order: ProductionOrder): ProductFlow | undefined {
  return productFlows.find((flow) => flow.lane === getOrderLane(order));
}

export function getFlowBlockers(order: ProductionOrder, downAssets: string[]) {
  const flow = getProductFlow(order);
  if (!flow) return [];

  const normalizedDown = downAssets.map((asset) => asset.toLowerCase());
  return flow.dependencies.filter((dependency) => {
    if (!dependency.required) return false;
    return normalizedDown.some((down) => dependency.name.toLowerCase().includes(down));
  });
}

export function isFlowBlockedByDownAsset(order: ProductionOrder, downAssets: string[]) {
  return getFlowBlockers(order, downAssets).length > 0;
}

export function getRunnableOrders(orders: ProductionOrder[], downAssets: string[]) {
  return orders.filter((order) => !isFlowBlockedByDownAsset(order, downAssets));
}

export function getBlockedOrdersByFlow(orders: ProductionOrder[], downAssets: string[]) {
  return orders.filter((order) => isFlowBlockedByDownAsset(order, downAssets));
}
