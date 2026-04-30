import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import type { RoleView, DepartmentFilter, AppTab } from '../types/app';
import type { Machine } from '../types/machine';
import { productionOrders } from '../data/productionOrders';
import { seedCoverage } from '../data/coverage';
import { workCenters } from '../data/workCenters';

interface WorkflowPageProps {
  roleView: RoleView;
  departmentFilter: DepartmentFilter;
  machines: Machine[];
  theme?: 'dark' | 'light';
  onGoToMaintenance: () => void;
  onGoToTab: (tab: AppTab) => void;
}

// ─── OPERATOR VIEW ────────────────────────────────────────────────────────────

function OperatorView({
  departmentFilter,
  machines,
  theme,
  onGoToMaintenance,
}: {
  departmentFilter: DepartmentFilter;
  machines: Machine[];
  theme: 'dark' | 'light';
  onGoToMaintenance: () => void;
}) {
  const deptLabel = departmentFilter === 'All' ? 'All Departments' : departmentFilter;

  const myOrders = useMemo(() => {
    const all =
      departmentFilter === 'All'
        ? productionOrders
        : productionOrders.filter((o) => o.currentDepartment === departmentFilter);
    return [...all].sort((a, b) => {
      const rank = (o: typeof a) =>
        String(o.flowStatus).toLowerCase() === 'runnable' ? 0 : 1;
      return rank(a) - rank(b);
    });
  }, [departmentFilter]);

  const runnableCount = myOrders.filter(
    (o) => String(o.flowStatus).toLowerCase() === 'runnable'
  ).length;

  return (
    <div style={getPageStyle()}>
      <div style={getHeaderStyle(theme)}>
        <div style={getHeaderLeftStyle()}>
          <div style={getDeptLabelStyle(theme)}>{deptLabel}</div>
          <div style={getRoleTagStyle()}>OPERATOR VIEW</div>
        </div>
        <div style={getShiftBadgeStyle()}>DAY SHIFT</div>
      </div>

      <div style={getSectionStyle(theme)}>
        <div style={getSectionTitleStyle(theme)}>
          MY ORDERS
          <span style={getCountBadge(runnableCount > 0 ? 'green' : 'gray')}>
            {runnableCount} RUNNABLE
          </span>
        </div>
        {myOrders.length === 0 && (
          <div style={getEmptyStyle(theme)}>No orders assigned to this area</div>
        )}
        {myOrders.map((order) => {
          const isBlocked = (order.blockers ?? []).length > 0;
          const isRunnable = String(order.flowStatus).toLowerCase() === 'runnable';
          return (
            <div key={order.id} style={getOrderCardStyle(isRunnable, isBlocked, theme)}>
              <div style={rowStyle}>
                <span style={getOrderNumStyle(theme)}>#{order.orderNumber}</span>
                <span style={getPriorityChip(order.priority)}>
                  {String(order.priority ?? 'normal').toUpperCase()}
                </span>
                <span style={getStatusChip(isRunnable)}>
                  {isRunnable ? 'READY TO RUN' : 'BLOCKED'}
                </span>
              </div>
              <div style={getOrderFamilyStyle(theme)}>{order.productFamily}</div>
              {isBlocked &&
                order.blockers.map((b, i) => (
                  <div key={i} style={getBlockerStyle(theme)}>
                    ⚠ {b.type.toUpperCase()}: {b.message}
                  </div>
                ))}
            </div>
          );
        })}
      </div>

      {machines.length > 0 && (
        <div style={getSectionStyle(theme)}>
          <div style={getSectionTitleStyle(theme)}>MY MACHINES</div>
          <div style={machineGridStyle}>
            {machines.map((m) => (
              <div key={m.id} style={getMachineChipStyle(m.state, theme)}>
                <div style={getMachineDot(m.state)} />
                <div>
                  <div style={getMachineNameStyle(theme)}>{m.name}</div>
                  <div style={getMachineStateStyle(m.state)}>{m.state}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={onGoToMaintenance} style={getSubmitBtnStyle(theme)}>
        + SUBMIT MAINTENANCE REQUEST
      </button>
    </div>
  );
}

// ─── LEAD VIEW ────────────────────────────────────────────────────────────────

function LeadView({
  departmentFilter,
  machines,
  theme,
  onGoToMaintenance,
  onGoToTab,
}: {
  departmentFilter: DepartmentFilter;
  machines: Machine[];
  theme: 'dark' | 'light';
  onGoToMaintenance: () => void;
  onGoToTab: (tab: AppTab) => void;
}) {
  const deptLabel = departmentFilter === 'All' ? 'All Departments' : departmentFilter;

  const crew = useMemo(() => {
    if (departmentFilter === 'All') return seedCoverage;
    return seedCoverage.filter((p) => p.department === departmentFilter);
  }, [departmentFilter]);

  const assigned = crew.filter((p) => p.status === 'ASSIGNED');
  const available = crew.filter((p) => p.status === 'AVAILABLE');
  const onBreak = crew.filter((p) => p.status === 'BREAK');

  const deptOrders = useMemo(() => {
    const all =
      departmentFilter === 'All'
        ? productionOrders
        : productionOrders.filter((o) => o.currentDepartment === departmentFilter);
    const priorityRank: Record<string, number> = { critical: 0, hot: 1, normal: 2 };
    return [...all].sort(
      (a, b) =>
        (priorityRank[String(a.priority).toLowerCase()] ?? 2) -
        (priorityRank[String(b.priority).toLowerCase()] ?? 2)
    );
  }, [departmentFilter]);

  const blockedCount = deptOrders.filter((o) => (o.blockers ?? []).length > 0).length;

  return (
    <div style={getPageStyle()}>
      <div style={getHeaderStyle(theme)}>
        <div>
          <div style={getDeptLabelStyle(theme)}>{deptLabel}</div>
          <div style={getRoleTagStyle()}>LEAD / SUPERVISOR VIEW</div>
        </div>
        <div style={getShiftBadgeStyle()}>DAY SHIFT</div>
      </div>

      {/* Crew */}
      <div style={getSectionStyle(theme)}>
        <div style={getSectionTitleStyle(theme)}>
          CREW ON SHIFT
          <span style={getCountBadge('blue')}>{crew.length} SIGNED IN</span>
        </div>
        <div style={crewSummaryRowStyle}>
          <div style={getCrewStat('green', theme)}>
            <strong>{assigned.length}</strong> ASSIGNED
          </div>
          <div style={getCrewStat('blue', theme)}>
            <strong>{available.length}</strong> AVAILABLE
          </div>
          <div style={getCrewStat('yellow', theme)}>
            <strong>{onBreak.length}</strong> ON BREAK
          </div>
        </div>
        {crew.length === 0 && (
          <div style={getEmptyStyle(theme)}>No crew signed in for this area</div>
        )}
        {crew.map((person) => (
          <div key={person.id} style={getCrewRowStyle(theme)}>
            <div style={getCrewBodyStyle()}>
              <div style={getCrewNameStyle(theme)}>{person.name}</div>
              <div style={getCrewDetailStyle()}>{person.station}</div>
              {person.assignedTo && (
                <div style={getCrewAssignedStyle()}>→ {person.assignedTo}</div>
              )}
            </div>
            <div style={getCrewStatusBadge(person.status)}>
              {person.status}
            </div>
          </div>
        ))}
      </div>

      {/* Orders */}
      <div style={getSectionStyle(theme)}>
        <div style={getSectionTitleStyle(theme)}>
          DEPARTMENT ORDERS
          {blockedCount > 0 && (
            <span style={getCountBadge('red')}>{blockedCount} BLOCKED</span>
          )}
        </div>
        {deptOrders.length === 0 && (
          <div style={getEmptyStyle(theme)}>No orders for this department</div>
        )}
        {deptOrders.map((order) => {
          const isBlocked = (order.blockers ?? []).length > 0;
          const isRunnable = String(order.flowStatus).toLowerCase() === 'runnable';
          return (
            <div key={order.id} style={getOrderCardStyle(isRunnable, isBlocked, theme)}>
              <div style={rowStyle}>
                <span style={getOrderNumStyle(theme)}>#{order.orderNumber}</span>
                <span style={getPriorityChip(order.priority)}>
                  {String(order.priority ?? 'normal').toUpperCase()}
                </span>
                <span style={getStatusChip(isRunnable)}>
                  {isRunnable ? 'RUNNABLE' : 'BLOCKED'}
                </span>
              </div>
              <div style={getOrderFamilyStyle(theme)}>{order.productFamily}</div>
              <div style={getOrderMetaRowStyle()}>
                <span style={getDeptChipStyle(theme)}>{order.currentDepartment}</span>
                {order.nextDepartment && (
                  <span style={getNextDeptStyle()}>→ {order.nextDepartment}</span>
                )}
              </div>
              {isBlocked &&
                order.blockers.map((b, i) => (
                  <div key={i} style={getBlockerStyle(theme)}>
                    ⚠ {b.type.toUpperCase()}: {b.message}
                  </div>
                ))}
            </div>
          );
        })}
      </div>

      {/* Machines */}
      {machines.length > 0 && (
        <div style={getSectionStyle(theme)}>
          <div style={getSectionTitleStyle(theme)}>MACHINE STATUS</div>
          <div style={machineGridStyle}>
            {machines.map((m) => (
              <div key={m.id} style={getMachineChipStyle(m.state, theme)}>
                <div style={getMachineDot(m.state)} />
                <div>
                  <div style={getMachineNameStyle(theme)}>{m.name}</div>
                  <div style={getMachineStateStyle(m.state)}>{m.state}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={actionRowStyle}>
        <button onClick={onGoToMaintenance} style={getActionBtn('orange', theme)}>
          MAINTENANCE REQUESTS
        </button>
        <button onClick={() => onGoToTab('coverage')} style={getActionBtn('blue', theme)}>
          FULL CREW VIEW
        </button>
        <button onClick={() => onGoToTab('orders')} style={getActionBtn('slate', theme)}>
          ALL ORDERS
        </button>
      </div>
    </div>
  );
}

// ─── MANAGER VIEW ─────────────────────────────────────────────────────────────

function ManagerView({
  theme,
  onGoToTab,
}: {
  departmentFilter: DepartmentFilter;
  machines: Machine[];
  theme: 'dark' | 'light';
  onGoToTab: (tab: AppTab) => void;
}) {
  const priorityOrders = productionOrders.filter(
    (o) =>
      String(o.priority).toLowerCase() === 'critical' ||
      String(o.priority).toLowerCase() === 'hot'
  );
  const blockedOrders = productionOrders.filter((o) => (o.blockers ?? []).length > 0);

  const deptSummary = useMemo(() => {
    return workCenters.map((wc) => {
      const orders = productionOrders.filter((o) => o.currentDepartment === wc.department);
      const crew = seedCoverage.filter((p) => p.department === wc.department);
      const blocked = orders.filter((o) => (o.blockers ?? []).length > 0);
      return { wc, orders, crew, blocked };
    });
  }, []);

  const crewDepts = ['Receiving', 'Machine Shop', 'Fab', 'Assembly', 'Coating', 'Shipping', 'QA'];

  return (
    <div style={getPageStyle()}>
      <div style={getHeaderStyle(theme)}>
        <div style={getHeaderLeftStyle()}>
          <div style={getDeptLabelStyle(theme)}>PLANT COMMAND</div>
          <div style={getRoleTagStyle()}>MANAGER VIEW</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <div style={getManagerBadge('red')}>{blockedOrders.length} BLOCKED</div>
          <div style={getManagerBadge('orange')}>{priorityOrders.length} PRIORITY</div>
        </div>
      </div>

      {/* Department Health */}
      <div style={getSectionStyle(theme)}>
        <div style={getSectionTitleStyle(theme)}>DEPARTMENT STATUS</div>
        <div style={deptStripStyle}>
          {deptSummary.map(({ wc, orders, crew, blocked }) => (
            <div key={wc.id} style={getDeptTileStyle(wc.status, theme)}>
              <div style={getDeptTileNameStyle(theme)}>{wc.department}</div>
              <div style={getDeptTileStatsStyle()}>
                <span>{orders.length} orders</span>
                <span>{crew.length} crew</span>
              </div>
              {blocked.length > 0 && (
                <div style={deptTileBlockedStyle}>{blocked.length} blocked</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Priority Orders */}
      {priorityOrders.length > 0 && (
        <div style={getSectionStyle(theme)}>
          <div style={getSectionTitleStyle(theme)}>
            CRITICAL / HOT ORDERS
            <span style={getCountBadge('red')}>{priorityOrders.length}</span>
          </div>
          {priorityOrders.map((order) => {
            const isBlocked = (order.blockers ?? []).length > 0;
            const isRunnable = String(order.flowStatus).toLowerCase() === 'runnable';
            return (
              <div key={order.id} style={getOrderCardStyle(isRunnable, isBlocked, theme)}>
                <div style={rowStyle}>
                  <span style={getOrderNumStyle(theme)}>#{order.orderNumber}</span>
                  <span style={getPriorityChip(order.priority)}>
                    {String(order.priority).toUpperCase()}
                  </span>
                  <span style={getStatusChip(isRunnable)}>
                    {isRunnable ? 'RUNNABLE' : 'BLOCKED'}
                  </span>
                </div>
                <div style={getOrderFamilyStyle(theme)}>{order.productFamily}</div>
                <div style={getOrderMetaRowStyle()}>
                  <span style={getDeptChipStyle(theme)}>{order.currentDepartment}</span>
                </div>
                {isBlocked &&
                  order.blockers.map((b, i) => (
                    <div key={i} style={getBlockerStyle(theme)}>
                      ⚠ {b.type.toUpperCase()}: {b.message}
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Crew Summary */}
      <div style={getSectionStyle(theme)}>
        <div style={getSectionTitleStyle(theme)}>PLANT CREW SUMMARY</div>
        <div style={crewSummaryGridStyle}>
          {crewDepts.map((dept) => {
            const deptCrew = seedCoverage.filter((p) => p.department === dept);
            if (deptCrew.length === 0) return null;
            const assignedCount = deptCrew.filter((p) => p.status === 'ASSIGNED').length;
            const availableCount = deptCrew.filter((p) => p.status === 'AVAILABLE').length;
            return (
              <div key={dept} style={getCrewTileStyle(theme)}>
                <div style={getCrewTileDeptStyle(theme)}>{dept}</div>
                <div style={getCrewTileCountStyle()}>
                  <span style={{ color: '#10b981' }}>{assignedCount} assigned</span>
                  <span style={{ color: '#64748b' }}>{availableCount} available</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={actionRowStyle}>
        <button onClick={() => onGoToTab('dashboard')} style={getActionBtn('orange', theme)}>
          COMMAND CENTER
        </button>
        <button onClick={() => onGoToTab('orders')} style={getActionBtn('blue', theme)}>
          ALL ORDERS
        </button>
        <button onClick={() => onGoToTab('coverage')} style={getActionBtn('slate', theme)}>
          CREW
        </button>
        <button onClick={() => onGoToTab('risk')} style={getActionBtn('red', theme)}>
          QA / SAFETY
        </button>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export default function WorkflowPage({
  roleView,
  departmentFilter,
  machines,
  theme = 'dark',
  onGoToMaintenance,
  onGoToTab,
}: WorkflowPageProps) {
  const isOperator = roleView === 'Operator' || roleView === 'operator';
  const isLead =
    roleView === 'Lead / Supervisor' || roleView === 'lead' || roleView === 'supervisor';

  if (isOperator) {
    return (
      <OperatorView
        departmentFilter={departmentFilter}
        machines={machines}
        theme={theme}
        onGoToMaintenance={onGoToMaintenance}
      />
    );
  }
  if (isLead) {
    return (
      <LeadView
        departmentFilter={departmentFilter}
        machines={machines}
        theme={theme}
        onGoToMaintenance={onGoToMaintenance}
        onGoToTab={onGoToTab}
      />
    );
  }
  return (
    <ManagerView
      departmentFilter={departmentFilter}
      machines={machines}
      theme={theme}
      onGoToTab={onGoToTab}
    />
  );
}

// ─── STYLE FUNCTIONS ──────────────────────────────────────────────────────────

function getPageStyle(): CSSProperties {
  return { padding: 0 };
}

function getHeaderStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: theme === 'dark' ? '#0f172a' : '#f1f5f9',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    borderLeft: '4px solid #f97316',
    borderRadius: 6,
    padding: '14px 16px',
    marginBottom: 12,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  };
}

function getHeaderLeftStyle(): CSSProperties {
  return { flex: 1, minWidth: 0 };
}

function getDeptLabelStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: '1px',
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    textTransform: 'uppercase',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };
}

function getRoleTagStyle(): CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '1.5px',
    color: '#f97316',
    marginTop: 2,
  };
}

function getShiftBadgeStyle(): CSSProperties {
  return {
    background: 'rgba(16,185,129,0.15)',
    border: '1px solid #10b981',
    color: '#10b981',
    padding: '6px 12px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '1px',
  };
}

function getSectionStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    borderRadius: 6,
    padding: 16,
    marginBottom: 12,
  };
}

function getSectionTitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '1.5px',
    color: theme === 'dark' ? '#64748b' : '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };
}

function getCountBadge(color: 'green' | 'red' | 'blue' | 'yellow' | 'gray'): CSSProperties {
  const map: Record<string, string> = {
    green: '#10b981',
    red: '#ef4444',
    blue: '#3b82f6',
    yellow: '#eab308',
    gray: '#64748b',
  };
  const c = map[color] ?? map.gray;
  return {
    background: `${c}22`,
    color: c,
    border: `1px solid ${c}`,
    borderRadius: 3,
    padding: '2px 7px',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.5px',
  };
}

function getOrderCardStyle(
  isRunnable: boolean,
  isBlocked: boolean,
  theme: 'dark' | 'light'
): CSSProperties {
  return {
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    border: isBlocked
      ? '1px solid rgba(220,38,38,0.4)'
      : isRunnable
      ? '1px solid rgba(16,185,129,0.4)'
      : theme === 'dark'
      ? '1px solid #334155'
      : '1px solid #e2e8f0',
    borderLeft: isBlocked
      ? '4px solid #ef4444'
      : isRunnable
      ? '4px solid #10b981'
      : '4px solid #475569',
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  };
}

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 4,
  flexWrap: 'wrap',
};

function getOrderNumStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 14,
    fontWeight: 800,
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    letterSpacing: '0.5px',
  };
}

function getPriorityChip(priority: string | undefined): CSSProperties {
  const p = String(priority ?? 'normal').toLowerCase();
  const map: Record<string, string> = { critical: '#ef4444', hot: '#f97316', normal: '#64748b' };
  const c = map[p] ?? '#64748b';
  return {
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: '1px',
    color: c,
    background: `${c}22`,
    border: `1px solid ${c}`,
    borderRadius: 3,
    padding: '2px 6px',
  };
}

function getStatusChip(isRunnable: boolean): CSSProperties {
  return {
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: '1px',
    color: isRunnable ? '#10b981' : '#ef4444',
    background: isRunnable ? 'rgba(16,185,129,0.1)' : 'rgba(220,38,38,0.1)',
    border: isRunnable ? '1px solid #10b981' : '1px solid #ef4444',
    borderRadius: 3,
    padding: '2px 6px',
  };
}

function getDeptChipStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 700,
    color: '#94a3b8',
    background: theme === 'dark' ? '#1e293b' : '#f1f5f9',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    borderRadius: 3,
    padding: '2px 6px',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
  };
}

function getOrderFamilyStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 14,
    color: theme === 'dark' ? '#cbd5e1' : '#475569',
    fontWeight: 600,
    marginTop: 4,
    lineHeight: 1.4,
  };
}

function getOrderMetaRowStyle(): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    flexWrap: 'wrap',
  };
}

function getNextDeptStyle(): CSSProperties {
  return {
    fontSize: 11,
    color: '#64748b',
    whiteSpace: 'nowrap',
  };
}

function getBlockerStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    marginTop: 8,
    fontSize: 11,
    color: theme === 'dark' ? '#fca5a5' : '#dc2626',
    background: 'rgba(220,38,38,0.1)',
    border: '1px solid rgba(220,38,38,0.3)',
    borderRadius: 4,
    padding: '6px 10px',
    fontWeight: 600,
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  };
}

const machineGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
  gap: 8,
};

function getMachineChipStyle(state: string, theme: 'dark' | 'light'): CSSProperties {
  const stateColor = getMachineColor(state);
  return {
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    border: `1px solid ${stateColor}44`,
    borderRadius: 4,
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };
}

function getMachineDot(state: string): CSSProperties {
  return {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: getMachineColor(state),
    flexShrink: 0,
  };
}

function getMachineNameStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 12,
    fontWeight: 700,
    color: theme === 'dark' ? '#cbd5e1' : '#0f172a',
    letterSpacing: '0.3px',
  };
}

function getMachineStateStyle(state: string): CSSProperties {
  return { fontSize: 10, fontWeight: 700, color: getMachineColor(state), letterSpacing: '0.5px' };
}

function getMachineColor(state: string): string {
  const map: Record<string, string> = {
    RUNNING: '#10b981',
    IDLE: '#64748b',
    ALARM: '#ef4444',
    OFFLINE: '#ef4444',
    SETUP: '#f97316',
    MAINTENANCE: '#f97316',
  };
  return map[state] ?? '#64748b';
}

function getSubmitBtnStyle(_theme: 'dark' | 'light'): CSSProperties {
  return {
    width: '100%',
    padding: 16,
    background: 'rgba(249,115,22,0.15)',
    border: '2px solid #f97316',
    borderRadius: 6,
    color: '#f97316',
    fontSize: 14,
    fontWeight: 800,
    letterSpacing: '1px',
    cursor: 'pointer',
    marginTop: 4,
  };
}

const crewSummaryRowStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
  marginBottom: 12,
  flexWrap: 'wrap',
};

function getCrewStat(
  color: 'green' | 'blue' | 'yellow',
  theme: 'dark' | 'light'
): CSSProperties {
  const map = { green: '#10b981', blue: '#3b82f6', yellow: '#eab308' };
  const c = map[color];
  return {
    flex: '1 1 80px',
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    border: `1px solid ${c}44`,
    borderRadius: 4,
    padding: '10px 8px',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: c,
    letterSpacing: '0.5px',
    lineHeight: 1.4,
  };
}

function getCrewRowStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #f1f5f9',
    borderRadius: 4,
    padding: '10px 12px',
    marginBottom: 6,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  };
}

function getCrewBodyStyle(): CSSProperties {
  return {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  };
}

function getCrewNameStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 13,
    fontWeight: 700,
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };
}

