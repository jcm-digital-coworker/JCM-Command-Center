import type { CSSProperties } from 'react';
import type { ProductionOrder } from '../../types/productionOrder';

type OrderDetailModalProps = {
  order: ProductionOrder;
  theme: 'dark' | 'light';
  onClose: () => void;
  onOpenOrders?: () => void;
};

export default function OrderDetailModal({ order, theme, onClose, onOpenOrders }: OrderDetailModalProps) {
  const route = order.requiredDepartments ?? [];
  const blockers = order.blockers ?? [];

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalCardStyle(theme, blockers.length > 0)} onClick={(event) => event.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <div>
            <div style={eyebrowStyle}>ORDER DETAIL</div>
            <h3 style={modalTitleStyle(theme)}>{order.orderNumber}</h3>
            <div style={subTextStyle(theme)}>{order.customer ?? 'Customer not listed'}</div>
          </div>
          <button type="button" style={closeButtonStyle} onClick={onClose}>CLOSE</button>
        </div>

        <div style={infoGridStyle}>
          <Info label="Priority" value={formatPriority(order.priority)} theme={theme} />
          <Info label="Flow" value={formatStatus(order.flowStatus)} theme={theme} />
          <Info label="Status" value={formatStatus(order.status)} theme={theme} />
          <Info label="Current" value={order.currentDepartment} theme={theme} />
          <Info label="Next" value={order.nextDepartment ?? 'Not assigned'} theme={theme} />
          <Info label="Material" value={formatStatus(order.materialStatus ?? 'UNKNOWN')} theme={theme} />
          <Info label="QA" value={formatStatus(order.qaStatus ?? 'UNKNOWN')} theme={theme} />
          <Info label="Ship Date" value={order.projectedShipDate ?? 'TBD'} theme={theme} />
          <Info label="Qty" value={String(order.quantity ?? 'TBD')} theme={theme} />
          <Info label="Part" value={order.assemblyPartNumber ?? order.partNumber ?? 'Not assigned'} theme={theme} />
        </div>

        {blockers.length > 0 ? (
          <div style={{ marginTop: 14 }}>
            <div style={smallLabelStyle(theme)}>Blockers</div>
            {blockers.map((blocker, index) => (
              <div key={`${blocker.type}-${index}`} style={blockerStyle(theme)}>
                {formatStatus(blocker.type)}: {blocker.message}
              </div>
            ))}
          </div>
        ) : (
          <div style={readyNoticeStyle(theme)}>No blockers are listed for this order.</div>
        )}

        {route.length > 0 ? (
          <div style={{ marginTop: 14 }}>
            <div style={smallLabelStyle(theme)}>Route</div>
            <div style={routeStyle(theme)}>{route.join('  ->  ')}</div>
          </div>
        ) : null}

        {order.notes?.length ? (
          <div style={{ marginTop: 14 }}>
            <div style={smallLabelStyle(theme)}>Notes</div>
            {order.notes.map((note) => <div key={note} style={noteStyle(theme)}>{note}</div>)}
          </div>
        ) : null}

        {onOpenOrders ? (
          <button type="button" style={openOrdersButtonStyle} onClick={onOpenOrders}>OPEN FULL ORDERS</button>
        ) : null}
      </div>
    </div>
  );
}

function Info({ label, value, theme }: { label: string; value: string; theme: 'dark' | 'light' }) {
  return (
    <div>
      <div style={smallLabelStyle(theme)}>{label}</div>
      <div style={infoValueStyle(theme)}>{value}</div>
    </div>
  );
}

function formatPriority(priority: ProductionOrder['priority']) {
  if (priority === 'critical' || priority === 'CRITICAL') return 'Critical';
  if (priority === 'hot' || priority === 'HOT') return 'Hot';
  return 'Normal';
}

function formatStatus(value: string) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const modalOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 60,
  background: 'rgba(2, 6, 23, 0.78)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
};

const modalHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
  marginBottom: 14,
};

const infoGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))',
  gap: 12,
  marginTop: 12,
};

const eyebrowStyle: CSSProperties = {
  color: '#f97316',
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
};

const closeButtonStyle: CSSProperties = {
  padding: '9px 11px',
  borderRadius: 6,
  border: '1px solid #f97316',
  background: 'rgba(249,115,22,0.12)',
  color: '#f97316',
  fontSize: 11,
  fontWeight: 900,
  cursor: 'pointer',
};

const openOrdersButtonStyle: CSSProperties = {
  width: '100%',
  marginTop: 16,
  padding: '11px 12px',
  borderRadius: 6,
  border: '1px solid #3b82f6',
  background: 'rgba(59,130,246,0.12)',
  color: '#93c5fd',
  fontSize: 12,
  fontWeight: 900,
  cursor: 'pointer',
  letterSpacing: '0.7px',
};

function modalCardStyle(theme: 'dark' | 'light', blocked: boolean): CSSProperties {
  const color = blocked ? '#ef4444' : '#10b981';
  return {
    width: 'min(720px, 100%)',
    maxHeight: '88vh',
    overflow: 'auto',
    padding: 16,
    borderRadius: 10,
    background: theme === 'dark' ? '#0f172a' : '#ffffff',
    border: `1px solid ${color}66`,
    borderLeft: `4px solid ${color}`,
    boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
  };
}

function modalTitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    margin: '4px 0',
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    letterSpacing: '0.5px',
  };
}

function subTextStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    color: theme === 'dark' ? '#94a3b8' : '#64748b',
    fontSize: 12,
    lineHeight: 1.4,
  };
}

function smallLabelStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '1px',
    color: theme === 'dark' ? '#64748b' : '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  };
}

function infoValueStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 13,
    fontWeight: 800,
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    lineHeight: 1.35,
  };
}

function blockerStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: 10,
    borderRadius: 6,
    background: theme === 'dark' ? 'rgba(127,29,29,0.35)' : '#fee2e2',
    border: '1px solid #ef4444',
    color: theme === 'dark' ? '#fecaca' : '#991b1b',
    fontSize: 12,
    fontWeight: 800,
    marginTop: 8,
  };
}

function readyNoticeStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    marginTop: 14,
    padding: 10,
    borderRadius: 6,
    background: theme === 'dark' ? 'rgba(6,78,59,0.32)' : '#dcfce7',
    border: '1px solid #10b981',
    color: theme === 'dark' ? '#bbf7d0' : '#166534',
    fontSize: 12,
    fontWeight: 800,
  };
}

function routeStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    color: theme === 'dark' ? '#cbd5e1' : '#475569',
    fontSize: 12,
    fontWeight: 800,
    lineHeight: 1.5,
  };
}

function noteStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: 10,
    borderRadius: 6,
    background: theme === 'dark' ? 'rgba(15,23,42,0.8)' : '#f8fafc',
    color: theme === 'dark' ? '#cbd5e1' : '#475569',
    fontSize: 12,
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    marginTop: 8,
  };
}
