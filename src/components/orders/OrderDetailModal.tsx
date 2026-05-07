import type { CSSProperties } from 'react';
import type { ProductionOrder } from '../../types/productionOrder';
import { getOperatorSafeStatusLabel } from '../../logic/orderStatusTruth';
import { getThemeColors } from '../../theme/theme';

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
    <div style={modalOverlayStyle(theme)} onClick={onClose}>
      <div style={modalCardStyle(theme, blockers.length > 0)} onClick={(event) => event.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <div>
            <div style={eyebrowStyle(theme)}>ORDER DETAIL</div>
            <h3 style={modalTitleStyle(theme)}>{order.orderNumber}</h3>
            <div style={subTextStyle(theme)}>{order.customer ?? 'Customer not listed'}</div>
          </div>
          <button type="button" style={closeButtonStyle(theme)} onClick={onClose}>CLOSE</button>
        </div>

        <div style={infoGridStyle}>
          <Info label="Priority" value={formatPriority(order.priority)} theme={theme} />
          <Info label="Flow" value={getOperatorSafeStatusLabel(order.flowStatus)} theme={theme} />
          <Info label="Status" value={getOperatorSafeStatusLabel(order.status)} theme={theme} />
          <Info label="Current" value={order.currentDepartment} theme={theme} />
          <Info label="Next" value={order.nextDepartment ?? 'Not assigned'} theme={theme} />
          <Info label="Material" value={getOperatorSafeStatusLabel(order.materialStatus)} theme={theme} />
          <Info label="QA" value={getOperatorSafeStatusLabel(order.qaStatus)} theme={theme} />
          <Info label="Ship Date" value={order.projectedShipDate ?? 'TBD'} theme={theme} />
          <Info label="Qty" value={String(order.quantity ?? 'TBD')} theme={theme} />
          <Info label="Part" value={order.assemblyPartNumber ?? order.partNumber ?? 'Not assigned'} theme={theme} />
        </div>

        {blockers.length > 0 ? (
          <div style={{ marginTop: 14 }}>
            <div style={smallLabelStyle(theme)}>Blockers</div>
            {blockers.map((blocker, index) => (
              <div key={`${blocker.type}-${index}`} style={blockerStyle(theme)}>
                {getOperatorSafeStatusLabel(blocker.type)}: {blocker.message}
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
          <button type="button" style={openOrdersButtonStyle(theme)} onClick={onOpenOrders}>OPEN FULL ORDERS</button>
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

function modalOverlayStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    position: 'fixed',
    inset: 0,
    zIndex: 60,
    background: colors.overlay,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  };
}

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

function eyebrowStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    color: colors.accent,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
  };
}

function closeButtonStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    padding: '9px 11px',
    borderRadius: 6,
    border: `1px solid ${colors.accent}`,
    background: colors.accentBg,
    color: colors.accent,
    fontSize: 11,
    fontWeight: 900,
    cursor: 'pointer',
  };
}

function openOrdersButtonStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    width: '100%',
    marginTop: 16,
    padding: '11px 12px',
    borderRadius: 6,
    border: `1px solid ${colors.info}`,
    background: colors.infoBg,
    color: colors.info,
    fontSize: 12,
    fontWeight: 900,
    cursor: 'pointer',
    letterSpacing: '0.7px',
  };
}

function modalCardStyle(theme: 'dark' | 'light', blocked: boolean): CSSProperties {
  const colors = getThemeColors(theme);
  const statusColor = blocked ? colors.danger : colors.success;
  return {
    width: 'min(720px, 100%)',
    maxHeight: '88vh',
    overflow: 'auto',
    padding: 16,
    borderRadius: 10,
    background: colors.panel,
    border: `1px solid ${statusColor}`,
    borderLeft: `4px solid ${statusColor}`,
    boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
  };
}

function modalTitleStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    margin: '4px 0',
    color: colors.text,
    letterSpacing: '0.5px',
  };
}

function subTextStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 1.4,
  };
}

function smallLabelStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '1px',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  };
}

function infoValueStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    fontSize: 13,
    fontWeight: 800,
    color: colors.text,
    lineHeight: 1.35,
  };
}

function blockerStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    padding: 10,
    borderRadius: 6,
    background: colors.dangerBg,
    border: `1px solid ${colors.danger}`,
    color: colors.danger,
    fontSize: 12,
    fontWeight: 800,
    marginTop: 8,
  };
}

function readyNoticeStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    marginTop: 14,
    padding: 10,
    borderRadius: 6,
    background: colors.successBg,
    border: `1px solid ${colors.success}`,
    color: colors.success,
    fontSize: 12,
    fontWeight: 800,
  };
}

function routeStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: 800,
    lineHeight: 1.5,
  };
}

function noteStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    padding: 10,
    borderRadius: 6,
    background: colors.cardAlt,
    color: colors.textSecondary,
    fontSize: 12,
    border: `1px solid ${colors.border}`,
    marginTop: 8,
  };
}
