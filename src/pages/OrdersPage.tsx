import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { productFamilies } from '../data/productFamilies';
import {
  formatMaterialStatus,
  formatStatus,
  getOrderBlockReason,
  getOrderStatusLabel,
} from '../logic/orderReadiness';
import type { ProductionOrder } from '../types/productionOrder';
import { getOrderLane, getProductFlow } from '../logic/flowLogic';
import { getRuntimeProductionOrders, WORKFLOW_RUNTIME_UPDATED_EVENT } from '../logic/workflowRuntimeState';
import {
  getOrderLastTouchedHours,
  getBlockerAgeLabel,
  getBlockerAgeTone,
  getBlockerAgeToneColor,
} from '../logic/blockerAge';

type OrdersPageProps = {
  theme?: 'dark' | 'light';
};

type OrderSortMode = 'priority' | 'shipDate' | 'status' | 'orderNumber';

export default function OrdersPage({ theme = 'dark' }: OrdersPageProps) {
  const [sortMode, setSortMode] = useState<OrderSortMode>('priority');
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => setTick((n) => n + 1);
    window.addEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const liveOrders = getRuntimeProductionOrders();
  const blockedCount = liveOrders.filter((order) => getOrderBlockReason(order)).length;
  const readyCount = liveOrders.filter((order) => String(order.status).toLowerCase() === 'ready').length;
  const engineeredCount = liveOrders.filter((order) => order.orderType === 'ENGINEERED' || order.productFamily === 'ENGINEERED_FITTING').length;

  const sortedOrders = useMemo(() => sortOrders(liveOrders, sortMode), [liveOrders, sortMode]);

  return (
    <div style={pageStyle}>
      <div style={heroStyle(theme)}>
        <div>
          <div style={eyebrowStyle}>ORDER BRAIN</div>
          <h2 style={titleStyle(theme)}>Production Orders</h2>
          <p style={subTextStyle(theme)}>
            First pass at the plant-wide traveler: order, material status, product family, blocker, QA signal, and route.
          </p>
        </div>
      </div>

      <div style={summaryGridStyle}>
        <SummaryTile label="Total Orders" value={liveOrders.length} theme={theme} />
        <SummaryTile label="Blocked" value={blockedCount} tone="bad" theme={theme} />
        <SummaryTile label="Ready" value={readyCount} tone="good" theme={theme} />
        <SummaryTile label="Engineered" value={engineeredCount} tone="watch" theme={theme} />
      </div>

      <section style={sectionStyle(theme)}>
        <div style={orderHeaderRowStyle}>
          <div>
            <div style={sectionTitleStyle(theme)}>Current Sample Orders</div>
            <div style={tapHintStyle(theme)}>Tap an order to open the traveler detail card.</div>
          </div>
          <label style={sortLabelStyle(theme)}>
            Sort
            <select value={sortMode} onChange={(event) => setSortMode(event.target.value as OrderSortMode)} style={sortSelectStyle(theme)}>
              <option value="priority">Priority</option>
              <option value="shipDate">Ship Date</option>
              <option value="status">Status</option>
              <option value="orderNumber">Order #</option>
            </select>
          </label>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {sortedOrders.map((order) => (
            <OrderCard key={order.orderNumber} order={order} theme={theme} onOpen={() => setSelectedOrder(order)} />
          ))}
        </div>
      </section>

      <section style={sectionStyle(theme)}>
        <div style={sectionTitleStyle(theme)}>Product Family Reference</div>
        <div style={familyGridStyle}>
          {productFamilies.map((family) => (
            <div key={family.id} style={familyCardStyle(theme)}>
              <div style={{ fontWeight: 900, color: theme === 'dark' ? '#e2e8f0' : '#0f172a' }}>{family.label}</div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#f97316', fontWeight: 800 }}>{family.productLine}</div>
              <p style={miniTextStyle(theme)}>{family.description}</p>
              <div style={chipWrapStyle}>
                {family.exampleSeries.map((series) => (
                  <span key={series} style={chipStyle(theme)}>{series}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedOrder ? <OrderDetailModal order={selectedOrder} theme={theme} onClose={() => setSelectedOrder(null)} /> : null}
    </div>
  );
}

function OrderCard({ order, theme, onOpen }: { order: ProductionOrder; theme: 'dark' | 'light'; onOpen: () => void }) {
  const blockReason = getOrderBlockReason(order);
  const flow = getProductFlow(order);
  const isBlocked = Boolean(blockReason);
  const lastTouchedHours = isBlocked ? getOrderLastTouchedHours(order.orderNumber) : null;

  return (
    <button type="button" style={cardStyle(theme, isBlocked)} onClick={onOpen}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <div>
          <div style={orderNumberStyle(theme)}>{order.orderNumber}</div>
          <div style={miniTextStyle(theme)}>{order.customer}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <div style={statusBadgeStyle(order.status, isBlocked)}>{getOrderStatusLabel(order)}</div>
          {isBlocked && lastTouchedHours !== null && (() => {
            const tone = getBlockerAgeTone(lastTouchedHours);
            const color = getBlockerAgeToneColor(tone);
            return <div style={{ fontSize: 9, fontWeight: 900, color, letterSpacing: '0.4px' }}>UPDATED {getBlockerAgeLabel(lastTouchedHours).toUpperCase()}</div>;
          })()}
        </div>
      </div>

      {isBlocked && blockReason && (
        <div style={inlineBlockerStyle(theme)}>{formatStatus(blockReason)}</div>
      )}

      <div style={detailGridStyle}>
        <Info label="Type" value={order.orderType ?? 'STANDARD'} theme={theme} />
        <Info label="Family" value={formatStatus(order.productFamily)} theme={theme} />
        <Info label="Lane" value={formatStatus(getOrderLane(order))} theme={theme} />
        <Info label="Assembly Part" value={order.assemblyPartNumber ?? 'Not assigned'} theme={theme} />
        <Info label="Qty" value={String(order.quantity ?? 'TBD')} theme={theme} />
        <Info label="Ship Date" value={order.projectedShipDate ?? 'TBD'} theme={theme} />
      </div>

      {(flow?.departments.length ?? order.requiredDepartments?.length ?? 0) > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={smallLabelStyle(theme)}>ROUTE</div>
          <div style={routeStyle(theme)}>{(flow?.departments ?? order.requiredDepartments ?? []).join('  ->  ')}</div>
        </div>
      )}

      <div style={openHintStyle(theme)}>Tap for full traveler</div>
    </button>
  );
}

function OrderDetailModal({ order, theme, onClose }: { order: ProductionOrder; theme: 'dark' | 'light'; onClose: () => void }) {
  const blockReason = getOrderBlockReason(order);
  const flow = getProductFlow(order);
  const route = flow?.departments ?? order.requiredDepartments ?? [];

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalCardStyle(theme)} onClick={(event) => event.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <div>
            <div style={eyebrowStyle}>ORDER TRAVELER</div>
            <h3 style={modalTitleStyle(theme)}>{order.orderNumber}</h3>
            <div style={miniTextStyle(theme)}>{order.customer}</div>
          </div>
          <button type="button" style={closeButtonStyle(theme)} onClick={onClose}>CLOSE</button>
        </div>

        <div style={detailGridStyle}>
          <Info label="Status" value={getOrderStatusLabel(order)} theme={theme} />
          <Info label="Priority" value={formatPriority(order)} theme={theme} />
          <Info label="Type" value={order.orderType ?? 'STANDARD'} theme={theme} />
          <Info label="Family" value={formatStatus(order.productFamily)} theme={theme} />
          <Info label="Lane" value={formatStatus(getOrderLane(order))} theme={theme} />
          <Info label="Assembly Part" value={order.assemblyPartNumber ?? 'Not assigned'} theme={theme} />
          <Info label="Qty" value={String(order.quantity ?? 'TBD')} theme={theme} />
          <Info label="Ship Date" value={order.projectedShipDate ?? 'TBD'} theme={theme} />
          <Info label="Material" value={formatMaterialStatus(order.materialStatus ?? 'UNKNOWN')} theme={theme} />
          <Info label="Current Area" value={order.currentDepartment} theme={theme} />
          <Info label="QA" value={formatStatus(order.qaStatus ?? 'UNKNOWN')} theme={theme} />
        </div>

        {blockReason ? <div style={blockerStyle(theme)}>{formatStatus(blockReason)}</div> : null}

        {route.length > 0 ? (
          <div style={{ marginTop: 14 }}>
            <div style={smallLabelStyle(theme)}>ROUTE</div>
            <div style={routeStyle(theme)}>{route.join('  ->  ')}</div>
          </div>
        ) : null}

        {order.notes?.length ? (
          <div style={{ marginTop: 14 }}>
            <div style={smallLabelStyle(theme)}>NOTES</div>
            {order.notes.map((note) => (
              <div key={note} style={noteStyle(theme)}>{note}</div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SummaryTile({ label, value, tone = 'normal', theme }: { label: string; value: number; tone?: 'normal' | 'good' | 'bad' | 'watch'; theme: 'dark' | 'light' }) {
  const color = tone === 'good' ? '#10b981' : tone === 'bad' ? '#ef4444' : tone === 'watch' ? '#f97316' : '#38bdf8';
  return (
    <div style={summaryTileStyle(theme)}>
      <div style={{ color, fontSize: 26, fontWeight: 900 }}>{value}</div>
      <div style={smallLabelStyle(theme)}>{label}</div>
    </div>
  );
}

function Info({ label, value, theme }: { label: string; value: string; theme: 'dark' | 'light' }) {
  return (
    <div>
      <div style={smallLabelStyle(theme)}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: theme === 'dark' ? '#e2e8f0' : '#0f172a' }}>{value}</div>
    </div>
  );
}

function sortOrders(orders: ProductionOrder[], sortMode: OrderSortMode): ProductionOrder[] {
  return [...orders].sort((a, b) => {
    if (sortMode === 'priority') return getPriorityScore(b) - getPriorityScore(a) || compareShipDate(a, b);
    if (sortMode === 'shipDate') return compareShipDate(a, b);
    if (sortMode === 'status') return String(a.status).localeCompare(String(b.status));
    return a.orderNumber.localeCompare(b.orderNumber);
  });
}

function getPriorityScore(order: ProductionOrder): number {
  let score = 0;
  if (getOrderBlockReason(order)) score += 100;
  if (order.qaStatus === 'HOLD' || order.qaStatus === 'FAILED') score += 80;
  if (order.materialStatus !== 'RECEIVED' && order.materialStatus !== 'STAGED') score += 40;
  if (order.priority === 'critical' || order.priority === 'CRITICAL') score += 30;
  if (order.priority === 'hot' || order.priority === 'HOT') score += 20;
  return score;
}

function compareShipDate(a: ProductionOrder, b: ProductionOrder): number {
  return String(a.projectedShipDate ?? '').localeCompare(String(b.projectedShipDate ?? ''));
}

function formatPriority(order: ProductionOrder): string {
  if (order.priority === 'critical' || order.priority === 'CRITICAL') return 'Critical';
  if (order.priority === 'hot' || order.priority === 'HOT') return 'Hot';
  return 'Normal';
}

const pageStyle: CSSProperties = { display: 'grid', gap: 16 };
const summaryGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 };
const detailGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginTop: 14 };
const familyGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 };
const chipWrapStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 };
const eyebrowStyle: CSSProperties = { color: '#f97316', fontSize: 11, fontWeight: 900, letterSpacing: '1.5px' };
const orderHeaderRowStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 12 };
const modalHeaderStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 };
const modalOverlayStyle: CSSProperties = { position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(2, 6, 23, 0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 };

function heroStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 18, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', borderLeft: '4px solid #f97316' }; }
function titleStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: '4px 0', color: theme === 'dark' ? '#e2e8f0' : '#0f172a', letterSpacing: '0.5px' }; }
function modalTitleStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: '4px 0', color: theme === 'dark' ? '#e2e8f0' : '#0f172a', letterSpacing: '0.5px' }; }
function subTextStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: 0, color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 13, lineHeight: 1.5 }; }
function sectionStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 14, borderRadius: 8, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function sectionTitleStyle(theme: 'dark' | 'light'): CSSProperties { return { marginBottom: 4, fontSize: 13, fontWeight: 900, letterSpacing: '1px', color: theme === 'dark' ? '#e2e8f0' : '#0f172a', textTransform: 'uppercase' }; }
function summaryTileStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 14, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function cardStyle(theme: 'dark' | 'light', blocked: boolean): CSSProperties { return { width: '100%', textAlign: 'left', padding: 14, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: blocked ? '1px solid #ef4444' : theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', borderLeft: blocked ? '4px solid #ef4444' : '4px solid #10b981', cursor: 'pointer' }; }
function inlineBlockerStyle(theme: 'dark' | 'light'): CSSProperties { return { marginTop: 8, marginBottom: 4, padding: '5px 9px', borderRadius: 4, background: theme === 'dark' ? 'rgba(127,29,29,0.28)' : '#fee2e2', border: '1px solid rgba(239,68,68,0.45)', color: theme === 'dark' ? '#fca5a5' : '#991b1b', fontSize: 11, fontWeight: 800 }; }
function familyCardStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 12, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function orderNumberStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 18, fontWeight: 900, color: theme === 'dark' ? '#f8fafc' : '#0f172a' }; }
function miniTextStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: '6px 0 0', color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12, lineHeight: 1.45 }; }
function tapHintStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#64748b' : '#64748b', fontSize: 12, lineHeight: 1.35 }; }
function openHintStyle(theme: 'dark' | 'light'): CSSProperties { return { marginTop: 12, color: theme === 'dark' ? '#93c5fd' : '#2563eb', fontSize: 11, fontWeight: 900, letterSpacing: '0.7px', textTransform: 'uppercase' }; }
function smallLabelStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 10, fontWeight: 900, letterSpacing: '1px', color: theme === 'dark' ? '#64748b' : '#64748b', textTransform: 'uppercase', marginBottom: 4 }; }
function routeStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#cbd5e1' : '#475569', fontSize: 12, fontWeight: 800, lineHeight: 1.5 }; }
function noteStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 10, borderRadius: 6, background: theme === 'dark' ? 'rgba(15,23,42,0.8)' : '#f8fafc', color: theme === 'dark' ? '#cbd5e1' : '#475569', fontSize: 12, border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', marginTop: 8 }; }
function chipStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: '4px 8px', borderRadius: 999, fontSize: 11, fontWeight: 800, color: theme === 'dark' ? '#fdba74' : '#9a3412', background: theme === 'dark' ? 'rgba(249,115,22,0.12)' : '#ffedd5', border: theme === 'dark' ? '1px solid rgba(249,115,22,0.3)' : '1px solid #fed7aa' }; }
function statusBadgeStyle(status: string, blocked: boolean): CSSProperties { return { padding: '6px 9px', borderRadius: 999, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: blocked ? '#fecaca' : status === 'READY' ? '#bbf7d0' : '#bfdbfe', background: blocked ? '#7f1d1d' : status === 'READY' ? '#064e3b' : '#1e3a8a', whiteSpace: 'nowrap' }; }
function sortLabelStyle(theme: 'dark' | 'light'): CSSProperties { return { display: 'grid', gap: 4, color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }; }
function sortSelectStyle(theme: 'dark' | 'light'): CSSProperties { return { minHeight: 38, borderRadius: 6, border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1', background: theme === 'dark' ? '#1e293b' : '#ffffff', color: theme === 'dark' ? '#e2e8f0' : '#0f172a', padding: '8px 10px', fontWeight: 800 }; }
function modalCardStyle(theme: 'dark' | 'light'): CSSProperties { return { width: 'min(720px, 100%)', maxHeight: '88vh', overflow: 'auto', padding: 16, borderRadius: 10, background: theme === 'dark' ? '#0f172a' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.45)' }; }
function closeButtonStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: '9px 11px', borderRadius: 6, border: '1px solid #f97316', background: 'rgba(249,115,22,0.12)', color: '#f97316', fontSize: 11, fontWeight: 900, cursor: 'pointer' }; }
function blockerStyle(theme: 'dark' | 'light'): CSSProperties { return { marginTop: 14, padding: 10, borderRadius: 6, background: theme === 'dark' ? 'rgba(127,29,29,0.35)' : '#fee2e2', border: '1px solid #ef4444', color: theme === 'dark' ? '#fecaca' : '#991b1b', fontSize: 12, fontWeight: 800 }; }
