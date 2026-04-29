import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';
import { plantAssets } from '../data/plantAssets';
import type { PlantAsset } from '../types/plantAsset';
import type { Department } from '../types/machine';

type PlantMapPageProps = {
  theme?: 'dark' | 'light';
};

const departmentOrder: Department[] = [
  'Receiving',
  'Material Handling',
  'Machine Shop',
  'Fab',
  'Coating',
  'Assembly',
  'Saddles Dept',
  'Clamps',
  'Patch Clamps',
  'QA',
  'Shipping',
  'Maintenance',
  'Office',
];

export default function PlantMapPage({ theme = 'dark' }: PlantMapPageProps) {
  const [filter, setFilter] = useState<Department | 'All'>('All');

  const groupedAssets = useMemo(() => {
    return departmentOrder
      .map((department) => ({
        department,
        assets: plantAssets.filter((asset) => asset.ownerDepartment === department),
      }))
      .filter((group) => group.assets.length > 0 && (filter === 'All' || group.department === filter));
  }, [filter]);

  const downCount = plantAssets.filter((asset) => asset.status === 'DOWN').length;
  const watchCount = plantAssets.filter((asset) => asset.status === 'WATCH').length;
  const unknownCount = plantAssets.filter((asset) => asset.status === 'UNKNOWN').length;

  return (
    <div style={pageStyle}>
      <div style={heroStyle(theme)}>
        <div>
          <div style={eyebrowStyle}>PLANT MAP</div>
          <h2 style={titleStyle(theme)}>Departments, Cells, Assets, and Process Zones</h2>
          <p style={subTextStyle(theme)}>
            This is the first real battlefield map. Machine Shop and Material Handling get equipment. Fab gets work cells. Coating gets process zones. QA is tracked as a plant-wide validation layer.
          </p>
        </div>
      </div>

      <div style={summaryGridStyle}>
        <SummaryTile label="Mapped Assets" value={plantAssets.length} theme={theme} />
        <SummaryTile label="Down" value={downCount} tone="bad" theme={theme} />
        <SummaryTile label="Watch" value={watchCount} tone="watch" theme={theme} />
        <SummaryTile label="Unknown" value={unknownCount} tone="unknown" theme={theme} />
      </div>

      <div style={toolbarStyle(theme)}>
        <label style={smallLabelStyle(theme)}>Filter Department</label>
        <select value={filter} onChange={(event) => setFilter(event.target.value as Department | 'All')} style={selectStyle(theme)}>
          <option value="All">All mapped areas</option>
          {departmentOrder.map((department) => (
            <option key={department} value={department}>{department}</option>
          ))}
        </select>
      </div>

      {groupedAssets.map((group) => (
        <section key={group.department} style={sectionStyle(theme)}>
          <div style={sectionHeaderStyle(theme)}>
            <div>{group.department}</div>
            <span style={countPillStyle(theme)}>{group.assets.length} mapped</span>
          </div>
          <div style={assetGridStyle}>
            {group.assets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} theme={theme} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function AssetCard({ asset, theme }: { asset: PlantAsset; theme: 'dark' | 'light' }) {
  return (
    <div style={assetCardStyle(theme, asset.status)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
        <div>
          <div style={assetTitleStyle(theme)}>{asset.name}</div>
          <div style={assetSubStyle(theme)}>{asset.kind.replaceAll('_', ' ')} · {asset.physicalArea}</div>
        </div>
        <span style={statusPillStyle(asset.status)}>{asset.status}</span>
      </div>

      <p style={bodyTextStyle(theme)}>{asset.primaryFunction}</p>

      <div style={infoGridStyle}>
        <Info label="Owner" value={asset.ownerDepartment} theme={theme} />
        <Info label="Confidence" value={asset.confidence} theme={theme} />
      </div>

      {asset.feeds.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={smallLabelStyle(theme)}>Feeds</div>
          <div style={chipWrapStyle}>
            {asset.feeds.map((feed) => <span key={feed} style={chipStyle(theme)}>{feed}</span>)}
          </div>
        </div>
      )}

      {asset.riskFlags?.length ? (
        <div style={{ marginTop: 12 }}>
          <div style={smallLabelStyle(theme)}>Risk Flags</div>
          <div style={chipWrapStyle}>
            {asset.riskFlags.map((risk) => <span key={risk} style={riskChipStyle(theme)}>{risk}</span>)}
          </div>
        </div>
      ) : null}

      {asset.notes?.length ? (
        <div style={{ marginTop: 12 }}>
          {asset.notes.map((note) => <div key={note} style={noteStyle(theme)}>{note}</div>)}
        </div>
      ) : null}
    </div>
  );
}

function SummaryTile({ label, value, tone = 'normal', theme }: { label: string; value: number; tone?: 'normal' | 'bad' | 'watch' | 'unknown'; theme: 'dark' | 'light' }) {
  const color = tone === 'bad' ? '#ef4444' : tone === 'watch' ? '#f97316' : tone === 'unknown' ? '#94a3b8' : '#38bdf8';
  return (
    <div style={summaryTileStyle(theme)}>
      <div style={{ color, fontSize: 26, fontWeight: 900 }}>{value}</div>
      <div style={smallLabelStyle(theme)}>{label}</div>
    </div>
  );
}

function Info({ label, value, theme }: { label: string; value: string; theme: 'dark' | 'light' }) {
  return (
    <div>
      <div style={smallLabelStyle(theme)}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 800, color: theme === 'dark' ? '#e2e8f0' : '#0f172a' }}>{value}</div>
    </div>
  );
}

const pageStyle: CSSProperties = { display: 'grid', gap: 16 };
const summaryGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 };
const assetGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 };
const infoGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 };
const chipWrapStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 6 };
const eyebrowStyle: CSSProperties = { color: '#f97316', fontSize: 11, fontWeight: 900, letterSpacing: '1.5px' };

function heroStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 18, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', borderLeft: '4px solid #f97316' }; }
function titleStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: '4px 0', color: theme === 'dark' ? '#e2e8f0' : '#0f172a', letterSpacing: '0.5px' }; }
function subTextStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: 0, color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 13, lineHeight: 1.5 }; }
function toolbarStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 12, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', display: 'grid', gap: 8 }; }
function selectStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: '10px 12px', borderRadius: 6, border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1', background: theme === 'dark' ? '#0f172a' : '#ffffff', color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontWeight: 800 }; }
function sectionStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 14, borderRadius: 8, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function sectionHeaderStyle(theme: 'dark' | 'light'): CSSProperties { return { marginBottom: 12, fontSize: 14, fontWeight: 900, letterSpacing: '1px', color: theme === 'dark' ? '#e2e8f0' : '#0f172a', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }; }
function summaryTileStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 14, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function assetCardStyle(theme: 'dark' | 'light', status: string): CSSProperties { const color = status === 'DOWN' ? '#ef4444' : status === 'WATCH' ? '#f97316' : status === 'UNKNOWN' ? '#94a3b8' : '#10b981'; return { padding: 14, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', borderLeft: `4px solid ${color}` }; }
function assetTitleStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 15, fontWeight: 900 }; }
function assetSubStyle(theme: 'dark' | 'light'): CSSProperties { return { marginTop: 4, color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px' }; }
function bodyTextStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: '12px 0 0', color: theme === 'dark' ? '#cbd5e1' : '#475569', fontSize: 12, lineHeight: 1.45 }; }
function smallLabelStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 10, fontWeight: 900, letterSpacing: '1px', color: theme === 'dark' ? '#64748b' : '#64748b', textTransform: 'uppercase', marginBottom: 4 }; }
function chipStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: '4px 8px', borderRadius: 999, fontSize: 11, fontWeight: 800, color: theme === 'dark' ? '#bfdbfe' : '#1e40af', background: theme === 'dark' ? 'rgba(59,130,246,0.12)' : '#dbeafe', border: theme === 'dark' ? '1px solid rgba(59,130,246,0.25)' : '1px solid #bfdbfe' }; }
function riskChipStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: '4px 8px', borderRadius: 999, fontSize: 11, fontWeight: 800, color: theme === 'dark' ? '#fdba74' : '#9a3412', background: theme === 'dark' ? 'rgba(249,115,22,0.12)' : '#ffedd5', border: theme === 'dark' ? '1px solid rgba(249,115,22,0.3)' : '1px solid #fed7aa' }; }
function noteStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 10, borderRadius: 6, background: theme === 'dark' ? 'rgba(15,23,42,0.8)' : '#f8fafc', color: theme === 'dark' ? '#cbd5e1' : '#475569', fontSize: 12, border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function countPillStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: '4px 8px', borderRadius: 999, background: theme === 'dark' ? '#1e293b' : '#ffffff', color: theme === 'dark' ? '#94a3b8' : '#64748b', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', fontSize: 11 }; }
function statusPillStyle(status: string): CSSProperties { const colors: Record<string, { background: string; color: string }> = { ACTIVE: { background: '#064e3b', color: '#bbf7d0' }, WATCH: { background: '#7c2d12', color: '#fed7aa' }, DOWN: { background: '#7f1d1d', color: '#fecaca' }, UNKNOWN: { background: '#334155', color: '#cbd5e1' }, PLANNED: { background: '#1e3a8a', color: '#bfdbfe' } }; const picked = colors[status] ?? colors.UNKNOWN; return { padding: '5px 8px', borderRadius: 999, fontSize: 10, fontWeight: 900, color: picked.color, background: picked.background, whiteSpace: 'nowrap' }; }
