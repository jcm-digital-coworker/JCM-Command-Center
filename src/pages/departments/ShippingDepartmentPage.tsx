import { plantAssets } from '../../data/plantAssets';
import { productionOrders } from '../../data/productionOrders';
import { AssetCard, CardGrid, CrewGuidancePanel, EmptyState, getDepartmentAssets, getDepartmentOrders, LiveCrewSection, OrderCard, PageShell, Section } from './DepartmentPageTools';
import type { DepartmentPageProps } from './DepartmentPageTools';

export default function ShippingDepartmentPage({ theme = 'dark' }: DepartmentPageProps) {
  const lanes = getDepartmentAssets(plantAssets, 'Shipping');
  const orders = getDepartmentOrders(productionOrders, 'Shipping');
  const readyToShip = orders.filter((order) => order.status === 'DONE' && order.qaStatus === 'PASSED');
  const waiting = orders.filter((order) => order.status !== 'DONE' || order.qaStatus !== 'PASSED');

  return (
    <PageShell
      title="Shipping"
      subtitle="Shipping is the readiness gate. It should show what can leave, what is almost ready, and what is held by QA, production, or missing components."
      theme={theme}
    >
      <Section title="Crew on Shift" theme={theme}>
        <LiveCrewSection department="Shipping" theme={theme} />
      </Section>

      <Section title="Crew Guidance" theme={theme}>
        <CrewGuidancePanel department="Shipping" orders={productionOrders} theme={theme} />
      </Section>

      <Section title="Shipping Lanes / Gates" theme={theme}>
        <CardGrid>{lanes.map((asset) => <AssetCard key={asset.id} asset={asset} theme={theme} />)}</CardGrid>
      </Section>

      <Section title="Ready to ship" theme={theme}>
        {readyToShip.length === 0 ? <EmptyState text="No sample orders are fully ship-ready yet." theme={theme} /> : (
          <CardGrid>{readyToShip.map((order) => <OrderCard key={order.orderNumber} order={order} theme={theme} />)}</CardGrid>
        )}
      </Section>

      <Section title="Not ship-ready yet" theme={theme}>
        {waiting.length === 0 ? <EmptyState text="No waiting sample orders." theme={theme} /> : (
          <CardGrid>{waiting.map((order) => <OrderCard key={order.orderNumber} order={order} theme={theme} />)}</CardGrid>
        )}
      </Section>
    </PageShell>
  );
}
