import type { CSSProperties } from 'react';
import type { Machine } from '../../types/machine';

interface SimulationCardProps {
  machine: Machine;
  onOpen: () => void;
  theme?: 'dark' | 'light';
}

export default function SimulationCard({
  machine,
  onOpen,
  theme = 'dark',
}: SimulationCardProps) {
  return (
    <div style={getCardStyle(theme)}>
      <h3
        style={{
          margin: '0 0 8px 0',
          fontSize: 16,
          fontWeight: 700,
          color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
        }}
      >
        {machine.name}
      </h3>

      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
        {machine.department}
      </div>

      <div
        style={{
          padding: '8px 12px',
          background: getStatusColor(machine.simulationStatus).bg,
          color: getStatusColor(machine.simulationStatus).color,
          border: `1px solid ${
            getStatusColor(machine.simulationStatus).border
          }`,
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 700,
          marginBottom: 12,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}
      >
        {machine.simulationStatus}
      </div>

      <div
        style={{
          fontSize: 13,
          color: '#94a3b8',
          marginBottom: 16,
          minHeight: 40,
        }}
      >
        {machine.simulationSummary}
      </div>

      <button onClick={onOpen} style={buttonStyle}>
        OPEN SIMULATOR
      </button>
    </div>
  );
}

function getCardStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    padding: 16,
    borderRadius: 6,
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  };
}

function getStatusColor(status: string): {
  bg: string;
  color: string;
  border: string;
} {
  if (status === 'READY') {
    return { bg: '#d1fae5', color: '#059669', border: '#10b981' };
  }
  if (status === 'CAUTION') {
    return { bg: '#fef3c7', color: '#d97706', border: '#f59e0b' };
  }
  if (status === 'BLOCKED') {
    return { bg: '#fee2e2', color: '#dc2626', border: '#ef4444' };
  }
  return { bg: '#e2e8f0', color: '#475569', border: '#64748b' };
}

const buttonStyle: CSSProperties = {
  width: '100%',
  padding: '10px 16px',
  background: 'rgba(249, 115, 22, 0.1)',
  border: '1px solid #f97316',
  borderRadius: 4,
  color: '#f97316',
  fontSize: 13,
  fontWeight: 800,
  cursor: 'pointer',
  letterSpacing: '0.5px',
  transition: 'all 0.2s',
};
