import { plantAssets } from '../../data/plantAssets';
import { productionOrders } from '../../data/productionOrders';
import { AssetCard, CardGrid, CrewGuidancePanel, EmptyState, getDepartmentAssets, LiveCrewSection, OrderCard, PageShell, Section } from './DepartmentPageTools';
import type { DepartmentPageProps } from './DepartmentPageTools';

export default function QADepartmentPage({ theme = 'dark', onGoToTab }: DepartmentPageProps) {
  const assets = getDepartmentAssets(plantAssets, 'QA');
  const orders = productionOrders.filter((order) => order.qaStatus !== 'NOT_REQUIRED');
  const holds = orders.filter((order) => order.qaStatus === 'HOLD' || order.qaStatus === 'FAILED');
  const pending = orders.filter((order) => order.qaStatus === 'PENDING');

  return (
    <PageShell
      title="QA"
      subtitle="QA is the truth layer: testing, compliance, inspection, and release. This page focuses on holds, pending checks, and what protects Shipping from bad exits."
      theme={theme}
    >
      <Section title="Crew on Shift" theme={theme}>
        <LiveCrewSection department="QA" theme={theme} onGoToTab={onGoToTab} />
      </Section>

      <Section title="Crew Guidance" theme={theme}>
        <CrewGuidancePanel department="QA" orders={productionOrders} theme={theme} />
      </Section>

      <Section title="QA Layer" theme={theme}>
        <CardGrid>{assets.map((asset) => <AssetCard key={asset.id} asset={asset} theme={theme} />)}</CardGrid>
      </Section>

      <Section title="QA holds / failures" theme={theme}>
        {holds.length === 0 ? <EmptyState text="No QA holds or failures in sample orders." theme={theme} /> : (
          <CardGrid>{holds.map((order) => <OrderCard key={order.orderNumber} order={order} theme={theme} />)}</CardGrid>
        )}
      </Section>

      <Section title="Pending QA checks" theme={theme}>
        {pending.length === 0 ? <EmptyState text="No pending sample QA checks." theme={theme} /> : (
          <CardGrid>{pending.map((order) => <OrderCard key={order.orderNumber} order={order} theme={theme} />)}</CardGrid>
        )}
      </Section>
    </PageShell>
  );
}
