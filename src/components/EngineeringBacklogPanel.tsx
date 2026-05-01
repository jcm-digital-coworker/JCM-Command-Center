import type { CSSProperties } from 'react';
import { productionOrders } from '../data/productionOrders';
import { hasMissingBlueprint, getWorkflowSignal } from '../logic/orderWorkflow';
import { addWorkflowAction } from '../logic/workflowActions';

type Props = {
  theme?: 'dark' | 'light';
};

export default function EngineeringBacklogPanel({ theme = 'dark' }: Props) {
  const engineeringOrders = productionOrders.filter(
    (order) => hasMissingBlueprint(order) || getWorkflowSignal(order).gate === 'ENGINEERING'
  );

  return (
    <section style={getPanelStyle(theme)}>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>ENGINEERING LOOP</div>
          <h3 style={getTitleStyle(theme)}>Blueprint backlog</h3>
        </div>
        <span style={countStyle}>{engineeringOrders.length} OPEN</span>
      </div>

      {engineeringOrders.length === 0 ? (
        <div style={getEmptyStyle(theme)}>No engineering blueprint kickbacks are open.</div>
      ) : (
        <div style={stackStyle}>
          {engineeringOrders.map((order) => (
            <div key={order.id} style={getCardStyle(theme)}>
              <div>
                <strong style={getOrderStyle(theme)}>Order {order.orderNumber} • {order.productFamily}</strong>
                <div style={mutedStyle}>Owner: Engineering</div>
                <div style={mutedStyle}>Reason: Missing or unreleased blueprint / part packet</div>
              </div>
              <button
                type="button"
                style={buttonStyle}
                onClick={() => addWorkflowAction({
                  orderNumber: order.orderNumber,
                  actionType: 'ENGINEERING_ESCALATION',
                  department: 'Engineering',
                  note: 'Blueprint release requested from engineering backlog panel.',
                })}
              >
                LOG ENGINEERING REQUEST
              </button>
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
const buttonStyle: CSSProperties = { padding: '9px 11px', borderRadius: 4, border: '1px solid #dc2626', background: 'rgba(220, 38, 38, 0.16)', color: '#dc2626', fontSize: 11, fontWeight: 900, cursor: 'pointer' };

function getPanelStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 18, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#fff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function getTitleStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: 0, color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 16, fontWeight: 900 }; }
function getEmptyStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 14, borderRadius: 6, border: theme === 'dark' ? '1px dashed #334155' : '1px dashed #cbd5e1', color: '#64748b', fontSize: 13, fontWeight: 700 }; }
function getCardStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 13, borderRadius: 6, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: '1px solid rgba(220, 38, 38, 0.45)', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }; }
function getOrderStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 13 }; }
