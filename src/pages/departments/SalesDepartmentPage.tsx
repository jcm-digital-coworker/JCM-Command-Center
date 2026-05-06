import type { CSSProperties } from 'react';
import { applyWorkflowRuntimeAction } from '../../logic/workflowRuntimeState';
import { addWorkflowAction } from '../../logic/workflowActions';
import {
  CardGrid, CrewGuidancePanel, DeptEnhancements, EmptyState,
  KpiStrip, LiveCrewSection, OrderCard, PageShell, Section, useRuntimeOrders,
} from './DepartmentPageTools';
import type { DepartmentPageProps } from './DepartmentPageTools';
import type { ProductionOrder } from '../../types/productionOrder';

export default function SalesDepartmentPage({ theme = 'dark', onGoToTab }: DepartmentPageProps) {
  const runtimeOrders = useRuntimeOrders();
  const salesOrders = runtimeOrders.filter((o) => o.workflowOrigin === 'SALES');
  const released = salesOrders.filter((o) => !!o.salesReleasedAt && o.engineeringStatus !== 'PENDING');
  const pendingEngineering = salesOrders.filter((o) => o.engineeringRequired && o.engineeringStatus === 'PENDING');
  const awaitingRelease = salesOrders.filter((o) => !o.salesReleasedAt);
  const hotOrders = salesOrders.filter((o) => ['hot', 'critical'].includes(String(o.priority).toLowerCase()));

  function releaseToProduction(order: ProductionOrder) {
    addWorkflowAction({ orderNumber: order.orderNumber, actionType: 'WORK_STARTED', department: 'Sales', note: 'Sales released order to production floor' });
    applyWorkflowRuntimeAction(order.orderNumber, 'ACKNOWLEDGE_ORDER', 'Sales released to production', {
      salesReleasedAt: new Date().toISOString(),
      flowStatus: 'RUNNABLE',
      status: 'READY',
      productionSupervisorAcknowledged: true,
    });
  }

  const kpis = [
    { label: 'TOTAL', value: salesOrders.length },
    { label: 'RELEASED', value: released.length, color: released.length > 0 ? '#10b981' : '#64748b' },
    { label: 'PENDING ENG.', value: pendingEngineering.length, color: pendingEngineering.length > 0 ? '#f59e0b' : '#64748b' },
    { label: 'AWAITING RELEASE', value: awaitingRelease.length, color: awaitingRelease.length > 0 ? '#38bdf8' : '#64748b' },
    { label: 'HOT / CRITICAL', value: hotOrders.length, color: hotOrders.length > 0 ? '#ef4444' : '#64748b' },
  ];

  function AwaitingCard({ order }: { order: ProductionOrder }) {
    const blockedOnEng = order.engineeringRequired && order.engineeringStatus === 'PENDING';
    return (
      <div>
        <OrderCard order={order} theme={theme} onGoToTab={onGoToTab} />
        {!blockedOnEng && (
          <button type="button" style={releaseBtnStyle(theme)} onClick={() => releaseToProduction(order)}>
            RELEASE TO PRODUCTION →
          </button>
        )}
      </div>
    );
  }

  return (
    <PageShell
      title="Sales"
      subtitle="Sales is the release gate. No order enters production until Sales releases it. This view tracks what's been handed off, what's blocked on engineering, and what hasn't shipped the signal yet."
      theme={theme}
    >
      <KpiStrip items={kpis} theme={theme} />
      <DeptEnhancements department="Sales" theme={theme} onGoToTab={onGoToTab} />
      <Section title="Crew on Shift" theme={theme}>
        <LiveCrewSection department="Sales" theme={theme} onGoToTab={onGoToTab} />
      </Section>
      <Section title="Crew Guidance" theme={theme}>
        <CrewGuidancePanel department="Sales" orders={runtimeOrders} theme={theme} />
      </Section>
      {hotOrders.length > 0 && (
        <Section title={`Hot / Critical Customer Orders (${hotOrders.length})`} theme={theme}>
          <CardGrid>{hotOrders.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
      <Section title={`Released to Production (${released.length})`} theme={theme}>
        {released.length === 0
          ? <EmptyState text="No Sales orders have been released to production yet." theme={theme} />
          : <CardGrid>{released.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      <Section title={`Pending Engineering Review (${pendingEngineering.length})`} theme={theme}>
        {pendingEngineering.length === 0
          ? <EmptyState text="No Sales orders are currently waiting on Engineering." theme={theme} />
          : <CardGrid>{pendingEngineering.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      <Section title={`Awaiting Sales Release (${awaitingRelease.length})`} theme={theme}>
        {awaitingRelease.length === 0
          ? <EmptyState text="No Sales orders are waiting to be released." theme={theme} />
          : <CardGrid>{awaitingRelease.map((o) => <AwaitingCard key={o.orderNumber} order={o} />)}</CardGrid>}
      </Section>
    </PageShell>
  );
}

function releaseBtnStyle(theme: 'dark' | 'light'): CSSProperties {
  void theme;
  return {
    marginTop: 6, width: '100%', padding: '8px 12px', borderRadius: 4,
    border: '1px solid #f97316', background: 'rgba(249,115,22,0.12)', color: '#f97316',
    fontSize: 11, fontWeight: 900, letterSpacing: '0.06em', cursor: 'pointer',
  };
}
