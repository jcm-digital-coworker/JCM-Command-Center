import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import type { AppTab, DepartmentFilter, RoleView } from '../../types/app';
import type { WorkCenter } from '../../types/plant';
import { FLAG_LABELS, getAllFeatureFlags, setFeatureFlag } from '../../logic/featureFlags';
import type { FeatureFlag } from '../../logic/featureFlags';
import { getThemeColors } from '../../theme/theme';
import { resetDemoSessionState } from '../../logic/demoSessionReset';
import ClockworkPlantSimulation from '../simulation/ClockworkPlantSimulation';
import {
  PLANT_SIMULATION_UPDATED_EVENT,
  advancePlantSimulationStep,
  getPlantSimulationSnapshot,
  resetPlantSimulation,
  startPlantSimulation,
  type PlantSimulationSnapshot,
} from '../../simulation/plantSimulation';

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
const WORKFLOW_RUNTIME_UPDATED_EVENT = 'jcm-workflow-runtime-state-updated';

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
  const [simulation, setSimulation] = useState<PlantSimulationSnapshot>(() => getPlantSimulationSnapshot());

  useEffect(() => {
    const syncFlags = () => setFlags(getAllFeatureFlags());
    window.addEventListener('storage', syncFlags);
    return () => window.removeEventListener('storage', syncFlags);
  }, []);

  useEffect(() => {
    const syncSimulation = () => setSimulation(getPlantSimulationSnapshot());
    window.addEventListener(PLANT_SIMULATION_UPDATED_EVENT, syncSimulation);
    window.addEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, syncSimulation);
    window.addEventListener('storage', syncSimulation);
    return () => {
      window.removeEventListener(PLANT_SIMULATION_UPDATED_EVENT, syncSimulation);
      window.removeEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, syncSimulation);
      window.removeEventListener('storage', syncSimulation);
    };
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

  function goToDiagnosticOrder() {
    const orderNumber = simulation.activeOrder?.orderNumber;
    window.dispatchEvent(new CustomEvent(JCM_NAVIGATE_EVENT, { detail: { tab: 'orders', orderNumber } }));
  }

  function runDemoSessionReset() {
    resetDemoSessionState();
    setRoleView('Management');
    setDepartmentFilter('All');
    setFlags(getAllFeatureFlags());
    setSimulation(getPlantSimulationSnapshot());
    window.dispatchEvent(new CustomEvent(JCM_NAVIGATE_EVENT, { detail: { tab: 'dashboard' } }));
  }

  function runSimulationStart() {
    setSimulation(startPlantSimulation());
  }

  function runSimulationStep() {
    setSimulation(advancePlantSimulationStep());
  }

  function runSimulationReset() {
    setSimulation(resetPlantSimulation());
  }

  const lastEvent = simulation.lastEvent;
  const timeline = simulation.eventLog.slice(0, 5);

  return (
    <div style={containerStyle}>
      <button type="button" onClick={() => setOpen((value) => !value)} style={buttonStyle(open, theme)}>
        PILOT
      </button>

      {open && (
        <section style={panelStyle(theme)}>
          <div style={panelHeaderStyle}>
            <div>
              <div style={eyebrowStyle(theme)}>PILOT TOOLS</div>
              <h3 style={titleStyle(theme)}>Demo and validation controls</h3>
            </div>
            <button type="button" onClick={() => setOpen(false)} style={closeStyle(theme)}>X</button>
          </div>

          <p style={descriptionStyle(theme)}>
            Pilot controls for feature flags, role/dept views, plant simulation, and war room context during demo validation.
          </p>

          <button type="button" onClick={runDemoSessionReset} style={dangerButtonStyle(theme)}>
            RESET DEMO SESSION
          </button>

          <button
            type="button"
            onClick={goToWarRoomContext}
            style={activeTab === 'warRoomContext' ? devTabActiveStyle(theme) : devTabStyle(theme)}
          >
            WAR ROOM CONTEXT
          </button>

          <div style={sectionStyle(theme)}>
            <div style={sectionLabelStyle(theme)}>CLOCKWORK PLANT</div>
            <ClockworkPlantSimulation theme={theme} />
          </div>

          <div style={sectionStyle(theme)}>
            <div style={sectionLabelStyle(theme)}>DIAGNOSTIC ORDER SIMULATION</div>
            <div style={simulationCardStyle(theme)}>
              <div style={simulationTitleStyle(theme)}>{simulation.scenario?.name ?? 'No scenario available'}</div>
              <p style={simulationTextStyle(theme)}>{simulation.scenario?.description ?? 'Add production orders before running simulation.'}</p>
              <div style={simulationMetaGridStyle}>
                <Metric label="Order" value={simulation.activeOrder?.orderNumber ?? 'None'} theme={theme} />
                <Metric label="Step" value={`${simulation.completedSteps}/${simulation.totalSteps}`} theme={theme} />
                <Metric label="Dept" value={simulation.activeOrder?.currentDepartment ?? 'N/A'} theme={theme} />
                <Metric label="State" value={simulation.activeOrder?.status ?? 'N/A'} theme={theme} />
              </div>
              <div style={simulationStepStyle(theme)}>
                <span style={fieldLabelStyle(theme)}>NEXT EVENT</span>
                <strong>{simulation.nextStep?.title ?? 'Scenario complete'}</strong>
                <small>{simulation.nextStep?.description ?? simulation.session?.lastStepTitle ?? 'Reset to run it again.'}</small>
              </div>
              <div style={buttonGridStyle}>
                <button type="button" onClick={runSimulationStart} style={devTabStyle(theme)} disabled={!simulation.scenario}>START</button>
                <button type="button" onClick={runSimulationStep} style={devTabStyle(theme)} disabled={!simulation.scenario}>STEP</button>
                <button type="button" onClick={runSimulationReset} style={dangerButtonStyle(theme)}>RESET</button>
              </div>
              <button type="button" onClick={goToDiagnosticOrder} style={devTabStyle(theme)} disabled={!simulation.activeOrder}>
                OPEN DIAGNOSTIC ORDER
              </button>

              <div style={recorderStyle(theme)}>
                <div style={fieldLabelStyle(theme)}>LAST EVENT DIFF</div>
                {lastEvent ? (
                  <>
                    <strong style={simulationTitleStyle(theme)}>{lastEvent.title}</strong>
                    <div style={simulationTextStyle(theme)}>{lastEvent.note}</div>
                    {lastEvent.changes.length > 0 ? (
                      <div style={diffListStyle}>
                        {lastEvent.changes.slice(0, 8).map((change) => (
                          <div key={change.field} style={diffRowStyle(theme)}>
                            <span>{String(change.field)}</span>
                            <code>{String(change.before)}</code>
                            <span>to</span>
                            <code>{String(change.after)}</code>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={simulationTextStyle(theme)}>No tracked fields changed.</div>
                    )}
                    {lastEvent.expectedEffects.length > 0 ? (
                      <div style={expectedListStyle(theme)}>
                        <span style={fieldLabelStyle(theme)}>EXPECTED CHECKS</span>
                        {lastEvent.expectedEffects.slice(0, 4).map((effect) => (
                          <div key={effect} style={expectedItemStyle(theme)}>{effect}</div>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div style={simulationTextStyle(theme)}>Start the scenario to record before/after changes.</div>
                )}
              </div>

              {timeline.length > 0 ? (
                <div style={timelineStyle(theme)}>
                  <span style={fieldLabelStyle(theme)}>EVENT TIMELINE</span>
                  {timeline.map((event) => (
                    <div key={event.id} style={timelineItemStyle(theme)}>
                      <strong>{event.stepIndex}. {event.title}</strong>
                      <small>{event.changes.length} tracked change{event.changes.length === 1 ? '' : 's'} | {event.after.status} | {event.after.currentDepartment}</small>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div style={sectionStyle(theme)}>
            <div style={sectionLabelStyle(theme)}>FEATURE FLAGS</div>
            <div style={flagStackStyle}>
              {(Object.keys(FLAG_LABELS) as FeatureFlag[]).map((flag) => (
                <div key={flag} style={flagRowStyle(theme)}>
                  <span style={flagLabelStyle(theme)}>{FLAG_LABELS[flag]}</span>
                  <button
                    type="button"
                    onClick={() => toggleFlag(flag)}
                    style={flags[flag] ? flagOnStyle(theme) : flagOffStyle(theme)}
                  >
                    {flags[flag] ? 'ON' : 'OFF'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={sectionStyle(theme)}>
            <div style={sectionLabelStyle(theme)}>VIEW SIMULATION</div>
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
            Simulation writes local runtime overrides only. Use Start/Step, then compare the event diff against dashboard, traveler, workflow, and order-detail screens.
          </div>
        </section>
      )}
    </div>
  );
}

function Metric({ label, value, theme }: { label: string; value: string | number; theme: 'dark' | 'light' }) {
  return (
    <div>
      <span style={fieldLabelStyle(theme)}>{label}</span>
      <strong style={metricValueStyle(theme)}>{value}</strong>
    </div>
  );
}

const containerStyle: CSSProperties = {
  position: 'fixed',
  right: 14,
  bottom: 14,
  zIndex: 1200,
};

function buttonStyle(open: boolean, theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    width: 58,
    height: 48,
    borderRadius: 999,
    border: `1px solid ${colors.accent}`,
    background: open ? colors.accent : colors.panel,
    color: open ? colors.textInverted : colors.accent,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.8px',
    cursor: 'pointer',
    boxShadow: '0 10px 24px rgba(0,0,0,0.32)',
  };
}

function panelStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    position: 'absolute',
    right: 0,
    bottom: 58,
    width: 420,
    maxWidth: 'calc(100vw - 28px)',
    maxHeight: 'calc(100vh - 90px)',
    overflowY: 'auto',
    padding: 14,
    borderRadius: 10,
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    boxShadow: '0 18px 40px rgba(0,0,0,0.38)',
  };
}

const panelHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'flex-start',
};

function eyebrowStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    color: colors.accent,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '1.1px',
  };
}

function titleStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    margin: '3px 0 0',
    color: colors.text,
    fontSize: 15,
    fontWeight: 900,
  };
}

function closeStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    border: `1px solid ${colors.border}`,
    background: colors.button,
    color: colors.textSecondary,
    borderRadius: 5,
    padding: '5px 8px',
    cursor: 'pointer',
    fontWeight: 900,
    fontSize: 11,
  };
}

function descriptionStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    margin: '10px 0 12px',
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 1.45,
  };
}

function sectionStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    marginTop: 12,
    paddingTop: 12,
    borderTop: `1px solid ${colors.border}`,
  };
}

function sectionLabelStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    color: colors.accent,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '1px',
    marginBottom: 8,
  };
}