function getCrewDetailStyle(): CSSProperties {
  return {
    fontSize: 11,
    color: '#64748b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };
}

function getCrewStatusBadge(status: string): CSSProperties {
  const map: Record<string, string> = {
    ASSIGNED: '#10b981',
    AVAILABLE: '#3b82f6',
    BREAK: '#eab308',
  };
  const c = map[status] ?? '#64748b';
  return {
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: '0.5px',
    color: c,
    background: `${c}22`,
    border: `1px solid ${c}`,
    borderRadius: 3,
    padding: '2px 6px',
    whiteSpace: 'nowrap',
  };
}

function getCrewAssignedStyle(): CSSProperties {
  return {
    fontSize: 10,
    color: '#94a3b8',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };
}

const actionRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: 8,
  marginTop: 4,
};

function getActionBtn(
  color: 'orange' | 'blue' | 'slate' | 'red',
  _theme: 'dark' | 'light'
): CSSProperties {
  const map: Record<string, string> = {
    orange: '#f97316',
    blue: '#3b82f6',
    slate: '#64748b',
    red: '#ef4444',
  };
  const c = map[color];
  return {
    padding: '12px 8px',
    background: `${c}22`,
    border: `1px solid ${c}`,
    borderRadius: 4,
    color: c,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.7px',
    cursor: 'pointer',
    textAlign: 'center',
    lineHeight: 1.3,
  };
}

