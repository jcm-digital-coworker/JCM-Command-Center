import type { CSSProperties } from 'react';
import type { Machine } from '../types/machine';
import SimulationCard from '../components/cards/SimulationCard';

interface SimulationPageProps {
  machines: Machine[];
  onOpenSimulator: (machine: Machine) => void;
  theme?: 'dark' | 'light';
}

export default function SimulationPage({
  machines,
  onOpenSimulator,
  theme = 'dark',
}: SimulationPageProps) {
  const simulatableMachines = machines.filter(
    (m) =>
      m.name.toLowerCase().includes('lv4500') || m.simulationStatus !== 'READY'
  );

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
        SIMULATION
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
        READ-ONLY MACHINE SIMULATORS
      </p>

      <div style={getWarningBoxStyle(theme)}>
        <div style={{ fontSize: 18, marginBottom: 4 }}>⚠️</div>
        <div>
          <div
            style={{
              fontWeight: 700,
              marginBottom: 4,
              color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
            }}
          >
            SIMULATION MODE
          </div>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            These are read-only simulators for training and verification. No
            actual machine commands are sent.
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
        }}
      >
        {simulatableMachines.map((machine) => (
          <SimulationCard
            key={machine.id}
            machine={machine}
            onOpen={() => onOpenSimulator(machine)}
            theme={theme}
          />
        ))}
      </div>

      {simulatableMachines.length === 0 && (
        <div style={getEmptyStateStyle(theme)}>NO SIMULATORS AVAILABLE</div>
      )}
    </div>
  );
}

function getWarningBoxStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7',
    border: '1px solid #f59e0b',
    borderLeft: '4px solid #f59e0b',
    padding: 16,
    borderRadius: 6,
    marginBottom: 24,
    display: 'flex',
    gap: 12,
    alignItems: 'start',
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
