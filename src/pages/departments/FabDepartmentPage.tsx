import { plantAssets } from '../../data/plantAssets';
import { productionOrders } from '../../data/productionOrders';
import { getRuntimeProductionOrders } from '../../logic/workflowRuntimeState';
import {
  AssetCard, CardGrid, CrewGuidancePanel, DeptEnhancements, EmptyState,
  getDepartmentAssets, getDepartmentOrders, getBlockedOrders, getHandoffReadyOrders,
  getUpstreamWaitingOrders, KpiStrip, LiveCrewSection, OrderCard, PageShell, Section,
} from './DepartmentPageTools';
import type { DepartmentPageProps } from './DepartmentPageTools';

export default function FabDepartmentPage({ theme = 'dark', onGoToTab }: DepartmentPageProps) {
  const cells = getDepartmentAssets(plantAssets, 'Fab');
  const orders = getDepartmentOrders(getRuntimeProductionOrders(productionOrders), 'Fab');
  const blocked = getBlockedOrders(orders);
  const handoffReady = getHandoffReadyOrders(orders);
  const waitingUpstream = getUpstreamWaitingOrders(orders, [
    'WAITING_ON_MACHINE_SHOP', 'WAITING_ON_LASER', 'WAITING_ON_PRESS', 'WAITING_ON_MATERIAL',
  ]);

  const tapSleeveOrders = orders.filter((o) =>
    o.productLane === 'TAPPING_SLEEVE' || String(o.productFamily).toLowerCase().includes('tapping'),
  );
  const couplingOrders = orders.filter((o) => o.productLane === 'COUPLING');
  const engineeredOrders = orders.filter(
    (o) => o.productLane === 'ENGINEERED_FITTING' || o.orderType === 'ENGINEERED' ||
    String(o.productFamily).toLowerCase().includes('engineered'),
  );
  const ssOrders = orders.filter(
    (o) => !tapSleeveOrders.includes(o) && !couplingOrders.includes(o) && !engineeredOrders.includes(o) &&
    (String(o.productFamily).startsWith('SS') || String(o.productFamily).toLowerCase().includes('stainless')),
  );
  const standardOrders = orders.filter(
    (o) => !tapSleeveOrders.includes(o) && !couplingOrders.includes(o) &&
    !engineeredOrders.includes(o) && !ssOrders.includes(o),
  );

  const kpis = [
    { label: 'TOTAL', value: orders.length },
    { label: 'ACTIVE', value: orders.length - blocked.length, color: '#10b981' as const },
    { label: 'BLOCKED', value: blocked.length, color: blocked.length > 0 ? '#ef4444' : '#64748b' },
    { label: 'READY TO COAT', value: handoffReady.length, color: handoffReady.length > 0 ? '#38bdf8' : '#64748b' },
  ];

  return (
    <PageShell
      title="Fab"
      subtitle="Fab is cell and skill driven, not machine driven. Lanes cover 412 (carbon), 432/452 (stainless), tapping sleeves, and special/engineered work."
      theme={theme}
    >
      <KpiStrip items={kpis} theme={theme} />
      <DeptEnhancements department="Fab" theme={theme} onGoToTab={onGoToTab} />
      <Section title="Crew on Shift" theme={theme}>
        <LiveCrewSection department="Fab" theme={theme} onGoToTab={onGoToTab} />
      </Section>
      <Section title="Crew Guidance" theme={theme}>
        <CrewGuidancePanel department="Fab" orders={getRuntimeProductionOrders(productionOrders)} theme={theme} />
      </Section>
      <Section title="Fab Work Cells" theme={theme}>
        <CardGrid>{cells.map((asset) => <AssetCard key={asset.id} asset={asset} theme={theme} />)}</CardGrid>
      </Section>
      {waitingUpstream.length > 0 && (
        <Section title="Waiting on Upstream (Machine Shop / Material Handling)" theme={theme}>
          <CardGrid>{waitingUpstream.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
      <Section title={`Tapping Sleeve Lane (${tapSleeveOrders.length})`} theme={theme}>
        {tapSleeveOrders.length === 0
          ? <EmptyState text="No tapping sleeve orders in Fab." theme={theme} />
          : <CardGrid>{tapSleeveOrders.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      <Section title={`Stainless Lane — 432 / 452 (${ssOrders.length})`} theme={theme}>
        {ssOrders.length === 0
          ? <EmptyState text="No stainless orders in Fab." theme={theme} />
          : <CardGrid>{ssOrders.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      <Section title={`Coupling Lane (${couplingOrders.length})`} theme={theme}>
        {couplingOrders.length === 0
          ? <EmptyState text="No coupling orders in Fab." theme={theme} />
          : <CardGrid>{couplingOrders.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      <Section title={`Special / Engineered Lane (${engineeredOrders.length})`} theme={theme}>
        {engineeredOrders.length === 0
          ? <EmptyState text="No special or engineered orders in Fab." theme={theme} />
          : <CardGrid>{engineeredOrders.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      <Section title={`Standard / Carbon Lane — 412 (${standardOrders.length})`} theme={theme}>
        {standardOrders.length === 0
          ? <EmptyState text="No standard carbon orders in Fab." theme={theme} />
          : <CardGrid>{standardOrders.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      {handoffReady.length > 0 && (
        <Section title={`Ready to Hand Off → Coating (${handoffReady.length})`} theme={theme}>
          <CardGrid>{handoffReady.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
    </PageShell>
  );
}
