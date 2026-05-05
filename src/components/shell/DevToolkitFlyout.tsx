import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { FLAG_LABELS, getAllFeatureFlags, setFeatureFlag } from '../../logic/featureFlags';
import type { FeatureFlag } from '../../logic/featureFlags';

type DevToolkitFlyoutProps = {
  theme: 'dark' | 'light';
};

export default function DevToolkitFlyout({ theme }: DevToolkitFlyoutProps) {
  const [open, setOpen] = useState(false);
  const [flags, setFlags] = useState(() => getAllFeatureFlags());

  useEffect(() => {
    const syncFlags = () => setFlags(getAllFeatureFlags());
    window.addEventListener('storage', syncFlags);
    return () => window.removeEventListener('storage', syncFlags);
  }, []);

  function toggleFlag(flag: FeatureFlag) {
    const nextValue = !flags[flag];
    setFeatureFlag(flag, nextValue);
    setFlags(getAllFeatureFlags());
  }

  return (
    <div style={containerStyle}>
      <button type="button" onClick={() => setOpen((value) => !value)} style={buttonStyle(open)}>
        DEV
      </button>

      {open && (
        <section style={panelStyle(theme)}>
          <div style={panelHeaderStyle}>
            <div>
              <div style={eyebrowStyle}>DEV TOOLKIT</div>
              <h3 style={titleStyle(theme)}>Experimental controls</h3>
            </div>
            <button type="button" onClick={() => setOpen(false)} style={closeStyle(theme)}>X</button>
          </div>

          <p style={descriptionStyle}>
            Toggle in-progress command features without adding noise to operator navigation.
          </p>

          <div style={flagStackStyle}>
            {(Object.keys(FLAG_LABELS) as FeatureFlag[]).map((flag) => (
              <div key={flag} style={flagRowStyle(theme)}>
                <span style={flagLabelStyle(theme)}>{FLAG_LABELS[flag]}</span>
                <button
                  type="button"
                  onClick={() => toggleFlag(flag)}
                  style={flags[flag] ? flagOnStyle : flagOffStyle(theme)}
                >
                  {flags[flag] ? 'ON' : 'OFF'}
                </button>
              </div>
            ))}
          </div>

          <div style={hintStyle(theme)}>
            Flags are stored locally in this browser. Refresh-safe, not plant-wide policy.
          </div>
        </section>
      )}
    </div>
  );
}

const containerStyle: CSSProperties = {
  position: 'fixed',
  right: 14,
  bottom: 14,
  zIndex: 1200,
};

function buttonStyle(open: boolean): CSSProperties {
  return {
    width: 48,
    height: 48,
    borderRadius: 999,
    border: open ? '1px solid #f97316' : '1px solid rgba(249, 115, 22, 0.65)',
    background: open ? '#f97316' : 'rgba(15, 23, 42, 0.92)',
    color: open ? '#ffffff' : '#f97316',
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '0.8px',
    cursor: 'pointer',
    boxShadow: '0 10px 24px rgba(0,0,0,0.32)',
  };
}

function panelStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    position: 'absolute',
    right: 0,
    bottom: 58,
    width: 310,
    maxWidth: 'calc(100vw - 28px)',
    padding: 14,
    borderRadius: 10,
    background: theme === 'dark' ? '#0f172a' : '#ffffff',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    boxShadow: '0 18px 40px rgba(0,0,0,0.38)',
  };
}

const panelHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'flex-start',
};

const eyebrowStyle: CSSProperties = {
  color: '#f97316',
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: '1.1px',
};

function titleStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    margin: '3px 0 0',
    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
    fontSize: 15,
    fontWeight: 900,
  };
}

function closeStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
    background: theme === 'dark' ? '#1e293b' : '#f8fafc',
    color: theme === 'dark' ? '#cbd5e1' : '#475569',
    borderRadius: 5,
    padding: '5px 8px',
    cursor: 'pointer',
    fontWeight: 900,
    fontSize: 11,
  };
}

const descriptionStyle: CSSProperties = {
  margin: '10px 0 12px',
  color: '#64748b',
  fontSize: 12,
  lineHeight: 1.45,
};

const flagStackStyle: CSSProperties = {
  display: 'grid',
  gap: 8,
};

function flagRowStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    padding: '9px 10px',
    borderRadius: 7,
    background: theme === 'dark' ? '#1e293b' : '#f8fafc',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
  };
}

function flagLabelStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    color: theme === 'dark' ? '#cbd5e1' : '#334155',
    fontSize: 12,
    fontWeight: 800,
    lineHeight: 1.25,
  };
}

const flagOnStyle: CSSProperties = {
  minWidth: 48,
  padding: '5px 9px',
  borderRadius: 5,
  border: '1px solid #10b981',
  background: 'rgba(16,185,129,0.15)',
  color: '#10b981',
  cursor: 'pointer',
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: '0.5px',
};

function flagOffStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    ...flagOnStyle,
    border: theme === 'dark' ? '1px solid #475569' : '1px solid #cbd5e1',
    background: 'transparent',
    color: '#64748b',
  };
}

function hintStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    marginTop: 12,
    paddingTop: 10,
    borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    color: '#64748b',
    fontSize: 11,
    lineHeight: 1.35,
  };
}
