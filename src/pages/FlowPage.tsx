import type { CSSProperties } from 'react';
import { productionOrders } from '../data/productionOrders';
import { productFlows } from '../data/productFlows';
import { getBlockedOrdersByFlow, getFlowBlockers, getOrderLane, getProductFlow, getRunnableOrders } from '../logic/flowLogic';
import { formatStatus } from '../logic/orderReadiness';
import type { ProductionOrder } from '../types/productionOrder';

const simulatedDownAssets = ['HK FS-1200 Laser Table'];

type FlowPageProps = {
  theme?: 'dark' | 'light';
};

export default function FlowPage({ theme = 'dark' }: FlowPageProps) {
  const runnableOrders = getRunnableOrders(productionOrders, simulatedDownAssets);
  const flowBlockedOrders = getBlockedOrdersByFlow(productionOrders, simulatedDownAssets);
  const bypassOrders = runnableOrders.filter((order) => getProductFlow(order)?.bypassCapability);

  return (
    <div style={pageStyle}>
      <div style={heroStyle(theme)}>
        <div style={eyebrowStyle}>FLOW INTELLIGENCE</div>
        <h2 style={titleStyle(theme)}>What Can Run Right Now?</h2>
        <p style={subTextStyle(theme)}>
          This layer ties product lanes to receiving, departments, shared resources, and bypass capability. It is hardcoded on purpose so we can prove the logic before wiring live data.
        </p>
      </div>

      <div style={summaryGridStyle}>
        <SummaryTile label="Simulated Down Assets" value={simulatedDownAssets.length} tone="watch" theme={theme} />
        <SummaryTile label="Flow Blocked" value={flowBlockedOrders.length} tone="bad" theme={theme} />
        <SummaryTile label="Runnable" value={runnableOrders.length} tone="good" theme={theme} />
        <SummaryTile label="Bypass Ready" value={bypassOrders.length} tone="blue" theme={theme} />
      </div>

      <section style={sectionStyle(theme)}>
        <div style={sectionTitleStyle(theme)}>Current Constraint Drill</div>
        <div style={downAssetBoxStyle(theme)}>
          {simulatedDownAssets.map((asset) => (
            <span key={asset} style={downChipStyle(theme)}>{asset} DOWN</span>
          ))}
        </div>
        <p style={subTextStyle(theme)}>
          Result: saddle and clamp lanes should show blocked. Patch clamps should remain runnable because they bypass the laser / press dependency.
        </p>
      </section>

      <section style={sectionStyle(theme)}>
        <div style={sectionTitleStyle(theme)}>Flow Calls</div>
        <div style={cardGridStyle}>
          {productionOrders.map((order) => (
            <FlowOrderCard key={order.orderNumber} order={order} theme={theme} />
          ))}
        </div>
      </section>

      <section style={sectionStyle(theme)}>
        <div style={sectionTitleStyle(theme)}>Product Lane Rules</div>
        <div style={cardGridStyle}>
          {productFlows.map((flow) => (
            <div key={flow.lane} style={ruleCardStyle(theme, flow.bypassCapability)}>
              <div style={cardTitleStyle(theme)}>{flow.label}</div>
              <div style={miniTextStyle(theme)}>{flow.commandNote}</div>
              <div style={{ marginTop: 12 }}>
                <div style={smallLabelStyle(theme)}>Route</div>
                <div style={routeStyle(theme)}>{flow.departments.join('  ->  ')}</div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={smallLabelStyle(theme)}>Dependencies</div>
                <div style={chipWrapStyle}>
                  {flow.dependencies.map((dependency) => (
                    <span key={dependency.name} style={chipStyle(theme)}>{dependency.name}</span>
                  ))}
                </div>
              </div>
              {flow.bypassCapability && <div style={bypassFlagStyle(theme)}>BYPASS CAPABLE</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function FlowOrderCard({ order, theme }: { order: ProductionOrder; theme: 'dark' | 'light' }) {
  const flow = getProductFlow(order);
  const blockers = getFlowBlockers(order, simulatedDownAssets);
  const blocked = blockers.length > 0;
  const lane = getOrderLane(order);

  return (
    <div style={orderCardStyle(theme, blocked, Boolean(flow?.bypassCapability))}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={cardTitleStyle(theme)}>{order.orderNumber}</div>
          <div style={miniTextStyle(theme)}>{order.customer}</div>
        </div>
        <span style={callBadgeStyle(blocked, Boolean(flow?.bypassCapability))}>
          {blocked ? 'FLOW BLOCKED' : flow?.bypassCapability ? 'RUNNABLE BYPASS' : 'RUNNABLE'}
        </span>
      </div>

      <div style={infoGridStyle}>
        <Info label="Lane" value={formatStatus(lane)} theme={theme} />
        <Info label="Part" value={order.assemblyPartNumber ?? 'No assembly part'} theme={theme} />
        <Info label="Current Area" value={order.currentDepartment} theme={theme} />
        <Info label="Material" value={formatStatus(order.materialStatus ?? 'UNKNOWN')} theme={theme} />
      </div>

      {flow && (
        <div style={{ marginTop: 12 }}>
          <div style={smallLabelStyle(theme)}>Route</div>
          <div style={routeStyle(theme)}>{flow.departments.join('  ->  ')}</div>
        </div>
      )}

      {blocked ? (
        <div style={blockerBoxStyle(theme)}>
          Blocked by: {blockers.map((blocker) => blocker.name).join(', ')}
        </div>
      ) : (
        <div style={readyBoxStyle(theme)}>
          Next useful action: keep this lane moving unless QA/material status says otherwise.
        </div>
      )}
    </div>
  );
}

function SummaryTile({ label, value, tone, theme }: { label: string; value: number; tone: 'good' | 'bad' | 'watch' | 'blue'; theme: 'dark' | 'light' }) {
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
      <div style={{ fontSize: 12, fontWeight: 800, color: theme === 'dark' ? '#e2e8f0' : '#0f172a' }}>{value}</div>
    </div>
  );
}

const pageStyle: CSSProperties = { display: 'grid', gap: 16 };
const summaryGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 };
const cardGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 };
const infoGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginTop: 12 };
const chipWrapStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 6 };
const eyebrowStyle: CSSProperties = { color: '#f97316', fontSize: 11, fontWeight: 900, letterSpacing: '1.5px' };

function heroStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 18, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', borderLeft: '4px solid #f97316' }; }
function titleStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: '4px 0', color: theme === 'dark' ? '#e2e8f0' : '#0f172a', letterSpacing: '0.5px' }; }
function subTextStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: 0, color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 13, lineHeight: 1.5 }; }
function summaryTileStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 14, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function sectionStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 14, borderRadius: 8, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function sectionTitleStyle(theme: 'dark' | 'light'): CSSProperties { return { marginBottom: 12, fontSize: 13, fontWeight: 900, letterSpacing: '1px', color: theme === 'dark' ? '#e2e8f0' : '#0f172a', textTransform: 'uppercase' }; }
function orderCardStyle(theme: 'dark' | 'light', blocked: boolean, bypass: boolean): CSSProperties { const color = blocked ? '#ef4444' : bypass ? '#38bdf8' : '#10b981'; return { padding: 14, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', borderLeft: `4px solid ${color}` }; }
function ruleCardStyle(theme: 'dark' | 'light', bypass: boolean): CSSProperties { return { padding: 14, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', borderLeft: bypass ? '4px solid #38bdf8' : '4px solid #f97316' }; }
function cardTitleStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 15, fontWeight: 900 }; }
function miniTextStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: '6px 0 0', color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12, lineHeight: 1.45 }; }
function smallLabelStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 10, fontWeight: 900, letterSpacing: '1px', color: theme === 'dark' ? '#64748b' : '#64748b', textTransform: 'uppercase', marginBottom: 4 }; }
function routeStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#cbd5e1' : '#475569', fontSize: 12, fontWeight: 800, lineHeight: 1.5 }; }
function chipStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: '4px 8px', borderRadius: 999, fontSize: 11, fontWeight: 800, color: theme === 'dark' ? '#bfdbfe' : '#1e40af', background: theme === 'dark' ? 'rgba(59,130,246,0.12)' : '#dbeafe', border: theme === 'dark' ? '1px solid rgba(59,130,246,0.25)' : '1px solid #bfdbfe' }; }
function downAssetBoxStyle(theme: 'dark' | 'light'): CSSProperties { return { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }; }
function downChipStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: '7px 10px', borderRadius: 999, fontSize: 11, fontWeight: 900, color: '#fecaca', background: '#7f1d1d', border: '1px solid #ef4444' }; }
function callBadgeStyle(blocked: boolean, bypass: boolean): CSSProperties { const background = blocked ? '#7f1d1d' : bypass ? '#075985' : '#064e3b'; const color = blocked ? '#fecaca' : bypass ? '#bae6fd' : '#bbf7d0'; return { padding: '6px 9px', borderRadius: 999, fontSize: 10, fontWeight: 900, color, background, whiteSpace: 'nowrap' }; }
function blockerBoxStyle(theme: 'dark' | 'light'): CSSProperties { return { marginTop: 12, padding: 10, borderRadius: 6, color: '#fecaca', background: '#7f1d1d', fontSize: 12, fontWeight: 800 }; }
function readyBoxStyle(theme: 'dark' | 'light'): CSSProperties { return { marginTop: 12, padding: 10, borderRadius: 6, color: theme === 'dark' ? '#bbf7d0' : '#065f46', background: theme === 'dark' ? 'rgba(16,185,129,0.12)' : '#d1fae5', fontSize: 12, fontWeight: 800 }; }
function bypassFlagStyle(theme: 'dark' | 'light'): CSSProperties { return { marginTop: 12, padding: 8, borderRadius: 6, color: theme === 'dark' ? '#bae6fd' : '#075985', background: theme === 'dark' ? 'rgba(56,189,248,0.12)' : '#e0f2fe', fontSize: 11, fontWeight: 900, textAlign: 'center' }; }