function getManagerBadge(color: 'red' | 'orange'): CSSProperties {
  const c = color === 'red' ? '#ef4444' : '#f97316';
  return {
    background: `${c}22`,
    border: `1px solid ${c}`,
    color: c,
    padding: '6px 12px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.5px',
  };
}

const deptStripStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
  gap: 8,
};

function getDeptTileStyle(status: string, theme: 'dark' | 'light'): CSSProperties {
  const map: Record<string, string> = {
    PLANNED: '#10b981',
    WATCH: '#eab308',
    NEEDS_ATTENTION: '#ef4444',
  };
  const c = map[status] ?? '#64748b';
  return {
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    border: `1px solid ${c}44`,
    borderTop: `3px solid ${c}`,
    borderRadius: 4,
    padding: '10px 12px',
  };
}

function getDeptTileNameStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 800,
    color: theme === 'dark' ? '#cbd5e1' : '#0f172a',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginBottom: 4,
  };
}

function getDeptTileStatsStyle(): CSSProperties {
  return {
    fontSize: 10,
    color: '#64748b',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  };
}

const deptTileBlockedStyle: CSSProperties = {
  marginTop: 6,
  fontSize: 10,
  fontWeight: 700,
  color: '#ef4444',
};

const crewSummaryGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
  gap: 8,
};

function getCrewTileStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    borderRadius: 4,
    padding: '10px 12px',
  };
}

function getCrewTileDeptStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 800,
    color: theme === 'dark' ? '#94a3b8' : '#64748b',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginBottom: 4,
  };
}

function getCrewTileCountStyle(): CSSProperties {
  return {
    fontSize: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    fontWeight: 600,
  };
}

function getEmptyStyle(_theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
    padding: '8px 0',
  };
}
