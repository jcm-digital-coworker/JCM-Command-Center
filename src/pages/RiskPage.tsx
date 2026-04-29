import type { CSSProperties } from 'react';
import type { RiskItem } from '../types/risk';
import type { RoleView } from '../types/app';
import RiskCard from '../components/cards/RiskCard';

interface RiskPageProps {
  risks: RiskItem[];
  roleView: RoleView;
  theme?: 'dark' | 'light';
}

export default function RiskPage({
  risks,
  roleView,
  theme = 'dark',
}: RiskPageProps) {
  const openRisks = risks.filter(
    (r) => r.status === 'OPEN' || r.status === 'IN_PROGRESS'
  );
  const closedRisks = risks.filter(
    (r) => r.status === 'CLOSED' || r.status === 'RESOLVED'
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
        SAFETY & RISK
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
        {openRisks.length} OPEN • {closedRisks.length} CLOSED
      </p>

      {/* Open Risks */}
      <div style={{ marginBottom: 30 }}>
        <h3
          style={{
            marginBottom: 12,
            fontSize: 16,
            color: '#dc2626',
            letterSpacing: '0.5px',
            fontWeight: 800,
          }}
        >
          OPEN RISKS ({openRisks.length})
        </h3>

        {openRisks.length === 0 ? (
          <div style={getEmptyStateStyle(theme)}>✅ NO OPEN SAFETY RISKS</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {openRisks.map((risk) => (
              <RiskCard
                key={risk.id}
                risk={risk}
                roleView={roleView}
                theme={theme}
              />
            ))}
          </div>
        )}
      </div>

      {/* Closed Risks */}
      {closedRisks.length > 0 && (
        <div>
          <h3
            style={{
              marginBottom: 12,
              fontSize: 16,
              color: '#64748b',
              letterSpacing: '0.5px',
              fontWeight: 800,
            }}
          >
            RESOLVED ({closedRisks.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {closedRisks.slice(0, 3).map((risk) => (
              <div
                key={risk.id}
                style={{ ...getRiskCardStyle(theme), opacity: 0.6 }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      marginBottom: 4,
                      color: theme === 'dark' ? '#cbd5e1' : '#475569',
                    }}
                  >
                    {risk.title}
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>
                    {risk.department} • {risk.category}
                  </div>
                </div>
                <span
                  style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}
                >
                  ✓ RESOLVED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
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

function getRiskCardStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    padding: 16,
    borderRadius: 6,
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  };
}
