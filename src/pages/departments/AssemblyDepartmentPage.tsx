import { productionOrders } from '../../data/productionOrders';
import { getRuntimeProductionOrders } from '../../logic/workflowRuntimeState';
import { AssetCard, CardGrid, CrewGuidancePanel, EmptyState, getDepartmentOrders, LiveCrewSection, OrderCard, PageShell, Section } from './DepartmentPageTools';
import type { DepartmentPageProps } from './DepartmentPageTools';

const assemblyCells = [
  { id: 'assembly-412', name: '412 Assembly', ownerDepartment: 'Assembly' as const, physicalArea: 'Assembly', kind: 'WORK_CELL' as const, status: 'ACTIVE' as const, primaryFunction: 'Assembly cell for 412 family work.', feeds: ['QA', 'Shipping'], confidence: 'MEDIUM' as const },
  { id: 'assembly-423', name: '423 Assembly', ownerDepartment: 'Assembly' as const, physicalArea: 'Assembly', kind: 'WORK_CELL' as const, status: 'ACTIVE' as const, primaryFunction: 'Assembly cell for 423 / related small stainless work.', feeds: ['QA', 'Shipping'], confidence: 'MEDIUM' as const },
  { id: 'assembly-452', name: '452 Assembly', ownerDepartment: 'Assembly' as const, physicalArea: 'Assembly', kind: 'WORK_CELL' as const, status: 'ACTIVE' as const, primaryFunction: 'Assembly cell for larger stainless 452 work.', feeds: ['QA', 'Shipping'], confidence: 'MEDIUM' as const },
  { id: 'assembly-coupling', name: 'Coupling Assembly', ownerDepartment: 'Assembly' as const, physicalArea: 'Assembly', kind: 'WORK_CELL' as const, status: 'ACTIVE' as const, primaryFunction: 'Coupling assembly lane.', feeds: ['QA', 'Shipping'], confidence: 'MEDIUM' as const },
  { id: 'assembly-special', name: 'Special Assembly', ownerDepartment: 'Assembly' as const, physicalArea: 'Assembly', kind: 'WORK_CELL' as const, status: 'ACTIVE' as const, primaryFunction: 'Special / non-standard assembly lane.', feeds: ['QA', 'Shipping'], confidence: 'MEDIUM' as const },
];

export default function AssemblyDepartmentPage({ theme = 'dark', onGoToTab }: DepartmentPageProps) {
  const orders = getDepartmentOrders(getRuntimeProductionOrders(productionOrders), 'Assembly');
  const ready = orders.filter((order) => ['ready', 'in_progress', 'running'].includes(String(order.status).toLowerCase()));

  return (
    <PageShell
      title="Assembly"
      subtitle="Assembly is kit-readiness and final build flow. It reveals missing or bad inputs from upstream, so this page focuses on readiness and blockers."
      theme={theme}
    >
      <Section title="Crew on Shift" theme={theme}>
        <LiveCrewSection department="Assembly" theme={theme} onGoToTab={onGoToTab} />
      </Section>

      <Section title="Crew Guidance" theme={theme}>
        <CrewGuidancePanel department="Assembly" orders={getRuntimeProductionOrders(productionOrders)} theme={theme} />
      </Section>

      <Section title="Assembly Cells" theme={theme}>
        <CardGrid>{assemblyCells.map((asset) => <AssetCard key={asset.id} asset={asset} theme={theme} />)}</CardGrid>
      </Section>

      <Section title="Orders touching Assembly" theme={theme}>
        {orders.length === 0 ? <EmptyState text="No current sample orders routed through Assembly." theme={theme} /> : (
          <CardGrid>{orders.map((order) => <OrderCard key={order.orderNumber} order={order} theme={theme} />)}</CardGrid>
        )}
      </Section>

      <Section title="Ready / active build candidates" theme={theme}>
        {ready.length === 0 ? <EmptyState text="No ready assembly candidates currently shown." theme={theme} /> : (
          <CardGrid>{ready.map((order) => <OrderCard key={order.orderNumber} order={order} theme={theme} />)}</CardGrid>
        )}
      </Section>
    </PageShell>
  );
}
