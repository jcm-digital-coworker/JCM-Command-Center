import type { CSSProperties } from 'react';
import type { Machine } from '../types/machine';
import StatusBadge from './StatusBadge';

type DetailTab = 'overview' | 'events' | 'patterns' | 'notes';

interface MachineDetailProps {
  machine: Machine;
  onClose: () => void;
  onOpenSimulator: () => void;
  detailTab: DetailTab;
  setDetailTab: (tab: DetailTab) => void;
  theme?: 'dark' | 'light';
}

export default function MachineDetail({
  machine,
  onClose,
  onOpenSimulator,
  detailTab,
  setDetailTab,
  theme = 'dark',
}: MachineDetailProps) {
  const lastEvent = machine.recentEvents[machine.recentEvents.length - 1];
  const lastActivity = lastEvent
    ? `${lastEvent.time} - ${lastEvent.text}`
    : 'No recent activity';

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={getModalStyle(theme)} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={getHeaderStyle(theme)}>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                color: 'white',
                letterSpacing: '0.5px',
              }}
            >
              {machine.name}
            </h2>
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: 13,
                color: 'rgba(255,255,255,0.8)',
              }}
            >
              {machine.department} • {machine.suite}
            </p>
          </div>
          <button onClick={onClose} style={closeButtonStyle}>
            ✕
          </button>
        </div>

        {/* Status Bar */}
        <div style={getStatusBarStyle(theme)}>
          <StatusBadge state={machine.state} priority={machine.alarmPriority} />
          <div style={{ fontSize: 13, color: '#64748b' }}>{lastActivity}</div>
        </div>

        {/* Tabs */}
        <div style={getTabContainerStyle(theme)}>
          <button
            onClick={() => setDetailTab('overview')}
            style={
              detailTab === 'overview'
                ? getActiveTabStyle(theme)
                : getTabStyle(theme)
            }
          >
            OVERVIEW
          </button>
          <button
            onClick={() => setDetailTab('events')}
            style={
              detailTab === 'events'
                ? getActiveTabStyle(theme)
                : getTabStyle(theme)
            }
          >
            EVENTS
          </button>
          <button
            onClick={() => setDetailTab('patterns')}
            style={
              detailTab === 'patterns'
                ? getActiveTabStyle(theme)
                : getTabStyle(theme)
            }
          >
            PATTERNS
          </button>
          <button
            onClick={() => setDetailTab('notes')}
            style={
              detailTab === 'notes'
                ? getActiveTabStyle(theme)
                : getTabStyle(theme)
            }
          >
            NOTES
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {detailTab === 'overview' && (
            <OverviewTab
              machine={machine}
              onOpenSimulator={onOpenSimulator}
              theme={theme}
            />
          )}

          {detailTab === 'events' && (
            <EventsTab machine={machine} theme={theme} />
          )}

          {detailTab === 'patterns' && (
            <PatternsTab machine={machine} theme={theme} />
          )}

          {detailTab === 'notes' && (
            <NotesTab machine={machine} theme={theme} />
          )}
        </div>
      </div>
    </div>
  );
}

