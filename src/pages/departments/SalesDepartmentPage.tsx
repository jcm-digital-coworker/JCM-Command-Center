import { productionOrders } from '../../data/productionOrders';
import { getRuntimeProductionOrders } from '../../logic/workflowRuntimeState';
import { CardGrid, CrewGuidancePanel, EmptyState, LiveCrewSection, OrderCard, PageShell, Section } from './DepartmentPageTools';
import type { DepartmentPageProps } from './DepartmentPageTools';

export default function SalesDepartmentPage({ theme = 'dark', onGoToTab }: DepartmentPageProps) {
  const salesOrders = productionOrders.filter((o) => o.workflowOrigin === 'SALES');
  const released = salesOrders.filter((o) => !!o.salesReleasedAt && o.engineeringStatus !== 'PENDING');
  const pendingEngineering = salesOrders.filter((o) => o.engineeringRequired && o.engineeringStatus === 'PENDING');
  const awaitingRelease = salesOrders.filter((o) => !o.salesReleasedAt);

  return (
    <PageShell
      title="Sales"
      subtitle="Sales is the release gate. Orders don't enter production until Sales releases them. This view shows what's been handed off, what's blocked on engineering, and what hasn't been released yet."
      theme={theme}
    >
      <Section title="Crew on Shift" theme={theme}>
        <LiveCrewSection department="Sales" theme={theme} onGoToTab={onGoToTab} />
      </Section>

      <Section title="Crew Guidance" theme={theme}>
        <CrewGuidancePanel department="Sales" orders={getRuntimeProductionOrders(productionOrders)} theme={theme} />
      </Section>

      <Section title="Released to production" theme={theme}>
        {released.length === 0
          ? <EmptyState text="No Sales orders have been released to production yet." theme={theme} />
          : <CardGrid>{released.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} />)}</CardGrid>}
      </Section>

      <Section title="Pending engineering review" theme={theme}>
        {pendingEngineering.length === 0
          ? <EmptyState text="No Sales orders are currently waiting on Engineering." theme={theme} />
          : <CardGrid>{pendingEngineering.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} />)}</CardGrid>}
      </Section>

      <Section title="Awaiting Sales release" theme={theme}>
        {awaitingRelease.length === 0
          ? <EmptyState text="No Sales orders are waiting to be released." theme={theme} />
          : <CardGrid>{awaitingRelease.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} />)}</CardGrid>}
      </Section>
    </PageShell>
  );
}
