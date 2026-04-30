import { productionOrders } from '../data/productionOrders';
import { partBlueprints } from '../data/partBlueprints';
import { getStationPacket, getBlueprintForOrder } from '../logic/orderBlueprints';
import { getWorkflowSignal } from '../logic/orderWorkflow';

export default function WorkCenterWorkflowPanel({ workCenter }) {
  const orders = productionOrders.filter(
    (o) => o.currentDepartment === workCenter.department || o.nextDepartment === workCenter.department
  );

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Live Workflow</h3>
      {orders.map((order) => {
        const blueprint = getBlueprintForOrder(order, partBlueprints);
        const packet = getStationPacket(order, blueprint);
        const signal = getWorkflowSignal(order);

        return (
          <div key={order.id} style={{ padding: 10, border: '1px solid #334155', marginBottom: 10 }}>
            <strong>Order {order.orderNumber}</strong>
            <div>Status: {packet.status}</div>
            <div>Gate: {signal.gate}</div>
            <div>{signal.message}</div>
            <div>Next: {signal.action}</div>
            {packet.operation && <div>Operation: {packet.operation}</div>}
            {packet.blockers?.map((b) => (
              <div key={b} style={{ color: 'red' }}>• {b}</div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
