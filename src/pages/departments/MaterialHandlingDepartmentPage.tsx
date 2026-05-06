import { plantAssets } from '../../data/plantAssets';
import {
  AssetCard, CardGrid, CrewGuidancePanel, DeptEnhancements, EmptyState,
  getDepartmentAssets, getDepartmentOrders, getBlockedOrders,
  KpiStrip, LiveCrewSection, OrderCard, PageShell, Section, useRuntimeOrders,
} from './DepartmentPageTools';
import type { DepartmentPageProps } from './DepartmentPageTools';

export default function MaterialHandlingDepartmentPage({ theme = 'dark', onGoToTab }: DepartmentPageProps) {
  const runtimeOrders = useRuntimeOrders();
  const assets = getDepartmentAssets(plantAssets, 'Material Handling');
  const orders = getDepartmentOrders(runtimeOrders, 'Material Handling');
  const blocked = getBlockedOrders(orders);

  const feedingFab = orders.filter((o) => o.nextDepartment === 'Fab');
  const feedingMachineShop = orders.filter((o) => o.nextDepartment === 'Machine Shop');
  const feedingOther = orders.filter(
    (o) => o.nextDepartment && o.nextDepartment !== 'Fab' && o.nextDepartment !== 'Machine Shop',
  );
  const noDestination = orders.filter((o) => !o.nextDepartment);

  const kpis = [
    { label: 'TOTAL', value: orders.length },
    { label: '→ FAB', value: feedingFab.length, color: feedingFab.length > 0 ? '#38bdf8' : '#64748b' },
    { label: '→ MACHINE SHOP', value: feedingMachineShop.length, color: feedingMachineShop.length > 0 ? '#a78bfa' : '#64748b' },
    { label: 'BLOCKED', value: blocked.length, color: blocked.length > 0 ? '#ef4444' : '#64748b' },
  ];

  return (
    <PageShell
      title="Material Handling"
      subtitle="Burn table, laser, rolling, sawing, press/brake, and large-diameter coupling expansion. The Press Building is a separate structure within this department. MH feeds Machine Shop, Fab, and Couplings."
      theme={theme}
    >
      <KpiStrip items={kpis} theme={theme} />
      <DeptEnhancements department="Material Handling" theme={theme} onGoToTab={onGoToTab} />
      <Section title="Crew on Shift" theme={theme}>
        <LiveCrewSection department="Material Handling" theme={theme} onGoToTab={onGoToTab} />
      </Section>
      <Section title="Crew Guidance" theme={theme}>
        <CrewGuidancePanel department="Material Handling" orders={runtimeOrders} theme={theme} />
      </Section>
      <Section title="Equipment / Buildings" theme={theme}>
        <CardGrid>{assets.map((asset) => <AssetCard key={asset.id} asset={asset} theme={theme} />)}</CardGrid>
      </Section>
      <Section title={`Feeding Fab (${feedingFab.length})`} theme={theme}>
        {feedingFab.length === 0
          ? <EmptyState text="No orders currently feeding Fab from Material Handling." theme={theme} />
          : <CardGrid>{feedingFab.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      <Section title={`Feeding Machine Shop (${feedingMachineShop.length})`} theme={theme}>
        {feedingMachineShop.length === 0
          ? <EmptyState text="No orders currently feeding Machine Shop from Material Handling." theme={theme} />
          : <CardGrid>{feedingMachineShop.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>}
      </Section>
      {feedingOther.length > 0 && (
        <Section title={`Feeding Other Destinations (${feedingOther.length})`} theme={theme}>
          <CardGrid>{feedingOther.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
      {blocked.length > 0 && (
        <Section title={`MH Blockers (${blocked.length})`} theme={theme}>
          <CardGrid>{blocked.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
      {noDestination.length > 0 && (
        <Section title={`No Destination Assigned (${noDestination.length})`} theme={theme}>
          <CardGrid>{noDestination.map((o) => <OrderCard key={o.orderNumber} order={o} theme={theme} onGoToTab={onGoToTab} />)}</CardGrid>
        </Section>
      )}
    </PageShell>
  );
}
