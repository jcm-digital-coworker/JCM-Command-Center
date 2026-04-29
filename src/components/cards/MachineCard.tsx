import type { CSSProperties } from 'react';
import type { Machine } from '../../types/machine';
import StatusBadge from '../StatusBadge';

interface MachineCardProps {
  machine: Machine;
  onClick: () => void;
  theme?: 'dark' | 'light';
}

export default function MachineCard({
  machine,
  onClick,
  theme = 'dark',
}: MachineCardProps) {
  return (
    <div style={getCardStyle(theme)} onClick={onClick}>
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

      <div style={{ marginBottom: 12 }}>
        <StatusBadge state={machine.state} priority={machine.alarmPriority} />
      </div>

      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
        {machine.department}
      </div>

      <div style={{ fontSize: 12, color: '#94a3b8' }}>
        {machine.lastActivity}
      </div>
    </div>
  );
}

function getCardStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    padding: 16,
    borderRadius: 6,
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  };
}
