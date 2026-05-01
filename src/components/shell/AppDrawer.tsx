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
  roleView,
  setRoleView,
  departmentFilter,
  setDepartmentFilter,
  onClose,
  workCenters,
  theme,
  onToggleTheme,
}: AppDrawerProps) {
  if (!open) return null;

  const tabs: { id: AppTab; label: string }[] = [
    { id: 'workflow', label: 'MY WORKFLOW' },
    { id: 'dashboard', label: 'COMMAND CENTER' },
    { id: 'orders', label: 'ORDERS' },
    { id: 'coverage', label: 'CREW / COVERAGE' },
    { id: 'plantMap', label: 'PLANT MAP' },
    { id: 'sales', label: 'SALES' },
    { id: 'engineering', label: 'ENGINEERING' },
    { id: 'materialHandling', label: 'MATERIAL HANDLING' },
    { id: 'fab', label: 'FAB' },
    { id: 'coating', label: 'COATING' },
    { id: 'assembly', label: 'ASSEMBLY' },
    { id: 'shipping', label: 'SHIPPING' },
    { id: 'qa', label: 'QA' },
    { id: 'maintenance', label: 'MAINTENANCE' },
    { id: 'receiving', label: 'RECEIVING' },
    { id: 'risk', label: 'QA / SAFETY' },
    { id: 'machines', label: 'MACHINES' },
    { id: 'alerts', label: 'MACHINE ALERTS' },
    { id: 'simulation', label: 'SIMULATION' },
    { id: 'documents', label: 'DOCUMENTS' },
  ];

  return (
    <>
      <style>
        {`
          .drawer-menu-scroll {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE/Edge */
          }
          .drawer-menu-scroll::-webkit-scrollbar {
            display: none; /* Chrome/Safari/Opera */
          }
        `}
      </style>
      <div style={overlayStyle} onClick={onClose} />
      <div style={drawerStyle}>
        {/* Fixed Header */}
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

        {/* Scrollable Menu Area - NO VISIBLE SCROLLBAR */}
        <div style={menuContainerStyle} className="drawer-menu-scroll">
          <div style={menuStyle}>
            <div style={drawerSectionLabelStyle}>PRIMARY</div>
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

            <div style={drawerSectionLabelStyle}>WORK CENTERS</div>
            <button
              onClick={() => {
                setDepartmentFilter('All');
                onClose();
              }}
              style={departmentFilter === 'All' ? activeWorkCenterStyle : workCenterStyle}
            >
              <div style={indicatorStyle(departmentFilter === 'All')} />
              ALL DEPARTMENTS
            </button>
            {workCenters.map((center) => (
              <button
                key={center.id}
                onClick={() => {
                  setDepartmentFilter(center.department);
                  onClose();
                }}
                style={departmentFilter === center.department ? activeWorkCenterStyle : workCenterStyle}
              >
                <div style={indicatorStyle(departmentFilter === center.department)} />
                {center.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Fixed Settings Section */}
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

        {/* Dev Tools */}
        <div style={devToolsSectionStyle}>
          <div style={devToolsHeaderStyle}>DEV TOOLS</div>
          <button
            onClick={() => { setTab('warRoomContext'); onClose(); }}
            style={tab === 'warRoomContext' ? devTabActiveStyle : devTabStyle}
          >
            WAR ROOM CONTEXT
          </button>
          <div style={devToolsItemStyle}>
            <span style={devToolsLabelStyle}>ROLE</span>
            <select
              value={roleView}
              onChange={(e) => setRoleView(e.target.value as RoleView)}
              style={devSelectStyle}
            >
              <option value="Operator">Operator</option>
              <option value="Lead / Supervisor">Lead / Supervisor</option>
              <option value="Manager">Manager</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Forklift / Receiving">Forklift / Receiving</option>
              <option value="QA">QA</option>
            </select>
          </div>
          <div style={devToolsItemStyle}>
            <span style={devToolsLabelStyle}>DEPT</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value as DepartmentFilter)}
              style={devSelectStyle}
            >
              <option value="All">All</option>
              {workCenters.map((center) => (
                <option key={center.id} value={center.department}>
                  {center.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fixed Footer */}
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
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle: CSSProperties = {
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  padding: '24px 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #334155',
  color: 'white',
  flexShrink: 0,
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

const menuContainerStyle: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  minHeight: 0,
};

const menuStyle: CSSProperties = {
  padding: '16px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const drawerSectionLabelStyle: CSSProperties = {
  color: '#64748b',
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: '1.5px',
  margin: '12px 0 4px 16px',
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

const workCenterStyle: CSSProperties = {
  ...tabStyle,
  padding: '10px 16px',
  fontSize: 12,
};

const activeWorkCenterStyle: CSSProperties = {
  ...workCenterStyle,
  background: 'rgba(249, 115, 22, 0.15)',
  color: '#f97316',
};

const settingsSectionStyle: CSSProperties = {
  borderTop: '1px solid #334155',
  padding: '16px 20px',
  flexShrink: 0,
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
  flexShrink: 0,
};

const devToolsSectionStyle: CSSProperties = {
  borderTop: '1px dashed #334155',
  padding: '12px 20px',
  flexShrink: 0,
};

const devToolsHeaderStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 800,
  color: '#475569',
  letterSpacing: '1.5px',
  marginBottom: 10,
};

const devToolsItemStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
};

const devToolsLabelStyle: CSSProperties = {
  fontSize: 11,
  color: '#475569',
  fontWeight: 700,
  letterSpacing: '0.5px',
};

const devTabStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  background: 'transparent',
  border: '1px solid #334155',
  color: '#475569',
  padding: '7px 10px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 700,
  cursor: 'pointer',
  letterSpacing: '0.5px',
  marginBottom: 8,
};

const devTabActiveStyle: CSSProperties = {
  ...devTabStyle,
  border: '1px solid #f97316',
  color: '#f97316',
  background: 'rgba(249,115,22,0.1)',
};

const devSelectStyle: CSSProperties = {
  background: '#0f172a',
  border: '1px solid #334155',
  color: '#64748b',
  padding: '4px 8px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600,
  cursor: 'pointer',
  outline: 'none',
  maxWidth: 160,
};
