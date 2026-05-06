import { productionOrders } from '../../data/productionOrders';
import { getRuntimeProductionOrders } from '../../logic/workflowRuntimeState';
import {
  CardGrid, CrewGuidancePanel, DeptEnhancements, EmptyState,
  KpiStrip, LiveCrewSection, OrderCard, PageShell, Section,
} from './DepartmentPageTools';
import type { DepartmentPageProps } from './DepartmentPageTools';

export default function SalesDepartmentPage({ theme = 'dark', onGoToTab }: DepartmentPageProps) {
  const salesOrders = getRuntimeProductionOrders(productionOrders).filter((o) => o.workflowOrigin === 'SALES');
  const released = salesOrders.filter((o) => !!o.salesReleasedAt && o.engineeringStatus !== 'PENDING');
  const pendingEngineering = salesOrders.filter((o) => o.engineeringRequired && o.engineeringStatus === 'PENDING');
  const awaitingRelease = salesOrders.filter((o) => !o.salesReleasedAt);
  const hotOrders = salesOrders.filter((o) => ['hot', 'critical'].includes(String(o.priority).toLowerCase()));

  const kpis = [
    { label: 'TOTAL', value: salesOrders.length },
    { label: 'RELEASED', value: released.length, color: released.length > 0 ? '#10b981' : '#64748b' },
    { label: 'PENDING ENG.', value: pendingEngineering.length, color: pendingEngineering.length > 0 ? '#f59e0b' : '#64748b' },
    { label: 'AWAITING RELEASE', value: awaitingRelease.length, color: awaitingRelease.length > 0 ? '#38bdf8' : '#64748b' },
    { label: 'HOT / CRITICAL', value: hotOrders.length, color: hotOrders.length > 0 ? '#ef4444' : '#64748b' },
  ];

  return (
    <PageShell
      title="Sales"
      subtitle="Sales is the release gate. No order enters production until Sales releases it. This view tracks what's been handed off, what's blocked on engineering, and what hasn't shipped the signal yet."
      theme={theme}
    >
      <KpiStrip items={kpis} theme={theme} />
      <DeptEnhancements department="Sales" theme={theme} onGoToTab={onGoToTab} />
      <Section title="Crew on Shift" theme={theme}>
        <LiveCrewSection department="Sales" theme={theme} onGoToTab={onGoToTab} />
      </Section>
      <Section title="Crew Guidance" theme={theme}>
        <CrewGuidancePanel department="Sales" orders={getRuntimeProductionOrders(productionOrders)} theme={theme} />
      </Section>
      {hotOrders.length > 0 && (
        <Section title={`Hot / Critical Customer Orders (${hotOrders.length})`} theme={theme}>
          <CardGrid>{hotOrders.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
      <Section title={`Released to Production (${released.length})`} theme={theme}>
        {released.length === 0
          ? <EmptyState text="No Sales orders have been released to production yet." theme={theme} />
          : <CardGrid>{released.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      <Section title={`Pending Engineering Review (${pendingEngineering.length})`} theme={theme}>
        {pendingEngineering.length === 0
          ? <EmptyState text="No Sales orders are currently waiting on Engineering." theme={theme} />
          : <CardGrid>{pendingEngineering.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      <Section title={`Awaiting Sales Release (${awaitingRelease.length})`} theme={theme}>
        {awaitingRelease.length === 0
          ? <EmptyState text="No Sales orders are waiting to be released." theme={theme} />
          : <CardGrid>{awaitingRelease.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
    </PageShell>
  );
}
