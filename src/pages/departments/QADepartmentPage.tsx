import { plantAssets } from '../../data/plantAssets';
import { productionOrders } from '../../data/productionOrders';
import { getRuntimeProductionOrders } from '../../logic/workflowRuntimeState';
import {
  AssetCard, CardGrid, CrewGuidancePanel, DeptEnhancements, EmptyState,
  getDepartmentAssets, KpiStrip, LiveCrewSection, OrderCard, PageShell, Section,
} from './DepartmentPageTools';
import type { DepartmentPageProps } from './DepartmentPageTools';

export default function QADepartmentPage({ theme = 'dark', onGoToTab }: DepartmentPageProps) {
  const assets = getDepartmentAssets(plantAssets, 'QA');
  const runtimeOrders = getRuntimeProductionOrders(productionOrders);
  const qaOrders = runtimeOrders.filter((o) => o.qaStatus && o.qaStatus !== 'NOT_REQUIRED');
  const holds = qaOrders.filter((o) => o.qaStatus === 'HOLD' || o.qaStatus === 'FAILED');
  const pending = qaOrders.filter((o) => o.qaStatus === 'PENDING');
  const passed = qaOrders.filter((o) => o.qaStatus === 'PASSED' || o.qaStatus === 'RELEASED');
  const readyForShipping = passed.filter((o) => o.nextDepartment === 'Shipping');

  const total = holds.length + passed.length;
  const passRate = total > 0 ? Math.round((passed.length / total) * 100) : null;

  const kpis = [
    { label: 'HOLDS / FAILED', value: holds.length, color: holds.length > 0 ? '#ef4444' : '#64748b' },
    { label: 'PENDING CHECK', value: pending.length, color: pending.length > 0 ? '#f59e0b' : '#64748b' },
    { label: 'PASSED', value: passed.length, color: passed.length > 0 ? '#10b981' : '#64748b' },
    ...(passRate !== null
      ? [{ label: 'PASS RATE', value: `${passRate}%`, color: passRate >= 80 ? '#10b981' : passRate >= 60 ? '#f59e0b' : '#ef4444' }]
      : []),
  ];

  return (
    <PageShell
      title="QA"
      subtitle="QA is the truth layer — holds, inspections, compliance checks, and release. Nothing ships without clearing this gate. Pass rate and hold age are the key pressure signals."
      theme={theme}
    >
      <KpiStrip items={kpis} theme={theme} />
      <DeptEnhancements department="QA" theme={theme} onGoToTab={onGoToTab} />
      <Section title="Crew on Shift" theme={theme}>
        <LiveCrewSection department="QA" theme={theme} onGoToTab={onGoToTab} />
      </Section>
      <Section title="Crew Guidance" theme={theme}>
        <CrewGuidancePanel department="QA" orders={getRuntimeProductionOrders(productionOrders)} theme={theme} />
      </Section>
      <Section title="QA Layer" theme={theme}>
        <CardGrid>{assets.map((asset) => <AssetCard key={asset.id} asset={asset} theme={theme} />)}</CardGrid>
      </Section>
      <Section title={`Holds / Failures (${holds.length})`} theme={theme}>
        {holds.length === 0
          ? <EmptyState text="No QA holds or failures." theme={theme} />
          : <CardGrid>{holds.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      <Section title={`Pending Inspection (${pending.length})`} theme={theme}>
        {pending.length === 0
          ? <EmptyState text="No orders pending QA inspection." theme={theme} />
          : <CardGrid>{pending.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      <Section title={`Passed / Released (${passed.length})`} theme={theme}>
        {passed.length === 0
          ? <EmptyState text="No orders have passed QA yet." theme={theme} />
          : <CardGrid>{passed.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      {readyForShipping.length > 0 && (
        <Section title={`Ready to Release → Shipping (${readyForShipping.length})`} theme={theme}>
          <CardGrid>{readyForShipping.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
    </PageShell>
  );
}
