import { plantAssets } from '../../data/plantAssets';
import { productionOrders } from '../../data/productionOrders';
import { AssetCard, CardGrid, CrewGuidancePanel, EmptyState, getDepartmentAssets, getDepartmentOrders, LiveCrewSection, OrderCard, PageShell, Section } from './DepartmentPageTools';
import type { DepartmentPageProps } from './DepartmentPageTools';

export default function FabDepartmentPage({ theme = 'dark', onGoToTab }: DepartmentPageProps) {
  const cells = getDepartmentAssets(plantAssets, 'Fab');
  const orders = getDepartmentOrders(productionOrders, 'Fab');
  const engineered = orders.filter((order) => order.orderType === 'ENGINEERED' || order.productFamily === 'ENGINEERED_FITTING');

  return (
    <PageShell
      title="Fab"
      subtitle="Fab is cell and skill driven, not machine driven. This view keeps Industrial, Special, 412, 452, and 432 work visible as separate capacity lanes."
      theme={theme}
    >
      <Section title="Crew on Shift" theme={theme}>
        <LiveCrewSection department="Fab" theme={theme} onGoToTab={onGoToTab} />
      </Section>

      <Section title="Crew Guidance" theme={theme}>
        <CrewGuidancePanel department="Fab" orders={productionOrders} theme={theme} />
      </Section>

      <Section title="Fab Work Cells" theme={theme}>
        <CardGrid>{cells.map((asset) => <AssetCard key={asset.id} asset={asset} theme={theme} />)}</CardGrid>
      </Section>

      <Section title="Fab Orders / Work Touches" theme={theme}>
        {orders.length === 0 ? <EmptyState text="No current sample orders routed through Fab." theme={theme} /> : (
          <CardGrid>{orders.map((order) => <OrderCard key={order.orderNumber} order={order} theme={theme} />)}</CardGrid>
        )}
      </Section>

      <Section title="Engineered / Higher-variability work" theme={theme}>
        {engineered.length === 0 ? <EmptyState text="No engineered sample orders currently shown for Fab." theme={theme} /> : (
          <CardGrid>{engineered.map((order) => <OrderCard key={order.orderNumber} order={order} theme={theme} />)}</CardGrid>
        )}
      </Section>
    </PageShell>
  );
}
