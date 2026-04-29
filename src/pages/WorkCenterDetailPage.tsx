import type { CSSProperties, ReactNode } from 'react';
import type { WorkCenter } from '../types/plant';
import type { Machine } from '../types/machine';
import type { MaintenanceTask } from '../types/maintenance';
import type { RiskItem } from '../types/risk';
import type { RoleView } from '../types/app';
import StatusBadge from '../components/StatusBadge';
import ReceivingWorkflowPanel from '../components/ReceivingWorkflowPanel';
import LiveCoveragePanel from '../components/LiveCoveragePanel';
import { workCenterAssets } from '../data/workCenterAssets';
import { isMaintenanceRole, isMaterialRole, isSupervisorRole } from '../data/workRoles';
import { getResourceModel } from '../data/workCenterResources';

type ReceivingShortcut = 'submit' | 'arriving' | 'ready' | 'claimed' | 'delivered' | 'holds';

interface WorkCenterDetailPageProps {
  workCenter: WorkCenter;
  machines: Machine[];
  tasks: MaintenanceTask[];
  risks: RiskItem[];
  roleView: RoleView;
  onBack: () => void;
  onOpenMachine: (machine: Machine) => void;
  onGoToMaintenance: () => void;
  onOpenCoverage: (view?: 'hub' | 'signin' | 'available' | 'assigned' | 'break' | 'offline') => void;
  onOpenReceiving?: (view: ReceivingShortcut, requesterDepartment?: WorkCenter['department']) => void;
  theme?: 'dark' | 'light';
}

