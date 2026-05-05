import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import type { AppTab, DepartmentFilter, RoleView } from '../../types/app';
import type { WorkCenter } from '../../types/plant';
import { FLAG_LABELS, getAllFeatureFlags, setFeatureFlag } from '../../logic/featureFlags';
import type { FeatureFlag } from '../../logic/featureFlags';

type DevToolkitFlyoutProps = {
  theme: 'dark' | 'light';
  activeTab: AppTab;
  roleView: RoleView;
  setRoleView: (view: RoleView) => void;
  departmentFilter: DepartmentFilter;
  setDepartmentFilter: (filter: DepartmentFilter) => void;
  workCenters: WorkCenter[];
};

const roleOptions: RoleView[] = [
  'Production',
  'Department Lead',
  'Department Supervisor',
  'Management',
  'Maintenance',
  'Support',
];

const JCM_NAVIGATE_EVENT = 'jcm:navigate';

export default function DevToolkitFlyout({
  theme,
  activeTab,
  roleView,
  setRoleView,
  departmentFilter,
  setDepartmentFilter,
  workCenters,
}: DevToolkitFlyoutProps) {
  const [open, setOpen] = useState(false);
  const [flags, setFlags] = useState(() => getAllFeatureFlags());

  useEffect(() => {
    const syncFlags = () => setFlags(getAllFeatureFlags());
    window.addEventListener('storage', syncFlags);
    return () => window.removeEventListener('storage', syncFlags);
  }, []);

  function toggleFlag(flag: FeatureFlag) {
    const nextValue = !flags[flag];
    setFeatureFlag(flag, nextValue);
    setFlags(getAllFeatureFlags());
  }

  function goToWarRoomContext() {
    window.dispatchEvent(new CustomEvent(JCM_NAVIGATE_EVENT, { detail: { tab: 'warRoomContext' } }));
    setOpen(false);
  }

  return (
    <div style={containerStyle}>
      <button type="button" onClick={() => setOpen((value) => !value)} style={buttonStyle(open)}>
        DEV
      </button>

      {open && (
        <section style={panelStyle(theme)}>
          <div style={panelHeaderStyle}>
            <div>
              <div style={eyebrowStyle}>DEV TOOLKIT</div>
              <h3 style={titleStyle(theme)}>Experimental controls</h3>
            </div>
            <button type="button" onClick={() => setOpen(false)} style={closeStyle(theme)}>X</button>
          </div>

          <p style={descriptionStyle}>
            Floating dev-only controls for feature flags, role/dept simulation, and war room context.
          </p>

          <button
            type="button"
            onClick={goToWarRoomContext}
            style={activeTab === 'warRoomContext' ? devTabActiveStyle(theme) : devTabStyle(theme)}
          >
            WAR ROOM CONTEXT
          </button>

          <div style={sectionStyle(theme)}>
            <div style={sectionLabelStyle}>FEATURE FLAGS</div>
            <div style={flagStackStyle}>
              {(Object.keys(FLAG_LABELS) as FeatureFlag[]).map((flag) => (
                <div key={flag} style={flagRowStyle(theme)}>
                  <span style={flagLabelStyle(theme)}>{FLAG_LABELS[flag]}</span>
                  <button
                    type="button"
                    onClick={() => toggleFlag(flag)}
                    style={flags[flag] ? flagOnStyle : flagOffStyle(theme)}
                  >
                    {flags[flag] ? 'ON' : 'OFF'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={sectionStyle(theme)}>
            <div style={sectionLabelStyle}>VIEW SIMULATION</div>
            <label style={fieldStyle}>
              <span style={fieldLabelStyle(theme)}>ROLE</span>
              <select
                value={roleView}
                onChange={(e) => setRoleView(e.target.value as RoleView)}
                style={selectStyle(theme)}
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </label>
            <label style={fieldStyle}>
              <span style={fieldLabelStyle(theme)}>DEPT</span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value as DepartmentFilter)}
                style={selectStyle(theme)}
              >
                <option value="All">All</option>
                {workCenters.map((center) => (
                  <option key={center.id} value={center.department}>
                    {center.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={hintStyle(theme)}>
            Flags are stored locally in this browser. Role and department controls simulate views for development.
          </div>
        </section>
      )}
    </div>
  );
}

const containerStyle: CSSProperties = {
  position: 'fixed',
  right: 14,
  bottom: 14,
  zIndex: 1200,
};

function buttonStyle(open: boolean): CSSProperties {
  return {
    width: 48,
    height: 48,
    borderRadius: 999,
    border: open ? '1px solid #f97316' : '1px solid rgba(249, 115, 22, 0.65)',
    background: open ? '#f97316' : 'rgba(15, 23, 42, 0.92)',
    color: open ? '#ffffff' : '#f97316',
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '0.8px',
    cursor: 'pointer',
    boxShadow: '0 10px 24px rgba(0,0,0,0.32)',
  };
}

function panelStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    position: 'absolute',
    right: 0,
    bottom: 58,
    width: 330,
    maxWidth: 'calc(100vw - 28px)',
    maxHeight: 'calc(100vh - 90px)',
    overflowY: 'auto',
    padding: 14,
    borderRadius: 10,
    background: theme === 'dark' ? '#0f172a' : '#ffffff',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    boxShadow: '0 18px 40px rgba(0,0,0,0.38)',
  };
}

const panelHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'flex-start',
};

const eyebrowStyle: CSSProperties = {
  color: '#f97316',
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: '1.1px',
};

function titleStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    margin: '3px 0 0',
    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
    fontSize: 15,
    fontWeight: 900,
  };
}

function closeStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
    background: theme === 'dark' ? '#1e293b' : '#f8fafc',
    color: theme === 'dark' ? '#cbd5e1' : '#475569',
    borderRadius: 5,
    padding: '5px 8px',
    cursor: 'pointer',
    fontWeight: 900,
    fontSize: 11,
  };
}

