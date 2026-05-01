import type { CSSProperties } from 'react';
import { productionOrders } from '../data/productionOrders';
import { addWorkflowAction } from '../logic/workflowActions';

type Props = {
  theme?: 'dark' | 'light';
};

export default function ReceivingClosurePanel({ theme = 'dark' }: Props) {
  const materialOrders = productionOrders.filter((order) => {
    const materialStatus = String(order.materialStatus ?? '').toUpperCase();
    return (
      materialStatus === 'MISSING' ||
      materialStatus === 'NOT_RECEIVED' ||
      materialStatus === 'ORDER_REQUIRED' ||
      order.blockers.some((blocker) => blocker.type === 'material')
    );
  });

  return (
    <section style={getPanelStyle(theme)}>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>RECEIVING LOOP</div>
          <h3 style={getTitleStyle(theme)}>Material closure</h3>
        </div>
        <span style={countStyle}>{materialOrders.length} OPEN</span>
      </div>

      {materialOrders.length === 0 ? (
        <div style={getEmptyStyle(theme)}>No open material blockers are assigned to Receiving.</div>
      ) : (
        <div style={stackStyle}>
          {materialOrders.map((order) => (
            <div key={order.id} style={getCardStyle(theme)}>
              <div>
                <strong style={getOrderStyle(theme)}>Order {order.orderNumber} • {order.productFamily}</strong>
                <div style={mutedStyle}>Current: {order.currentDepartment}</div>
                <div style={mutedStyle}>Material: {order.materialStatus ?? 'UNKNOWN'}</div>
                {order.projectedShipDate ? <div style={mutedStyle}>Due: {order.projectedShipDate}</div> : null}
              </div>
              <div style={buttonRowStyle}>
                <button
                  type="button"
                  style={buttonStyle}
                  onClick={() => addWorkflowAction({
                    orderNumber: order.orderNumber,
                    actionType: 'MATERIAL_REQUEST',
                    department: 'Receiving',
                    note: 'Material request logged from receiving closure panel.',
                  })}
                >
                  LOG REQUEST
                </button>
                <button
                  type="button"
                  style={completeButtonStyle}
                  onClick={() => addWorkflowAction({
                    orderNumber: order.orderNumber,
                    actionType: 'NOTIFICATION',
                    department: 'Receiving',
                    note: 'Material staged/delivery confirmation logged. Data is simulated until persistence is connected.',
                  })}
                >
                  MARK STAGED
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const headerStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 14 };
const eyebrowStyle: CSSProperties = { color: '#f97316', fontSize: 11, fontWeight: 900, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 6 };
const countStyle: CSSProperties = { color: '#f97316', fontSize: 11, fontWeight: 900, border: '1px solid #f97316', borderRadius: 4, padding: '6px 8px' };
const stackStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 10 };
const mutedStyle: CSSProperties = { color: '#64748b', fontSize: 12, marginTop: 4, fontWeight: 700 };
const buttonRowStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 8 };
const buttonStyle: CSSProperties = { padding: '9px 11px', borderRadius: 4, border: '1px solid #f59e0b', background: 'rgba(245, 158, 11, 0.16)', color: '#f59e0b', fontSize: 11, fontWeight: 900, cursor: 'pointer' };
const completeButtonStyle: CSSProperties = { padding: '9px 11px', borderRadius: 4, border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.16)', color: '#10b981', fontSize: 11, fontWeight: 900, cursor: 'pointer' };

function getPanelStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 18, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#fff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function getTitleStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: 0, color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 16, fontWeight: 900 }; }
function getEmptyStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 14, borderRadius: 6, border: theme === 'dark' ? '1px dashed #334155' : '1px dashed #cbd5e1', color: '#64748b', fontSize: 13, fontWeight: 700 }; }
function getCardStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 13, borderRadius: 6, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: '1px solid rgba(245, 158, 11, 0.45)', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }; }
function getOrderStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 13 }; }