export default function WorkCenterDetailPage({
  workCenter,
  machines,
  tasks,
  risks,
  roleView,
  onBack,
  onOpenMachine,
  onGoToMaintenance,
  onOpenCoverage,
  onOpenReceiving,
  theme = 'dark',
}: WorkCenterDetailPageProps) {
  const departmentMachines = workCenter.department === 'Maintenance'
    ? machines
    : machines.filter((machine) => machine.department === workCenter.department);
  const departmentAssets = workCenterAssets.filter((asset) => asset.department === workCenter.department);
  const activeTasks = tasks.filter((task) => task.status !== 'OK');
  const activeRisks = risks.filter((risk) => risk.status === 'OPEN' || risk.status === 'IN_PROGRESS');
  const isSupervisorView = isSupervisorRole(roleView);
  const isMaintenanceView = isMaintenanceRole(roleView);
  const resourceModel = getResourceModel(workCenter.department);
  const isReceiving = workCenter.id === 'receiving';
  const priority = getPriority(workCenter, departmentMachines, activeTasks, activeRisks);
  const tabletFocus = getTabletFocus(workCenter.id, roleView);

  return (
    <div style={pageStyle}>
      <button onClick={onBack} style={getBackButtonStyle(theme)}>← BACK TO COMMAND CENTER</button>

      <section style={getHeroStyle(theme, workCenter.status)}>
        <div>
          <div style={eyebrowStyle}>WORK CENTER TABLET</div>
          <h2 style={getHeroTitleStyle(theme)}>{workCenter.name}</h2>
          <p style={getHeroTextStyle(theme)}>
            {isSupervisorView ? workCenter.primaryFunction : getWorkerHeroText(workCenter.id)}
          </p>
        </div>
        <div style={getStatusPillStyle(workCenter.status)}>{workCenter.status.replace('_', ' ')}</div>
      </section>

      <section style={getNextMoveStyle(theme)}>
        <div style={eyebrowStyle}>DIGITAL CO-WORKER</div>
        <h3 style={getSectionTitleStyle(theme)}>Today’s priority</h3>
        <p style={getLargeTextStyle(theme)}>{priority}</p>

        {isSupervisorView ? (
          <div style={getThreeColumnGridStyle()}>
            <InfoTile label="Role view" value={roleView} theme={theme} />
            <InfoTile label="Live coverage source" value="Tablet sign-in / roll call" theme={theme} />
            <InfoTile label="Default station" value={workCenter.stationTabletDefault} theme={theme} />
            <InfoTile label="Resource model" value={resourceModel?.displayLabel ?? "Work center"} theme={theme} />
          </div>
        ) : (
          <div style={getWorkerNoticeStyle(theme)}>
            Worker station view: this screen stays focused on orders, claims, handoffs, blockers, and the next useful action. This area is modeled as {resourceModel?.displayLabel ?? "a work center"}. 
          </div>
        )}
      </section>

      {isSupervisorView ? (
        <LiveCoveragePanel theme={theme} department={workCenter.department} onOpenStatus={onOpenCoverage} />
      ) : null}

      {isReceiving ? <ReceivingWorkflowPanel theme={theme} onOpenQueue={onOpenReceiving} /> : null}

      {!isReceiving ? (
        <Panel
          title="Material requests"
          theme={theme}
          actionLabel="REQUEST MATERIAL"
          onAction={() => onOpenReceiving?.('submit', workCenter.department)}
        >
          <p style={getHeroTextStyle(theme)}>Request known department material from Receiving. Pick the catalog item, enter quantity, add the weekly order or job number, then Receiving can verify inventory and deliver it to your station.</p>
        </Panel>
      ) : null}

      <div style={getMainGridStyle()}>
        <Panel title={isSupervisorView ? 'Department focus' : 'Today’s work'} theme={theme}>
          <List items={workCenter.dailyFocus} theme={theme} />
        </Panel>

        <Panel title={isSupervisorView ? 'Coordination view' : 'Station actions'} theme={theme}>
          <List items={tabletFocus} theme={theme} />
        </Panel>
      </div>

      <div style={getMainGridStyle()}>
        <Panel title={getAssetPanelTitle(workCenter.department, isMaintenanceView)} theme={theme}>
          {isReceiving ? (
            departmentAssets.length === 0 ? (
              <EmptyState text="No receiving forklifts or support assets are listed yet." theme={theme} />
            ) : (
              <div style={listStackStyle}>
                {departmentAssets.map((asset) => (
                  <div key={asset.id} style={getSimpleRowStyle(theme)}>
                    <div>
                      <div style={getRowTitleStyle(theme)}>{asset.name}</div>
                      <div style={mutedStyle}>{asset.lastKnownState}</div>
                      {asset.nextAction ? <div style={mutedStyle}>Next: {asset.nextAction}</div> : null}
                    </div>
                    <span style={getAssetStatusBadgeStyle(asset.status)}>{asset.status.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            )
          ) : departmentMachines.length === 0 ? (
            <EmptyState text={workCenter.department === 'Maintenance' ? 'No machines currently need maintenance attention.' : 'No machines are assigned to this work center yet.'} theme={theme} />
          ) : (
            <div style={listStackStyle}>
              {departmentMachines.map((machine) => (
                <button key={machine.id} onClick={() => onOpenMachine(machine)} style={getMachineRowStyle(theme)}>
                  <div>
                    <div style={getRowTitleStyle(theme)}>{machine.name}</div>
                    <div style={mutedStyle}>{machine.department} • {machine.lastKnownState}</div>
                  </div>
                  <StatusBadge state={machine.state} priority={machine.alarmPriority} />
                </button>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Blockers and risks" theme={theme}>
          {activeRisks.length === 0 ? (
            <EmptyState text="No open risks for this work center." theme={theme} />
          ) : (
            <div style={listStackStyle}>
              {activeRisks.map((risk) => (
                <div key={risk.id} style={getSimpleRowStyle(theme)}>
                  <div>
                    <div style={getRowTitleStyle(theme)}>{risk.title}</div>
                    <div style={mutedStyle}>{risk.category ?? risk.source}</div>
                  </div>
                  <span style={getSmallBadgeStyle(risk.severity ?? risk.level)}>{risk.severity ?? risk.level}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div style={getMainGridStyle()}>
        <Panel title="Maintenance / service" theme={theme} actionLabel="OPEN MAINTENANCE" onAction={onGoToMaintenance}>
          {activeTasks.length === 0 ? (
            <EmptyState text="No active scheduled maintenance items are showing here." theme={theme} />
          ) : (
            <div style={listStackStyle}>
              {activeTasks.slice(0, 5).map((task) => (
                <div key={task.id} style={getSimpleRowStyle(theme)}>
                  <div>
                    <div style={getRowTitleStyle(theme)}>{task.title}</div>
                    <div style={mutedStyle}>Due {task.nextDue}</div>
                  </div>
                  <span style={getSmallBadgeStyle(task.status)}>{task.status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title={isSupervisorView ? 'Supervisor tools' : 'Support tools'}
          theme={theme}
          actionLabel={isSupervisorView ? 'OPEN COVERAGE' : undefined}
          onAction={isSupervisorView ? onOpenCoverage : undefined}
        >
          <List
            items={isSupervisorView ? ['Live roll call / coverage board', 'Assignment visibility by person', 'Work center blockers', 'Next build modules'] : isMaintenanceView ? ['Open maintenance requests', 'Machine repair notes', 'Downtime blockers'] : workCenter.nextBuildModules}
            theme={theme}
          />
        </Panel>
      </div>
    </div>
  );
}

function getPriority(workCenter: WorkCenter, machines: Machine[], tasks: MaintenanceTask[], risks: RiskItem[]) {
  const downMachine = machines.find((machine) => machine.state === 'ALARM' || machine.alarmPriority === 'ESTOP');
  if (downMachine) return `${downMachine.name} needs attention before this area can run cleanly.`;
  if (tasks.length > 0) return `${tasks.length} maintenance item${tasks.length === 1 ? '' : 's'} need review or follow-up.`;
  if (risks.length > 0) return `${risks.length} open risk item${risks.length === 1 ? '' : 's'} should be reviewed before the shift gets busy.`;
  if (workCenter.id === 'receiving') return 'Keep the inbound queue accurate, then deliver material to the right work centers without creating mystery inventory.';
  return workCenter.stationTabletDefault;
}

function getWorkerHeroText(workCenterId: string) {
  if (workCenterId === 'receiving') return 'Receive, verify, claim, deliver, and hand off material without making the floor hunt for it.';
  if (workCenterId === 'machine-shop') return 'See the work, find blockers, request material, and keep the station moving.';
  if (workCenterId === 'material-handling') return 'Work the cut/stage queue and keep downstream departments supplied.';
  if (workCenterId === 'fab') return 'Work the weld queue, flag blockers, and hand off cleanly to Assembly.';
  if (workCenterId === 'assembly') return 'Build from available components, call out missing parts, and complete handoffs.';
  return 'Do the work, report blockers, and leave a clean handoff trail.';
}

function getTabletFocus(workCenterId: string, roleView: RoleView) {
  if (workCenterId === 'receiving') {
    if (isMaterialRole(roleView) || roleView === 'Machine Operator' || roleView === 'Operator') {
      return ['Check inbound receiver accuracy.', 'Claim deliveries that are ready.', 'Mark delivered only after handoff.', 'Put unclear, short, or damaged items on problem hold.'];
    }
    if (isSupervisorRole(roleView)) {
      return ['Review late, hot, or questionable receipts first.', 'Watch delivery backlog by work center.', 'Use live coverage before assigning more work.', 'Confirm handoff notes are clear.'];
    }
  }
  if (isMaintenanceRole(roleView)) return ['Look for downtime or safety-impacting requests first.', 'Claim the request before starting work.', 'Leave completion notes.', 'Escalate repeated failures into machine history.'];
  if (isSupervisorRole(roleView)) return ['Check blockers before output numbers.', 'Look for people, machines, or material that need help.', 'Use coverage to assign work.', 'Push only the next useful action to the floor.'];
  return ['Start with the next required task.', 'Check blockers before working around them.', 'Use maintenance requests instead of hallway reports.', 'Leave a short handoff note when something changes.'];
}

function getAssetPanelTitle(department: WorkCenter['department'], isMaintenanceView: boolean) {
  if (department === 'Receiving') return 'Forklifts / receiving assets';
  if (department === 'Maintenance' || isMaintenanceView) return 'Machines needing service';
  return 'Active machines / stations';
}

function getAssetStatusBadgeStyle(status: string): CSSProperties {
  const color = status === 'NEEDS_SERVICE' || status === 'OFFLINE' ? '#dc2626' : status === 'ASSIGNED' ? '#f59e0b' : '#10b981';
  return { whiteSpace: 'nowrap', padding: '5px 8px', borderRadius: 4, border: `1px solid ${color}66`, color, background: `${color}18`, fontSize: 11, fontWeight: 900, letterSpacing: '0.5px', textTransform: 'uppercase' };
}
function Panel({ title, children, theme, actionLabel, onAction }: { title: string; children: ReactNode; theme: 'dark' | 'light'; actionLabel?: string; onAction?: () => void }) {
  return (
    <section style={getPanelStyle(theme)}>
      <div style={panelHeaderStyle}>
        <h3 style={getSectionTitleStyle(theme)}>{title}</h3>
        {actionLabel && onAction ? <button onClick={onAction} style={actionButtonStyle}>{actionLabel}</button> : null}
      </div>
      {children}
    </section>
  );
}

function InfoTile({ label, value, theme }: { label: string; value: string; theme: 'dark' | 'light' }) {
  return (
    <div style={getInfoTileStyle(theme)}>
      <div style={tileLabelStyle}>{label}</div>
      <div style={getTileValueStyle(theme)}>{value}</div>
    </div>
  );
}

function List({ items, theme }: { items: string[]; theme: 'dark' | 'light' }) {
  return <div style={listStackStyle}>{items.map((item) => <div key={item} style={getSimpleRowStyle(theme)}><div style={orangeDotStyle} /><div style={getRowTitleStyle(theme)}>{item}</div></div>)}</div>;
}
function EmptyState({ text, theme }: { text: string; theme: 'dark' | 'light' }) { return <div style={getEmptyStyle(theme)}>{text}</div>; }

const pageStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16 };
const eyebrowStyle: CSSProperties = { color: '#f97316', fontSize: 11, fontWeight: 900, letterSpacing: '1.4px', textTransform: 'uppercase', marginBottom: 8 };
const mutedStyle: CSSProperties = { color: '#64748b', fontSize: 12, marginTop: 4, textAlign: 'left' };
const listStackStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 10 };
const panelHeaderStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 14 };
const orangeDotStyle: CSSProperties = { width: 8, height: 8, borderRadius: 999, background: '#f97316', flex: '0 0 auto', marginTop: 5 };
const actionButtonStyle: CSSProperties = { padding: '8px 12px', borderRadius: 4, border: '1px solid #f97316', background: 'rgba(249, 115, 22, 0.12)', color: '#f97316', fontSize: 11, fontWeight: 900, letterSpacing: '0.8px', cursor: 'pointer' };
const tileLabelStyle: CSSProperties = { color: '#94a3b8', fontSize: 11, fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 };
function getBackButtonStyle(theme: 'dark' | 'light'): CSSProperties { return { alignSelf: 'flex-start', padding: '10px 14px', borderRadius: 4, border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1', background: theme === 'dark' ? '#1e293b' : '#ffffff', color: theme === 'dark' ? '#e2e8f0' : '#0f172a', cursor: 'pointer', fontWeight: 900, letterSpacing: '0.7px' }; }
function getHeroStyle(theme: 'dark' | 'light', status: WorkCenter['status']): CSSProperties { return { padding: 22, borderRadius: 8, border: `1px solid ${getStatusColor(status)}`, background: theme === 'dark' ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', boxShadow: '0 2px 12px rgba(0,0,0,0.22)', display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }; }
function getHeroTitleStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: 0, fontSize: 30, color: theme === 'dark' ? '#e2e8f0' : '#0f172a', letterSpacing: '0.4px' }; }
function getHeroTextStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: '10px 0 0 0', color: theme === 'dark' ? '#cbd5e1' : '#475569', fontSize: 14, lineHeight: 1.5, maxWidth: 820 }; }
function getNextMoveStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 20, borderRadius: 8, border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', background: theme === 'dark' ? '#1e293b' : '#ffffff' }; }
function getLargeTextStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 20, lineHeight: 1.4, fontWeight: 800, margin: '8px 0 18px 0' }; }
function getSectionTitleStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: 0, color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 16, fontWeight: 900, letterSpacing: '0.7px', textTransform: 'uppercase' }; }
function getThreeColumnGridStyle(): CSSProperties { return { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }; }
function getMainGridStyle(): CSSProperties { return { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }; }
function getPanelStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 18, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }; }
function getInfoTileStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 14, borderRadius: 6, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function getTileValueStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 14, lineHeight: 1.4, fontWeight: 800 }; }
function getWorkerNoticeStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 13, borderRadius: 6, border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', background: theme === 'dark' ? '#0f172a' : '#f8fafc', color: theme === 'dark' ? '#94a3b8' : '#475569', fontSize: 13, lineHeight: 1.5, fontWeight: 700 }; }
function getMachineRowStyle(theme: 'dark' | 'light'): CSSProperties { return { ...getSimpleRowStyle(theme), width: '100%', cursor: 'pointer', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function getSimpleRowStyle(theme: 'dark' | 'light'): CSSProperties { return { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: 13, borderRadius: 6, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0', color: 'inherit' }; }
function getRowTitleStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 13, fontWeight: 800, textAlign: 'left', lineHeight: 1.35 }; }
function getEmptyStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 16, borderRadius: 6, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: theme === 'dark' ? '1px dashed #334155' : '1px dashed #cbd5e1', color: '#64748b', fontSize: 13, fontWeight: 700 }; }
function getStatusPillStyle(status: WorkCenter['status']): CSSProperties { const color = getStatusColor(status); return { whiteSpace: 'nowrap', padding: '8px 12px', borderRadius: 4, border: `1px solid ${color}`, color, background: `${color}1f`, fontSize: 12, fontWeight: 900, letterSpacing: '0.8px' }; }
function getSmallBadgeStyle(value: string): CSSProperties { const color = value === 'CRITICAL' || value === 'HIGH' || value === 'OVERDUE' ? '#dc2626' : value === 'DUE_SOON' || value === 'MEDIUM' ? '#f59e0b' : '#64748b'; return { whiteSpace: 'nowrap', padding: '5px 8px', borderRadius: 4, border: `1px solid ${color}66`, color, background: `${color}18`, fontSize: 11, fontWeight: 900, letterSpacing: '0.5px', textTransform: 'uppercase' }; }
function getStatusColor(status: WorkCenter['status']) { if (status === 'READY') return '#10b981'; if (status === 'WATCH') return '#f59e0b'; if (status === 'NEEDS_ATTENTION') return '#dc2626'; return '#64748b'; }
