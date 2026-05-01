import { productionOrders } from '../../data/productionOrders';
import EngineeringBacklogPanel from '../../components/EngineeringBacklogPanel';
import { CardGrid, CrewGuidancePanel, EmptyState, LiveCrewSection, OrderCard, PageShell, Section } from './DepartmentPageTools';
import type { DepartmentPageProps } from './DepartmentPageTools';

export default function EngineeringDepartmentPage({ theme = 'dark' }: DepartmentPageProps) {
  const engineeringHolds = productionOrders.filter(
    (o) => o.engineeringRequired && o.engineeringStatus === 'PENDING',
  );
  const released = productionOrders.filter(
    (o) => o.engineeringRequired && o.engineeringStatus === 'RELEASED',
  );

  return (
    <PageShell
      title="Engineering"
      subtitle="Engineering is the blueprint and routing release gate. No engineered order can run until Engineering releases the packet. This view surfaces what's blocked, what's been released, and the full blueprint backlog."
      theme={theme}
    >
      <Section title="Crew on Shift" theme={theme}>
        <LiveCrewSection department="Engineering" theme={theme} />
      </Section>

      <Section title="Crew Guidance" theme={theme}>
        <CrewGuidancePanel department="Engineering" orders={productionOrders} theme={theme} />
      </Section>

      <Section title="Blueprint backlog" theme={theme}>
        <EngineeringBacklogPanel theme={theme} />
      </Section>

      <Section title="Engineering holds — pending release" theme={theme}>
        {engineeringHolds.length === 0
          ? <EmptyState text="No orders are currently held pending Engineering release." theme={theme} />
          : <CardGrid>{engineeringHolds.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} />)}</CardGrid>}
      </Section>

      <Section title="Engineering released" theme={theme}>
        {released.length === 0
          ? <EmptyState text="No engineered orders have been released yet." theme={theme} />
          : <CardGrid>{released.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} />)}</CardGrid>}
      </Section>
    </PageShell>
  );
}
