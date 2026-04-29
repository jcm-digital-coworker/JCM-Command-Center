import type { CSSProperties } from 'react';
import type { Machine } from '../types/machine';
import MachineCard from '../components/cards/MachineCard';
import StatusBadge from '../components/StatusBadge';

interface MachinesPageProps {
  machines: Machine[];
  onOpenMachine: (machine: Machine) => void;
  theme?: 'dark' | 'light';
}

export default function MachinesPage({
  machines,
  onOpenMachine,
  theme = 'dark',
}: MachinesPageProps) {
  return (
    <div>
      <h2
        style={{
          marginTop: 0,
          marginBottom: 8,
          color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
          letterSpacing: '0.5px',
        }}
      >
        MACHINES
      </h2>
      <p
        style={{
          color: '#64748b',
          marginTop: 0,
          marginBottom: 20,
          fontSize: 13,
          letterSpacing: '0.5px',
        }}
      >
        {machines.length} TOTAL
      </p>

      <div style={getGridStyle(theme)}>
        {machines.map((machine) => (
          <MachineCard
            key={machine.id}
            machine={machine}
            onClick={() => onOpenMachine(machine)}
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
}

interface AlertsPageProps {
  alerts: Machine[];
  onOpenMachine: (machine: Machine) => void;
  theme?: 'dark' | 'light';
}

export function AlertsPage({
  alerts,
  onOpenMachine,
  theme = 'dark',
}: AlertsPageProps) {
  return (
    <div>
      <h2
        style={{
          marginTop: 0,
          marginBottom: 8,
          color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
          letterSpacing: '0.5px',
        }}
      >
        ALERTS
      </h2>
      <p
        style={{
          color: '#64748b',
          marginTop: 0,
          marginBottom: 20,
          fontSize: 13,
          letterSpacing: '0.5px',
        }}
      >
        {alerts.length} ACTIVE
      </p>

      {alerts.length === 0 ? (
        <div style={getEmptyStateStyle(theme)}>✅ NO ACTIVE ALERTS</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {alerts.map((machine) => (
            <div
              key={machine.id}
              style={getAlertCardStyle(theme)}
              onClick={() => onOpenMachine(machine)}
            >
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    marginBottom: 4,
                    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
                  }}
                >
                  {machine.name}
                </div>
                <div style={{ fontSize: 13, color: '#64748b' }}>
                  {machine.department} • {machine.lastActivity}
                </div>
              </div>
              <StatusBadge
                state={machine.state}
                priority={machine.alarmPriority}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getGridStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
  };
}

function getEmptyStateStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    padding: 60,
    borderRadius: 6,
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    textAlign: 'center',
    color: '#64748b',
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: '1px',
  };
}

function getAlertCardStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    padding: 16,
    borderRadius: 6,
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  };
}
