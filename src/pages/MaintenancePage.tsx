import type { CSSProperties } from 'react';
import type { Machine } from '../types/machine';
import type { MaintenanceTask } from '../types/maintenance';
import MaintenanceTaskCard from '../components/cards/MaintenanceTaskCard';

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
