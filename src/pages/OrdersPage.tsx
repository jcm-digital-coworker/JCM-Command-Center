import type { CSSProperties } from 'react';
import { productionOrders } from '../data/productionOrders';
import { productFamilies } from '../data/productFamilies';
import {
  formatMaterialStatus,
  formatStatus,
  getOrderBlockReason,
  getOrderStatusLabel,
} from '../logic/orderReadiness';
import type { ProductionOrder } from '../types/productionOrder';
import { getOrderLane, getProductFlow } from '../logic/flowLogic';

type OrdersPageProps = {
  theme?: 'dark' | 'light';
};

export default function OrdersPage({ theme = 'dark' }: OrdersPageProps) {
  const blockedCount = productionOrders.filter((order) => getOrderBlockReason(order)).length;
  const readyCount = productionOrders.filter((order) => order.status === 'READY').length;
  const engineeredCount = productionOrders.filter((order) => order.orderType === 'ENGINEERED').length;

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
        <SummaryTile label="Total Orders" value={productionOrders.length} theme={theme} />
        <SummaryTile label="Blocked" value={blockedCount} tone="bad" theme={theme} />
        <SummaryTile label="Ready" value={readyCount} tone="good" theme={theme} />
        <SummaryTile label="Engineered" value={engineeredCount} tone="watch" theme={theme} />
      </div>

      <section style={sectionStyle(theme)}>
        <div style={sectionTitleStyle(theme)}>Current Sample Orders</div>
        <div style={{ display: 'grid', gap: 12 }}>
          {productionOrders.map((order) => (
            <OrderCard key={order.orderNumber} order={order} theme={theme} />
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
    </div>
  );
}

function OrderCard({ order, theme }: { order: ProductionOrder; theme: 'dark' | 'light' }) {
  const blockReason = getOrderBlockReason(order);
  const flow = getProductFlow(order);

  return (
    <div style={cardStyle(theme, Boolean(blockReason))}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <div>
          <div style={orderNumberStyle(theme)}>{order.orderNumber}</div>
          <div style={miniTextStyle(theme)}>{order.customer}</div>
        </div>
        <div style={statusBadgeStyle(order.status, Boolean(blockReason))}>{getOrderStatusLabel(order)}</div>
      </div>

      <div style={detailGridStyle}>
        <Info label="Type" value={order.orderType} theme={theme} />
        <Info label="Family" value={formatStatus(order.productFamily)} theme={theme} />
        <Info label="Lane" value={formatStatus(getOrderLane(order))} theme={theme} />
        <Info label="Assembly Part" value={order.assemblyPartNumber} theme={theme} />
        <Info label="Qty" value={String(order.quantity)} theme={theme} />
        <Info label="Ship Date" value={order.projectedShipDate} theme={theme} />
        <Info label="Material" value={formatMaterialStatus(order.materialStatus)} theme={theme} />
        <Info label="Current Area" value={order.currentDepartment} theme={theme} />
        <Info label="QA" value={formatStatus(order.qaStatus)} theme={theme} />
      </div>

      {(flow?.departments.length ?? order.requiredDepartments.length) > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={smallLabelStyle(theme)}>ROUTE</div>
          <div style={routeStyle(theme)}>{(flow?.departments ?? order.requiredDepartments).join('  ->  ')}</div>
        </div>
      )}

      {order.notes?.length ? (
        <div style={{ marginTop: 12 }}>
          {order.notes.map((note) => (
            <div key={note} style={noteStyle(theme)}>{note}</div>
          ))}
        </div>
      ) : null}
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

const pageStyle: CSSProperties = { display: 'grid', gap: 16 };
const summaryGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 };
const detailGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginTop: 14 };
const familyGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 };
const chipWrapStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 };
const eyebrowStyle: CSSProperties = { color: '#f97316', fontSize: 11, fontWeight: 900, letterSpacing: '1.5px' };

function heroStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 18, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', borderLeft: '4px solid #f97316' }; }
function titleStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: '4px 0', color: theme === 'dark' ? '#e2e8f0' : '#0f172a', letterSpacing: '0.5px' }; }
function subTextStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: 0, color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 13, lineHeight: 1.5 }; }
function sectionStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 14, borderRadius: 8, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function sectionTitleStyle(theme: 'dark' | 'light'): CSSProperties { return { marginBottom: 12, fontSize: 13, fontWeight: 900, letterSpacing: '1px', color: theme === 'dark' ? '#e2e8f0' : '#0f172a', textTransform: 'uppercase' }; }
function summaryTileStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 14, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function cardStyle(theme: 'dark' | 'light', blocked: boolean): CSSProperties { return { padding: 14, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: blocked ? '1px solid #ef4444' : theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', borderLeft: blocked ? '4px solid #ef4444' : '4px solid #10b981' }; }
function familyCardStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 12, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function orderNumberStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 18, fontWeight: 900, color: theme === 'dark' ? '#f8fafc' : '#0f172a' }; }
function miniTextStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: '6px 0 0', color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12, lineHeight: 1.45 }; }
function smallLabelStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 10, fontWeight: 900, letterSpacing: '1px', color: theme === 'dark' ? '#64748b' : '#64748b', textTransform: 'uppercase', marginBottom: 4 }; }
function routeStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#cbd5e1' : '#475569', fontSize: 12, fontWeight: 800, lineHeight: 1.5 }; }
function noteStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 10, borderRadius: 6, background: theme === 'dark' ? 'rgba(15,23,42,0.8)' : '#f8fafc', color: theme === 'dark' ? '#cbd5e1' : '#475569', fontSize: 12, border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function chipStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: '4px 8px', borderRadius: 999, fontSize: 11, fontWeight: 800, color: theme === 'dark' ? '#fdba74' : '#9a3412', background: theme === 'dark' ? 'rgba(249,115,22,0.12)' : '#ffedd5', border: theme === 'dark' ? '1px solid rgba(249,115,22,0.3)' : '1px solid #fed7aa' }; }
function statusBadgeStyle(status: string, blocked: boolean): CSSProperties { return { padding: '6px 9px', borderRadius: 999, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: blocked ? '#fecaca' : status === 'READY' ? '#bbf7d0' : '#bfdbfe', background: blocked ? '#7f1d1d' : status === 'READY' ? '#064e3b' : '#1e3a8a', whiteSpace: 'nowrap' }; }
