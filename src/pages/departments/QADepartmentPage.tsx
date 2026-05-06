import type { CSSProperties } from 'react';
import { plantAssets } from '../../data/plantAssets';
import { applyWorkflowRuntimeAction } from '../../logic/workflowRuntimeState';
import { addWorkflowAction } from '../../logic/workflowActions';
import {
  AssetCard, CardGrid, CrewGuidancePanel, DeptEnhancements, EmptyState,
  getDepartmentAssets, KpiStrip, LiveCrewSection, OrderCard, PageShell, Section,
  useRuntimeOrders,
} from './DepartmentPageTools';
import type { DepartmentPageProps } from './DepartmentPageTools';
import type { ProductionOrder } from '../../types/productionOrder';

export default function QADepartmentPage({ theme = 'dark', onGoToTab }: DepartmentPageProps) {
  const runtimeOrders = useRuntimeOrders();
  const assets = getDepartmentAssets(plantAssets, 'QA');
  const qaOrders = runtimeOrders.filter((o) => o.qaStatus && o.qaStatus !== 'NOT_REQUIRED');
  const holds = qaOrders.filter((o) => o.qaStatus === 'HOLD' || o.qaStatus === 'FAILED');
  const pending = qaOrders.filter((o) => o.qaStatus === 'PENDING');
  const passed = qaOrders.filter((o) => o.qaStatus === 'PASSED' || o.qaStatus === 'RELEASED');
  const readyForShipping = passed.filter((o) => o.nextDepartment === 'Shipping');

  const total = holds.length + passed.length;
  const passRate = total > 0 ? Math.round((passed.length / total) * 100) : null;

  function releaseToShipping(order: ProductionOrder) {
    addWorkflowAction({ orderNumber: order.orderNumber, actionType: 'BLOCKER_RESOLUTION', department: 'QA', note: 'QA released to Shipping' });
    applyWorkflowRuntimeAction(order.orderNumber, 'ADVANCE_DEPARTMENT', 'QA released to Shipping', {
      qaStatus: 'RELEASED',
      currentDepartment: 'Shipping',
      flowStatus: 'RUNNABLE',
      status: 'READY',
    });
  }

  const kpis = [
    { label: 'HOLDS / FAILED', value: holds.length, color: holds.length > 0 ? '#ef4444' : '#64748b' },
    { label: 'PENDING CHECK', value: pending.length, color: pending.length > 0 ? '#f59e0b' : '#64748b' },
    { label: 'PASSED', value: passed.length, color: passed.length > 0 ? '#10b981' : '#64748b' },
    ...(passRate !== null
      ? [{ label: 'PASS RATE', value: `${passRate}%`, color: passRate >= 80 ? '#10b981' : passRate >= 60 ? '#f59e0b' : '#ef4444' }]
      : []),
  ];

  function PassedCard({ order }: { order: ProductionOrder }) {
    const canRelease = order.nextDepartment === 'Shipping';
    return (
      <div>
        <OrderCard order={order} theme={theme} onGoToTab={onGoToTab} />
        {canRelease && (
          <button type="button" style={releaseBtnStyle(theme)} onClick={() => releaseToShipping(order)}>
            RELEASE TO SHIPPING →
          </button>
        )}
      </div>
    );
  }

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
        <CrewGuidancePanel department="QA" orders={runtimeOrders} theme={theme} />
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
          : <CardGrid>{passed.map((o) => <PassedCard key={o.orderNumber} order={o} />)}</CardGrid>}
      </Section>
      {readyForShipping.length > 0 && (
        <Section title={`Ready to Release → Shipping (${readyForShipping.length})`} theme={theme}>
          <CardGrid>{readyForShipping.map((o) => <PassedCard key={o.orderNumber} order={o} />)}</CardGrid>
        </Section>
      )}
    </PageShell>
  );
}

function releaseBtnStyle(theme: 'dark' | 'light'): CSSProperties {
  void theme;
  return {
    marginTop: 6, width: '100%', padding: '8px 12px', borderRadius: 4,
    border: '1px solid #10b981', background: 'rgba(16,185,129,0.12)', color: '#10b981',
    fontSize: 11, fontWeight: 900, letterSpacing: '0.06em', cursor: 'pointer',
  };
}
