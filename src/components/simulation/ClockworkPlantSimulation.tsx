import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Department } from '../../types/machine';
import type { FlowBlocker, ProductionOrder } from '../../types/productionOrder';
import {
  applyWorkflowRuntimeAction,
  clearWorkflowRuntimeState,
  getRuntimeProductionOrders,
  type RuntimeOrderOverride,
  type WorkflowRuntimeActionKind,
} from '../../logic/workflowRuntimeState';

type SimDepartment = Extract<Department,
  | 'Receiving'
  | 'Material Handling'
  | 'Machine Shop'
  | 'Fab'
  | 'Coating'
  | 'Saddles Dept'
  | 'Assembly'
  | 'QA'
  | 'Shipping'
>;

type SimStatus = 'WAITING' | 'ACTIVE' | 'BLOCKED' | 'READY' | 'DONE';
type SimWorkerRole = 'Receiver' | 'Material Handler' | 'Machinist' | 'Fab Lead' | 'Coating Operator' | 'Saddles Operator' | 'QA Inspector' | 'Shipping Lead';

type ClockworkOrder = {
  id: string;
  orderNumber: string;
  product: string;
  route: SimDepartment[];
  routeIndex: number;
  status: SimStatus;
  blocker?: string;
};

type ClockworkWorker = {
  id: string;
  name: string;
  role: SimWorkerRole;
  department: SimDepartment;
};

type ClockworkEvent = {
  id: string;
  tick: number;
  orderNumber: string;
  worker: string;
  department: SimDepartment;
  message: string;
  signal: 'move' | 'work' | 'block' | 'release' | 'done';
};

type ClockworkPlantSimulationProps = {
  theme?: 'dark' | 'light';
};

const startingOrders: ClockworkOrder[] = [
  {
    id: 'cw-2501',
    orderNumber: '2501',
    product: 'Standard DI saddle',
    route: ['Receiving', 'Saddles Dept', 'Coating', 'Shipping'],
    routeIndex: 0,
    status: 'WAITING',
  },
  {
    id: 'cw-2605',
    orderNumber: '2605',
    product: 'Plastic-coated saddle',
    route: ['Receiving', 'Coating', 'Saddles Dept', 'Shipping'],
    routeIndex: 0,
    status: 'WAITING',
  },
  {
    id: 'cw-2504',
    orderNumber: '2504',
    product: 'Stainless tapping sleeve',
    route: ['Receiving', 'Material Handling', 'Fab', 'Assembly', 'QA', 'Shipping'],
    routeIndex: 0,
    status: 'WAITING',
  },
  {
    id: 'cw-2509',
    orderNumber: '2509',
    product: 'DI coupling',
    route: ['Receiving', 'Machine Shop', 'Coating', 'Assembly', 'QA', 'Shipping'],
    routeIndex: 0,
    status: 'WAITING',
  },
  {
    id: 'cw-2505',
    orderNumber: '2505',
    product: 'Engineered repair sleeve',
    route: ['Receiving', 'Material Handling', 'Fab', 'Coating', 'Assembly', 'QA', 'Shipping'],
    routeIndex: 0,
    status: 'WAITING',
  },
  {
    id: 'cw-2507',
    orderNumber: '2507',
    product: 'Clamp coupling',
    route: ['Receiving', 'Material Handling', 'Coating', 'Assembly', 'QA', 'Shipping'],
    routeIndex: 0,
    status: 'WAITING',
  },
];

const workers: ClockworkWorker[] = [
  { id: 'worker-receiving', name: 'Mia', role: 'Receiver', department: 'Receiving' },
  { id: 'worker-material', name: 'Luis', role: 'Material Handler', department: 'Material Handling' },
  { id: 'worker-machine', name: 'Ray', role: 'Machinist', department: 'Machine Shop' },
  { id: 'worker-fab', name: 'Dee', role: 'Fab Lead', department: 'Fab' },
  { id: 'worker-coating', name: 'Ana', role: 'Coating Operator', department: 'Coating' },
  { id: 'worker-saddles', name: 'Bo', role: 'Saddles Operator', department: 'Saddles Dept' },
  { id: 'worker-qa', name: 'Iris', role: 'QA Inspector', department: 'QA' },
  { id: 'worker-shipping', name: 'Nate', role: 'Shipping Lead', department: 'Shipping' },
];

const blockerByDepartment: Partial<Record<SimDepartment, string>> = {
  Coating: 'Coating cure clock is not complete.',
  QA: 'Certification packet needs review.',
  Shipping: 'Forklift is tied up at another dock.',
};

