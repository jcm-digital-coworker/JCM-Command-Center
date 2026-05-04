import { plantAssets } from '../../data/plantAssets';
import { productionOrders } from '../../data/productionOrders';
import { getRuntimeProductionOrders } from '../../logic/workflowRuntimeState';
import { AssetCard, CardGrid, CrewGuidancePanel, EmptyState, getDepartmentAssets, getDepartmentOrders, LiveCrewSection, OrderCard, PageShell, Section } from './DepartmentPageTools';
import type { DepartmentPageProps } from './DepartmentPageTools';

export default function MaterialHandlingDepartmentPage({ theme = 'dark', onGoToTab }: DepartmentPageProps) {
  const assets = getDepartmentAssets(plantAssets, 'Material Handling');
  const orders = getDepartmentOrders(getRuntimeProductionOrders(productionOrders), 'Material Handling');
  const blocked = orders.filter((order) => String(order.status).toLowerCase() === 'blocked');

  return (
    <PageShell
      title="Material Handling"
      subtitle="Cut, roll, saw, press, expand, and stage material. This page focuses on equipment constraints and the queues feeding the rest of the plant."
      theme={theme}
    >
      <Section title="Crew on Shift" theme={theme}>
        <LiveCrewSection department="Material Handling" theme={theme} onGoToTab={onGoToTab} />
      </Section>

      <Section title="Crew Guidance" theme={theme}>
        <CrewGuidancePanel department="Material Handling" orders={getRuntimeProductionOrders(productionOrders)} theme={theme} />
      </Section>

      <Section title="Equipment / Buildings" theme={theme}>
        <CardGrid>
          {assets.map((asset) => <AssetCard key={asset.id} asset={asset} theme={theme} />)}
        </CardGrid>
      </Section>

      <Section title="Orders depending on Material Handling" theme={theme}>
        {orders.length === 0 ? <EmptyState text="No orders currently routed through Material Handling." theme={theme} /> : (
          <CardGrid>{orders.map((order) => <OrderCard key={order.orderNumber} order={order} theme={theme} />)}</CardGrid>
        )}
      </Section>

      <Section title="Current MH blockers" theme={theme}>
        {blocked.length === 0 ? <EmptyState text="No Material Handling related sample blockers right now." theme={theme} /> : (
          <CardGrid>{blocked.map((order) => <OrderCard key={order.orderNumber} order={order} theme={theme} />)}</CardGrid>
        )}
      </Section>
    </PageShell>
  );
}
