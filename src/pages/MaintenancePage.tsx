import type { CSSProperties } from 'react';
import type { Machine } from '../types/machine';
import type { MaintenanceTask } from '../types/maintenance';
import MaintenanceTaskCard from '../components/cards/MaintenanceTaskCard';
import { maintenanceRequests } from '../data/maintenanceRequests';
import { getRepeatOffenders } from '../logic/maintenanceRepeatOffenders';

interface MaintenancePageProps {
  machines: Machine[];
  tasks: MaintenanceTask[];
  theme?: 'dark' | 'light';
}

export default function MaintenancePage({
  machines,
  tasks,
  theme = 'dark',
}: MaintenancePageProps) {
  const repeatOffenders = getRepeatOffenders(maintenanceRequests);
  const overdueCount = tasks.filter((task) => task.status === 'OVERDUE').length;
  const dueSoonCount = tasks.filter((task) => task.status === 'DUE_SOON').length;
  const watchCount = tasks.filter((task) => task.status === 'WATCH').length;
  const okCount = tasks.filter((task) => task.status === 'OK').length;

  return (
    <div>
      <div style={headerStyle}>
        <div>
          <h2 style={getTitleStyle(theme)}>SCHEDULED MAINTENANCE</h2>
          <p style={subtitleStyle}>
            {tasks.length} TASKS • {overdueCount} OVERDUE • {dueSoonCount} DUE SOON
          </p>
        </div>
      </div>

      <div style={summaryGridStyle}>
        <SummaryTile label="Overdue" value={overdueCount} color="#dc2626" theme={theme} />
        <SummaryTile label="Due Soon" value={dueSoonCount} color="#f59e0b" theme={theme} />
        <SummaryTile label="Watch" value={watchCount} color="#8b5cf6" theme={theme} />
        <SummaryTile label="OK" value={okCount} color="#10b981" theme={theme} />
      </div>

      {repeatOffenders.length > 0 && (
        <div style={getRepeatOffenderSectionStyle(theme)}>
          <div style={repeatOffenderHeaderStyle}>
            <span style={{ color: '#ef4444', fontWeight: 900, fontSize: 12, letterSpacing: '0.8px' }}>CHRONIC ISSUE ALERT</span>
            <span style={{ color: '#64748b', fontSize: 11, fontWeight: 700 }}>{repeatOffenders.length} asset{repeatOffenders.length > 1 ? 's' : ''} with 3+ requests in 30 days</span>
          </div>
          <div style={repeatOffenderGridStyle}>
            {repeatOffenders.map((offender) => {
              const priorityColor = offender.topPriority === 'SAFETY' || offender.topPriority === 'LINE_DOWN' || offender.topPriority === 'MACHINE_DOWN' ? '#ef4444' : offender.topPriority === 'URGENT' ? '#f59e0b' : '#64748b';
              return (
                <div key={offender.machineId} style={getRepeatOffenderCardStyle(theme)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <strong style={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 13, fontWeight: 900 }}>{offender.machineName}</strong>
                    <span style={{ color: priorityColor, fontSize: 10, fontWeight: 900, border: `1px solid ${priorityColor}`, borderRadius: 4, padding: '3px 6px' }}>{offender.topPriority}</span>
                  </div>
                  <div style={{ color: '#ef4444', fontSize: 20, fontWeight: 900, margin: '4px 0 2px' }}>{offender.requestCount}</div>
                  <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700 }}>requests in 30 days</div>
                  <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>Last: {new Date(offender.mostRecentAt).toLocaleDateString()}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <div style={getEmptyStateStyle(theme)}>NO SCHEDULED MAINTENANCE TASKS</div>
      ) : (
        <div style={taskGridStyle}>
          {tasks.map((task) => {
            const machine = machines.find((m) => m.id === task.machineId);
            return (
              <MaintenanceTaskCard
                key={task.id}
                task={task}
                machine={machine}
                theme={theme}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

interface SummaryTileProps {
  label: string;
  value: number;
  color: string;
  theme: 'dark' | 'light';
}

function SummaryTile({ label, value, color, theme }: SummaryTileProps) {
  return (
    <div style={{ ...getSummaryTileStyle(theme), borderLeft: `4px solid ${color}` }}>
      <div style={{ color, fontSize: 26, fontWeight: 900, lineHeight: 1 }}>
        {value}
      </div>
      <div style={summaryLabelStyle}>{label}</div>
    </div>
  );
}

const headerStyle: CSSProperties = {
  marginBottom: 18,
};

function getTitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    margin: 0,
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    letterSpacing: '0.5px',
    fontSize: 22,
    fontWeight: 900,
  };
}

const subtitleStyle: CSSProperties = {
  color: '#64748b',
  marginTop: 6,
  marginBottom: 0,
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.7px',
};

const summaryGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
  gap: 12,
  marginBottom: 18,
};

function getSummaryTileStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    borderRadius: 8,
    padding: 14,
    boxShadow:
      theme === 'dark'
        ? '0 6px 14px rgba(0,0,0,0.2)'
        : '0 4px 12px rgba(15,23,42,0.08)',
  };
}

const summaryLabelStyle: CSSProperties = {
  color: '#64748b',
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: '0.8px',
  textTransform: 'uppercase',
  marginTop: 7,
};

const taskGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 14,
};

function getRepeatOffenderSectionStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    marginBottom: 20, padding: 16, borderRadius: 6,
    border: '1px solid rgba(239,68,68,0.35)', borderLeft: '4px solid #ef4444',
    background: theme === 'dark' ? 'rgba(239,68,68,0.06)' : '#fef2f2',
  };
}

const repeatOffenderHeaderStyle: CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  marginBottom: 12, flexWrap: 'wrap', gap: 6,
};

const repeatOffenderGridStyle: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10,
};

function getRepeatOffenderCardStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: 12, borderRadius: 6,
    background: theme === 'dark' ? '#0f172a' : '#ffffff',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #fecaca',
  };
}

function getEmptyStateStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    padding: 60,
    borderRadius: 8,
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    textAlign: 'center',
    color: '#64748b',
    fontSize: 16,
    fontWeight: 800,
    letterSpacing: '1px',
  };
}
