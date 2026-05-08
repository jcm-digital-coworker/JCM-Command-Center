import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { implementedCastings, tapCodeTable, LV4500_FIXTURE_LIMIT } from '../data/lv4500JcmSuite';
import {
  LV4500R_G28_TRAVEL_X,
  LV4500R_G28_TRAVEL_Z,
  LV4500R_INDEX_SECONDS_PER_STEP,
  LV4500R_RAPID_RATE_IPM,
  estimateLv4500CycleTime,
} from '../logic/lv4500JcmCycleTime';
import { runLv4500Geometry, runLv4500Logic } from '../logic/lv4500JcmSimulator';
import type { GeometryResult, LogicResult, SimStatus } from '../types/lv4500Jcm';

type Theme = 'dark' | 'light';
type LvTab = 'setup' | 'results' | 'geometry' | 'docs';

type Lv4500JcmSimulatorV2Props = {
  theme?: Theme;
  onGoToSaddles?: () => void;
};

type RunRecord = {
  ts: string;
  casting: string;
  tap: string;
  zDepth: number;
  overallStatus: SimStatus;
};

type ThemeTokens = {
  page: string;
  card: string;
  cardAlt: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  input: string;
};

function getTokens(theme: Theme): ThemeTokens {
  if (theme === 'dark') {
    return {
      page: '#0f172a',
      card: '#1e293b',
      cardAlt: '#111827',
      border: '#334155',
      text: '#e2e8f0',
      muted: '#94a3b8',
      accent: '#f97316',
      input: '#020617',
    };
  }

  return {
    page: '#f8fafc',
    card: '#ffffff',
    cardAlt: '#f1f5f9',
    border: '#cbd5e1',
    text: '#0f172a',
    muted: '#64748b',
    accent: '#f97316',
    input: '#ffffff',
  };
}

