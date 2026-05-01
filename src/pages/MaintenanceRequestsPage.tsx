import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import {
  maintenanceRequests,
  updateMaintenanceRequest,
  resetMaintenanceRequests,
  reloadMaintenanceRequests,
} from '../data/maintenanceRequests';
import type { MaintenanceRequest } from '../types/maintenanceRequest';
import MaintenanceSubmitPage from './MaintenanceSubmitPage';

export default function MaintenanceRequestsPage({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const [, forceUpdate] = useState({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  const refresh = () => {
    reloadMaintenanceRequests();
    forceUpdate({});
  };

  useEffect(() => {
    refresh();
  }, []);

  const sortedRequests = [...maintenanceRequests].sort((a, b) => {
    const priorityOrder = { SAFETY: 0, LINE_DOWN: 1, MACHINE_DOWN: 1, URGENT: 2, NORMAL: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return (
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  });

  const openRequests = sortedRequests.filter((r) => r.status !== 'COMPLETED');
  const completedRequests = sortedRequests.filter(
    (r) => r.status === 'COMPLETED'
  );

  const handleClaim = (requestId: string) => {
    const name = prompt('Enter your name:');
    if (name) {
      updateMaintenanceRequest(requestId, {
        status: 'CLAIMED',
        claimedBy: name,
        claimedAt: new Date().toISOString(),
      });
      refresh();
    }
  };

  const handleComplete = (requestId: string) => {
    const workDone = prompt('What work was done?');
    if (workDone) {
      const name = prompt('Your name:');
      if (name) {
        updateMaintenanceRequest(requestId, {
          status: 'COMPLETED',
          completedBy: name,
          completedAt: new Date().toISOString(),
          workDone,
        });
        refresh();
      }
    }
  };

  const handleReset = () => {
    if (confirm('Reset all maintenance requests to demo data?')) {
      resetMaintenanceRequests();
      refresh();
    }
  };

  const handleSubmitSuccess = () => {
    setShowSubmitForm(false);
    refresh();
  };

  // If showing submit form, render it instead
  if (showSubmitForm) {
    return (
      <MaintenanceSubmitPage
        onBack={() => setShowSubmitForm(false)}
        onSubmitSuccess={handleSubmitSuccess}
        theme={theme}
      />
    );
  }

  return (
    <div>
      <div style={getHeaderStyle(theme)}>
        <div>
          <h2 style={getTitleStyle(theme)}>
            MAINTENANCE REQUESTS
          </h2>
          <p style={getSubtitleStyle(theme)}>
            {openRequests.length} OPEN
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setShowSubmitForm(true)} style={getSubmitButtonStyle(theme)}>
            + SUBMIT REQUEST
          </button>
          <button onClick={handleReset} style={getResetButtonStyle(theme)}>
            RESET
          </button>
        </div>
      </div>

      {openRequests.length === 0 ? (
        <div style={getEmptyStateStyle(theme)}>✅ ALL CLEAR</div>
      ) : (
        <div style={listStyle}>
          {openRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              expanded={expandedId === request.id}
              onToggle={() =>
                setExpandedId(expandedId === request.id ? null : request.id)
              }
              onClaim={handleClaim}
              onComplete={handleComplete}
              theme={theme}
            />
          ))}
        </div>
      )}

      {completedRequests.length > 0 && (
        <>
          <h3 style={getCompletedHeaderStyle(theme)}>
            COMPLETED ({completedRequests.length})
          </h3>
          <div style={listStyle}>
            {completedRequests.slice(0, 3).map((request) => (
              <CompletedCard key={request.id} request={request} theme={theme} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface RequestCardProps {
  request: MaintenanceRequest;
  expanded: boolean;
  onToggle: () => void;
  onClaim: (id: string) => void;
  onComplete: (id: string) => void;
  theme: 'dark' | 'light';
}

function RequestCard({
  request,
  expanded,
  onToggle,
  onClaim,
  onComplete,
  theme,
}: RequestCardProps) {
  return (
    <div style={getCardStyle(theme)} onClick={onToggle}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            {getPriorityIcon(request.priority)}
            <span style={getAssetNameStyle(theme)}>
              {request.machineName}
            </span>
          </div>
          <div style={getProblemTextStyle(theme)}>
            {request.problem.length > 60 && !expanded
              ? request.problem.substring(0, 60) + '...'
              : request.problem}
          </div>
        </div>
        <div style={{ textAlign: 'right', marginLeft: 16 }}>
          {getStatusBadge(request.status)}
          <div style={getTimeStyle(theme)}>
            {getTimeAgo(request.submittedAt)}
          </div>
        </div>
      </div>

      {expanded && (
        <div style={getDetailsStyle(theme)}>
          <div style={detailRowStyle}>
            <span style={getLabelStyle(theme)}>Department:</span>
            <span style={getValueStyle(theme)}>{request.department}</span>
          </div>
          <div style={detailRowStyle}>
            <span style={getLabelStyle(theme)}>Submitted By:</span>
            <span style={getValueStyle(theme)}>{request.submittedBy}</span>
          </div>
          <div style={detailRowStyle}>
            <span style={getLabelStyle(theme)}>Submitted:</span>
            <span style={getValueStyle(theme)}>
              {new Date(request.submittedAt).toLocaleString()}
            </span>
          </div>
          {request.claimedBy && (
            <>
              <div style={detailRowStyle}>
                <span style={getLabelStyle(theme)}>Claimed By:</span>
                <span style={getValueStyle(theme)}>{request.claimedBy}</span>
              </div>
              <div style={detailRowStyle}>
                <span style={getLabelStyle(theme)}>Claimed:</span>
                <span style={getValueStyle(theme)}>
                  {request.claimedAt
                    ? new Date(request.claimedAt).toLocaleString()
                    : 'N/A'}
                </span>
              </div>
            </>
          )}

          {request.photos && request.photos.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={getPhotoLabelStyle(theme)}>PHOTOS</div>
              <div style={photoRowStyle}>
                {request.photos.map((src, i) => (
                  <a key={i} href={src} target="_blank" rel="noopener noreferrer">
                    <img src={src} alt={`Photo ${i + 1}`} style={photoThumbStyle} />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: 16,
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {request.status === 'NEW' && (
              <button onClick={() => onClaim(request.id)} style={claimButtonStyle}>
                CLAIM
              </button>
            )}
            {(request.status === 'CLAIMED' || request.status === 'IN_PROGRESS') && (
              <button onClick={() => onComplete(request.id)} style={completeButtonStyle}>
                COMPLETE
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface CompletedCardProps {
  request: MaintenanceRequest;
  theme: 'dark' | 'light';
}

function CompletedCard({ request, theme }: CompletedCardProps) {
  return (
    <div style={getCompletedCardStyle(theme)}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={getAssetNameStyle(theme)}>{request.machineName}</div>
          <div style={getCompletedProblemStyle(theme)}>{request.problem}</div>
          {request.workDone && (
            <div style={getWorkDoneStyle(theme)}>
              ✓ {request.workDone}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={getCompletedByStyle(theme)}>
            {request.completedBy || 'Unknown'}
          </div>
          <div style={getTimeStyle(theme)}>
            {getTimeAgo(request.completedAt || request.submittedAt)}
          </div>
        </div>
      </div>
    </div>
  );
}

function getPriorityIcon(priority: MaintenanceRequest['priority']) {
  const icons = {
    NORMAL: <span style={{ fontSize: 20 }}>🟢</span>,
    URGENT: <span style={{ fontSize: 20 }}>🟡</span>,
    LINE_DOWN: <span style={{ fontSize: 20 }}>🔴</span>,
    SAFETY: <span style={{ fontSize: 20 }}>🛑</span>,
    MACHINE_DOWN: <span style={{ fontSize: 20 }}>🔴</span>,
  };
  return icons[priority];
}
function getStatusBadge(status: MaintenanceRequest['status']) {
  const styles: Record<
    MaintenanceRequest['status'],
    { background: string; color: string; border: string }
  > = {
    NEW: {
      background: '#7c2d12',
      color: '#fed7aa',
      border: '1px solid #92400e',
    },
    CLAIMED: {
      background: '#713f12',
      color: '#fdba74',
      border: '1px solid #92400e',
    },
    IN_PROGRESS: {
      background: '#1e3a8a',
      color: '#93c5fd',
      border: '1px solid #1e40af',
    },
    COMPLETED: {
      background: '#064e3b',
      color: '#a7f3d0',
      border: '1px solid #047857',
    },
  };

  return (
    <span
      style={{
        ...badgeStyle,
        ...(styles[status] || {}),
      }}
    >
      {status}
    </span>
  );
}

function getTimeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'NOW';
  if (diffMins < 60) return `${diffMins}M`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}H`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}D`;
}

// Theme-aware style functions
function getHeaderStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: 24,
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
    letterSpacing: '1px',
  };
}

function getSubmitButtonStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: '8px 14px',
    background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
    color: '#ffffff',
    border: '1px solid #f97316',
    borderRadius: 4,
    fontWeight: 800,
    cursor: 'pointer',
    fontSize: 12,
    letterSpacing: '0.5px',
    boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)',
  };
}

function getResetButtonStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: '8px 14px',
    background: 'rgba(100, 116, 139, 0.2)',
    color: '#94a3b8',
    border: '1px solid #475569',
    borderRadius: 4,
    fontWeight: 800,
    cursor: 'pointer',
    fontSize: 12,
    letterSpacing: '0.5px',
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
    boxShadow: theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
  };
}

function getCardStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    padding: 16,
    borderRadius: 6,
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
  };
}

function getAssetNameStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontWeight: 800,
    fontSize: 16,
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    letterSpacing: '0.3px',
  };
}

function getProblemTextStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 14,
    color: theme === 'dark' ? '#cbd5e1' : '#475569',
    marginTop: 6,
  };
}

function getTimeStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
  };
}

function getDetailsStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    marginTop: 16,
    paddingTop: 16,
    borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
  };
}

function getLabelStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    color: '#64748b',
    minWidth: 120,
    fontWeight: 700,
    letterSpacing: '0.5px',
  };
}

function getValueStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    color: theme === 'dark' ? '#cbd5e1' : '#475569',
  };
}

function getCompletedHeaderStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    marginTop: 40,
    marginBottom: 16,
    fontSize: 16,
    color: '#64748b',
    letterSpacing: '0.5px',
    fontWeight: 800,
  };
}

function getCompletedCardStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
    padding: 16,
    borderRadius: 6,
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    opacity: 0.7,
  };
}

function getCompletedProblemStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  };
}

function getWorkDoneStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 13,
    color: '#10b981',
    marginTop: 6,
    fontStyle: 'italic',
  };
}

function getCompletedByStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 13,
    color: '#64748b',
    fontWeight: 600,
  };
}

// Static styles
const listStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const detailRowStyle: CSSProperties = {
  display: 'flex',
  gap: 12,
  marginBottom: 8,
  fontSize: 13,
};

const badgeStyle: CSSProperties = {
  padding: '4px 10px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const claimButtonStyle: CSSProperties = {
  padding: '10px 18px',
  background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
  color: 'white',
  border: '1px solid #10b981',
  borderRadius: 4,
  fontWeight: 800,
  cursor: 'pointer',
  fontSize: 13,
  letterSpacing: '0.5px',
};

const completeButtonStyle: CSSProperties = {
  padding: '10px 18px',
  background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
  color: 'white',
  border: '1px solid #3b82f6',
  borderRadius: 4,
  fontWeight: 800,
  cursor: 'pointer',
  fontSize: 13,
  letterSpacing: '0.5px',
};

function getPhotoLabelStyle(theme: 'dark' | 'light'): CSSProperties {
  return { fontSize: 11, fontWeight: 900, color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 };
}

const photoRowStyle: CSSProperties = {
  display: 'flex', flexWrap: 'wrap', gap: 8,
};

const photoThumbStyle: CSSProperties = {
  width: 72, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid #334155', display: 'block', cursor: 'pointer',
};
