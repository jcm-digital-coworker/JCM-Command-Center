import { plantAssets } from '../../data/plantAssets';
import { productionOrders } from '../../data/productionOrders';
import { getRuntimeProductionOrders } from '../../logic/workflowRuntimeState';
import { AssetCard, CardGrid, CrewGuidancePanel, EmptyState, getDepartmentAssets, getDepartmentOrders, LiveCrewSection, OrderCard, PageShell, Section } from './DepartmentPageTools';
import type { DepartmentPageProps } from './DepartmentPageTools';

export default function SaddlesDepartmentPage({ theme = 'dark', onGoToTab }: DepartmentPageProps) {
  const assets = getDepartmentAssets(plantAssets, 'Saddles Dept');
  const orders = getDepartmentOrders(getRuntimeProductionOrders(productionOrders), 'Saddles Dept');
  const blocked = orders.filter((o) =>
    String(o.flowStatus).toLowerCase() === 'blocked' || (o.blockers ?? []).length > 0,
  );

  return (
    <PageShell
      title="Saddles Dept"
      subtitle="The Saddles cell runs service saddle products on the LV4500. Work here is skill-specific and cell-driven — crew availability and machine state directly gate throughput."
      theme={theme}
    >
      <Section title="Crew on Shift" theme={theme}>
        <LiveCrewSection department="Saddles Dept" theme={theme} onGoToTab={onGoToTab} />
      </Section>

      <Section title="Crew Guidance" theme={theme}>
        <CrewGuidancePanel department="Saddles Dept" orders={getRuntimeProductionOrders(productionOrders)} theme={theme} />
      </Section>

      <Section title="Saddles Equipment" theme={theme}>
        {assets.length === 0
          ? <EmptyState text="No equipment assets mapped to Saddles Dept yet." theme={theme} />
          : <CardGrid>{assets.map((a) => <AssetCard key={a.id} asset={a} theme={theme} />)}</CardGrid>}
      </Section>

      <Section title="Active Saddles Orders" theme={theme}>
        {orders.length === 0
          ? <EmptyState text="No orders currently routed through the Saddles cell." theme={theme} />
          : <CardGrid>{orders.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} />)}</CardGrid>}
      </Section>

      <Section title="Blocked" theme={theme}>
        {blocked.length === 0
          ? <EmptyState text="No blocked orders in the Saddles cell." theme={theme} />
          : <CardGrid>{blocked.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} />)}</CardGrid>}
      </Section>
    </PageShell>
  );
}