export default function Lv4500JcmSimulatorV2({ theme = 'dark', onGoToSaddles }: Lv4500JcmSimulatorV2Props) {
  const t = getTokens(theme);
  const [activeTab, setActiveTab] = useState<LvTab>('setup');
  const [castingNumber, setCastingNumber] = useState(implementedCastings[0].castingNumber);
  const [tapCode, setTapCode] = useState(tapCodeTable[0].code);
  const [batchTarget, setBatchTarget] = useState(50);
  const [zDepthOverride, setZDepthOverride] = useState(getDefaultThreadDepth(tapCode));
  const [logicResult, setLogicResult] = useState<LogicResult | null>(null);
  const [geometryResult, setGeometryResult] = useState<GeometryResult | null>(null);
  const [cycleTime, setCycleTime] = useState<ReturnType<typeof estimateLv4500CycleTime> | null>(null);
  const [runHistory, setRunHistory] = useState<RunRecord[]>([]);

  const selectedCasting = implementedCastings.find((casting) => casting.castingNumber === castingNumber);
  const selectedTap = tapCodeTable.find((tap) => tap.code === tapCode);
  const defaultDepth = getDefaultThreadDepth(tapCode);

  const overallStatus = useMemo<SimStatus | null>(() => {
    if (!logicResult || !geometryResult) return null;
    if (logicResult.status === 'FAIL' || geometryResult.status === 'FAIL') return 'FAIL';
    if (logicResult.status === 'CAUTION' || geometryResult.status === 'CAUTION') return 'CAUTION';
    return 'PASS';
  }, [logicResult, geometryResult]);

  function chooseTap(nextTap: string) {
    setTapCode(nextTap);
    setZDepthOverride(getDefaultThreadDepth(nextTap));
  }

  function resetZDepth() {
    setZDepthOverride(defaultDepth);
  }

  function runSimulation() {
    const casting = implementedCastings.find((item) => item.castingNumber === castingNumber);

    const logic = runLv4500Logic({
      castingNumber,
      tapCode,
      batchTarget,
      actualCount: 0,
      gaugeCount: 0,
      interruptFlag: false,
      warmupDone: true,
      proveOutMode: false,
      bossType: casting?.bossType ?? 'large',
    });

    const geometry = runLv4500Geometry(castingNumber, tapCode, { zDepthOverride });
    const time = estimateLv4500CycleTime(tapCode, { zDepthOverride });
    const nextOverall: SimStatus =
      logic.status === 'FAIL' || geometry.status === 'FAIL'
        ? 'FAIL'
        : logic.status === 'CAUTION' || geometry.status === 'CAUTION'
          ? 'CAUTION'
          : 'PASS';

    setLogicResult(logic);
    setGeometryResult(geometry);
    setCycleTime(time);
    setRunHistory((previous) => [
      {
        ts: new Date().toISOString(),
        casting: casting?.lastThree ?? castingNumber,
        tap: selectedTap?.label ?? tapCode,
        zDepth: Math.abs(zDepthOverride),
        overallStatus: nextOverall,
      },
      ...previous,
    ].slice(0, 8));
    setActiveTab('results');
  }

  function stepNextTap() {
    const currentIndex = tapCodeTable.findIndex((tap) => tap.code === tapCode);
    const nextTap = tapCodeTable[(currentIndex + 1) % tapCodeTable.length];
    chooseTap(nextTap.code);
    window.setTimeout(() => {
      const casting = implementedCastings.find((item) => item.castingNumber === castingNumber);
      const nextDepth = getDefaultThreadDepth(nextTap.code);
      const logic = runLv4500Logic({
        castingNumber,
        tapCode: nextTap.code,
        batchTarget,
        actualCount: 0,
        gaugeCount: 0,
        interruptFlag: false,
        warmupDone: true,
        proveOutMode: false,
        bossType: casting?.bossType ?? 'large',
      });
      const geometry = runLv4500Geometry(castingNumber, nextTap.code, { zDepthOverride: nextDepth });
      const time = estimateLv4500CycleTime(nextTap.code, { zDepthOverride: nextDepth });
      setLogicResult(logic);
      setGeometryResult(geometry);
      setCycleTime(time);
      setRunHistory((previous) => [
        {
          ts: new Date().toISOString(),
          casting: casting?.lastThree ?? castingNumber,
          tap: nextTap.label,
          zDepth: nextDepth,
          overallStatus: logic.status === 'FAIL' || geometry.status === 'FAIL' ? 'FAIL' : logic.status === 'CAUTION' || geometry.status === 'CAUTION' ? 'CAUTION' : 'PASS',
        },
        ...previous,
      ].slice(0, 8));
      setActiveTab('results');
    }, 0);
  }

  return (
    <div style={pageStyle(t)}>
      <div style={shellStyle}>
        <h2 style={titleStyle(t)}>LV4500R JCM Suite Simulator</h2>
        <p style={subtitleStyle(t)}>
          Read-only macro simulator with editable thread Z-depth and measured LV4500R travel constants.
        </p>

        <div style={tabBarStyle}>
          {(['setup', 'results', 'geometry', 'docs'] as LvTab[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={tabStyle(t, activeTab === tab)}>
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {activeTab === 'setup' && (
          <section style={cardStyle(t)}>
            <h3 style={cardTitleStyle(t)}>Job Setup</h3>

            <label style={labelStyle(t)}>Casting</label>
            <select value={castingNumber} onChange={(event) => setCastingNumber(event.target.value)} style={inputStyle(t)}>
              {implementedCastings.map((casting) => (
                <option key={casting.castingNumber} value={casting.castingNumber}>
                  {casting.lastThree} - {casting.displayName} - {casting.bossType}
                </option>
              ))}
            </select>

            <label style={labelStyle(t)}>Tap Code</label>
            <select value={tapCode} onChange={(event) => chooseTap(event.target.value)} style={inputStyle(t)}>
              {tapCodeTable.map((tap) => (
                <option key={tap.code} value={tap.code}>
                  {tap.code} - {tap.label}
                </option>
              ))}
            </select>

            <label style={labelStyle(t)}>Batch Target</label>
            <input type="number" min={1} value={batchTarget} onChange={(event) => setBatchTarget(Number(event.target.value))} style={inputStyle(t)} />

            <div style={zDepthPanelStyle(t)}>
              <div>
                <label style={labelStyle(t)}>Thread Z Depth Override</label>
                <input
                  type="number"
                  step="0.001"
                  value={zDepthOverride}
                  onChange={(event) => setZDepthOverride(Number(event.target.value))}
                  style={inputStyle(t)}
                />
              </div>
              <button onClick={resetZDepth} style={secondaryButtonStyle(t)}>
                RESET TO MACRO DEFAULT {defaultDepth.toFixed(3)}
              </button>
              <p style={helpTextStyle(t)}>
                Enter depth as a positive or negative number. The simulator uses absolute Z travel for safety checks and G76 stroke math.
              </p>
            </div>

            <InfoGrid>
              <InfoTile t={t} label="Selected Casting" value={selectedCasting?.lastThree ?? 'Unknown'} />
              <InfoTile t={t} label="Boss Type" value={selectedCasting?.bossType ?? 'Unknown'} />
              <InfoTile t={t} label="Tap" value={selectedTap?.label ?? 'Unknown'} />
              <InfoTile t={t} label="Macro Z Default" value={`${defaultDepth.toFixed(3)} in`} />
              <InfoTile t={t} label="Rapid Rate" value={`${LV4500R_RAPID_RATE_IPM} IPM`} />
              <InfoTile t={t} label="G28 Travel" value={`X${LV4500R_G28_TRAVEL_X.toFixed(3)} / Z${LV4500R_G28_TRAVEL_Z.toFixed(3)}`} />
              <InfoTile t={t} label="Indexing" value={`${LV4500R_INDEX_SECONDS_PER_STEP.toFixed(1)} sec / step`} />
            </InfoGrid>

            <div style={buttonRowStyle}>
              <button onClick={runSimulation} style={primaryButtonStyle(t)}>RUN / VALIDATE</button>
              <button onClick={stepNextTap} style={secondaryButtonStyle(t)}>STEP TO NEXT TAP</button>
            </div>
          </section>
        )}

        {activeTab === 'results' && (
          <section style={cardStyle(t)}>
            <h3 style={cardTitleStyle(t)}>Results</h3>
            {!logicResult || !geometryResult || !cycleTime ? (
              <p style={subtitleStyle(t)}>Run the simulator from Setup to generate results.</p>
            ) : (
              <>
                <StatusBanner t={t} status={overallStatus ?? 'PASS'} />
                <InfoGrid>
                  <InfoTile t={t} label="Logic" value={logicResult.status} />
                  <InfoTile t={t} label="Geometry" value={geometryResult.status} />
                  <InfoTile t={t} label="Thread End Z" value={`${geometryResult.threadEndZ.toFixed(3)} in`} />
                  <InfoTile t={t} label="Max Depth" value={`${geometryResult.maxDepth.toFixed(3)} in`} />
                  <InfoTile t={t} label="Fixture Margin" value={`${geometryResult.fixtureMargin.toFixed(3)} in`} />
                  <InfoTile t={t} label="G76 R" value={geometryResult.g76R.toFixed(4)} />
                  <InfoTile t={t} label="Cycle Estimate" value={`~${cycleTime.totalMinutes.toFixed(2)} min`} />
                  <InfoTile t={t} label="Rapid Portion" value={`${cycleTime.rapidMinutes.toFixed(2)} min`} />
                </InfoGrid>

                <MessageBlock t={t} title="Logic Messages" messages={logicResult.messages} />
                <MessageBlock t={t} title="Geometry Messages" messages={geometryResult.messages} />
                <MessageBlock t={t} title="Cycle-Time Notes" messages={cycleTime.notes} />
              </>
            )}

            {runHistory.length > 0 && (
              <div style={historyStyle(t)}>
                <strong>RUN HISTORY</strong>
                {runHistory.map((run) => (
                  <div key={`${run.ts}-${run.tap}`} style={historyRowStyle(t)}>
                    <span>{new Date(run.ts).toLocaleTimeString()}</span>
                    <span>{run.casting}</span>
                    <span>{run.tap}</span>
                    <span>Z {run.zDepth.toFixed(3)}</span>
                    <span>{run.overallStatus}</span>
                  </div>
                ))}
              </div>
            )}

            {onGoToSaddles && (
              <button onClick={onGoToSaddles} style={{ ...secondaryButtonStyle(t), marginTop: 14 }}>
                OPEN SADDLES DEPARTMENT
              </button>
            )}
          </section>
        )}

        {activeTab === 'geometry' && (
          <section style={cardStyle(t)}>
            <h3 style={cardTitleStyle(t)}>Geometry View</h3>
            {!geometryResult ? (
              <p style={subtitleStyle(t)}>Run validation first.</p>
            ) : (
              <>
                <DepthBar t={t} depth={geometryResult.maxDepth} />
                <GeometryRow t={t} label="Drill" value={geometryResult.drillZ} />
                <GeometryRow t={t} label="Bore taper" value={geometryResult.boreTaperZ} />
                <GeometryRow t={t} label="Straight relief" value={geometryResult.reliefZ} />
                <GeometryRow t={t} label="Thread end" value={geometryResult.threadEndZ} />
                <GeometryRow t={t} label="Fixture danger" value={LV4500_FIXTURE_LIMIT} danger />
              </>
            )}
          </section>
        )}

        {activeTab === 'docs' && (
          <section style={cardStyle(t)}>
            <h3 style={cardTitleStyle(t)}>Machine Constants</h3>
            <InfoGrid>
              <InfoTile t={t} label="Rapid Rate" value={`${LV4500R_RAPID_RATE_IPM} IPM`} />
              <InfoTile t={t} label="G28 X Travel" value={`${LV4500R_G28_TRAVEL_X.toFixed(3)} in`} />
              <InfoTile t={t} label="G28 Z Travel" value={`${LV4500R_G28_TRAVEL_Z.toFixed(3)} in`} />
              <InfoTile t={t} label="Indexing Time" value={`${LV4500R_INDEX_SECONDS_PER_STEP.toFixed(1)} sec / step`} />
              <InfoTile t={t} label="Fixture Limit" value={`${LV4500_FIXTURE_LIMIT.toFixed(3)} in`} />
            </InfoGrid>
            <p style={helpTextStyle(t)}>
              The production macro still owns real machine motion. This simulator only changes the read-only estimate and safety visualization.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

function getDefaultThreadDepth(tapCode: string) {
  return Math.abs(tapCodeTable.find((tap) => tap.code === tapCode)?.threadDepth ?? 0);
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return <div style={infoGridStyle}>{children}</div>;
}

function InfoTile({ t, label, value }: { t: ThemeTokens; label: string; value: string }) {
  return (
    <div style={infoTileStyle(t)}>
      <div style={infoLabelStyle(t)}>{label}</div>
      <div style={infoValueStyle(t)}>{value}</div>
    </div>
  );
}

function StatusBanner({ t, status }: { t: ThemeTokens; status: SimStatus }) {
  return <div style={statusBannerStyle(status)}>{status}</div>;
}

function MessageBlock({ t, title, messages }: { t: ThemeTokens; title: string; messages: string[] }) {
  return (
    <div style={messageBlockStyle(t)}>
      <strong>{title}</strong>
      {messages.map((message) => <p key={message} style={messageStyle(t)}>• {message}</p>)}
    </div>
  );
}

function GeometryRow({ t, label, value, danger = false }: { t: ThemeTokens; label: string; value: number; danger?: boolean }) {
  return (
    <div style={geometryRowStyle(t, danger)}>
      <span>{label}</span>
      <strong>Z {value.toFixed(3)}</strong>
    </div>
  );
}

function DepthBar({ t, depth }: { t: ThemeTokens; depth: number }) {
  const percent = Math.min((depth / LV4500_FIXTURE_LIMIT) * 100, 100);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={depthTrackStyle(t)}>
        <div style={{ ...depthFillStyle(depth), width: `${percent}%` }} />
      </div>
      <p style={helpTextStyle(t)}>Max depth {depth.toFixed(3)} in / fixture limit {LV4500_FIXTURE_LIMIT.toFixed(3)} in.</p>
    </div>
  );
}

function pageStyle(t: ThemeTokens): CSSProperties {
  return { background: t.page, minHeight: '100vh', padding: 20, color: t.text, fontFamily: 'Arial, sans-serif' };
}

const shellStyle: CSSProperties = { maxWidth: 980, margin: '0 auto' };
const tabBarStyle: CSSProperties = { display: 'flex', gap: 8, flexWrap: 'wrap', margin: '16px 0' };
const buttonRowStyle: CSSProperties = { display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 };
const infoGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginTop: 14 };

function titleStyle(t: ThemeTokens): CSSProperties { return { margin: 0, color: t.text, textAlign: 'center', letterSpacing: '0.5px' }; }
function subtitleStyle(t: ThemeTokens): CSSProperties { return { color: t.muted, textAlign: 'center', lineHeight: 1.45 }; }
function cardStyle(t: ThemeTokens): CSSProperties { return { padding: 16, borderRadius: 14, border: `1px solid ${t.border}`, background: t.card, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }; }
function cardTitleStyle(t: ThemeTokens): CSSProperties { return { color: t.text, textAlign: 'center', marginTop: 0 }; }
function labelStyle(t: ThemeTokens): CSSProperties { return { display: 'block', color: t.muted, fontWeight: 900, fontSize: 12, letterSpacing: '0.6px', marginTop: 12, textTransform: 'uppercase' }; }
function inputStyle(t: ThemeTokens): CSSProperties { return { width: '100%', boxSizing: 'border-box', marginTop: 6, padding: 10, borderRadius: 9, border: `1px solid ${t.border}`, background: t.input, color: t.text, fontWeight: 800 }; }
function tabStyle(t: ThemeTokens, active: boolean): CSSProperties { return { flex: 1, minWidth: 110, padding: '10px 12px', borderRadius: 9, border: `1px solid ${active ? t.accent : t.border}`, background: active ? 'rgba(249,115,22,0.16)' : t.card, color: active ? t.accent : t.text, fontWeight: 900, cursor: 'pointer' }; }
function primaryButtonStyle(t: ThemeTokens): CSSProperties { return { flex: 1, minWidth: 160, padding: '12px 14px', borderRadius: 10, border: `1px solid ${t.accent}`, background: t.accent, color: '#111827', fontWeight: 950, cursor: 'pointer' }; }
function secondaryButtonStyle(t: ThemeTokens): CSSProperties { return { flex: 1, minWidth: 160, padding: '12px 14px', borderRadius: 10, border: `1px solid ${t.border}`, background: t.cardAlt, color: t.text, fontWeight: 900, cursor: 'pointer' }; }
function zDepthPanelStyle(t: ThemeTokens): CSSProperties { return { marginTop: 12, padding: 12, borderRadius: 12, border: `1px solid ${t.accent}`, background: 'rgba(249,115,22,0.10)' }; }
function helpTextStyle(t: ThemeTokens): CSSProperties { return { color: t.muted, fontSize: 12, lineHeight: 1.45, marginBottom: 0 }; }
function infoTileStyle(t: ThemeTokens): CSSProperties { return { padding: 10, borderRadius: 10, border: `1px solid ${t.border}`, background: t.cardAlt }; }
function infoLabelStyle(t: ThemeTokens): CSSProperties { return { color: t.muted, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px' }; }
function infoValueStyle(t: ThemeTokens): CSSProperties { return { color: t.text, fontSize: 16, fontWeight: 950, marginTop: 5 }; }
function statusBannerStyle(status: SimStatus): CSSProperties { return { textAlign: 'center', padding: 12, borderRadius: 10, fontWeight: 950, color: '#111827', background: status === 'PASS' ? '#10b981' : status === 'CAUTION' ? '#f59e0b' : '#ef4444', marginBottom: 12 }; }
function messageBlockStyle(t: ThemeTokens): CSSProperties { return { marginTop: 12, padding: 12, borderRadius: 10, border: `1px solid ${t.border}`, background: t.cardAlt, color: t.text }; }
function messageStyle(t: ThemeTokens): CSSProperties { return { color: t.muted, margin: '6px 0', lineHeight: 1.35 }; }
function historyStyle(t: ThemeTokens): CSSProperties { return { display: 'grid', gap: 6, marginTop: 14, padding: 12, borderRadius: 10, background: t.cardAlt, border: `1px solid ${t.border}`, color: t.text }; }
function historyRowStyle(t: ThemeTokens): CSSProperties { return { display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr 1fr 1fr', gap: 6, color: t.muted, fontSize: 12 }; }
function geometryRowStyle(t: ThemeTokens, danger: boolean): CSSProperties { return { display: 'flex', justifyContent: 'space-between', padding: 10, borderRadius: 9, marginTop: 8, border: danger ? '1px solid #ef4444' : `1px solid ${t.border}`, background: danger ? 'rgba(239,68,68,0.12)' : t.cardAlt, color: danger ? '#ef4444' : t.text }; }
function depthTrackStyle(t: ThemeTokens): CSSProperties { return { height: 18, borderRadius: 999, overflow: 'hidden', background: t.cardAlt, border: `1px solid ${t.border}` }; }
function depthFillStyle(depth: number): CSSProperties { return { height: '100%', background: depth >= LV4500_FIXTURE_LIMIT ? '#ef4444' : depth >= 1.425 ? '#f59e0b' : '#10b981' }; }
