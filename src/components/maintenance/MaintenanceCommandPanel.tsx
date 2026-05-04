import type { CSSProperties } from 'react';
import type { MaintenanceCommandModel, MaintenanceAssetHealth } from '../../logic/maintenanceCommand';

type Theme = 'dark' | 'light';

type MaintenanceCommandPanelProps = {
  model: MaintenanceCommandModel;
  theme: Theme;
};

export default function MaintenanceCommandPanel({ model, theme }: MaintenanceCommandPanelProps) {
  const pressureColor = toneColor(model.pressureTone);
  const topAssets = model.assetHealth.slice(0, 6);

  return (
    <section style={panelStyle(theme)}>
      <div style={heroStyle(model.pressureTone, theme)}>
        <div>
          <div style={eyebrowStyle}>Maintenance Command</div>
          <h3 style={titleStyle(theme)}>Daily maintenance control board</h3>
          <p style={subtitleStyle}>
            Floor intake, PM pressure, chronic assets, and Epicor-ready handoff fields in one view.
          </p>
        </div>
        <div style={pressureBoxStyle(pressureColor)}>
          <div style={{ color: pressureColor, fontSize: 34, fontWeight: 900, lineHeight: 1 }}>{model.pressureScore}</div>
          <div style={{ color: pressureColor, fontSize: 10, fontWeight: 900, letterSpacing: '0.8px' }}>{model.pressureLabel.toUpperCase()}</div>
        </div>
      </div>

      <div style={nextActionStyle(theme)}>
        <span style={nextActionLabelStyle}>NEXT BEST ACTION</span>
        <strong style={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 13 }}>{model.nextBestAction}</strong>
      </div>

      <div style={laneGridStyle}>
        {model.lanes.map((lane) => {
          const color = toneColor(lane.tone);
          return (
            <div key={lane.key} style={laneCardStyle(theme, color)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={laneTitleStyle(theme)}>{lane.title}</span>
                <span style={{ color, fontSize: 22, fontWeight: 900 }}>{lane.count}</span>
              </div>
              <p style={laneDetailStyle}>{lane.detail}</p>
            </div>
          );
        })}
      </div>

      <div style={erpStripStyle(theme)}>
        <div>
          <div style={smallLabelStyle}>EPICOR READINESS</div>
          <div style={erpTextStyle(theme)}>{model.epicorReadyCount} open request{model.epicorReadyCount === 1 ? '' : 's'} with ERP-style details started</div>
        </div>
        <div style={erpHintStyle}>Asset ID · failure code · root cause · downtime · labor · parts</div>
      </div>

      <div style={assetSectionHeaderStyle}>
        <h4 style={sectionTitleStyle(theme)}>Asset health focus</h4>
        <span style={sectionHintStyle}>Top machines by active maintenance pressure</span>
      </div>
      <div style={assetGridStyle}>
        {topAssets.map((asset) => <AssetHealthCard key={asset.machineId} asset={asset} theme={theme} />)}
      </div>
    </section>
  );
}

function AssetHealthCard({ asset, theme }: { asset: MaintenanceAssetHealth; theme: Theme }) {
  const color = toneColor(asset.riskTone);
  return (
    <div style={assetCardStyle(theme, color)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <strong style={assetTitleStyle(theme)}>{asset.machineName}</strong>
          <div style={assetDeptStyle}>{asset.department} · {asset.state}</div>
        </div>
        <span style={assetBadgeStyle(color)}>{asset.criticalRequestCount > 0 ? 'CRITICAL' : asset.openRequestCount > 0 ? 'OPEN' : asset.dueTaskCount > 0 ? 'PM' : 'OK'}</span>
      </div>
      <div style={assetMetricRowStyle}>
        <span>{asset.openRequestCount} open</span>
        <span>{asset.dueTaskCount} PM due</span>
      </div>
      <p style={assetActionStyle(theme)}>{asset.recommendedAction}</p>
      <p style={assetStateStyle}>{asset.lastKnownState}</p>
    </div>
  );
}

function toneColor(tone: MaintenanceCommandModel['pressureTone'] | MaintenanceAssetHealth['riskTone'] | 'danger' | 'warning' | 'info' | 'good'): string {
  if (tone === 'danger') return '#ef4444';
  if (tone === 'warning') return '#f59e0b';
  if (tone === 'info') return '#38bdf8';
  return '#10b981';
}

function panelStyle(theme: Theme): CSSProperties {
  return {
    padding: 16,
    borderRadius: 10,
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    background: theme === 'dark' ? '#0f172a' : '#ffffff',
    marginBottom: 18,
  };
}

function heroStyle(tone: MaintenanceCommandModel['pressureTone'], theme: Theme): CSSProperties {
  const color = toneColor(tone);
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
    padding: 14,
    borderRadius: 8,
    border: `1px solid ${color}55`,
    borderLeft: `4px solid ${color}`,
    background: theme === 'dark' ? `${color}12` : `${color}10`,
    marginBottom: 12,
  };
}

