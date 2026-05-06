import {
  CardGrid, CrewGuidancePanel, DeptEnhancements, EmptyState,
  getDepartmentOrders, getBlockedOrders, getHandoffReadyOrders, getUpstreamWaitingOrders,
  KpiStrip, LiveCrewSection, OrderCard, PageShell, Section, useRuntimeOrders,
} from './DepartmentPageTools';
import type { DepartmentPageProps } from './DepartmentPageTools';

const assemblyCells = [
  { id: 'assembly-412', name: '412 Assembly', primaryFunction: '412 carbon steel lane — repair fittings, standard tapping sleeves.' },
  { id: 'assembly-432', name: '432 Assembly', primaryFunction: '432 stainless small lane.' },
  { id: 'assembly-452', name: '452 Assembly', primaryFunction: '452 stainless large lane.' },
  { id: 'assembly-coupling', name: 'Coupling Assembly', primaryFunction: 'Coupling assembly lane — UCC, expansion joints.' },
  { id: 'assembly-special', name: 'Special / Engineered Assembly', primaryFunction: 'Special and engineered fittings. Requires blueprint packet.' },
];

export default function AssemblyDepartmentPage({ theme = 'dark', onGoToTab }: DepartmentPageProps) {
  const runtimeOrders = useRuntimeOrders();
  const orders = getDepartmentOrders(runtimeOrders, 'Assembly');
  const blocked = getBlockedOrders(orders);
  const handoffReady = getHandoffReadyOrders(orders);
  const kitComplete = orders.filter((o) => o.materialStatus === 'STAGED' || o.materialStatus === 'RECEIVED');
  const waitingUpstream = getUpstreamWaitingOrders(orders, ['WAITING_ON_FAB', 'WAITING_ON_COATING', 'WAITING_ON_MATERIAL']);

  const couplingOrders = orders.filter((o) => o.productLane === 'COUPLING');
  const engineeredOrders = orders.filter(
    (o) => o.productLane === 'ENGINEERED_FITTING' || o.orderType === 'ENGINEERED' ||
    String(o.productFamily).toLowerCase().includes('engineered'),
  );
  const standardOrders = orders.filter((o) => !couplingOrders.includes(o) && !engineeredOrders.includes(o));

  const kpis = [
    { label: 'TOTAL', value: orders.length },
    { label: 'KIT COMPLETE', value: kitComplete.length, color: kitComplete.length > 0 ? '#10b981' : '#64748b' },
    { label: 'BLOCKED', value: blocked.length, color: blocked.length > 0 ? '#ef4444' : '#64748b' },
    { label: 'READY FOR QA', value: handoffReady.length, color: handoffReady.length > 0 ? '#38bdf8' : '#64748b' },
  ];

  return (
    <PageShell
      title="Assembly"
      subtitle="Assembly is kit-readiness and final build flow, lane-matched to Fab: 412, 432, 452, Special, and Couplings. Kit completeness and upstream blockers are the key signals here."
      theme={theme}
    >
      <KpiStrip items={kpis} theme={theme} />
      <DeptEnhancements department="Assembly" theme={theme} onGoToTab={onGoToTab} />
      <Section title="Crew on Shift" theme={theme}>
        <LiveCrewSection department="Assembly" theme={theme} onGoToTab={onGoToTab} />
      </Section>
      <Section title="Crew Guidance" theme={theme}>
        <CrewGuidancePanel department="Assembly" orders={runtimeOrders} theme={theme} />
      </Section>
      <Section title="Assembly Cells" theme={theme}>
        <CardGrid>{assemblyCells.map((cell) => (
          <div key={cell.id} style={{ padding: 12, borderRadius: 6, border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', background: theme === 'dark' ? '#0f172a' : '#f8fafc' }}>
            <div style={{ fontWeight: 800, color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 13 }}>{cell.name}</div>
            <div style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12, marginTop: 4 }}>{cell.primaryFunction}</div>
          </div>
        ))}</CardGrid>
      </Section>
      {waitingUpstream.length > 0 && (
        <Section title={`Waiting on Upstream — Fab / Coating (${waitingUpstream.length})`} theme={theme}>
          <CardGrid>{waitingUpstream.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
      <Section title={`Coupling Assembly Lane (${couplingOrders.length})`} theme={theme}>
        {couplingOrders.length === 0
          ? <EmptyState text="No coupling orders in Assembly." theme={theme} />
          : <CardGrid>{couplingOrders.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      <Section title={`Special / Engineered Assembly (${engineeredOrders.length})`} theme={theme}>
        {engineeredOrders.length === 0
          ? <EmptyState text="No engineered orders in Assembly." theme={theme} />
          : <CardGrid>{engineeredOrders.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      <Section title={`Standard Assembly — 412 / 432 / 452 (${standardOrders.length})`} theme={theme}>
        {standardOrders.length === 0
          ? <EmptyState text="No standard orders in Assembly." theme={theme} />
          : <CardGrid>{standardOrders.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      {handoffReady.length > 0 && (
        <Section title={`Ready to Hand Off → QA (${handoffReady.length})`} theme={theme}>
          <CardGrid>{handoffReady.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
    </PageShell>
  );
}