const descriptionStyle: CSSProperties = {
  margin: '10px 0 12px',
  color: '#64748b',
  fontSize: 12,
  lineHeight: 1.45,
};

function sectionStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    marginTop: 12,
    paddingTop: 12,
    borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
  };
}

const sectionLabelStyle: CSSProperties = {
  color: '#f97316',
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: '1px',
  marginBottom: 8,
};

const flagStackStyle: CSSProperties = {
  display: 'grid',
  gap: 8,
};

function flagRowStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    padding: '9px 10px',
    borderRadius: 7,
    background: theme === 'dark' ? '#1e293b' : '#f8fafc',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
  };
}

function flagLabelStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    color: theme === 'dark' ? '#cbd5e1' : '#334155',
    fontSize: 12,
    fontWeight: 800,
    lineHeight: 1.25,
  };
}

const flagOnStyle: CSSProperties = {
  minWidth: 48,
  padding: '5px 9px',
  borderRadius: 5,
  border: '1px solid #10b981',
  background: 'rgba(16,185,129,0.15)',
  color: '#10b981',
  cursor: 'pointer',
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: '0.5px',
};

function flagOffStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    ...flagOnStyle,
    border: theme === 'dark' ? '1px solid #475569' : '1px solid #cbd5e1',
    background: 'transparent',
    color: '#64748b',
  };
}

function devTabStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    width: '100%',
    textAlign: 'left',
    background: theme === 'dark' ? '#1e293b' : '#f8fafc',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    color: theme === 'dark' ? '#cbd5e1' : '#475569',
    padding: '9px 10px',
    borderRadius: 7,
    fontSize: 11,
    fontWeight: 900,
    cursor: 'pointer',
    letterSpacing: '0.5px',
  };
}

function devTabActiveStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    ...devTabStyle(theme),
    border: '1px solid #f97316',
    color: '#f97316',
    background: 'rgba(249,115,22,0.1)',
  };
}

const fieldStyle: CSSProperties = {
  display: 'grid',
  gap: 5,
  marginBottom: 10,
};

function fieldLabelStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    color: theme === 'dark' ? '#64748b' : '#64748b',
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.8px',
  };
}

function selectStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: theme === 'dark' ? '#020617' : '#ffffff',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
    color: theme === 'dark' ? '#94a3b8' : '#334155',
    padding: '8px 9px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer',
    outline: 'none',
    width: '100%',
  };
}

function hintStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    marginTop: 12,
    paddingTop: 10,
    borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    color: '#64748b',
    fontSize: 11,
    lineHeight: 1.35,
  };
}
