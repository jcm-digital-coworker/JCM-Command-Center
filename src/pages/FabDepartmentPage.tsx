import { plantAssets } from '../../data/plantAssets';
import { productionOrders } from '../../data/productionOrders';
import { AssetCard, CardGrid, EmptyState, getDepartmentAssets, OrderCard, PageShell, Section } from './DepartmentPageTools';
import type { DepartmentPageProps } from './DepartmentPageTools';

export default function FabDepartmentPage({ theme = 'dark' }: DepartmentPageProps) {
  const cells = getDepartmentAssets(plantAssets, 'Fab');
  const orders = productionOrders.filter((order) => order.currentDepartment === 'Fab' || order.requiredDepartments.includes('Fab'));
  const engineered = orders.filter((order) => order.orderType === 'ENGINEERED');

  return (
    <PageShell
      title="Fab"
      subtitle="Fab is cell and skill driven, not machine driven. This view keeps Industrial, Special, 412, 452, and 432 work visible as separate capacity lanes."
      theme={theme}
    >
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
