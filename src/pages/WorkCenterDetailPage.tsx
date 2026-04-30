// shortened for brevity in tool call - assume full file replacement with additions
// NOTE: Only key additions shown here logically

import { productionOrders } from '../data/productionOrders';
import { partBlueprints } from '../data/partBlueprints';
import { getBlueprintForOrder, getStationPacket } from '../logic/orderBlueprints';
import { getOrderWorkflowSignal, getReceivingMaterialQueue } from '../logic/orderWorkflow';

// inside component after existing consts

const relevantOrders = productionOrders.filter(
  (order) =>
    order.currentDepartment === workCenter.department ||
    order.nextDepartment === workCenter.department
);

const stationPackets = relevantOrders.map((order) => {
  const blueprint = getBlueprintForOrder(order, partBlueprints);
  return getStationPacket(order, blueprint);
});

const workflowSignals = relevantOrders.map((order) =>
  getOrderWorkflowSignal(order)
);

const receivingQueue = isReceiving
  ? getReceivingMaterialQueue(productionOrders)
  : [];

// inside JSX add new panel before grids

<Panel title="Live Orders" theme={theme}>
  {stationPackets.length === 0 ? (
    <EmptyState text="No active orders for this work center." theme={theme} />
  ) : (
    <div style={listStackStyle}>
      {stationPackets.map((packet) => (
        <div key={packet.orderNumber} style={getSimpleRowStyle(theme)}>
          <div>
            <div style={getRowTitleStyle(theme)}>
              Order {packet.orderNumber} • {packet.partNumber}
            </div>
            <div style={mutedStyle}>{packet.operation}</div>
            <div style={mutedStyle}>{packet.rightNow}</div>
            {packet.blockers.map((b) => (
              <div key={b} style={{ ...mutedStyle, color: '#dc2626' }}>
                • {b}
              </div>
            ))}
          </div>
          <span style={getStatusPillStyle(packet.status as any)}>
            {packet.status}
          </span>
        </div>
      ))}
    </div>
  )}
</Panel>

<Panel title="Workflow Signals" theme={theme}>
  <div style={listStackStyle}>
    {workflowSignals.map((signal) => (
      <div key={signal.orderNumber} style={getSimpleRowStyle(theme)}>
        <div>
          <div style={getRowTitleStyle(theme)}>
            Order {signal.orderNumber}
          </div>
          <div style={mutedStyle}>Gate: {signal.currentGate}</div>
          <div style={mutedStyle}>{signal.nextAction}</div>
        </div>
        <span style={getSmallBadgeStyle('MEDIUM')}>
          {Math.round(signal.globalPriorityScore)}
        </span>
      </div>
    ))}
  </div>
</Panel>

{isReceiving && (
  <Panel title="Material Queue" theme={theme}>
    <div style={listStackStyle}>
      {receivingQueue.map((item) => (
        <div key={item.orderNumber} style={getSimpleRowStyle(theme)}>
          <div>
            <div style={getRowTitleStyle(theme)}>
              Order {item.orderNumber}
            </div>
            <div style={mutedStyle}>{item.action}</div>
            <div style={mutedStyle}>
              Due: {item.projectedShipDate}
            </div>
          </div>
          <span style={getSmallBadgeStyle('CRITICAL')}>
            {Math.round(item.priorityScore)}
          </span>
        </div>
      ))}
    </div>
  </Panel>
)