// OVERVIEW TAB
function OverviewTab({
  machine,
  onOpenSimulator,
  theme,
}: {
  machine: Machine;
  onOpenSimulator: () => void;
  theme: 'dark' | 'light';
}) {
  const currentLoad =
    machine.recentSpindleLoad[machine.recentSpindleLoad.length - 1];

  return (
    <div>
      <h3
        style={{
          marginTop: 0,
          color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
          letterSpacing: '0.5px',
        }}
      >
        CURRENT STATUS
      </h3>

      {/* Machine Info Grid */}
      <div style={infoGridStyle}>
        <InfoRow label="Control" value={machine.control} theme={theme} />
        <InfoRow label="Suite" value={machine.suite} theme={theme} />
        <InfoRow label="Program" value={machine.program} theme={theme} />
        <InfoRow label="State" value={machine.lastKnownState} theme={theme} />
      </div>

      {/* Current Tool */}
      <h3
        style={{
          marginTop: 24,
          marginBottom: 12,
          color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
          letterSpacing: '0.5px',
        }}
      >
        CURRENT TOOL
      </h3>

      <div style={getToolCardStyle(theme)}>
        <div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
              marginBottom: 4,
            }}
          >
            {machine.lastTool.toolNumber}
          </div>
          <div style={{ fontSize: 14, color: '#64748b' }}>
            {machine.lastTool.description}
          </div>
        </div>
        <div style={getToolWeightBadge(machine.lastTool.weight)}>
          {machine.lastTool.weight}
        </div>
      </div>

      {/* Spindle Load Timeline */}
      {machine.recentSpindleLoad.length > 0 && (
        <>
          <h3
            style={{
              marginTop: 24,
              marginBottom: 12,
              color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
              letterSpacing: '0.5px',
            }}
          >
            SPINDLE LOAD TREND
          </h3>

          {currentLoad && (
            <MetricBar
              label="Current Load"
              value={currentLoad.percent}
              max={100}
              unit="%"
              sublabel={currentLoad.label}
              theme={theme}
              color={
                currentLoad.percent > 80
                  ? '#dc2626'
                  : currentLoad.percent > 60
                  ? '#f59e0b'
                  : '#10b981'
              }
            />
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              marginTop: 12,
            }}
          >
            {machine.recentSpindleLoad.map((event, idx) => (
              <div key={idx} style={getLoadEventStyle(theme)}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#64748b',
                    minWidth: 60,
                  }}
                >
                  {event.time}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        color: theme === 'dark' ? '#cbd5e1' : '#475569',
                      }}
                    >
                      {event.label}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: getLoadColor(event.percent),
                      }}
                    >
                      {event.percent}%
                    </span>
                  </div>
                  <div style={getLoadBarStyle(theme)}>
                    <div
                      style={{
                        width: `${event.percent}%`,
                        height: '100%',
                        background: getLoadColor(event.percent),
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Behavior Tags */}
      {machine.behaviorTags.length > 0 && (
        <>
          <h3
            style={{
              marginTop: 24,
              marginBottom: 12,
              color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
              letterSpacing: '0.5px',
            }}
          >
            BEHAVIOR TAGS
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {machine.behaviorTags.map((tag, idx) => (
              <span key={idx} style={getBehaviorTagStyle(theme)}>
                {tag}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Simulator Button */}
      {machine.name.toLowerCase().includes('lv4500') && (
        <button onClick={onOpenSimulator} style={simulatorButtonStyle}>
          🔧 OPEN SIMULATOR
        </button>
      )}
    </div>
  );
}

// EVENTS TAB
function EventsTab({
  machine,
  theme,
}: {
  machine: Machine;
  theme: 'dark' | 'light';
}) {
  return (
    <div>
      <h3
        style={{
          marginTop: 0,
          color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
          letterSpacing: '0.5px',
        }}
      >
        RECENT EVENTS
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {machine.recentEvents.map((event, idx) => (
          <div key={idx} style={getEventCardStyle(theme, event.type)}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>
                {event.time}
              </span>
              <span style={getEventTypeBadge(event.type)}>{event.type}</span>
            </div>
            <div
              style={{
                fontSize: 14,
                color: theme === 'dark' ? '#cbd5e1' : '#475569',
              }}
            >
              {event.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// PATTERNS TAB
function PatternsTab({
  machine,
  theme,
}: {
  machine: Machine;
  theme: 'dark' | 'light';
}) {
  return (
    <div>
      <h3
        style={{
          marginTop: 0,
          color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
          letterSpacing: '0.5px',
        }}
      >
        MACHINE PATTERNS
      </h3>

      {machine.machinePatterns.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            marginBottom: 24,
          }}
        >
          {machine.machinePatterns.map((pattern, idx) => (
            <div key={idx} style={getPatternBoxStyle(theme)}>
              <span style={{ fontSize: 14, marginRight: 8 }}>•</span>
              {pattern}
            </div>
          ))}
        </div>
      )}

      <h3
        style={{
          marginTop: 24,
          marginBottom: 12,
          color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
          letterSpacing: '0.5px',
        }}
      >
        SOURCED NOTES
      </h3>

      {machine.sourcedNotes.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {machine.sourcedNotes.map((note, idx) => (
            <div key={idx} style={getNoteBoxStyle(theme)}>
              {note}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: '#64748b', fontStyle: 'italic' }}>
          No sourced notes available
        </p>
      )}
    </div>
  );
}

// NOTES TAB
function NotesTab({
  machine,
  theme,
}: {
  machine: Machine;
  theme: 'dark' | 'light';
}) {
  return (
    <div>
      <h3
        style={{
          marginTop: 0,
          color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
          letterSpacing: '0.5px',
        }}
      >
        OPERATOR NOTES
      </h3>
      <textarea
        style={getTextareaStyle(theme)}
        placeholder="Add notes about this machine..."
        rows={10}
      />
      <button style={saveButtonStyle}>SAVE NOTES</button>
    </div>
  );
}

// HELPER COMPONENTS
function InfoRow({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: 'dark' | 'light';
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 11,
          color: '#64748b',
          marginBottom: 4,
          fontWeight: 700,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 15,
          color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
          fontWeight: 600,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MetricBar({
  label,
  value,
  max,
  unit,
  sublabel,
  color,
  theme,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  sublabel?: string;
  color: string;
  theme: 'dark' | 'light';
}) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        <div>
          <span
            style={{
              fontSize: 13,
              color: theme === 'dark' ? '#cbd5e1' : '#475569',
              fontWeight: 700,
              letterSpacing: '0.5px',
            }}
          >
            {label}
          </span>
          {sublabel && (
            <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>
              ({sublabel})
            </span>
          )}
        </div>
        <span style={{ fontSize: 13, color, fontWeight: 700 }}>
          {value}
          {unit}
        </span>
      </div>
      <div style={getBarBackgroundStyle(theme)}>
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: color,
            borderRadius: 4,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}

function getLoadColor(percent: number): string {
  if (percent > 80) return '#dc2626';
  if (percent > 60) return '#f59e0b';
  return '#10b981';
}

function getToolWeightBadge(weight: string): CSSProperties {
  const colors: Record<string, { bg: string; color: string; border: string }> =
    {
      HEAVY: {
        bg: 'rgba(220, 38, 38, 0.2)',
        color: '#fca5a5',
        border: '#dc2626',
      },
      MEDIUM: {
        bg: 'rgba(245, 158, 11, 0.2)',
        color: '#fcd34d',
        border: '#f59e0b',
      },
      LIGHT: {
        bg: 'rgba(59, 130, 246, 0.2)',
        color: '#93c5fd',
        border: '#3b82f6',
      },
    };

  const style = colors[weight] || colors.MEDIUM;

  return {
    padding: '4px 10px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 800,
    background: style.bg,
    color: style.color,
    border: `1px solid ${style.border}`,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  };
}

function getEventTypeBadge(type: string): CSSProperties {
  const colors: Record<string, { bg: string; color: string; border: string }> =
    {
      ALARM: {
        bg: 'rgba(220, 38, 38, 0.2)',
        color: '#fca5a5',
        border: '#dc2626',
      },
      TOOL_CHANGE: {
        bg: 'rgba(59, 130, 246, 0.2)',
        color: '#93c5fd',
        border: '#3b82f6',
      },
      SETUP: {
        bg: 'rgba(245, 158, 11, 0.2)',
        color: '#fcd34d',
        border: '#f59e0b',
      },
      RUN: {
        bg: 'rgba(16, 185, 129, 0.2)',
        color: '#6ee7b7',
        border: '#10b981',
      },
      OFFLINE: {
        bg: 'rgba(100, 116, 139, 0.2)',
        color: '#94a3b8',
        border: '#64748b',
      },
    };

  const style = colors[type] || colors.RUN;

  return {
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 800,
    background: style.bg,
    color: style.color,
    border: `1px solid ${style.border}`,
    letterSpacing: '0.5px',
  };
}

// STYLES
const overlayStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.7)',
  zIndex: 1000,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
  overflowY: 'auto',
};

function getModalStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: theme === 'dark' ? '#0f172a' : '#ffffff',
    borderRadius: 8,
    maxWidth: 700,
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    margin: '20px 0',
  };
}

function getHeaderStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background:
      theme === 'dark'
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        : 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
    padding: 20,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #94a3b8',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  };
}

const closeButtonStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  color: 'white',
  width: 36,
  height: 36,
  borderRadius: 4,
  fontSize: 18,
  cursor: 'pointer',
  fontWeight: 700,
};

function getStatusBarStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: 16,
    borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    flexWrap: 'wrap',
    background: theme === 'dark' ? '#1e293b' : '#f8fafc',
  };
}

function getTabContainerStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    display: 'flex',
    gap: 4,
    padding: '12px 16px',
    borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    position: 'sticky',
    top: 77,
    background: theme === 'dark' ? '#0f172a' : '#ffffff',
    zIndex: 9,
  };
}

function getTabStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    flex: 1,
    padding: '8px 12px',
    background: 'transparent',
    border: 'none',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
    color: '#64748b',
    cursor: 'pointer',
    letterSpacing: '0.5px',
    transition: 'all 0.2s',
  };
}

function getActiveTabStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    flex: 1,
    padding: '8px 12px',
    background: 'rgba(249, 115, 22, 0.2)',
    border: '1px solid #f97316',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
    color: '#f97316',
    cursor: 'pointer',
    letterSpacing: '0.5px',
    transition: 'all 0.2s',
  };
}

const contentStyle: CSSProperties = {
  padding: 20,
};

const infoGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: 16,
};

function getToolCardStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: 14,
    background: theme === 'dark' ? '#1e293b' : '#f8fafc',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    borderRadius: 4,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };
}

function getLoadEventStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    display: 'flex',
    gap: 12,
    padding: 10,
    background: theme === 'dark' ? '#1e293b' : '#f8fafc',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    borderRadius: 4,
    alignItems: 'center',
  };
}

function getLoadBarStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    width: '100%',
    height: 6,
    background: theme === 'dark' ? '#0f172a' : '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  };
}

function getBarBackgroundStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    width: '100%',
    height: 8,
    background: theme === 'dark' ? '#1e293b' : '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
  };
}

function getEventCardStyle(
  theme: 'dark' | 'light',
  type: string
): CSSProperties {
  return {
    padding: 12,
    background: theme === 'dark' ? '#1e293b' : '#f8fafc',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    borderLeft: `4px solid ${
      type === 'ALARM'
        ? '#dc2626'
        : type === 'TOOL_CHANGE'
        ? '#3b82f6'
        : '#10b981'
    }`,
    borderRadius: 4,
  };
}

function getBehaviorTagStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: '6px 12px',
    background: theme === 'dark' ? 'rgba(249, 115, 22, 0.2)' : '#fed7aa',
    border: '1px solid #f97316',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
    color: theme === 'dark' ? '#fb923c' : '#ea580c',
    letterSpacing: '0.5px',
  };
}

function getPatternBoxStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: 12,
    background: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe',
    border: '1px solid #3b82f6',
    borderRadius: 4,
    fontSize: 13,
    color: theme === 'dark' ? '#93c5fd' : '#1e40af',
    display: 'flex',
    alignItems: 'start',
  };
}

function getNoteBoxStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: 12,
    background: theme === 'dark' ? '#1e293b' : '#f8fafc',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    borderRadius: 4,
    fontSize: 13,
    color: theme === 'dark' ? '#cbd5e1' : '#475569',
    lineHeight: 1.6,
  };
}

const simulatorButtonStyle: CSSProperties = {
  marginTop: 24,
  padding: '12px 20px',
  background: 'rgba(249, 115, 22, 0.1)',
  border: '1px solid #f97316',
  borderRadius: 4,
  color: '#f97316',
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
  letterSpacing: '0.5px',
  width: '100%',
};

const saveButtonStyle: CSSProperties = {
  marginTop: 12,
  padding: '10px 18px',
  background: 'rgba(16, 185, 129, 0.1)',
  border: '1px solid #10b981',
  borderRadius: 4,
  color: '#10b981',
  fontSize: 13,
  fontWeight: 800,
  cursor: 'pointer',
  letterSpacing: '0.5px',
};

function getTextareaStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    width: '100%',
    padding: 12,
    borderRadius: 4,
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    fontSize: 14,
    fontFamily: 'Arial, sans-serif',
    resize: 'vertical',
  };
}
