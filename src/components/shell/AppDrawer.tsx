import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import type { AppTab, DepartmentFilter, RoleView } from '../../types/app';
import type { WorkCenter } from '../../types/plant';
import type { NavigationGroupId } from '../../logic/navigationAccess';
import {
  getHomeTabForRole,
  getVisibleNavigationGroups,
} from '../../logic/navigationAccess';
import { getAllFeatureFlags, setFeatureFlag, FLAG_LABELS } from '../../logic/featureFlags';
import type { FeatureFlag } from '../../logic/featureFlags';

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

const roleOptions: RoleView[] = [
  'Production',
  'Department Lead',
  'Department Supervisor',
  'Management',
  'Maintenance',
  'Support',
];

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
  const visibleGroups = getVisibleNavigationGroups(roleView);
  const homeTab = getHomeTabForRole(roleView);
  const activeGroupId = getActiveGroupId(tab, visibleGroups);
  const [openGroupId, setOpenGroupId] = useState<NavigationGroupId | null>(activeGroupId);
  const [workCentersOpen, setWorkCentersOpen] = useState(departmentFilter !== 'All');
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [flags, setFlags] = useState(() => getAllFeatureFlags());

  function toggleFlag(flag: FeatureFlag) {
    setFeatureFlag(flag, !flags[flag]);
    setFlags(getAllFeatureFlags());
  }

  useEffect(() => {
    if (!open) return;
    setOpenGroupId(activeGroupId);
    setWorkCentersOpen(departmentFilter !== 'All');
  }, [activeGroupId, departmentFilter, open]);

  useEffect(() => {
    if (!open) setDevToolsOpen(false);
  }, [open]);

  if (!open) return null;

  function goToTab(nextTab: AppTab) {
    setTab(nextTab);
    onClose();
  }

  function toggleGroup(groupId: NavigationGroupId) {
    setOpenGroupId((current) => (current === groupId ? null : groupId));
  }

  return (
    <>
      <style>
        {`
          .drawer-menu-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .drawer-menu-scroll::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <div style={overlayStyle} onClick={onClose} />
      <div style={drawerStyle}>
        <div style={headerStyle}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '1px' }}>
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
            X
          </button>
        </div>

        <div style={homeSectionStyle}>
          <button
            onClick={() => goToTab(homeTab)}
            style={tab === homeTab ? homeButtonActiveStyle : homeButtonStyle}
          >
            <div style={indicatorStyle(tab === homeTab)} />
            HOME / {getHomeLabel(homeTab)}
          </button>
        </div>

        <div style={menuContainerStyle} className="drawer-menu-scroll">
          <div style={menuStyle}>
            {visibleGroups.map((group) => {
              const groupOpen = openGroupId === group.id;
              const groupActive = group.id === activeGroupId;
              return (
                <div key={group.id} style={accordionGroupStyle}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    style={groupActive ? activeAccordionHeaderStyle : accordionHeaderStyle}
                  >
                    <span>{group.label.toUpperCase()}</span>
                    <span style={accordionMetaStyle}>
                      {group.items.length} {group.items.length === 1 ? 'PAGE' : 'PAGES'} {groupOpen ? '-' : '+'}
                    </span>
                  </button>
                  {groupOpen && (
                    <div style={accordionBodyStyle}>
                      <div style={groupDescriptionStyle}>{group.description}</div>
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => goToTab(item.id)}
                          style={tab === item.id ? activeTabStyle : tabStyle}
                          title={item.description}
                        >
                          <div style={indicatorStyle(tab === item.id)} />
                          <span>{item.label.toUpperCase()}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div style={accordionGroupStyle}>
              <button
                type="button"
                onClick={() => setWorkCentersOpen((current) => !current)}
                style={departmentFilter !== 'All' ? activeAccordionHeaderStyle : accordionHeaderStyle}
              >
                <span>WORK CENTERS</span>
                <span style={accordionMetaStyle}>
                  {workCenters.length + 1} ITEMS {workCentersOpen ? '-' : '+'}
                </span>
              </button>
              {workCentersOpen && (
                <div style={accordionBodyStyle}>
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
              )}
            </div>
          </div>

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
                {theme === 'dark' ? 'DARK' : 'LIGHT'}
              </button>
            </div>
          </div>
        </div>

        <div style={footerStyle}>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Nash, Texas</div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDevToolsOpen((current) => !current)}
        style={devFlyoutButtonStyle(devToolsOpen)}
        aria-expanded={devToolsOpen}
      >
        DEV
      </button>

      {devToolsOpen && (
        <div style={devFlyoutPanelStyle}>
          <div style={devFlyoutHeaderStyle}>
            <div>
              <div style={devToolsHeaderStyle}>CO-WORKER VIEW</div>
              <div style={devFlyoutTitleStyle}>Developer Toolkit</div>
            </div>
            <button type="button" onClick={() => setDevToolsOpen(false)} style={devFlyoutCloseStyle}>X</button>
          </div>

          <button
            onClick={() => goToTab('warRoomContext')}
            style={tab === 'warRoomContext' ? devTabActiveStyle : devTabStyle}
          >
            WAR ROOM CONTEXT
          </button>

          <div style={{ marginBottom: 12 }}>
            <div style={{ ...devToolsLabelStyle, marginBottom: 6 }}>FEATURE FLAGS</div>
            {(Object.keys(FLAG_LABELS) as FeatureFlag[]).map((flag) => (
              <div key={flag} style={flagRowStyle}>
                <span style={flagLabelStyle}>{FLAG_LABELS[flag]}</span>
                <button
                  type="button"
                  onClick={() => toggleFlag(flag)}
                  style={flags[flag] ? flagOnStyle : flagOffStyle}
                >
                  {flags[flag] ? 'ON' : 'OFF'}
                </button>
              </div>
            ))}
          </div>

          <div style={devToolsItemStyle}>
            <span style={devToolsLabelStyle}>ROLE</span>
            <select
              value={roleView}
              onChange={(e) => setRoleView(e.target.value as RoleView)}
              style={devSelectStyle}
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
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
      )}
    </>
  );
}

function getActiveGroupId(tab: AppTab, groups: ReturnType<typeof getVisibleNavigationGroups>): NavigationGroupId | null {
  return groups.find((group) => group.items.some((item) => item.id === tab))?.id ?? null;
}

function getHomeLabel(homeTab: AppTab) {
  if (homeTab === 'workflow') return 'WORKFLOW';
  if (homeTab === 'maintenance') return 'MAINTENANCE';
  if (homeTab === 'receiving') return 'RECEIVING';
  if (homeTab === 'risk') return 'QA / SAFETY';
  return 'COMMAND';
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

function devFlyoutButtonStyle(open: boolean): CSSProperties {
  return {
    position: 'fixed',
    top: 98,
    left: 292,
    zIndex: 1002,
    width: 46,
    height: 38,
    borderRadius: '0 6px 6px 0',
    border: '1px solid #f97316',
    borderLeft: 'none',
    background: open ? '#f97316' : '#0f172a',
    color: open ? '#111827' : '#f97316',
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '1px',
    cursor: 'pointer',
    boxShadow: '4px 4px 14px rgba(0,0,0,0.3)',
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

const homeSectionStyle: CSSProperties = {
  padding: '12px 12px',
  borderBottom: '1px solid #334155',
  flexShrink: 0,
};

const homeButtonStyle: CSSProperties = {
  width: '100%',
  background: 'rgba(15, 23, 42, 0.8)',
  border: '1px solid #334155',
  padding: '13px 14px',
  borderRadius: 4,
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 900,
  color: '#e2e8f0',
  display: 'flex',
  alignItems: 'center',
  letterSpacing: '0.6px',
};

const homeButtonActiveStyle: CSSProperties = {
  ...homeButtonStyle,
  background: 'rgba(249, 115, 22, 0.15)',
  border: '1px solid #f97316',
  color: '#f97316',
};

const menuContainerStyle: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  minHeight: 0,
};

const menuStyle: CSSProperties = {
  padding: '12px 12px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const accordionGroupStyle: CSSProperties = {
  border: '1px solid #334155',
  borderRadius: 5,
  overflow: 'hidden',
  background: 'rgba(15, 23, 42, 0.45)',
};

const accordionHeaderStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 10,
  padding: '11px 12px',
  background: 'transparent',
  border: 'none',
  color: '#94a3b8',
  cursor: 'pointer',
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: '1px',
  textAlign: 'left',
};

const activeAccordionHeaderStyle: CSSProperties = {
  ...accordionHeaderStyle,
  background: 'rgba(249, 115, 22, 0.15)',
  color: '#f97316',
};

const accordionMetaStyle: CSSProperties = {
  color: '#64748b',
  fontSize: 9,
  fontWeight: 900,
  whiteSpace: 'nowrap',
};

const accordionBodyStyle: CSSProperties = {
  padding: '4px 4px 8px',
  borderTop: '1px solid #334155',
};

const groupDescriptionStyle: CSSProperties = {
  color: '#64748b',
  fontSize: 10,
  lineHeight: 1.35,
  margin: '6px 10px 6px 12px',
};

const tabStyle: CSSProperties = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  padding: '11px 12px',
  borderRadius: 4,
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: 12,
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
  padding: '9px 12px',
  fontSize: 11,
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

const devFlyoutPanelStyle: CSSProperties = {
  position: 'fixed',
  top: 98,
  left: 338,
  width: 270,
  maxHeight: 'calc(100vh - 120px)',
  overflowY: 'auto',
  zIndex: 1001,
  background: '#0f172a',
  border: '1px solid #334155',
  borderLeft: '3px solid #f97316',
  borderRadius: '0 8px 8px 0',
  boxShadow: '8px 8px 24px rgba(0,0,0,0.38)',
  padding: 14,
};

const devFlyoutHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 10,
  marginBottom: 12,
  paddingBottom: 10,
  borderBottom: '1px solid #1e293b',
};

const devFlyoutTitleStyle: CSSProperties = {
  color: '#e2e8f0',
  fontSize: 14,
  fontWeight: 900,
  letterSpacing: '0.7px',
};

const devFlyoutCloseStyle: CSSProperties = {
  background: 'transparent',
  border: '1px solid #334155',
  color: '#64748b',
  width: 28,
  height: 28,
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 900,
};

const devToolsHeaderStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 800,
  color: '#475569',
  letterSpacing: '1.5px',
  marginBottom: 3,
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
  color: '#64748b',
  padding: '8px 10px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 800,
  cursor: 'pointer',
  letterSpacing: '0.5px',
  marginBottom: 12,
};

const devTabActiveStyle: CSSProperties = {
  ...devTabStyle,
  border: '1px solid #f97316',
  color: '#f97316',
  background: 'rgba(249,115,22,0.1)',
};

const devSelectStyle: CSSProperties = {
  background: '#020617',
  border: '1px solid #334155',
  color: '#94a3b8',
  padding: '5px 8px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 700,
  cursor: 'pointer',
  outline: 'none',
  maxWidth: 160,
};

const flagRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 6,
  gap: 8,
};

const flagLabelStyle: CSSProperties = {
  fontSize: 10,
  color: '#64748b',
  fontWeight: 700,
  letterSpacing: '0.3px',
  flex: 1,
};

const flagOnStyle: CSSProperties = {
  fontSize: 9,
  fontWeight: 900,
  padding: '3px 8px',
  borderRadius: 3,
  border: '1px solid #10b981',
  background: 'rgba(16,185,129,0.15)',
  color: '#10b981',
  cursor: 'pointer',
  letterSpacing: '0.5px',
};

const flagOffStyle: CSSProperties = {
  ...flagOnStyle,
  border: '1px solid #334155',
  background: 'transparent',
  color: '#64748b',
};
