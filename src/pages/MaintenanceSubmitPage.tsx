import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { MaintenanceRequestPriority } from '../types/maintenanceRequest';
import { machines } from '../data/machine';
import { plantAssets } from '../data/plantAssets';
import { addMaintenanceRequest } from '../data/maintenanceRequests';

interface MaintenanceSubmitPageProps {
  onBack: () => void;
  onSubmitSuccess: () => void;
  theme?: 'dark' | 'light';
}

export default function MaintenanceSubmitPage({
  onBack,
  onSubmitSuccess,
  theme = 'dark',
}: MaintenanceSubmitPageProps) {
  const [machineId, setMachineId] = useState('');
  const [priority, setPriority] =
    useState<MaintenanceRequestPriority>('NORMAL');
  const [problem, setProblem] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const serviceTargets = [
    ...machines.map((machine) => ({ id: machine.id, name: machine.name, department: machine.department, group: 'Machine' })),
    ...plantAssets.map((asset) => ({ id: asset.id, name: asset.name, department: asset.ownerDepartment, group: asset.kind.replaceAll('_', ' ') })),
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!machineId || !problem || !submittedBy) {
      alert('Please fill in all fields');
      return;
    }

    const selectedTarget = serviceTargets.find((target) => target.id === machineId);
    if (!selectedTarget) return;
    const newRequest = {
      id: `REQ-${Date.now()}`,
      machineId,
      machineName: selectedTarget.name,
      department: selectedTarget.department,
      priority,
      problem,
      submittedBy,
      submittedAt: new Date().toISOString(),
      status: 'NEW' as const,
    };

    addMaintenanceRequest(newRequest);
    onSubmitSuccess();
  };

  return (
    <div>
      <button onClick={onBack} style={getBackButtonStyle(theme)}>
        ← BACK TO REQUESTS
      </button>

      <h2 style={getTitleStyle(theme)}>SUBMIT MAINTENANCE REQUEST</h2>
      <p style={getSubtitleStyle(theme)}>
        Report a machine, asset, area, work-cell, or process-zone issue
      </p>

      <form onSubmit={handleSubmit} style={getFormStyle(theme)}>
        <div style={fieldStyle}>
          <label style={getLabelStyle(theme)}>Asset / Area *</label>
          <select
            value={machineId}
            onChange={(e) => setMachineId(e.target.value)}
            style={getSelectStyle(theme)}
            required
          >
            <option value="">Select an asset, area, or machine...</option>
            {serviceTargets.map((target) => (
              <option key={target.id} value={target.id}>
                {target.name} ({target.department} · {target.group})
              </option>
            ))}
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={getLabelStyle(theme)}>Priority *</label>
          <div style={{ display: 'flex', gap: 12 }}>
            <label style={getRadioLabelStyle(theme)}>
              <input
                type="radio"
                value="NORMAL"
                checked={priority === 'NORMAL'}
                onChange={(e) =>
                  setPriority(e.target.value as MaintenanceRequestPriority)
                }
                style={{ marginRight: 6 }}
              />
              <span style={getPriorityTextStyle('NORMAL')}>● Normal</span>
            </label>
            <label style={getRadioLabelStyle(theme)}>
              <input
                type="radio"
                value="URGENT"
                checked={priority === 'URGENT'}
                onChange={(e) =>
                  setPriority(e.target.value as MaintenanceRequestPriority)
                }
                style={{ marginRight: 6 }}
              />
              <span style={getPriorityTextStyle('URGENT')}>● Urgent</span>
            </label>
            <label style={getRadioLabelStyle(theme)}>
              <input
                type="radio"
                value="LINE_DOWN"
                checked={priority === 'LINE_DOWN'}
                onChange={(e) =>
                  setPriority(e.target.value as MaintenanceRequestPriority)
                }
                style={{ marginRight: 6 }}
              />
              <span style={getPriorityTextStyle('LINE_DOWN')}>
                ● Line Down
              </span>
            </label>
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={getLabelStyle(theme)}>Problem Description *</label>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            style={getTextareaStyle(theme)}
            placeholder="Describe the issue in detail..."
            rows={4}
            required
          />
        </div>

        <div style={fieldStyle}>
          <label style={getLabelStyle(theme)}>Your Name *</label>
          <input
            type="text"
            value={submittedBy}
            onChange={(e) => setSubmittedBy(e.target.value)}
            style={getInputStyle(theme)}
            placeholder="e.g., John (Welder), Sam (Receiver), Kim (Machine Operator)"
            required
          />
        </div>

        <button type="submit" style={getSubmitButtonStyle(theme)}>
          SUBMIT REQUEST
        </button>
      </form>
    </div>
  );
}

// Theme-aware style functions
function getBackButtonStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: '10px 16px',
    borderRadius: 6,
    border: theme === 'dark' ? '1px solid #475569' : '1px solid #cbd5e1',
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    cursor: 'pointer',
    fontWeight: 800,
    fontSize: 14,
    letterSpacing: '0.5px',
    transition: 'all 0.2s',
  };
}

function getTitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 24,
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    letterSpacing: '0.5px',
    fontWeight: 800,
  };
}

function getSubtitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    color: '#64748b',
    marginTop: 0,
    marginBottom: 24,
    fontSize: 13,
    letterSpacing: '0.5px',
  };
}

function getFormStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    padding: 24,
    borderRadius: 6,
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    maxWidth: 600,
    boxShadow:
      theme === 'dark'
        ? '0 2px 8px rgba(0,0,0,0.3)'
        : '0 2px 8px rgba(0,0,0,0.1)',
  };
}

function getLabelStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    display: 'block',
    fontWeight: 700,
    marginBottom: 8,
    fontSize: 13,
    color: theme === 'dark' ? '#cbd5e1' : '#475569',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  };
}

function getSelectStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 6,
    border: theme === 'dark' ? '1px solid #475569' : '1px solid #cbd5e1',
    fontSize: 14,
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    cursor: 'pointer',
  };
}

function getInputStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 6,
    border: theme === 'dark' ? '1px solid #475569' : '1px solid #cbd5e1',
    fontSize: 14,
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    boxSizing: 'border-box',
  };
}

function getTextareaStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 6,
    border: theme === 'dark' ? '1px solid #475569' : '1px solid #cbd5e1',
    fontSize: 14,
    fontFamily: 'Arial, sans-serif',
    resize: 'vertical',
    boxSizing: 'border-box',
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
  };
}

function getRadioLabelStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: 14,
    color: theme === 'dark' ? '#cbd5e1' : '#475569',
  };
}

function getPriorityTextStyle(
  priority: MaintenanceRequestPriority
): CSSProperties {
  const colors: Record<MaintenanceRequestPriority, string> = {
    NORMAL: '#10b981',
    URGENT: '#f59e0b',
    LINE_DOWN: '#ef4444',
    SAFETY: '#dc2626',
    MACHINE_DOWN: '#ef4444',
  };

  return {
    color: colors[priority],
    fontWeight: 600,
  };
}

function getSubmitButtonStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
    color: '#ffffff',
    border: '1px solid #f97316',
    borderRadius: 6,
    fontWeight: 800,
    cursor: 'pointer',
    fontSize: 14,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginTop: 8,
    width: '100%',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)',
  };
}

const fieldStyle: CSSProperties = {
  marginBottom: 20,
};
