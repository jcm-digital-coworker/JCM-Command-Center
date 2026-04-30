import { useMemo, useState, type CSSProperties } from 'react';
import { maintenanceRequests } from '../data/maintenanceRequests';
import { machines } from '../data/machine';
import { maintenanceTasks } from '../data/maintenance';
import type { MaintenanceRequest } from '../types/maintenanceRequest';

interface MaintenanceAnalyticsPageProps {
  theme?: 'dark' | 'light';
}

export default function MaintenanceAnalyticsPage({
  theme = 'dark',
}: MaintenanceAnalyticsPageProps) {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('week');

  const analytics = useMemo(() => {
    const completed = maintenanceRequests.filter((r) => r.status === 'COMPLETED');
    
    // Calculate average completion time (in hours)
    const completionTimes = completed
      .filter((r) => r.completedAt)
      .map((r) => {
        const submitted = new Date(r.submittedAt).getTime();
        const completedTime = new Date(r.completedAt!).getTime();
        return (completedTime - submitted) / (1000 * 60 * 60); // hours
      });

    const avgCompletionTime =
      completionTimes.length > 0
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
        : 0;

    // Top machines needing service
    const machineCounts: Record<string, number> = {};
    maintenanceRequests.forEach((r) => {
      machineCounts[r.machineId] = (machineCounts[r.machineId] || 0) + 1;
    });

    const topMachines = Object.entries(machineCounts)
      .map(([id, count]) => ({
        machine: machines.find((m) => m.id === id),
        count,
      }))
      .filter((item) => item.machine)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Priority distribution
    const priorityCounts = {
      NORMAL: maintenanceRequests.filter((r) => r.priority === 'NORMAL').length,
      URGENT: maintenanceRequests.filter((r) => r.priority === 'URGENT').length,
      MACHINE_DOWN: maintenanceRequests.filter(
        (r) => r.priority === 'MACHINE_DOWN'
      ).length,
    };

    // Status distribution
    const statusCounts = {
      NEW: maintenanceRequests.filter((r) => r.status === 'NEW').length,
      CLAIMED: maintenanceRequests.filter((r) => r.status === 'CLAIMED').length,
      IN_PROGRESS: maintenanceRequests.filter((r) => r.status === 'IN_PROGRESS')
        .length,
      COMPLETED: completed.length,
    };

    // Task status distribution
    const taskStatusCounts = {
      OVERDUE: maintenanceTasks.filter((t) => t.status === 'OVERDUE').length,
      DUE_SOON: maintenanceTasks.filter((t) => t.status === 'DUE_SOON').length,
      WATCH: maintenanceTasks.filter((t) => t.status === 'WATCH').length,
      OK: maintenanceTasks.filter((t) => t.status === 'OK').length,
    };

    return {
      totalRequests: maintenanceRequests.length,
      completedRequests: completed.length,
      avgCompletionTime,
      topMachines,
      priorityCounts,
      statusCounts,
      taskStatusCounts,
    };
  }, []);

  const exportToCSV = () => {
    const headers = [
      'Request ID',
      'Machine',
      'Department',
      'Priority',
      'Status',
      'Problem',
      'Submitted By',
      'Submitted At',
      'Claimed By',
      'Claimed At',
      'Completed By',
      'Completed At',
      'Work Done',
    ];

    const rows = maintenanceRequests.map((r) => [
      r.id,
      r.machineName,
      r.department,
      r.priority,
      r.status,
      r.problem,
      r.submittedBy,
      r.submittedAt,
      r.claimedBy || '',
      r.claimedAt || '',
      r.completedBy || '',
      r.completedAt || '',
      r.workDone || '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `maintenance-requests-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportTasksToCSV = () => {
    const headers = [
      'Machine',
      'Department',
      'Task',
      'Category',
      'Interval',
      'Status',
      'Last Completed',
      'Next Due',
      'Notes',
    ];

    const rows = maintenanceTasks.map((t) => {
      const machine = machines.find((m) => m.id === t.machineId);
      return [
        machine?.name || 'Unknown',
        machine?.department || 'Unknown',
        t.title,
        t.category,
        t.interval,
        t.status,
        t.lastCompleted,
        t.nextDue,
        t.notes,
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `maintenance-tasks-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={getHeaderStyle(theme)}>
        <div>
          <h2 style={getTitleStyle(theme)}>MAINTENANCE ANALYTICS</h2>
          <p style={getSubtitleStyle(theme)}>
            Performance metrics and insights
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={exportToCSV} style={getExportButtonStyle(theme)}>
            📊 EXPORT REQUESTS
          </button>
          <button onClick={exportTasksToCSV} style={getExportButtonStyle(theme)}>
            📋 EXPORT TASKS
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div style={summaryGridStyle}>
        <MetricCard
          label="Total Requests"
          value={analytics.totalRequests}
          theme={theme}
        />
        <MetricCard
          label="Completed"
          value={analytics.completedRequests}
          color="#10b981"
          theme={theme}
        />
        <MetricCard
          label="Avg. Completion Time"
          value={`${analytics.avgCompletionTime.toFixed(1)}h`}
          color="#f59e0b"
          theme={theme}
        />
        <MetricCard
          label="Scheduled Tasks"
          value={maintenanceTasks.length}
          color="#3b82f6"
          theme={theme}
        />
      </div>

      {/* Top Machines */}
      <div style={getSectionStyle(theme)}>
        <h3 style={getSectionTitleStyle(theme)}>
          TOP MACHINES NEEDING SERVICE
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {analytics.topMachines.map((item, index) => (
            <div key={item.machine!.id} style={getBarItemStyle(theme)}>
              <div style={getMachineRankStyle(theme)}>#{index + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={getMachineNameStyle(theme)}>
                  {item.machine!.name}
                </div>
                <div style={getDepartmentStyle(theme)}>
                  {item.machine!.department}
                </div>
              </div>
              <div style={getCountBadgeStyle(theme)}>{item.count} requests</div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Distribution */}
      <div style={getSectionStyle(theme)}>
        <h3 style={getSectionTitleStyle(theme)}>PRIORITY DISTRIBUTION</h3>
        <div style={chartGridStyle}>
          <ChartBar
            label="Normal"
            value={analytics.priorityCounts.NORMAL}
            max={analytics.totalRequests}
            color="#10b981"
            theme={theme}
          />
          <ChartBar
            label="Urgent"
            value={analytics.priorityCounts.URGENT}
            max={analytics.totalRequests}
            color="#f59e0b"
            theme={theme}
          />
          <ChartBar
            label="Machine Down"
            value={analytics.priorityCounts.MACHINE_DOWN}
            max={analytics.totalRequests}
            color="#ef4444"
            theme={theme}
          />
        </div>
      </div>

      {/* Status Distribution */}
      <div style={getSectionStyle(theme)}>
        <h3 style={getSectionTitleStyle(theme)}>REQUEST STATUS</h3>
        <div style={chartGridStyle}>
          <ChartBar
            label="New"
            value={analytics.statusCounts.NEW}
            max={analytics.totalRequests}
            color="#f97316"
            theme={theme}
          />
          <ChartBar
            label="Claimed"
            value={analytics.statusCounts.CLAIMED}
            max={analytics.totalRequests}
            color="#f59e0b"
            theme={theme}
          />
          <ChartBar
            label="In Progress"
            value={analytics.statusCounts.IN_PROGRESS}
            max={analytics.totalRequests}
            color="#3b82f6"
            theme={theme}
          />
          <ChartBar
            label="Completed"
            value={analytics.statusCounts.COMPLETED}
            max={analytics.totalRequests}
            color="#10b981"
            theme={theme}
          />
        </div>
      </div>

      {/* Task Status */}
      <div style={getSectionStyle(theme)}>
        <h3 style={getSectionTitleStyle(theme)}>SCHEDULED TASK STATUS</h3>
        <div style={chartGridStyle}>
          <ChartBar
            label="Overdue"
            value={analytics.taskStatusCounts.OVERDUE}
            max={maintenanceTasks.length}
            color="#dc2626"
            theme={theme}
          />
          <ChartBar
            label="Due Soon"
            value={analytics.taskStatusCounts.DUE_SOON}
            max={maintenanceTasks.length}
            color="#f59e0b"
            theme={theme}
          />
          <ChartBar
            label="Watch"
            value={analytics.taskStatusCounts.WATCH}
            max={maintenanceTasks.length}
            color="#8b5cf6"
            theme={theme}
          />
          <ChartBar
            label="OK"
            value={analytics.taskStatusCounts.OK}
            max={maintenanceTasks.length}
            color="#10b981"
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  color?: string;
  theme: 'dark' | 'light';
}

function MetricCard({ label, value, color = '#f97316', theme }: MetricCardProps) {
  return (
    <div style={getMetricCardStyle(theme)}>
      <div style={{ color, fontSize: 32, fontWeight: 900, lineHeight: 1 }}>
        {value}
      </div>
      <div style={getMetricLabelStyle(theme)}>{label}</div>
    </div>
  );
}

interface ChartBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  theme: 'dark' | 'light';
}

function ChartBar({ label, value, max, color, theme }: ChartBarProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div>
      <div style={getChartLabelStyle(theme)}>
        <span>{label}</span>
        <span style={{ fontWeight: 900 }}>{value}</span>
      </div>
      <div style={getChartBarBgStyle(theme)}>
        <div
          style={{
            ...getChartBarFillStyle(),
            width: `${percentage}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}

// Theme-aware style functions
function getHeaderStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 16,
  };
}

function getTitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    margin: 0,
    fontSize: 24,
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    letterSpacing: '0.5px',
    fontWeight: 800,
  };
}

function getSubtitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    margin: '4px 0 0 0',
    fontSize: 13,
    color: '#64748b',
    letterSpacing: '0.5px',
  };
}

function getExportButtonStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: '8px 14px',
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    border: theme === 'dark' ? '1px solid #475569' : '1px solid #cbd5e1',
    borderRadius: 4,
    fontWeight: 800,
    cursor: 'pointer',
    fontSize: 12,
    letterSpacing: '0.5px',
    transition: 'all 0.2s',
  };
}

function getMetricCardStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    padding: 20,
    borderRadius: 8,
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    boxShadow:
      theme === 'dark'
        ? '0 2px 8px rgba(0,0,0,0.3)'
        : '0 2px 8px rgba(0,0,0,0.1)',
  };
}

function getMetricLabelStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    color: '#64748b',
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    marginTop: 8,
  };
}

function getSectionStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    padding: 20,
    borderRadius: 8,
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    marginBottom: 16,
    boxShadow:
      theme === 'dark'
        ? '0 2px 8px rgba(0,0,0,0.3)'
        : '0 2px 8px rgba(0,0,0,0.1)',
  };
}

function getSectionTitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 16,
    fontWeight: 800,
    letterSpacing: '0.5px',
    color: theme === 'dark' ? '#cbd5e1' : '#475569',
    marginBottom: 16,
    marginTop: 0,
  };
}

function getBarItemStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 6,
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
  };
}

function getMachineRankStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 18,
    fontWeight: 900,
    color: '#f97316',
    minWidth: 40,
  };
}

function getMachineNameStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontWeight: 800,
    fontSize: 15,
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
  };
}

function getDepartmentStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  };
}

function getCountBadgeStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: '6px 12px',
    borderRadius: 999,
    background: 'rgba(249, 115, 22, 0.2)',
    color: '#f97316',
    fontSize: 12,
    fontWeight: 800,
    border: '1px solid rgba(249, 115, 22, 0.3)',
  };
}

function getChartLabelStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 6,
    fontSize: 13,
    color: theme === 'dark' ? '#cbd5e1' : '#475569',
    fontWeight: 700,
  };
}

function getChartBarBgStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    height: 24,
    borderRadius: 4,
    background: theme === 'dark' ? '#0f172a' : '#f1f5f9',
    overflow: 'hidden',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
  };
}

function getChartBarFillStyle(): CSSProperties {
  return {
    height: '100%',
    transition: 'width 0.3s ease',
    borderRadius: 4,
  };
}

// Static styles
const summaryGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: 16,
  marginBottom: 24,
};

const chartGridStyle: CSSProperties = {
  display: 'grid',
  gap: 16,
};
