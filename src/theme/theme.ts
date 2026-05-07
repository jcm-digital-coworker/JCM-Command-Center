export type Theme = 'dark' | 'light';

export const darkTheme = {
  name: 'dark' as Theme,

  // Backgrounds
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  surface: '#1e293b',
  surfaceAlt: '#0f172a',
  panel: '#0f172a',
  panelAlt: '#020617',
  overlay: 'rgba(2, 6, 23, 0.78)',

  // UI Elements
  header: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  card: '#1e293b',
  cardAlt: '#0f172a',
  border: '#334155',
  borderLight: '#475569',
  input: '#020617',
  button: '#1e293b',
  buttonHover: '#334155',

  // Text
  text: '#e2e8f0',
  textSecondary: '#cbd5e1',
  textMuted: '#64748b',
  textInverted: '#ffffff',

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

  // Semantic accents
  success: '#10b981',
  successBg: 'rgba(16, 185, 129, 0.15)',
  warning: '#f59e0b',
  warningBg: 'rgba(245, 158, 11, 0.16)',
  danger: '#ef4444',
  dangerBg: 'rgba(239, 68, 68, 0.12)',
  info: '#3b82f6',
  infoBg: 'rgba(59, 130, 246, 0.14)',

  // Accent
  accent: '#f97316',
  accentHover: '#fb923c',
  accentBg: 'rgba(249, 115, 22, 0.12)',
};

export const lightTheme = {
  name: 'light' as Theme,

  // Backgrounds
  background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
  surface: '#ffffff',
  surfaceAlt: '#f1f5f9',
  panel: '#ffffff',
  panelAlt: '#f8fafc',
  overlay: 'rgba(15, 23, 42, 0.42)',

  // UI Elements
  header: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
  card: '#ffffff',
  cardAlt: '#f8fafc',
  border: '#cbd5e1',
  borderLight: '#e2e8f0',
  input: '#ffffff',
  button: '#f8fafc',
  buttonHover: '#e2e8f0',

  // Text
  text: '#0f172a',
  textSecondary: '#1e293b',
  textMuted: '#64748b',
  textInverted: '#ffffff',

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

  // Semantic accents
  success: '#059669',
  successBg: '#d1fae5',
  warning: '#d97706',
  warningBg: '#fef3c7',
  danger: '#dc2626',
  dangerBg: '#fee2e2',
  info: '#2563eb',
  infoBg: '#dbeafe',

  // Accent
  accent: '#f97316',
  accentHover: '#ea580c',
  accentBg: '#ffedd5',
};

export type ThemeColors = typeof darkTheme;

export function getThemeColors(theme: Theme): ThemeColors {
  return theme === 'dark' ? darkTheme : lightTheme;
}