export default function ClockworkPlantSimulation({ theme = 'dark' }: ClockworkPlantSimulationProps) {
  const [running, setRunning] = useState(false);
  const [speedMs, setSpeedMs] = useState(1800);
  const [tick, setTick] = useState(0);
  const [orders, setOrders] = useState<ClockworkOrder[]>(startingOrders);
  const [timeline, setTimeline] = useState<ClockworkEvent[]>([]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => stepSimulation(), speedMs);
    return () => window.clearInterval(timer);
  }, [running, speedMs, orders, tick]);

  const queues = useMemo(() => getDepartmentQueues(orders), [orders]);
  const visibleRuntimeOrders = useMemo(() => getVisibleRuntimeOrders(orders), [orders, tick]);
  const activeOrders = orders.filter((order) => order.status !== 'DONE');
  const blockedOrders = orders.filter((order) => order.status === 'BLOCKED');
  const completedOrders = orders.filter((order) => order.status === 'DONE');

  function resetSimulation() {
    setRunning(false);
    setTick(0);
    setOrders(startingOrders);
    setTimeline([]);
    clearWorkflowRuntimeState();
  }

  function stepSimulation() {
    setOrders((currentOrders) => {
      const nextTick = tick + 1;
      const targetIndex = currentOrders.findIndex((order) => order.status !== 'DONE');
      if (targetIndex < 0) {
        setRunning(false);
        return currentOrders;
      }

      const nextOrders = currentOrders.map((order) => ({ ...order }));
      const order = nextOrders[targetIndex];
      const department = order.route[order.routeIndex];
      const worker = getWorkerForDepartment(department);
      const shouldBlock = shouldCreateBlocker(order, nextTick);
      const shouldRelease = order.status === 'BLOCKED';

      let event: ClockworkEvent;

      if (shouldRelease) {
        order.status = 'READY';
        order.blocker = undefined;
        applyClockworkRuntime(order, 'RESOLVE_BLOCKER', `${worker.name} cleared the simulated blocker.`, {
          status: 'READY',
          flowStatus: 'RUNNABLE',
          currentDepartment: department,
          nextDepartment: getNextRouteDepartment(order),
          blockers: [],
          blockedReason: undefined,
        });
        event = createEvent(nextTick, order, worker, department, 'release', `${worker.name} cleared the blocker. ${order.orderNumber} is ready to continue at ${department}.`);
      } else if (shouldBlock) {
        order.status = 'BLOCKED';
        order.blocker = blockerByDepartment[department] ?? 'Supervisor review is needed.';
        applyClockworkRuntime(order, 'START_WORK', `${worker.name} flagged a simulated blocker.`, {
          status: 'BLOCKED',
          flowStatus: 'BLOCKED',
          currentDepartment: department,
          nextDepartment: getNextRouteDepartment(order),
          blockedReason: 'CLOCKWORK_PLANT_SIMULATION',
          blockers: [createClockworkBlocker(department, order.blocker)],
        });
        event = createEvent(nextTick, order, worker, department, 'block', `${worker.name} flagged ${order.orderNumber}: ${order.blocker}`);
      } else if (order.routeIndex >= order.route.length - 1) {
        order.status = 'DONE';
        applyClockworkRuntime(order, 'COMPLETE_ORDER', `${worker.name} shipped simulated order.`, {
          currentDepartment: department,
          nextDepartment: undefined,
          status: 'DONE',
          flowStatus: 'RUNNABLE',
          blockers: [],
          blockedReason: undefined,
        });
        event = createEvent(nextTick, order, worker, department, 'done', `${worker.name} shipped ${order.orderNumber}. Shipping is final.`);
      } else {
        const nextDepartment = order.route[order.routeIndex + 1];
        order.status = 'ACTIVE';
        applyClockworkRuntime(order, 'ADVANCE_DEPARTMENT', `${worker.name} moved simulated order from ${department} to ${nextDepartment}.`, {
          currentDepartment: nextDepartment,
          nextDepartment: order.route[order.routeIndex + 2],
          status: 'READY',
          flowStatus: 'RUNNABLE',
          blockers: [],
          blockedReason: undefined,
        });
        event = createEvent(nextTick, order, worker, department, 'move', `${worker.name} worked ${order.orderNumber} in ${department} and handed it to ${nextDepartment}.`);
        order.routeIndex += 1;
        order.status = 'WAITING';
      }

      setTick(nextTick);
      setTimeline((events) => [event, ...events].slice(0, 12));
      return nextOrders;
    });
  }

  return (
    <section style={shellStyle(theme)}>
      <div style={headerRowStyle}>
        <div>
          <div style={eyebrowStyle}>PLANT SIMULATION</div>
          <h3 style={titleStyle(theme)}>Clockwork Plant</h3>
          <p style={subtitleStyle}>
            Sandbox loop for existing sample orders, fake co-workers, handoffs, blockers, and plant signals. Writes local runtime overrides only.
          </p>
        </div>
        <div style={controlRowStyle}>
          <button type="button" onClick={() => setRunning((value) => !value)} style={primaryButtonStyle(running)}>
            {running ? 'STOP LOOP' : 'START LOOP'}
          </button>
          <button type="button" onClick={stepSimulation} style={secondaryButtonStyle(theme)} disabled={running}>
            STEP ONCE
          </button>
          <button type="button" onClick={resetSimulation} style={secondaryButtonStyle(theme)}>
            RESET
          </button>
        </div>
      </div>

      <div style={noticeStyle(theme)}>
        Clockwork changes should now show across Orders, Department pages, dashboards, and travelers because the loop writes to the same local runtime layer used by diagnostic simulation.
      </div>

      <div style={statusGridStyle}>
        <Metric label="Tick" value={String(tick)} theme={theme} />
        <Metric label="Running" value={running ? 'YES' : 'NO'} theme={theme} />
        <Metric label="Active Orders" value={String(activeOrders.length)} theme={theme} />
        <Metric label="Blocked" value={String(blockedOrders.length)} theme={theme} />
        <Metric label="Shipped" value={String(completedOrders.length)} theme={theme} />
      </div>

      <div style={speedRowStyle(theme)}>
        <span>Loop speed</span>
        <select value={speedMs} onChange={(event) => setSpeedMs(Number(event.target.value))} style={selectStyle(theme)}>
          <option value={2600}>Slow</option>
          <option value={1800}>Normal</option>
          <option value={900}>Fast</option>
        </select>
      </div>

      <div style={twoColumnStyle}>
        <div style={panelStyle(theme)}>
          <div style={panelTitleStyle(theme)}>Department Queues</div>
          <div style={queueGridStyle}>
            {Object.entries(queues).map(([department, queuedOrders]) => (
              <div key={department} style={queueCardStyle(theme, queuedOrders.length)}>
                <div style={queueDepartmentStyle(theme)}>{department}</div>
                <div style={queueCountStyle(theme)}>{queuedOrders.length}</div>
                <div style={queueOrdersStyle(theme)}>
                  {queuedOrders.length > 0 ? queuedOrders.map((order) => order.orderNumber).join(', ') : 'Clear'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={panelStyle(theme)}>
          <div style={panelTitleStyle(theme)}>App-Visible Runtime Orders</div>
          <div style={runtimeOrderListStyle}>
            {visibleRuntimeOrders.map((order) => (
              <div key={order.orderNumber} style={runtimeOrderStyle(theme)}>
                <strong>{order.orderNumber}</strong>
                <span>{order.currentDepartment} → {order.nextDepartment ?? 'Complete'}</span>
                <small>{String(order.status ?? 'unknown')} / {String(order.flowStatus ?? 'unknown')}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={panelStyle(theme)}>
        <div style={panelTitleStyle(theme)}>Plant Signals</div>
        <div style={signalListStyle}>
          <Signal text={blockedOrders.length > 0 ? `${blockedOrders.length} simulated blocker needs review.` : 'No simulated blockers at this tick.'} tone={blockedOrders.length > 0 ? 'warn' : 'ok'} theme={theme} />
          <Signal text={queues.Coating.length >= 2 ? 'Coating queue is building.' : 'Coating queue is stable.'} tone={queues.Coating.length >= 2 ? 'warn' : 'ok'} theme={theme} />
          <Signal text={queues.Shipping.length > 0 ? 'Shipping has product waiting at final department.' : 'No order is waiting at Shipping.'} tone={queues.Shipping.length > 0 ? 'info' : 'ok'} theme={theme} />
        </div>
      </div>

      <div style={panelStyle(theme)}>
        <div style={panelTitleStyle(theme)}>Event Timeline</div>
        {timeline.length > 0 ? (
          <div style={timelineStyle}>
            {timeline.map((event) => (
              <div key={event.id} style={eventStyle(theme, event.signal)}>
                <div style={eventTopLineStyle(theme)}>
                  Tick {event.tick} • {event.department} • {event.orderNumber}
                </div>
                <div style={eventMessageStyle(theme)}>{event.message}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={emptyTextStyle(theme)}>Start the loop or step once to create the first plant event.</div>
        )}
      </div>
    </section>
  );
}

function applyClockworkRuntime(
  order: ClockworkOrder,
  actionKind: WorkflowRuntimeActionKind,
  note: string,
  extraOverrides: Partial<RuntimeOrderOverride>,
) {
  applyWorkflowRuntimeAction(order.orderNumber, actionKind, `Clockwork Plant: ${note}`, extraOverrides);
}

function getVisibleRuntimeOrders(orders: ClockworkOrder[]): ProductionOrder[] {
  const clockworkOrderNumbers = new Set(orders.map((order) => order.orderNumber));
  return getRuntimeProductionOrders().filter((order) => clockworkOrderNumbers.has(order.orderNumber));
}

function shouldCreateBlocker(order: ClockworkOrder, nextTick: number) {
  const department = order.route[order.routeIndex];
  if (!blockerByDepartment[department]) return false;
  return (nextTick + order.routeIndex + order.orderNumber.length) % 7 === 0;
}

function createClockworkBlocker(department: SimDepartment, message: string): FlowBlocker {
  return {
    type: department === 'QA' ? 'quality' : department === 'Shipping' ? 'labor' : 'process',
    message: `Clockwork Plant: ${message}`,
  };
}

function createEvent(
  tick: number,
  order: ClockworkOrder,
  worker: ClockworkWorker,
  department: SimDepartment,
  signal: ClockworkEvent['signal'],
  message: string,
): ClockworkEvent {
  return {
    id: `${tick}-${order.id}-${signal}`,
    tick,
    orderNumber: order.orderNumber,
    worker: `${worker.name} (${worker.role})`,
    department,
    signal,
    message,
  };
}

function getWorkerForDepartment(department: SimDepartment) {
  return workers.find((worker) => worker.department === department) ?? workers[0];
}

function getNextRouteDepartment(order: ClockworkOrder): SimDepartment | undefined {
  return order.route[order.routeIndex + 1];
}

function getDepartmentQueues(orders: ClockworkOrder[]) {
  const departments: SimDepartment[] = ['Receiving', 'Material Handling', 'Machine Shop', 'Fab', 'Coating', 'Saddles Dept', 'Assembly', 'QA', 'Shipping'];
  return departments.reduce<Record<SimDepartment, ClockworkOrder[]>>((queues, department) => {
    queues[department] = orders.filter((order) => order.status !== 'DONE' && order.route[order.routeIndex] === department);
    return queues;
  }, {} as Record<SimDepartment, ClockworkOrder[]>);
}

function Metric({ label, value, theme }: { label: string; value: string; theme: 'dark' | 'light' }) {
  return (
    <div style={metricStyle(theme)}>
      <div style={metricLabelStyle}>{label}</div>
      <div style={metricValueStyle(theme)}>{value}</div>
    </div>
  );
}

function Signal({ text, tone, theme }: { text: string; tone: 'ok' | 'warn' | 'info'; theme: 'dark' | 'light' }) {
  const color = tone === 'warn' ? '#f97316' : tone === 'info' ? '#38bdf8' : '#10b981';
  return <div style={signalStyle(theme, color)}>{text}</div>;
}

function shellStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    marginBottom: 24,
    padding: 12,
    borderRadius: 10,
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
    background: theme === 'dark' ? '#0f172a' : '#ffffff',
  };
}

const headerRowStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' };
const controlRowStyle: CSSProperties = { display: 'flex', gap: 8, flexWrap: 'wrap' };
const statusGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))', gap: 8, marginTop: 12 };
const twoColumnStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginTop: 10 };
const queueGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(104px, 1fr))', gap: 7 };
const signalListStyle: CSSProperties = { display: 'grid', gap: 8 };
const timelineStyle: CSSProperties = { display: 'grid', gap: 8 };
const runtimeOrderListStyle: CSSProperties = { display: 'grid', gap: 7 };
const eyebrowStyle: CSSProperties = { color: '#f97316', fontSize: 10, fontWeight: 900, letterSpacing: '1.4px' };
const subtitleStyle: CSSProperties = { color: '#64748b', fontSize: 12, margin: '4px 0 0', maxWidth: 720, lineHeight: 1.45 };
const metricLabelStyle: CSSProperties = { color: '#64748b', fontSize: 9, fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' };

function titleStyle(theme: 'dark' | 'light'): CSSProperties {
  return { margin: '3px 0', color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 18 };
}

function noticeStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    marginTop: 10,
    padding: 9,
    borderRadius: 7,
    border: '1px solid #38bdf8',
    background: 'rgba(56,189,248,0.13)',
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    fontSize: 11,
    lineHeight: 1.35,
    fontWeight: 750,
  };
}

function metricStyle(theme: 'dark' | 'light'): CSSProperties {
  return { padding: 8, borderRadius: 8, background: theme === 'dark' ? '#111827' : '#f8fafc', border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0' };
}

function metricValueStyle(theme: 'dark' | 'light'): CSSProperties {
  return { color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 16, fontWeight: 900, marginTop: 4 };
}

function panelStyle(theme: 'dark' | 'light'): CSSProperties {
  return { marginTop: 10, padding: 10, borderRadius: 8, background: theme === 'dark' ? '#111827' : '#f8fafc', border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0' };
}

function panelTitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return { color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontWeight: 900, fontSize: 12, letterSpacing: '0.6px', marginBottom: 9, textTransform: 'uppercase' };
}

function queueCardStyle(theme: 'dark' | 'light', count: number): CSSProperties {
  return { padding: 8, borderRadius: 7, border: count > 0 ? '1px solid #38bdf8' : theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', background: count > 0 ? 'rgba(56,189,248,0.12)' : 'transparent' };
}

function queueDepartmentStyle(theme: 'dark' | 'light'): CSSProperties {
  return { color: theme === 'dark' ? '#cbd5e1' : '#334155', fontSize: 10, fontWeight: 900 };
}

function queueCountStyle(theme: 'dark' | 'light'): CSSProperties {
  return { color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 18, fontWeight: 900, marginTop: 4 };
}

function queueOrdersStyle(theme: 'dark' | 'light'): CSSProperties {
  return { color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 10, marginTop: 2, lineHeight: 1.35 };
}

function runtimeOrderStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    display: 'grid',
    gap: 2,
    padding: 8,
    borderRadius: 7,
    background: theme === 'dark' ? '#020617' : '#ffffff',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    fontSize: 11,
  };
}

function speedRowStyle(theme: 'dark' | 'light'): CSSProperties {
  return { display: 'flex', gap: 10, alignItems: 'center', marginTop: 10, color: theme === 'dark' ? '#cbd5e1' : '#334155', fontSize: 12, fontWeight: 800 };
}

function selectStyle(theme: 'dark' | 'light'): CSSProperties {
  return { background: theme === 'dark' ? '#020617' : '#ffffff', color: theme === 'dark' ? '#e2e8f0' : '#0f172a', border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1', borderRadius: 5, padding: '6px 8px', fontWeight: 800 };
}

function primaryButtonStyle(running: boolean): CSSProperties {
  return { padding: '8px 10px', borderRadius: 6, border: running ? '1px solid #ef4444' : '1px solid #10b981', background: running ? 'rgba(239,68,68,0.14)' : 'rgba(16,185,129,0.14)', color: running ? '#ef4444' : '#10b981', fontWeight: 900, cursor: 'pointer', fontSize: 10, letterSpacing: '0.7px' };
}

function secondaryButtonStyle(theme: 'dark' | 'light'): CSSProperties {
  return { padding: '8px 10px', borderRadius: 6, border: theme === 'dark' ? '1px solid #475569' : '1px solid #cbd5e1', background: theme === 'dark' ? '#111827' : '#ffffff', color: theme === 'dark' ? '#cbd5e1' : '#334155', fontWeight: 900, cursor: 'pointer', fontSize: 10, letterSpacing: '0.7px' };
}

function signalStyle(theme: 'dark' | 'light', color: string): CSSProperties {
  return { padding: 9, borderRadius: 6, border: `1px solid ${color}`, background: `${color}1f`, color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 11, fontWeight: 800, lineHeight: 1.35 };
}

function eventStyle(theme: 'dark' | 'light', signal: ClockworkEvent['signal']): CSSProperties {
  const color = signal === 'block' ? '#f97316' : signal === 'done' ? '#10b981' : signal === 'release' ? '#38bdf8' : '#64748b';
  return { padding: 9, borderRadius: 6, borderLeft: `4px solid ${color}`, background: theme === 'dark' ? '#020617' : '#ffffff', borderTop: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0', borderRight: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0', borderBottom: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0' };
}

function eventTopLineStyle(theme: 'dark' | 'light'): CSSProperties {
  return { color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px' };
}

function eventMessageStyle(theme: 'dark' | 'light'): CSSProperties {
  return { color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 12, fontWeight: 750, marginTop: 4, lineHeight: 1.35 };
}

function emptyTextStyle(theme: 'dark' | 'light'): CSSProperties {
  return { color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 700 };
}
