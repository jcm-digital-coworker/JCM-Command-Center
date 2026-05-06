import { plantAssets } from '../../data/plantAssets';
import {
  AssetCard, CardGrid, CrewGuidancePanel, DeptEnhancements, EmptyState,
  getDepartmentAssets, getDepartmentOrders, getUpstreamWaitingOrders,
  KpiStrip, LiveCrewSection, OrderCard, PageShell, Section, useRuntimeOrders,
} from './DepartmentPageTools';
import type { DepartmentPageProps } from './DepartmentPageTools';

export default function ShippingDepartmentPage({ theme = 'dark', onGoToTab }: DepartmentPageProps) {
  const runtimeOrders = useRuntimeOrders();
  const lanes = getDepartmentAssets(plantAssets, 'Shipping');
  const orders = getDepartmentOrders(runtimeOrders, 'Shipping');

  const readyToShip = orders.filter((o) => {
    const s = String(o.status).toLowerCase();
    const qa = String(o.qaStatus ?? '').toUpperCase();
    const done = s === 'done' || s === 'complete' || s === 'completed';
    const qaOk = qa === 'PASSED' || qa === 'RELEASED' || qa === 'NOT_REQUIRED';
    return done && qaOk;
  });
  const hotOrders = orders.filter((o) => ['hot', 'critical'].includes(String(o.priority).toLowerCase()));
  const waitingOnQA = getUpstreamWaitingOrders(orders, ['WAITING_ON_QA']);
  const staging = orders.filter((o) => {
    const s = String(o.status).toLowerCase();
    return s === 'in_progress' || s === 'running';
  });
  const notReady = orders.filter((o) => !readyToShip.includes(o));

  const kpis = [
    { label: 'SHIP READY', value: readyToShip.length, color: readyToShip.length > 0 ? '#10b981' : '#64748b' },
    { label: 'HOT / CRITICAL', value: hotOrders.length, color: hotOrders.length > 0 ? '#ef4444' : '#64748b' },
    { label: 'WAITING ON QA', value: waitingOnQA.length, color: waitingOnQA.length > 0 ? '#f59e0b' : '#64748b' },
    { label: 'STAGING', value: staging.length, color: staging.length > 0 ? '#a78bfa' : '#64748b' },
  ];

  return (
    <PageShell
      title="Shipping"
      subtitle="Shipping is the readiness gate — what can leave today, what is staging, and what is blocked by QA or production. Hot shipments and dock readiness are the priority signals."
      theme={theme}
    >
      <KpiStrip items={kpis} theme={theme} />
      <DeptEnhancements department="Shipping" theme={theme} onGoToTab={onGoToTab} />
      <Section title="Crew on Shift" theme={theme}>
        <LiveCrewSection department="Shipping" theme={theme} onGoToTab={onGoToTab} />
      </Section>
      <Section title="Crew Guidance" theme={theme}>
        <CrewGuidancePanel department="Shipping" orders={runtimeOrders} theme={theme} />
      </Section>
      <Section title="Shipping Lanes / Gates" theme={theme}>
        <CardGrid>{lanes.map((asset) => <AssetCard key={asset.id} asset={asset} theme={theme} />)}</CardGrid>
      </Section>
      {hotOrders.length > 0 && (
        <Section title={`Hot / Critical Shipments (${hotOrders.length})`} theme={theme}>
          <CardGrid>{hotOrders.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
      <Section title={`Ready to Ship (${readyToShip.length})`} theme={theme}>
        {readyToShip.length === 0
          ? <EmptyState text="No orders are fully ship-ready yet." theme={theme} />
          : <CardGrid>{readyToShip.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      {waitingOnQA.length > 0 && (
        <Section title={`Waiting on QA Release (${waitingOnQA.length})`} theme={theme}>
          <CardGrid>{waitingOnQA.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
      <Section title={`Not Ship-Ready (${notReady.length})`} theme={theme}>
        {notReady.length === 0
          ? <EmptyState text="All orders are either ship-ready or cleared." theme={theme} />
          : <CardGrid>{notReady.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
    </PageShell>
  );
}
