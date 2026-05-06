import { plantAssets } from '../../data/plantAssets';
import {
  AssetCard, CardGrid, CrewGuidancePanel, DeptEnhancements, EmptyState,
  getDepartmentAssets, getDepartmentOrders, getBlockedOrders, getHandoffReadyOrders,
  KpiStrip, LiveCrewSection, OrderCard, PageShell, Section, useRuntimeOrders,
} from './DepartmentPageTools';
import type { DepartmentPageProps } from './DepartmentPageTools';

export default function CoatingDepartmentPage({ theme = 'dark', onGoToTab }: DepartmentPageProps) {
  const runtimeOrders = useRuntimeOrders();
  const zones = getDepartmentAssets(plantAssets, 'Coating');
  const orders = getDepartmentOrders(runtimeOrders, 'Coating');
  const blocked = getBlockedOrders(orders);
  const handoffReady = getHandoffReadyOrders(orders);

  const incoming = orders.filter((o) => {
    const s = String(o.status).toLowerCase();
    return s === 'ready' && !blocked.includes(o);
  });
  const inProcess = orders.filter((o) => {
    const s = String(o.status).toLowerCase();
    return s === 'in_progress' || s === 'running';
  });
  const holds = blocked;

  const ssOrders = orders.filter((o) =>
    String(o.productFamily).startsWith('SS') || String(o.productFamily).toLowerCase().includes('stainless'),
  );
  const carbonOrders = orders.filter((o) => !ssOrders.includes(o));

  const kpis = [
    { label: 'TOTAL', value: orders.length },
    { label: 'INCOMING', value: incoming.length, color: incoming.length > 0 ? '#38bdf8' : '#64748b' },
    { label: 'IN PROCESS', value: inProcess.length, color: inProcess.length > 0 ? '#f59e0b' : '#64748b' },
    { label: 'HOLDS', value: holds.length, color: holds.length > 0 ? '#ef4444' : '#64748b' },
    { label: 'READY TO ASSEMBLE', value: handoffReady.length, color: handoffReady.length > 0 ? '#10b981' : '#64748b' },
  ];

  return (
    <PageShell
      title="Coating"
      subtitle="Coating runs Wheelabrator blast, enamel booths, plastic dip (pizza oven + fluidized bed), shop coat line, and passivation. Process path depends on product type — SS goes passivation, carbon goes enamel or shop coat."
      theme={theme}
    >
      <KpiStrip items={kpis} theme={theme} />
      <DeptEnhancements department="Coating" theme={theme} onGoToTab={onGoToTab} />
      <Section title="Crew on Shift" theme={theme}>
        <LiveCrewSection department="Coating" theme={theme} onGoToTab={onGoToTab} />
      </Section>
      <Section title="Crew Guidance" theme={theme}>
        <CrewGuidancePanel department="Coating" orders={runtimeOrders} theme={theme} />
      </Section>
      <Section title="Process Zones" theme={theme}>
        <CardGrid>{zones.map((asset) => <AssetCard key={asset.id} asset={asset} theme={theme} />)}</CardGrid>
      </Section>
      {incoming.length > 0 && (
        <Section title={`Incoming from Fab / Saddles (${incoming.length})`} theme={theme}>
          <CardGrid>{incoming.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
      {inProcess.length > 0 && (
        <Section title={`In Process (${inProcess.length})`} theme={theme}>
          <CardGrid>{inProcess.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
      <Section title={`Stainless — Passivation Path (${ssOrders.length})`} theme={theme}>
        {ssOrders.length === 0
          ? <EmptyState text="No stainless orders in Coating." theme={theme} />
          : <CardGrid>{ssOrders.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      <Section title={`Carbon / Standard — Enamel / Shop Coat (${carbonOrders.length})`} theme={theme}>
        {carbonOrders.length === 0
          ? <EmptyState text="No carbon or standard orders in Coating." theme={theme} />
          : <CardGrid>{carbonOrders.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      {holds.length > 0 && (
        <Section title={`Coating / Finish Holds (${holds.length})`} theme={theme}>
          <CardGrid>{holds.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
      {handoffReady.length > 0 && (
        <Section title={`Ready to Hand Off → Assembly / QA (${handoffReady.length})`} theme={theme}>
          <CardGrid>{handoffReady.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
    </PageShell>
  );
}
