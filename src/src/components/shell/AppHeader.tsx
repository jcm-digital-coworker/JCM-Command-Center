import type { CSSProperties } from 'react';

interface AppHeaderProps {
  onMenuClick: () => void;
  onBackClick?: () => void;
  showBack?: boolean;
  theme?: 'dark' | 'light';
}

export default function AppHeader({
  onMenuClick,
  onBackClick,
  showBack,
  theme = 'dark',
}: AppHeaderProps) {
  return (
    <div style={getHeaderStyle(theme)}>
      {showBack && onBackClick ? (
        <button onClick={onBackClick} style={getBackButtonStyle(theme)}>
          ← BACK
        </button>
      ) : (
        <button onClick={onMenuClick} style={getMenuButtonStyle(theme)}>
          ☰ MENU
        </button>
      )}

      <div style={titleContainerStyle}>
        <div style={getTitleStyle(theme)}>JCM</div>
        <div style={getSubtitleStyle(theme)}>COMMAND CENTER</div>
      </div>

      <div style={{ width: 90 }} />
    </div>
  );
}

function getHeaderStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background:
      theme === 'dark'
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        : 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
    color: 'white',
    padding: '16px 20px',
    borderRadius: 0,
    marginBottom: 16,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    borderBottom: theme === 'dark' ? '2px solid #334155' : '2px solid #94a3b8',
  };
}

const titleContainerStyle: CSSProperties = {
  flex: 1,
  textAlign: 'center',
};

function getTitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: '2px',
    color: 'white',
  };
}

function getSubtitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 10,
    letterSpacing: '3px',
    opacity: 0.7,
    marginTop: 2,
    fontWeight: 600,
    color: 'white',
  };
}

function getMenuButtonStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: 'rgba(249, 115, 22, 0.2)',
    border: '1px solid #f97316',
    color: '#f97316',
    padding: '10px 16px',
    borderRadius: 4,
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 800,
    width: 90,
    letterSpacing: '0.5px',
    transition: 'all 0.2s',
  };
}

function getBackButtonStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: 'rgba(100, 116, 139, 0.2)',
    border: '1px solid #64748b',
    color: '#cbd5e1',
    padding: '10px 16px',
    borderRadius: 4,
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 800,
    width: 90,
    letterSpacing: '0.5px',
    transition: 'all 0.2s',
  };
}
