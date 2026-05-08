import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import type { AppTab, DepartmentFilter, RoleView } from '../../types/app';
import type { WorkCenter } from '../../types/plant';
import type { NavigationGroupId } from '../../logic/navigationAccess';
import {
  getHomeTabForRole,
  getVisibleNavigationGroups,
} from '../../logic/navigationAccess';
import { getThemeColors } from '../../theme/theme';
import type { Language } from '../../i18n/language';
import { t, tabLabel, navGroupLabel } from '../../i18n/translations';

interface AppDrawerProps {
  open: boolean;
  tab: AppTab;
  setTab: (tab: AppTab) => void;
  roleView: RoleView;
  departmentFilter: DepartmentFilter;
  setDepartmentFilter: (filter: DepartmentFilter) => void;
  onClose: () => void;
  workCenters: WorkCenter[];
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  lang?: Language;
  onToggleLang?: () => void;
}

export default function AppDrawer({
  open,
  tab,
  setTab,
  roleView,
  departmentFilter,
  setDepartmentFilter,
  onClose,
  workCenters,
  theme,
  onToggleTheme,
  lang = 'en',
  onToggleLang,
}: AppDrawerProps) {
  const visibleGroups = getVisibleNavigationGroups(roleView);
  const homeTab = getHomeTabForRole(roleView);
  const activeGroupId = getActiveGroupId(tab, visibleGroups);
  const [openGroupId, setOpenGroupId] = useState<NavigationGroupId | null>(activeGroupId);
  const [workCentersOpen, setWorkCentersOpen] = useState(departmentFilter !== 'All');

  useEffect(() => {
    if (!open) return;
    setOpenGroupId(activeGroupId);
    setWorkCentersOpen(departmentFilter !== 'All');
  }, [activeGroupId, departmentFilter, open]);

  if (!open) return null;

  function goToTab(nextTab: AppTab) {
    setTab(nextTab);
    onClose();
  }

  function toggleGroup(groupId: NavigationGroupId) {
    setOpenGroupId((current) => (current === groupId ? null : groupId));
  }

  const closeLabel = t('close', lang);

  return (
    <>
      <style>
        {`
          .drawer-menu-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .drawer-menu-scroll::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <div style={overlayStyle(theme)} onClick={onClose} />
      <div style={drawerStyle(theme)}>
        <div style={headerStyle(theme)}>
          <div>
            <div style={brandTitleStyle(theme)}>
              JCM
            </div>
            <div style={brandSubtitleStyle(theme)}>
              DIGITAL CO-WORKER
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={closeButtonStyle(theme)}
            aria-label={closeLabel}
            title={closeLabel}
          >
            ×
          </button>
        </div>

        <div style={homeSectionStyle(theme)}>
          <button
            onClick={() => goToTab(homeTab)}
            style={tab === homeTab ? homeButtonActiveStyle(theme) : homeButtonStyle(theme)}
          >
            <div style={indicatorStyle(tab === homeTab, theme)} />
            {t('home', lang).toUpperCase()} / {getHomeLabel(homeTab, lang)}
          </button>
        </div>

        <div style={menuContainerStyle} className="drawer-menu-scroll">
          <div style={menuStyle}>
            {visibleGroups.map((group) => {
              const groupOpen = openGroupId === group.id;
              const groupActive = group.id === activeGroupId;
              return (
                <div key={group.id} style={accordionGroupStyle(theme)}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    style={groupActive ? activeAccordionHeaderStyle(theme) : accordionHeaderStyle(theme)}
                  >
                    <span>{navGroupLabel(group.id, lang).toUpperCase()}</span>
                    <span style={accordionMetaStyle(theme)}>
                      {group.items.length} {t('pagesSuffix', lang).toUpperCase()} {groupOpen ? '-' : '+'}
                    </span>
                  </button>
                  {groupOpen && (
                    <div style={accordionBodyStyle(theme)}>
                      <div style={groupDescriptionStyle(theme)}>{group.description}</div>
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => goToTab(item.id)}
                          style={tab === item.id ? activeTabStyle(theme) : tabStyle(theme)}
                          title={item.description}
                        >
                          <div style={indicatorStyle(tab === item.id, theme)} />
                          <span>{tabLabel(item.id, lang).toUpperCase()}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div style={accordionGroupStyle(theme)}>
              <button
                type="button"
                onClick={() => setWorkCentersOpen((current) => !current)}
                style={departmentFilter !== 'All' ? activeAccordionHeaderStyle(theme) : accordionHeaderStyle(theme)}
              >
                <span>{t('workCenters', lang).toUpperCase()}</span>
                <span style={accordionMetaStyle(theme)}>
                  {workCenters.length + 1} {t('itemsSuffix', lang).toUpperCase()} {workCentersOpen ? '-' : '+'}
                </span>
              </button>
              {workCentersOpen && (
                <div style={accordionBodyStyle(theme)}>
                  <button
                    onClick={() => {
                      setDepartmentFilter('All');
                      onClose();
                    }}
                    style={departmentFilter === 'All' ? activeWorkCenterStyle(theme) : workCenterStyle(theme)}
                  >
                    <div style={indicatorStyle(departmentFilter === 'All', theme)} />
                    {t('allDepartments', lang).toUpperCase()}
                  </button>
                  {workCenters.map((center) => (
                    <button
                      key={center.id}
                      onClick={() => {
                        setDepartmentFilter(center.department);
                        onClose();
                      }}
                      style={departmentFilter === center.department ? activeWorkCenterStyle(theme) : workCenterStyle(theme)}
                    >
                      <div style={indicatorStyle(departmentFilter === center.department, theme)} />
                      {center.name.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={settingsSectionStyle(theme)}>
            <div style={settingsHeaderStyle(theme)}>{t('settings', lang).toUpperCase()}</div>
            <div style={settingItemStyle}>
              <span style={settingLabelStyle(theme)}>
                {t('theme', lang).toUpperCase()}
              </span>
              <button onClick={onToggleTheme} style={themeToggleStyle(theme)}>
                {theme === 'dark' ? t('dark', lang).toUpperCase() : t('light', lang).toUpperCase()}
              </button>
            </div>
            {onToggleLang && (
              <div style={settingItemStyle}>
                <span style={settingLabelStyle(theme)}>
                  {t('language', lang).toUpperCase()}
                </span>
                <button onClick={onToggleLang} style={themeToggleStyle(theme)}>
                  {lang === 'en' ? t('english', lang).toUpperCase() : t('spanish', lang).toUpperCase()}
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={footerStyle(theme)}>
          <div style={footerTextStyle(theme)}>{t('nashTexas', lang)}</div>
        </div>
      </div>
    </>
  );
}

function getActiveGroupId(tab: AppTab, groups: ReturnType<typeof getVisibleNavigationGroups>): NavigationGroupId | null {
  return groups.find((group) => group.items.some((item) => item.id === tab))?.id ?? null;
}

function getHomeLabel(homeTab: AppTab, lang: Language) {
  if (homeTab === 'workflow') return t('homeWorkflow', lang).toUpperCase();
  if (homeTab === 'maintenance') return t('homeMaintenance', lang).toUpperCase();
  if (homeTab === 'receiving') return t('homeReceiving', lang).toUpperCase();
  if (homeTab === 'risk') return t('homeQASafety', lang).toUpperCase();
  return t('homeCommand', lang).toUpperCase();
}

function indicatorStyle(active: boolean, theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    width: 4,
    height: 24,
    background: active ? colors.accent : 'transparent',
    borderRadius: 2,
    marginRight: 12,
  };
}

function overlayStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: colors.overlay,
    zIndex: 999,
  };
}

function drawerStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    background: colors.panel,
    zIndex: 1000,
    boxShadow: '4px 0 20px rgba(0,0,0,0.32)',
    display: 'flex',
    flexDirection: 'column',
  };
}

function headerStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    background: colors.header,
    padding: '24px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${colors.border}`,
    color: colors.textInverted,
    flexShrink: 0,
  };
}

function brandTitleStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: '1px',
    color: colors.textInverted,
  };
}

function brandSubtitleStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    fontSize: 11,
    letterSpacing: '2px',
    opacity: 0.82,
    marginTop: 2,
    color: colors.textInverted,
  };
}

function closeButtonStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    background: colors.accentBg,
    border: `1px solid ${colors.accent}`,
    color: colors.accent,
    width: 36,
    height: 36,
    borderRadius: 4,
    fontSize: 22,
    lineHeight: 1,
    cursor: 'pointer',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    letterSpacing: 0,
    padding: 0,
  };
}

function homeSectionStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    padding: '12px 12px',
    borderBottom: `1px solid ${colors.border}`,
    flexShrink: 0,
  };
}

function homeButtonStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    width: '100%',
    background: colors.card,
    border: `1px solid ${colors.border}`,
    padding: '13px 14px',
    borderRadius: 4,
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 900,
    color: colors.text,
    display: 'flex',
    alignItems: 'center',
    letterSpacing: '0.6px',
  };
}

function homeButtonActiveStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    ...homeButtonStyle(theme),
    background: colors.accentBg,
    border: `1px solid ${colors.accent}`,
    color: colors.accent,
  };
}

const menuContainerStyle: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  minHeight: 0,
};

const menuStyle: CSSProperties = {
  padding: '12px 12px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

function accordionGroupStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    border: `1px solid ${colors.border}`,
    borderRadius: 5,
    overflow: 'hidden',
    background: colors.cardAlt,
  };
}

function accordionHeaderStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    padding: '11px 12px',
    background: 'transparent',
    border: 'none',
    color: colors.textSecondary,
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '1px',
    textAlign: 'left',
  };
}

function activeAccordionHeaderStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    ...accordionHeaderStyle(theme),
    background: colors.accentBg,
    color: colors.accent,
  };
}

function accordionMetaStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: 900,
    whiteSpace: 'nowrap',
  };
}

function accordionBodyStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    padding: '4px 4px 8px',
    borderTop: `1px solid ${colors.border}`,
  };
}

function groupDescriptionStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 1.35,
    margin: '6px 10px 6px 12px',
  };
}

function tabStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    width: '100%',
    background: 'transparent',
    border: 'none',
    padding: '11px 12px',
    borderRadius: 4,
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
    color: colors.textSecondary,
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
    letterSpacing: '0.5px',
  };
}

function activeTabStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    ...tabStyle(theme),
    background: colors.accentBg,
    color: colors.accent,
  };
}

function workCenterStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    ...tabStyle(theme),
    padding: '9px 12px',
    fontSize: 11,
  };
}

function activeWorkCenterStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    ...workCenterStyle(theme),
    background: colors.accentBg,
    color: colors.accent,
  };
}

function settingsSectionStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    borderTop: `1px solid ${colors.border}`,
    padding: '16px 20px',
    flexShrink: 0,
  };
}

function settingsHeaderStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    fontSize: 11,
    fontWeight: 800,
    color: colors.textMuted,
    letterSpacing: '1px',
    marginBottom: 12,
  };
}

const settingItemStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
};

function settingLabelStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: 700,
    letterSpacing: '0.5px',
  };
}

function themeToggleStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    background: colors.accentBg,
    border: `1px solid ${colors.accent}`,
    color: colors.accent,
    padding: '6px 12px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 800,
    cursor: 'pointer',
    letterSpacing: '0.5px',
    transition: 'all 0.2s',
  };
}

function footerStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    padding: '16px 20px',
    borderTop: `1px solid ${colors.border}`,
    textAlign: 'center',
    flexShrink: 0,
  };
}

function footerTextStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    fontSize: 11,
    color: colors.textMuted,
  };
}
