import { plantAssets } from '../../data/plantAssets';
import { productionOrders } from '../../data/productionOrders';
import { AssetCard, CardGrid, CrewGuidancePanel, EmptyState, getDepartmentAssets, getDepartmentOrders, OrderCard, PageShell, Section } from './DepartmentPageTools';
import type { DepartmentPageProps } from './DepartmentPageTools';

export default function CoatingDepartmentPage({ theme = 'dark' }: DepartmentPageProps) {
  const zones = getDepartmentAssets(plantAssets, 'Coating');
  const orders = getDepartmentOrders(productionOrders, 'Coating');
  const holds = orders.filter((order) => order.blockedReason === 'WAITING_ON_COATING' || order.qaStatus === 'HOLD');

  return (
    <PageShell
      title="Coating"
      subtitle="Coating is process-zone based: blast, enamel, dip, passivation, and cure/finish flow. The page avoids pretending this area is just another machine list."
      theme={theme}
    >
      <Section title="Crew Guidance" theme={theme}>
        <CrewGuidancePanel department="Coating" orders={productionOrders} theme={theme} />
      </Section>

      <Section title="Process Zones" theme={theme}>
        <CardGrid>{zones.map((asset) => <AssetCard key={asset.id} asset={asset} theme={theme} />)}</CardGrid>
      </Section>

      <Section title="Orders touching Coating" theme={theme}>
        {orders.length === 0 ? <EmptyState text="No current sample orders routed through Coating." theme={theme} /> : (
          <CardGrid>{orders.map((order) => <OrderCard key={order.orderNumber} order={order} theme={theme} />)}</CardGrid>
        )}
      </Section>

      <Section title="Coating / finish holds" theme={theme}>
        {holds.length === 0 ? <EmptyState text="No coating-related holds currently shown." theme={theme} /> : (
          <CardGrid>{holds.map((order) => <OrderCard key={order.orderNumber} order={order} theme={theme} />)}</CardGrid>
        )}
      </Section>
    </PageShell>
  );
}
