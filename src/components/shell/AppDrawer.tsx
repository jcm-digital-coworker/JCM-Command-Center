import type { CSSProperties } from 'react';
import type { AppTab, DepartmentFilter, RoleView } from '../../types/app';
import type { WorkCenter } from '../../types/plant';

interface AppDrawerProps {
  open: boolean;
  tab: AppTab;
  setTab: (tab: AppTab) => void;
  roleView: RoleView;
  setRoleView: (view: RoleView) => void;
  departmentFilter: DepartmentFilter;
  setDepartmentFilter: (filter: DepartmentFilter) => void;
  onClose: () => void;
  workCenters: WorkCenter[];
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export default function AppDrawer({
  open,
  tab,
  setTab,
  onClose,
  theme,
  onToggleTheme,
}: AppDrawerProps) {
  if (!open) return null;

  const tabs: { id: AppTab; label: string }[] = [
    { id: 'dashboard', label: 'COMMAND CENTER' },
    { id: 'orders', label: 'ORDERS' },
    { id: 'coverage', label: 'CREW / COVERAGE' },
    { id: 'plantMap', label: 'PLANT MAP' },
    { id: 'materialHandling', label: 'MATERIAL HANDLING' },
    { id: 'fab', label: 'FAB' },
    { id: 'coating', label: 'COATING' },
    { id: 'assembly', label: 'ASSEMBLY' },
    { id: 'shipping', label: 'SHIPPING' },
    { id: 'qa', label: 'QA' },
    { id: 'maintenance', label: 'MAINTENANCE' },
    { id: 'receiving', label: 'RECEIVING' },
    { id: 'risk', label: 'QA / SAFETY' },
    { id: 'warRoomContext', label: 'WAR ROOM CONTEXT' },
    { id: 'machines', label: 'MACHINES' },
    { id: 'alerts', label: 'MACHINE ALERTS' },
    { id: 'simulation', label: 'SIMULATION' },
    { id: 'documents', label: 'DOCUMENTS' },
  ];

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={drawerStyle}>
        <div style={headerStyle}>
          <div>
            <div
              style={{ fontSize: 18, fontWeight: 800, letterSpacing: '1px' }}
            >
              JCM
            </div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: '2px',
                opacity: 0.8,
                marginTop: 2,
              }}
            >
              DIGITAL CO-WORKER
            </div>
          </div>
          <button onClick={onClose} style={closeButtonStyle}>
            ✕
          </button>
        </div>

        <div style={menuStyle}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                onClose();
              }}
              style={tab === t.id ? activeTabStyle : tabStyle}
            >
              <div style={indicatorStyle(tab === t.id)} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Settings Section */}
        <div style={settingsSectionStyle}>
          <div style={settingsHeaderStyle}>SETTINGS</div>

          <div style={settingItemStyle}>
            <span
              style={{
                fontSize: 13,
                color: '#94a3b8',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              THEME
            </span>
            <button onClick={onToggleTheme} style={themeToggleStyle}>
              {theme === 'dark' ? '🌙 DARK' : '☀️ LIGHT'}
            </button>
          </div>
        </div>

        <div style={footerStyle}>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Nash, Texas</div>
        </div>
      </div>
    </>
  );
}

function indicatorStyle(active: boolean): CSSProperties {
  return {
    width: 4,
    height: 24,
    background: active ? '#f97316' : 'transparent',
    borderRadius: 2,
    marginRight: 12,
  };
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.7)',
  zIndex: 999,
};

const drawerStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  bottom: 0,
  width: 280,
  background: '#1e293b',
  zIndex: 1000,
  boxShadow: '4px 0 20px rgba(0,0,0,0.5)',
};

const headerStyle: CSSProperties = {
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  padding: '24px 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #334155',
  color: 'white',
};

const closeButtonStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  color: 'white',
  width: 36,
  height: 36,
  borderRadius: 4,
  fontSize: 18,
  cursor: 'pointer',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const menuStyle: CSSProperties = {
  padding: '16px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const tabStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  padding: '14px 16px',
  borderRadius: 4,
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 700,
  color: '#94a3b8',
  display: 'flex',
  alignItems: 'center',
  transition: 'all 0.2s',
  letterSpacing: '0.5px',
};

const activeTabStyle: CSSProperties = {
  ...tabStyle,
  background: 'rgba(249, 115, 22, 0.15)',
  color: '#f97316',
};

const settingsSectionStyle: CSSProperties = {
  borderTop: '1px solid #334155',
  padding: '16px 20px',
  marginTop: 'auto',
};

const settingsHeaderStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: '#64748b',
  letterSpacing: '1px',
  marginBottom: 12,
};

const settingItemStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
};

const themeToggleStyle: CSSProperties = {
  background: 'rgba(249, 115, 22, 0.2)',
  border: '1px solid #f97316',
  color: '#f97316',
  padding: '6px 12px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 800,
  cursor: 'pointer',
  letterSpacing: '0.5px',
  transition: 'all 0.2s',
};

const footerStyle: CSSProperties = {
  padding: '16px 20px',
  borderTop: '1px solid #334155',
  textAlign: 'center',
};
