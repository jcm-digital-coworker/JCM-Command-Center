import { productionOrders } from '../../data/productionOrders';
import { getRuntimeProductionOrders } from '../../logic/workflowRuntimeState';
import EngineeringBacklogPanel from '../../components/EngineeringBacklogPanel';
import {
  CardGrid, CrewGuidancePanel, DeptEnhancements, EmptyState,
  KpiStrip, LiveCrewSection, OrderCard, PageShell, Section,
} from './DepartmentPageTools';
import type { DepartmentPageProps } from './DepartmentPageTools';

export default function EngineeringDepartmentPage({ theme = 'dark', onGoToTab }: DepartmentPageProps) {
  const runtimeOrders = getRuntimeProductionOrders(productionOrders);
  const engineeringHolds = runtimeOrders.filter(
    (o) => o.engineeringRequired && o.engineeringStatus === 'PENDING',
  );
  const released = runtimeOrders.filter(
    (o) => o.engineeringRequired && o.engineeringStatus === 'RELEASED',
  );
  const onHold = runtimeOrders.filter(
    (o) => o.engineeringRequired && o.engineeringStatus === 'HOLD',
  );

  const now = Date.now();
  const overdue = engineeringHolds.filter((o) => {
    if (!o.lastActionAt) return true;
    return now - new Date(o.lastActionAt).getTime() > 48 * 60 * 60 * 1000;
  });

  const kpis = [
    { label: 'PENDING HOLDS', value: engineeringHolds.length, color: engineeringHolds.length > 0 ? '#ef4444' : '#64748b' },
    { label: 'RELEASED', value: released.length, color: released.length > 0 ? '#10b981' : '#64748b' },
    { label: 'ON HOLD', value: onHold.length, color: onHold.length > 0 ? '#f59e0b' : '#64748b' },
    { label: 'OVERDUE >48H', value: overdue.length, color: overdue.length > 0 ? '#dc2626' : '#64748b' },
  ];

  return (
    <PageShell
      title="Engineering"
      subtitle="Engineering owns drawing, routing, and engineered-order readiness. No engineered order can run until Engineering releases the blueprint packet. Hold age is the pressure signal."
      theme={theme}
    >
      <KpiStrip items={kpis} theme={theme} />
      <DeptEnhancements department="Engineering" theme={theme} onGoToTab={onGoToTab} />
      <Section title="Crew on Shift" theme={theme}>
        <LiveCrewSection department="Engineering" theme={theme} onGoToTab={onGoToTab} />
      </Section>
      <Section title="Crew Guidance" theme={theme}>
        <CrewGuidancePanel department="Engineering" orders={getRuntimeProductionOrders(productionOrders)} theme={theme} />
      </Section>
      <Section title="Blueprint Backlog" theme={theme}>
        <EngineeringBacklogPanel theme={theme} />
      </Section>
      {overdue.length > 0 && (
        <Section title={`Overdue Holds — No Action >48h (${overdue.length})`} theme={theme}>
          <CardGrid>{overdue.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
      <Section title={`Pending Engineering Release (${engineeringHolds.length})`} theme={theme}>
        {engineeringHolds.length === 0
          ? <EmptyState text="No orders are currently held pending Engineering release." theme={theme} />
          : <CardGrid>{engineeringHolds.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      {onHold.length > 0 && (
        <Section title={`Engineering Hold (${onHold.length})`} theme={theme}>
          <CardGrid>{onHold.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
      <Section title={`Engineering Released (${released.length})`} theme={theme}>
        {released.length === 0
          ? <EmptyState text="No engineered orders have been released yet." theme={theme} />
          : <CardGrid>{released.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
    </PageShell>
  );
}