const eyebrowStyle: CSSProperties = { color: '#f97316', fontSize: 10, fontWeight: 900, letterSpacing: '1.1px', textTransform: 'uppercase' };
function titleStyle(theme: Theme): CSSProperties { return { margin: '4px 0', color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 18, fontWeight: 900 }; }
const subtitleStyle: CSSProperties = { margin: 0, color: '#64748b', fontSize: 12, lineHeight: 1.45 };
function pressureBoxStyle(color: string): CSSProperties { return { minWidth: 112, textAlign: 'right', padding: 8, borderRadius: 8, background: `${color}12` }; }
function nextActionStyle(theme: Theme): CSSProperties { return { display: 'grid', gap: 4, padding: '10px 12px', borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#f8fafc', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', marginBottom: 12 }; }
const nextActionLabelStyle: CSSProperties = { color: '#f97316', fontSize: 10, fontWeight: 900, letterSpacing: '1px' };
const laneGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 12 };
function laneCardStyle(theme: Theme, color: string): CSSProperties { return { padding: 12, borderRadius: 8, border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', borderLeft: `3px solid ${color}`, background: theme === 'dark' ? '#1e293b' : '#f8fafc' }; }
function laneTitleStyle(theme: Theme): CSSProperties { return { color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4px' }; }
const laneDetailStyle: CSSProperties = { color: '#64748b', fontSize: 11, lineHeight: 1.4, margin: '6px 0 0' };
function erpStripStyle(theme: Theme): CSSProperties { return { display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: 12, borderRadius: 8, background: theme === 'dark' ? 'rgba(56,189,248,0.08)' : '#ecfeff', border: '1px solid rgba(56,189,248,0.28)', marginBottom: 14 }; }
const smallLabelStyle: CSSProperties = { color: '#38bdf8', fontSize: 10, fontWeight: 900, letterSpacing: '1px' };
function erpTextStyle(theme: Theme): CSSProperties { return { color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 12, fontWeight: 800, marginTop: 4 }; }
const erpHintStyle: CSSProperties = { color: '#64748b', fontSize: 11, fontWeight: 700, alignSelf: 'center' };
const assetSectionHeaderStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 10 };
function sectionTitleStyle(theme: Theme): CSSProperties { return { margin: 0, color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px' }; }
const sectionHintStyle: CSSProperties = { color: '#64748b', fontSize: 11, fontWeight: 700 };
const assetGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 };
function assetCardStyle(theme: Theme, color: string): CSSProperties { return { padding: 12, borderRadius: 8, border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', borderTop: `3px solid ${color}`, background: theme === 'dark' ? '#1e293b' : '#ffffff' }; }
function assetTitleStyle(theme: Theme): CSSProperties { return { color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 13, fontWeight: 900 }; }
const assetDeptStyle: CSSProperties = { color: '#64748b', fontSize: 11, marginTop: 3, fontWeight: 700 };
function assetBadgeStyle(color: string): CSSProperties { return { color, border: `1px solid ${color}55`, background: `${color}12`, borderRadius: 999, padding: '3px 7px', fontSize: 9, fontWeight: 900, letterSpacing: '0.5px' }; }
const assetMetricRowStyle: CSSProperties = { display: 'flex', gap: 10, color: '#94a3b8', fontSize: 11, fontWeight: 800, marginTop: 9 };
function assetActionStyle(theme: Theme): CSSProperties { return { color: theme === 'dark' ? '#cbd5e1' : '#475569', fontSize: 12, lineHeight: 1.45, margin: '8px 0 0' }; }
const assetStateStyle: CSSProperties = { color: '#64748b', fontSize: 11, lineHeight: 1.35, margin: '6px 0 0' };
