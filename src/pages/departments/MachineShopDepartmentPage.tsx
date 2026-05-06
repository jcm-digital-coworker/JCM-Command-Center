import { plantAssets } from '../../data/plantAssets';
import {
  AssetCard, CardGrid, CrewGuidancePanel, DeptEnhancements, EmptyState,
  getDepartmentAssets, getDepartmentOrders, getBlockedOrders, getHandoffReadyOrders,
  getUpstreamWaitingOrders,
  KpiStrip, LiveCrewSection, OrderCard, PageShell, Section, useRuntimeOrders,
} from './DepartmentPageTools';
import type { DepartmentPageProps } from './DepartmentPageTools';

export default function MachineShopDepartmentPage({ theme = 'dark', onGoToTab }: DepartmentPageProps) {
  const runtimeOrders = useRuntimeOrders();
  const assets = getDepartmentAssets(plantAssets, 'Machine Shop');
  const orders = getDepartmentOrders(runtimeOrders, 'Machine Shop');
  const blocked = getBlockedOrders(orders);
  const handoffReady = getHandoffReadyOrders(orders);

  const couplingLane = orders.filter((o) =>
    o.productLane === 'COUPLING' ||
    String(o.productFamily).toLowerCase().includes('coupling') ||
    String(o.productFamily).toLowerCase().includes('ucc'),
  );
  const engineeredLane = orders.filter((o) =>
    o.productLane === 'ENGINEERED_FITTING' ||
    (!couplingLane.includes(o) && (
      String(o.productFamily).toLowerCase().includes('engineered') ||
      String(o.productFamily).toLowerCase().includes('adapter') ||
      String(o.productFamily).toLowerCase().includes('flange')
    )),
  );
  const otherLane = orders.filter((o) => !couplingLane.includes(o) && !engineeredLane.includes(o));

  const toAssembly = orders.filter((o) => o.nextDepartment === 'Assembly');
  const toFab = orders.filter((o) => o.nextDepartment === 'Fab');
  const toOther = orders.filter(
    (o) => o.nextDepartment && o.nextDepartment !== 'Assembly' && o.nextDepartment !== 'Fab',
  );

  const waitingOnMaterial = getUpstreamWaitingOrders(orders, ['WAITING_ON_MATERIAL', 'WAITING_ON_MH', 'WAITING_ON_LASER', 'WAITING_ON_PRESS']);
  const active = orders.filter((o) => !blocked.includes(o));

  const kpis = [
    { label: 'TOTAL', value: orders.length },
    { label: 'COUPLING LANE', value: couplingLane.length, color: couplingLane.length > 0 ? '#38bdf8' : '#64748b' },
    { label: 'ENGINEERED LANE', value: engineeredLane.length, color: engineeredLane.length > 0 ? '#a78bfa' : '#64748b' },
    { label: 'ACTIVE', value: active.length, color: active.length > 0 ? '#10b981' : '#64748b' },
    { label: 'BLOCKED', value: blocked.length, color: blocked.length > 0 ? '#ef4444' : '#64748b' },
    { label: 'READY TO HAND OFF', value: handoffReady.length, color: handoffReady.length > 0 ? '#f59e0b' : '#64748b' },
  ];

  return (
    <PageShell
      title="Machine Shop"
      subtitle="CNC turning, boring, and milling — coupling ID/OD finishing, adapter flanging, and engineered spec parts. Machine alarm clears are the primary constraint. Downstream: Assembly (couplings) and Fab (engineered pieces)."
      theme={theme}
    >
      <KpiStrip items={kpis} theme={theme} />
      <DeptEnhancements department="Machine Shop" theme={theme} onGoToTab={onGoToTab} />
      <Section title="Crew on Shift" theme={theme}>
        <LiveCrewSection department="Machine Shop" theme={theme} onGoToTab={onGoToTab} />
      </Section>
      <Section title="Crew Guidance" theme={theme}>
        <CrewGuidancePanel department="Machine Shop" orders={runtimeOrders} theme={theme} />
      </Section>
      <Section title="CNC Equipment" theme={theme}>
        {assets.length === 0
          ? <EmptyState text="No equipment assets mapped to Machine Shop yet." theme={theme} />
          : <CardGrid>{assets.map((a) => <AssetCard key={a.id} asset={a} theme={theme} />)}</CardGrid>}
      </Section>
      <Section title={`Coupling Lane (${couplingLane.length})`} theme={theme}>
        {couplingLane.length === 0
          ? <EmptyState text="No coupling work currently in Machine Shop." theme={theme} />
          : <CardGrid>{couplingLane.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      <Section title={`Engineered Fitting Lane (${engineeredLane.length})`} theme={theme}>
        {engineeredLane.length === 0
          ? <EmptyState text="No engineered fitting work currently in Machine Shop." theme={theme} />
          : <CardGrid>{engineeredLane.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      {otherLane.length > 0 && (
        <Section title={`Other / Unclassified (${otherLane.length})`} theme={theme}>
          <CardGrid>{otherLane.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
      <Section title={`Downstream → Assembly (${toAssembly.length})`} theme={theme}>
        {toAssembly.length === 0
          ? <EmptyState text="No Machine Shop orders currently staged for Assembly." theme={theme} />
          : <CardGrid>{toAssembly.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      {toFab.length > 0 && (
        <Section title={`Downstream → Fab (${toFab.length})`} theme={theme}>
          <CardGrid>{toFab.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
      {toOther.length > 0 && (
        <Section title={`Downstream → Other (${toOther.length})`} theme={theme}>
          <CardGrid>{toOther.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
      {waitingOnMaterial.length > 0 && (
        <Section title={`Waiting on Material / Upstream (${waitingOnMaterial.length})`} theme={theme}>
          <CardGrid>{waitingOnMaterial.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
      {blocked.length > 0 && (
        <Section title={`Blocked (${blocked.length})`} theme={theme}>
          <CardGrid>{blocked.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
      {handoffReady.length > 0 && (
        <Section title={`Ready to Hand Off (${handoffReady.length})`} theme={theme}>
          <CardGrid>{handoffReady.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
    </PageShell>
  );
}
