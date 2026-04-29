export type Theme = 'dark' | 'light';

export const darkTheme = {
  name: 'dark' as Theme,

  // Backgrounds
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  surface: '#1e293b',
  surfaceAlt: '#0f172a',

  // UI Elements
  header: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  card: '#1e293b',
  border: '#334155',
  borderLight: '#475569',

  // Text
  text: '#e2e8f0',
  textSecondary: '#cbd5e1',
  textMuted: '#64748b',

  // Status - Enhanced for dark mode visibility
  statusRunning: '#10b981',
  statusRunningBg: 'rgba(16, 185, 129, 0.2)',
  statusRunningBorder: '#059669',

  statusIdle: '#f59e0b',
  statusIdleBg: 'rgba(245, 158, 11, 0.2)',
  statusIdleBorder: '#d97706',

  statusOffline: '#64748b',
  statusOfflineBg: 'rgba(100, 116, 139, 0.2)',
  statusOfflineBorder: '#475569',

  statusAlarm: '#ef4444',
  statusAlarmBg: 'rgba(239, 68, 68, 0.2)',
  statusAlarmBorder: '#dc2626',

  statusEstop: '#dc2626',
  statusEstopBg: 'rgba(220, 38, 38, 0.3)',
  statusEstopBorder: '#991b1b',

  // Accent
  accent: '#f97316',
  accentHover: '#fb923c',
};

export const lightTheme = {
  name: 'light' as Theme,

  // Backgrounds
  background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
  surface: '#ffffff',
  surfaceAlt: '#f1f5f9',

  // UI Elements
  header: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
  card: '#ffffff',
  border: '#cbd5e1',
  borderLight: '#e2e8f0',

  // Text
  text: '#0f172a',
  textSecondary: '#1e293b',
  textMuted: '#64748b',

  // Status
  statusRunning: '#059669',
  statusRunningBg: '#d1fae5',
  statusRunningBorder: '#10b981',

  statusIdle: '#d97706',
  statusIdleBg: '#fef3c7',
  statusIdleBorder: '#f59e0b',

  statusOffline: '#475569',
  statusOfflineBg: '#e2e8f0',
  statusOfflineBorder: '#64748b',

  statusAlarm: '#dc2626',
  statusAlarmBg: '#fee2e2',
  statusAlarmBorder: '#ef4444',

  statusEstop: '#991b1b',
  statusEstopBg: '#fecaca',
  statusEstopBorder: '#dc2626',

  // Accent
  accent: '#f97316',
  accentHover: '#ea580c',
};

export type ThemeColors = typeof darkTheme;
