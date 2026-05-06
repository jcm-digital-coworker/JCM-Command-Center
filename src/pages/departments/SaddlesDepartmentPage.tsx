import { plantAssets } from '../../data/plantAssets';
import {
  AssetCard, CardGrid, CrewGuidancePanel, DeptEnhancements, EmptyState,
  getDepartmentAssets, getDepartmentOrders, getBlockedOrders, getHandoffReadyOrders,
  KpiStrip, LiveCrewSection, OrderCard, PageShell, Section, useRuntimeOrders,
} from './DepartmentPageTools';
import type { DepartmentPageProps } from './DepartmentPageTools';

export default function SaddlesDepartmentPage({ theme = 'dark', onGoToTab }: DepartmentPageProps) {
  const runtimeOrders = useRuntimeOrders();
  const assets = getDepartmentAssets(plantAssets, 'Saddles Dept');
  const orders = getDepartmentOrders(runtimeOrders, 'Saddles Dept');
  const blocked = getBlockedOrders(orders);
  const active = orders.filter((o) => !blocked.includes(o));
  const handoffReady = getHandoffReadyOrders(orders);

  const kpis = [
    { label: 'TOTAL', value: orders.length },
    { label: 'ACTIVE', value: active.length, color: active.length > 0 ? '#10b981' : '#64748b' },
    { label: 'BLOCKED', value: blocked.length, color: blocked.length > 0 ? '#ef4444' : '#64748b' },
    { label: 'READY TO COAT', value: handoffReady.length, color: handoffReady.length > 0 ? '#38bdf8' : '#64748b' },
  ];

  return (
    <PageShell
      title="Saddles Dept"
      subtitle="Dedicated service saddle cell — LV4500 tap drilling, saddle-specific gauges, and batch flow. Crew availability and machine state directly gate throughput. LV4500 is the primary constraint."
      theme={theme}
    >
      <KpiStrip items={kpis} theme={theme} />
      <DeptEnhancements department="Saddles Dept" theme={theme} onGoToTab={onGoToTab} />
      <Section title="Crew on Shift" theme={theme}>
        <LiveCrewSection department="Saddles Dept" theme={theme} onGoToTab={onGoToTab} />
      </Section>
      <Section title="Crew Guidance" theme={theme}>
        <CrewGuidancePanel department="Saddles Dept" orders={runtimeOrders} theme={theme} />
      </Section>
      <Section title="Saddles Equipment" theme={theme}>
        {assets.length === 0
          ? <EmptyState text="No equipment assets mapped to Saddles Dept yet." theme={theme} />
          : <CardGrid>{assets.map((a) => <AssetCard key={a.id} asset={a} theme={theme} />)}</CardGrid>}
      </Section>
      <Section title={`Active Saddles Orders (${active.length})`} theme={theme}>
        {active.length === 0
          ? <EmptyState text="No active orders in the Saddles cell." theme={theme} />
          : <CardGrid>{active.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      {blocked.length > 0 && (
        <Section title={`Blocked (${blocked.length})`} theme={theme}>
          <CardGrid>{blocked.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
      {handoffReady.length > 0 && (
        <Section title={`Ready to Hand Off → Coating (${handoffReady.length})`} theme={theme}>
          <CardGrid>{handoffReady.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
    </PageShell>
  );
}
