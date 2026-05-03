import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { RoleView, DepartmentFilter, AppTab } from '../types/app';
import type { Machine } from '../types/machine';
import type { DynamicTraveler } from '../types/dynamicTraveler';
import { productionOrders } from '../data/productionOrders';
import { seedCoverage } from '../data/coverage';
import { workCenters } from '../data/workCenters';
import { generateDynamicTravelers } from '../logic/dynamicTraveler';
import TravelerDetailModal from '../components/travelers/TravelerDetailModal';

interface WorkflowMobilePageProps {
  roleView: RoleView;
  departmentFilter: DepartmentFilter;
  machines: Machine[];
  theme?: 'dark' | 'light';
  onGoToMaintenance: () => void;
  onGoToTab: (tab: AppTab) => void;
}

type WorkflowMode = 'production' | 'lead' | 'management';

export default function WorkflowMobilePage({
  roleView,
  departmentFilter,
  machines,
  theme = 'dark',
  onGoToMaintenance,
  onGoToTab,
}: WorkflowMobilePageProps) {
  const [selectedTraveler, setSelectedTraveler] = useState<DynamicTraveler | null>(null);
  const [showAllTravelers, setShowAllTravelers] = useState(false);
  const workflowMode = getWorkflowMode(roleView);
  const deptLabel = departmentFilter === 'All' ? 'All Departments' : departmentFilter;

  const travelers = useMemo(() => {
    return generateDynamicTravelers(productionOrders, workflowMode === 'management' ? 'All' : departmentFilter);
  }, [departmentFilter, workflowMode]);

  const visibleTravelers = showAllTravelers ? travelers : travelers.slice(0, 3);
  const hiddenTravelerCount = Math.max(travelers.length - visibleTravelers.length, 0);
  const nextTraveler = travelers[0];
  const readyCount = travelers.filter((traveler) => traveler.visualSignal === 'READY').length;
  const blockedCount = travelers.filter((traveler) => traveler.visualSignal === 'BLOCKED' || traveler.visualSignal === 'HOLD').length;
  const crew = departmentFilter === 'All' ? seedCoverage : seedCoverage.filter((person) => person.department === departmentFilter);
  const assignedCount = crew.filter((person) => person.status === 'ASSIGNED').length;
  const availableCount = crew.filter((person) => person.status === 'AVAILABLE').length;

  return (
    <div style={pageStyle}>
      <div style={getHeaderStyle(theme)}>
        <div style={headerLeftStyle}>
          <div style={getDeptLabelStyle(theme)}>{workflowMode === 'management' ? 'Plant Command' : deptLabel}</div>
          <div style={roleTagStyle}>{getWorkflowRoleLabel(workflowMode)}</div>
        </div>
        <div style={shiftBadgeStyle}>DAY SHIFT</div>
      </div>

      <section style={getSectionStyle(theme)}>
        <div style={getSectionTitleStyle(theme)}>
          YOUR NEXT TRAVELER
          <span style={getCountBadge(blockedCount > 0 ? 'red' : readyCount > 0 ? 'green' : 'gray')}>
            {blockedCount > 0 ? `${blockedCount} BLOCKED / HOLD` : `${readyCount} READY`}
          </span>
        </div>
        {nextTraveler ? (
          <NextTravelerCard traveler={nextTraveler} theme={theme} onOpen={() => setSelectedTraveler(nextTraveler)} />
        ) : (
          <div style={getEmptyStyle(theme)}>No travelers are currently assigned to this workflow view.</div>
        )}
      </section>

      <section style={getSectionStyle(theme)}>
        <div style={getSectionTitleStyle(theme)}>
          TRAVELER QUEUE
          <span style={getCountBadge('blue')}>{travelers.length} ACTIVE</span>
        </div>
        <p style={getIntroTextStyle(theme)}>
          Travelers are order-specific work instructions. Each one shows what to work on, the recommended resource, blocker signal, and next handoff.
        </p>

        {travelers.length === 0 ? (
          <div style={getEmptyStyle(theme)}>No travelers assigned to this workflow view.</div>
        ) : (
          <div style={orderListStyle}>
            {visibleTravelers.map((traveler) => (
              <CompactTravelerButton key={traveler.id} traveler={traveler} theme={theme} onOpen={() => setSelectedTraveler(traveler)} />
            ))}
          </div>
        )}

        {travelers.length > 3 ? (
          <button type="button" style={getShowMoreButtonStyle(theme)} onClick={() => setShowAllTravelers((current) => !current)}>
            {showAllTravelers ? 'SHOW FEWER TRAVELERS' : `SHOW ${hiddenTravelerCount} MORE TRAVELER${hiddenTravelerCount === 1 ? '' : 'S'}`}
          </button>
        ) : null}
      </section>

      {nextTraveler ? (
        <section style={getSectionStyle(theme)}>
          <div style={getSectionTitleStyle(theme)}>RESOURCE MATCH</div>
          <ResourceMatch traveler={nextTraveler} theme={theme} />
        </section>
      ) : null}

      {workflowMode !== 'production' ? (
        <section style={getSectionStyle(theme)}>
          <div style={getSectionTitleStyle(theme)}>
            CREW SNAPSHOT
            <span style={getCountBadge('blue')}>{crew.length} SIGNED IN</span>
          </div>
          <div style={crewSummaryRowStyle}>
            <div style={getCrewStat('green', theme)}><strong>{assignedCount}</strong> ASSIGNED</div>
            <div style={getCrewStat('blue', theme)}><strong>{availableCount}</strong> AVAILABLE</div>
            <div style={getCrewStat('yellow', theme)}><strong>{crew.length - assignedCount - availableCount}</strong> OTHER</div>
          </div>
          <button type="button" onClick={() => onGoToTab('coverage')} style={getActionBtn('blue', theme)}>OPEN COVERAGE</button>
        </section>
      ) : null}

      {workflowMode === 'management' ? (
        <section style={getSectionStyle(theme)}>
          <div style={getSectionTitleStyle(theme)}>DEPARTMENT SNAPSHOT</div>
          <div style={deptStripStyle}>
            {workCenters.slice(0, showAllTravelers ? undefined : 6).map((workCenter) => {
              const deptTravelers = generateDynamicTravelers(productionOrders, workCenter.department);
              const deptBlocked = deptTravelers.filter((traveler) => traveler.visualSignal === 'BLOCKED' || traveler.visualSignal === 'HOLD').length;
              return (
                <div key={workCenter.id} style={getDeptTileStyle(workCenter.status, theme)}>
                  <div style={getDeptTileNameStyle(theme)}>{workCenter.department}</div>
                  <div style={deptTileStatsStyle}>{deptTravelers.length} travelers · {deptBlocked} blocked/hold</div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <div style={actionRowStyle}>
        <button onClick={onGoToMaintenance} style={getActionBtn('orange', theme)}>MAINTENANCE</button>
        <button onClick={() => onGoToTab('orders')} style={getActionBtn('slate', theme)}>ALL ORDERS</button>
        <button onClick={() => onGoToTab('risk')} style={getActionBtn('red', theme)}>QA / SAFETY</button>
      </div>

      {selectedTraveler ? (
        <TravelerDetailModal
          traveler={selectedTraveler}
          theme={theme}
          onClose={() => setSelectedTraveler(null)}
          onOpenOrders={() => {
            setSelectedTraveler(null);
            onGoToTab('orders');
          }}
        />
      ) : null}
    </div>
  );
}

function NextTravelerCard({ traveler, theme, onOpen }: { traveler: DynamicTraveler; theme: 'dark' | 'light'; onOpen: () => void }) {
  return (
    <button type="button" style={getNextTravelerStyle(traveler.visualSignal, theme)} onClick={onOpen}>
      <div style={rowStyle}>
        <span style={getOrderNumStyle(theme)}>#{traveler.order.orderNumber}</span>
        <span style={getPriorityChip(traveler.order.priority)}>{String(traveler.order.priority ?? 'normal').toUpperCase()}</span>
        <span style={getVisualChip(traveler.visualSignal)}>{traveler.visualSignal}</span>
      </div>
      <div style={getTravelerInstructionStyle(theme)}>{traveler.currentInstruction}</div>
      <div style={travelerMetaGridStyle}>
        <TravelerMeta label="Resource" value={traveler.bestResource?.label ?? 'No capable resource mapped'} theme={theme} />
        <TravelerMeta label="Next" value={traveler.nextHandoff ?? 'Not assigned'} theme={theme} />
        <TravelerMeta label="Material" value={formatToken(traveler.materialStatus)} theme={theme} />
        <TravelerMeta label="QA" value={formatToken(traveler.qaStatus)} theme={theme} />
      </div>
      <div style={getTapHintStyle(theme)}>Tap for traveler detail</div>
    </button>
  );
}

function CompactTravelerButton({ traveler, theme, onOpen }: { traveler: DynamicTraveler; theme: 'dark' | 'light'; onOpen: () => void }) {
  return (
    <button type="button" style={getOrderCardStyle(traveler.visualSignal, theme)} onClick={onOpen}>
      <div style={rowStyle}>
        <span style={getOrderNumStyle(theme)}>#{traveler.order.orderNumber}</span>
        <span style={getPriorityChip(traveler.order.priority)}>{String(traveler.order.priority ?? 'normal').toUpperCase()}</span>
        <span style={getVisualChip(traveler.visualSignal)}>{traveler.visualSignal}</span>
      </div>
      <div style={getOrderFamilyStyle(theme)}>{traveler.order.productFamily}</div>
      <div style={getCompactReasonStyle(theme, traveler.visualSignal === 'BLOCKED' || traveler.visualSignal === 'HOLD')}>
        {traveler.bestResource ? `Use: ${traveler.bestResource.label}` : 'No capable resource mapped'}
        {traveler.nextHandoff ? ` · Next: ${traveler.nextHandoff}` : ''}
      </div>
      <div style={getTapHintStyle(theme)}>Tap for traveler detail</div>
    </button>
  );
}

function ResourceMatch({ traveler, theme }: { traveler: DynamicTraveler; theme: 'dark' | 'light' }) {
  if (traveler.capableResources.length === 0) {
    return <div style={getEmptyStyle(theme)}>No capable resource has been mapped for this traveler yet.</div>;
  }

  return (
    <div style={machineGridStyle}>
      {traveler.capableResources.slice(0, 6).map((resource) => (
        <div key={resource.id} style={getResourceChipStyle(resource.id === traveler.bestResource?.id, theme)}>
          <div style={getMachineDot(resource.status === 'AVAILABLE' ? 'RUNNING' : 'IDLE')} />
          <div>
            <div style={getMachineNameStyle(theme)}>{resource.label}</div>
            <div style={getMachineStateStyle(resource.status)}>{resource.id === traveler.bestResource?.id ? 'BEST MATCH' : resource.status}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TravelerMeta({ label, value, theme }: { label: string; value: string; theme: 'dark' | 'light' }) {
  return (
    <div>
      <div style={getMetaLabelStyle(theme)}>{label}</div>
      <div style={getMetaValueStyle(theme)}>{value}</div>
    </div>
  );
}

function getWorkflowMode(roleView: RoleView): WorkflowMode {
  if (roleView === 'Production') return 'production';
  if (roleView === 'Department Lead' || roleView === 'Department Supervisor') return 'lead';
  return 'management';
}

function getWorkflowRoleLabel(mode: WorkflowMode): string {
  if (mode === 'production') return 'PRODUCTION CO-WORKER VIEW';
  if (mode === 'lead') return 'DEPARTMENT LEAD / SUPERVISOR VIEW';
  return 'MANAGEMENT VIEW';
}

function formatToken(value: string) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const pageStyle: CSSProperties = { padding: 0 };
const headerLeftStyle: CSSProperties = { flex: 1, minWidth: 0 };
const roleTagStyle: CSSProperties = { fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: '#f97316', marginTop: 2 };
const shiftBadgeStyle: CSSProperties = { background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#10b981', padding: '6px 12px', borderRadius: 4, fontSize: 11, fontWeight: 800, letterSpacing: '1px' };
const orderListStyle: CSSProperties = { display: 'grid', gap: 8 };
const rowStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' };
const crewSummaryRowStyle: CSSProperties = { display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' };
const deptStripStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 };
const deptTileStatsStyle: CSSProperties = { fontSize: 11, color: '#64748b', marginTop: 5, lineHeight: 1.4 };
const machineGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 };
const actionRowStyle: CSSProperties = { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 };
const travelerMetaGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(112px, 1fr))', gap: 8, marginTop: 12 };

function getHeaderStyle(theme: 'dark' | 'light'): CSSProperties { return { background: theme === 'dark' ? '#0f172a' : '#f1f5f9', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', borderLeft: '4px solid #f97316', borderRadius: 6, padding: '14px 16px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }; }
function getDeptLabelStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 18, fontWeight: 800, letterSpacing: '1px', color: theme === 'dark' ? '#e2e8f0' : '#0f172a', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }; }
function getSectionStyle(theme: 'dark' | 'light'): CSSProperties { return { background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', borderRadius: 6, padding: 16, marginBottom: 12 }; }
function getSectionTitleStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 11, fontWeight: 800, letterSpacing: '1.5px', color: theme === 'dark' ? '#64748b' : '#94a3b8', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }; }
function getIntroTextStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: '0 0 12px', color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12, lineHeight: 1.45 }; }
function getCountBadge(color: 'green' | 'red' | 'blue' | 'yellow' | 'gray'): CSSProperties { const map: Record<string, string> = { green: '#10b981', red: '#ef4444', blue: '#3b82f6', yellow: '#eab308', gray: '#64748b' }; const picked = map[color] ?? map.gray; return { background: `${picked}22`, color: picked, border: `1px solid ${picked}`, borderRadius: 3, padding: '2px 7px', fontSize: 10, fontWeight: 800, letterSpacing: '0.5px' }; }
function getOrderCardStyle(signal: DynamicTraveler['visualSignal'], theme: 'dark' | 'light'): CSSProperties { const color = getSignalColor(signal); return { width: '100%', textAlign: 'left', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: `1px solid ${color}66`, borderLeft: `4px solid ${color}`, borderRadius: 4, padding: 12, cursor: 'pointer' }; }
function getNextTravelerStyle(signal: DynamicTraveler['visualSignal'], theme: 'dark' | 'light'): CSSProperties { const color = getSignalColor(signal); return { width: '100%', textAlign: 'left', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: `1px solid ${color}88`, borderLeft: `5px solid ${color}`, borderRadius: 6, padding: 14, cursor: 'pointer' }; }
function getSignalColor(signal: DynamicTraveler['visualSignal']): string { if (signal === 'BLOCKED' || signal === 'HOLD') return '#ef4444'; if (signal === 'READY') return '#10b981'; if (signal === 'DONE') return '#64748b'; return '#f97316'; }
function getOrderNumStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 14, fontWeight: 800, color: theme === 'dark' ? '#e2e8f0' : '#0f172a', letterSpacing: '0.5px' }; }
function getPriorityChip(priority: string | undefined): CSSProperties { const priorityKey = String(priority ?? 'normal').toLowerCase(); const map: Record<string, string> = { critical: '#ef4444', hot: '#f97316', normal: '#64748b' }; const picked = map[priorityKey] ?? '#64748b'; return { fontSize: 9, fontWeight: 800, letterSpacing: '1px', color: picked, background: `${picked}22`, border: `1px solid ${picked}`, borderRadius: 3, padding: '2px 6px' }; }
function getVisualChip(signal: DynamicTraveler['visualSignal']): CSSProperties { const color = getSignalColor(signal); return { fontSize: 9, fontWeight: 800, letterSpacing: '1px', color, background: `${color}22`, border: `1px solid ${color}`, borderRadius: 3, padding: '2px 6px' }; }
function getTravelerInstructionStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 14, color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontWeight: 800, lineHeight: 1.4, marginTop: 8 }; }
function getOrderFamilyStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 14, color: theme === 'dark' ? '#cbd5e1' : '#475569', fontWeight: 700, marginTop: 4, lineHeight: 1.4 }; }
function getCompactReasonStyle(theme: 'dark' | 'light', blocked: boolean): CSSProperties { return { marginTop: 6, fontSize: 12, color: blocked ? (theme === 'dark' ? '#fca5a5' : '#dc2626') : '#64748b', lineHeight: 1.35, fontWeight: 700 }; }
function getTapHintStyle(theme: 'dark' | 'light'): CSSProperties { return { marginTop: 8, color: theme === 'dark' ? '#93c5fd' : '#2563eb', fontSize: 10, fontWeight: 900, letterSpacing: '0.8px', textTransform: 'uppercase' }; }
function getShowMoreButtonStyle(theme: 'dark' | 'light'): CSSProperties { return { width: '100%', marginTop: 10, padding: '11px 12px', borderRadius: 4, border: theme === 'dark' ? '1px dashed #475569' : '1px dashed #cbd5e1', background: theme === 'dark' ? '#0f172a' : '#f8fafc', color: '#94a3b8', fontSize: 11, fontWeight: 900, cursor: 'pointer', letterSpacing: '0.7px' }; }
function getCrewStat(color: 'green' | 'blue' | 'yellow', theme: 'dark' | 'light'): CSSProperties { const map = { green: '#10b981', blue: '#3b82f6', yellow: '#eab308' }; const picked = map[color]; return { flex: '1 1 80px', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: `1px solid ${picked}44`, borderRadius: 4, padding: '10px 8px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: picked, letterSpacing: '0.5px', lineHeight: 1.4 }; }
function getDeptTileStyle(status: string, theme: 'dark' | 'light'): CSSProperties { const color = status === 'NEEDS_ATTENTION' ? '#ef4444' : status === 'WATCH' ? '#f97316' : '#10b981'; return { padding: 12, borderRadius: 4, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: `1px solid ${color}44`, borderLeft: `3px solid ${color}` }; }
function getDeptTileNameStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 12, fontWeight: 800, color: theme === 'dark' ? '#e2e8f0' : '#0f172a' }; }
function getResourceChipStyle(best: boolean, theme: 'dark' | 'light'): CSSProperties { const color = best ? '#10b981' : '#64748b'; return { background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: `1px solid ${color}55`, borderRadius: 4, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }; }
function getMachineDot(state: string): CSSProperties { return { width: 8, height: 8, borderRadius: '50%', background: getMachineColor(state), flexShrink: 0 }; }
function getMachineNameStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 12, fontWeight: 700, color: theme === 'dark' ? '#cbd5e1' : '#0f172a', letterSpacing: '0.3px' }; }
function getMachineStateStyle(state: string): CSSProperties { return { fontSize: 10, fontWeight: 700, color: getMachineColor(state), letterSpacing: '0.5px' }; }
function getMachineColor(state: string): string { const map: Record<string, string> = { RUNNING: '#10b981', AVAILABLE: '#10b981', IDLE: '#64748b', BUSY: '#f97316', UNKNOWN: '#64748b', ALARM: '#ef4444', DOWN: '#ef4444', OFFLINE: '#ef4444', SETUP: '#f97316', MAINTENANCE: '#f97316' }; return map[state] ?? '#64748b'; }
function getActionBtn(color: 'orange' | 'blue' | 'slate' | 'red', theme: 'dark' | 'light'): CSSProperties { const map = { orange: '#f97316', blue: '#3b82f6', slate: '#64748b', red: '#ef4444' }; const picked = map[color]; return { flex: '1 1 120px', padding: '12px 10px', background: `${picked}20`, border: `1px solid ${picked}`, borderRadius: 4, color: theme === 'light' && color === 'slate' ? '#475569' : picked, fontSize: 11, fontWeight: 900, letterSpacing: '0.7px', cursor: 'pointer' }; }
function getEmptyStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 16, borderRadius: 6, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: theme === 'dark' ? '1px dashed #334155' : '1px dashed #cbd5e1', color: '#64748b', fontSize: 13, fontWeight: 700 }; }
function getMetaLabelStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 9, fontWeight: 900, letterSpacing: '0.9px', color: theme === 'dark' ? '#64748b' : '#64748b', textTransform: 'uppercase', marginBottom: 3 }; }
function getMetaValueStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 12, fontWeight: 800, color: theme === 'dark' ? '#cbd5e1' : '#334155', lineHeight: 1.3 }; }
