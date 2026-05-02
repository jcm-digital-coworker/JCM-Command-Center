import type { CSSProperties } from 'react';

const JCM_NAVIGATE_EVENT = 'jcm:navigate';

interface AppHeaderProps {
  onMenuClick: () => void;
  onBackClick?: () => void;
  onHomeClick?: () => void;
  showBack?: boolean;
  theme?: 'dark' | 'light';
}

export default function AppHeader({
  onMenuClick,
  onBackClick,
  onHomeClick,
  showBack,
  theme = 'dark',
}: AppHeaderProps) {
  return (
    <div style={getHeaderStyle(theme)}>
      <div style={headerSideStyle}>
        <button onClick={onMenuClick} style={getMenuButtonStyle(theme)}>
          MENU
        </button>
        {showBack && onBackClick ? (
          <button onClick={onBackClick} style={getBackButtonStyle(theme)}>
            BACK
          </button>
        ) : null}
      </div>

      <div style={titleContainerStyle}>
        <div style={getTitleStyle(theme)}>JCM</div>
        <div style={getSubtitleStyle(theme)}>COMMAND CENTER</div>
      </div>

      <div style={rightActionsStyle}>
        <button
          onClick={onHomeClick ?? dispatchCommandHome}
          style={getHomeButtonStyle(theme)}
        >
          HOME
        </button>
      </div>
    </div>
  );
}

function dispatchCommandHome() {
  window.dispatchEvent(new CustomEvent(JCM_NAVIGATE_EVENT, { detail: { tab: 'dashboard' } }));
}

function getHeaderStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background:
      theme === 'dark'
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        : 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
    color: 'white',
    padding: '14px 12px',
    borderRadius: 0,
    marginBottom: 16,
    display: 'grid',
    gridTemplateColumns: 'minmax(86px, 1fr) auto minmax(86px, 1fr)',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    borderBottom: theme === 'dark' ? '2px solid #334155' : '2px solid #94a3b8',
  };
}

const headerSideStyle: CSSProperties = {
  display: 'flex',
  gap: 6,
  alignItems: 'center',
  justifyContent: 'flex-start',
  minWidth: 0,
};

const rightActionsStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  minWidth: 0,
};

const titleContainerStyle: CSSProperties = {
  textAlign: 'center',
  minWidth: 86,
};

function getTitleStyle(theme: 'dark' | 'light'): CSSProperties {
  void theme;
  return {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: '2px',
    color: 'white',
    lineHeight: 1,
  };
}

function getSubtitleStyle(theme: 'dark' | 'light'): CSSProperties {
  void theme;
  return {
    fontSize: 9,
    letterSpacing: '2px',
    opacity: 0.7,
    marginTop: 3,
    fontWeight: 600,
    color: 'white',
    whiteSpace: 'nowrap',
  };
}

function getMenuButtonStyle(theme: 'dark' | 'light'): CSSProperties {
  void theme;
  return {
    background: 'rgba(249, 115, 22, 0.2)',
    border: '1px solid #f97316',
    color: '#f97316',
    padding: '10px 9px',
    borderRadius: 4,
    fontSize: 11,
    cursor: 'pointer',
    fontWeight: 800,
    minWidth: 58,
    letterSpacing: '0.5px',
    transition: 'all 0.2s',
  };
}

function getBackButtonStyle(theme: 'dark' | 'light'): CSSProperties {
  void theme;
  return {
    background: 'rgba(100, 116, 139, 0.2)',
    border: '1px solid #64748b',
    color: '#cbd5e1',
    padding: '10px 9px',
    borderRadius: 4,
    fontSize: 11,
    cursor: 'pointer',
    fontWeight: 800,
    minWidth: 56,
    letterSpacing: '0.5px',
    transition: 'all 0.2s',
  };
}

function getHomeButtonStyle(theme: 'dark' | 'light'): CSSProperties {
  void theme;
  return {
    background: 'rgba(16, 185, 129, 0.16)',
    border: '1px solid #10b981',
    color: '#10b981',
    padding: '10px 9px',
    borderRadius: 4,
    fontSize: 11,
    cursor: 'pointer',
    fontWeight: 900,
    minWidth: 60,
    letterSpacing: '0.5px',
    transition: 'all 0.2s',
  };
}
