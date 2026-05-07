import type { CSSProperties } from 'react';
import type { Language } from '../../i18n/language';
import { t } from '../../i18n/translations';

const JCM_NAVIGATE_EVENT = 'jcm:navigate';

interface AppHeaderProps {
  onMenuClick: () => void;
  onBackClick?: () => void;
  onHomeClick?: () => void;
  showBack?: boolean;
  theme?: 'dark' | 'light';
  lang?: Language;
}

export default function AppHeader({
  onMenuClick,
  onBackClick,
  onHomeClick,
  showBack,
  theme = 'dark',
  lang = 'en',
}: AppHeaderProps) {
  return (
    <div style={getHeaderStyle(theme)}>
      <div style={headerSideStyle}>
        <button onClick={onMenuClick} style={getMenuButtonStyle(theme)}>
          {t('menu', lang).toUpperCase()}
        </button>
        {showBack && onBackClick ? (
          <button onClick={onBackClick} style={getBackButtonStyle(theme)}>
            {t('back', lang).toUpperCase()}
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
          {t('home', lang).toUpperCase()}
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

function getTitleStyle(_theme: 'dark' | 'light'): CSSProperties {
  return {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: '2px',
    color: 'white',
    lineHeight: 1,
  };
}

function getSubtitleStyle(_theme: 'dark' | 'light'): CSSProperties {
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

function getMenuButtonStyle(_theme: 'dark' | 'light'): CSSProperties {
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
  return {
    background: theme === 'dark' ? 'rgba(100, 116, 139, 0.2)' : 'rgba(255, 255, 255, 0.15)',
    border: '1px solid #64748b',
    color: 'white',
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

function getHomeButtonStyle(_theme: 'dark' | 'light'): CSSProperties {
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