const flagStackStyle: CSSProperties = {
  display: 'grid',
  gap: 8,
};

function flagRowStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    padding: '9px 10px',
    borderRadius: 7,
    background: colors.button,
    border: `1px solid ${colors.border}`,
  };
}

function flagLabelStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: 800,
    lineHeight: 1.25,
  };
}

function flagOnStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    minWidth: 48,
    padding: '5px 9px',
    borderRadius: 5,
    border: `1px solid ${colors.success}`,
    background: colors.successBg,
    color: colors.success,
    cursor: 'pointer',
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.5px',
  };
}

function flagOffStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    ...flagOnStyle(theme),
    border: `1px solid ${colors.borderLight}`,
    background: 'transparent',
    color: colors.textMuted,
  };
}

function devTabStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    width: '100%',
    textAlign: 'left',
    background: colors.button,
    border: `1px solid ${colors.border}`,
    color: colors.textSecondary,
    padding: '9px 10px',
    borderRadius: 7,
    fontSize: 11,
    fontWeight: 900,
    cursor: 'pointer',
    letterSpacing: '0.5px',
    marginTop: 8,
  };
}

function devTabActiveStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    ...devTabStyle(theme),
    border: `1px solid ${colors.accent}`,
    color: colors.accent,
    background: colors.accentBg,
  };
}

function dangerButtonStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    ...devTabStyle(theme),
    border: `1px solid ${colors.danger}`,
    color: colors.danger,
    background: colors.dangerBg,
  };
}

const fieldStyle: CSSProperties = {
  display: 'grid',
  gap: 5,
  marginBottom: 10,
};

function fieldLabelStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    display: 'block',
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.8px',
    marginBottom: 4,
  };
}

function selectStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    background: colors.input,
    border: `1px solid ${colors.border}`,
    color: colors.textSecondary,
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
  const colors = getThemeColors(theme);
  return {
    marginTop: 12,
    paddingTop: 10,
    borderTop: `1px solid ${colors.border}`,
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 1.35,
  };
}

function simulationCardStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    display: 'grid',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    background: colors.panelAlt,
    border: `1px solid ${colors.border}`,
  };
}

function simulationTitleStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    color: colors.text,
    fontSize: 13,
    fontWeight: 900,
  };
}

function simulationTextStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    margin: 0,
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 1.4,
  };
}

const simulationMetaGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 8,
};

function metricValueStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    display: 'block',
    color: colors.text,
    fontSize: 12,
    fontWeight: 900,
    lineHeight: 1.2,
  };
}

function simulationStepStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    display: 'grid',
    gap: 2,
    padding: 9,
    borderRadius: 7,
    background: colors.card,
    border: `1px solid ${colors.border}`,
    color: colors.textSecondary,
    fontSize: 11,
  };
}

const buttonGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: 8,
};

const diffListStyle: CSSProperties = {
  display: 'grid',
  gap: 5,
};

function recorderStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    display: 'grid',
    gap: 8,
    padding: 9,
    borderRadius: 7,
    background: colors.card,
    border: `1px solid ${colors.border}`,
  };
}

function diffRowStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr auto 1fr',
    gap: 5,
    alignItems: 'center',
    color: colors.textSecondary,
    fontSize: 10,
  };
}

function expectedListStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    display: 'grid',
    gap: 5,
    paddingTop: 7,
    borderTop: `1px solid ${colors.border}`,
  };
}

function expectedItemStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 1.35,
  };
}

function timelineStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    display: 'grid',
    gap: 6,
    padding: 9,
    borderRadius: 7,
    background: colors.card,
    border: `1px solid ${colors.border}`,
  };
}

function timelineItemStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    display: 'grid',
    gap: 2,
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 1.25,
  };
}
