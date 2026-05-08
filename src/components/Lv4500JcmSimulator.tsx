import { useState } from 'react';
import { implementedCastings, tapCodeTable } from '../data/lv4500JcmSuite';
import {
  estimateLv4500CycleTime,
  LV4500R_RAPID_RATE_IPM,
  LV4500R_G28_TRAVEL_X,
  LV4500R_G28_TRAVEL_Z,
  LV4500R_INDEX_SECONDS_PER_STEP,
} from '../logic/lv4500JcmCycleTime';
import { runLv4500Geometry, runLv4500Logic } from '../logic/lv4500JcmSimulator';
import type { GeometryResult, LogicResult } from '../types/lv4500Jcm';

// ─── Theme ───────────────────────────────────────────────────────────────────

export type Theme = 'dark' | 'light';

interface ThemeTokens {
  pageBg: string;
  cardBg: string;
  cardBgAlt: string; // slightly elevated surface (e.g. inside a card)
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  inputBg: string;
  inputBorder: string;
  tabActiveBg: string;
  tabActiveText: string;
  tabInactiveBg: string;
  tabInactiveText: string;
  tabInactiveBorder: string;
  runBtnBg: string;
  runBtnText: string;
  runBtnBorder: string;
  resetBtnBg: string;
  resetBtnText: string;
  resetBtnBorder: string;
  tileValueText: string;
  noteBg: string; // amber-tinted notice block
  readonlyBg: string; // blue-tinted notice block
}

function getThemeTokens(theme: Theme): ThemeTokens {
  if (theme === 'dark') {
    return {
      pageBg: '#0f172a',
      cardBg: '#1e293b',
      cardBgAlt: '#273549',
      border: '#334155',
      borderStrong: '#475569',
      text: '#f1f5f9',
      textMuted: '#94a3b8',
      textSubtle: '#64748b',
      inputBg: '#0f172a',
      inputBorder: '#475569',
      tabActiveBg: '#f1f5f9',
      tabActiveText: '#0f172a',
      tabInactiveBg: '#1e293b',
      tabInactiveText: '#cbd5e1',
      tabInactiveBorder: '#334155',
      runBtnBg: '#f1f5f9',
      runBtnText: '#0f172a',
      runBtnBorder: '#f1f5f9',
      resetBtnBg: '#1e293b',
      resetBtnText: '#f1f5f9',
      resetBtnBorder: '#475569',
      tileValueText: '#f1f5f9',
      noteBg: '#431407', // dark amber
      readonlyBg: '#0c1a35', // dark blue
    };
  }
  return {
    pageBg: '#f8fafc',
    cardBg: '#ffffff',
    cardBgAlt: 'rgba(255,255,255,0.7)',
    border: '#e2e8f0',
    borderStrong: '#cbd5e1',
    text: '#111827',
    textMuted: '#64748b',
    textSubtle: '#475569',
    inputBg: '#ffffff',
    inputBorder: '#cbd5e1',
    tabActiveBg: '#111827',
    tabActiveText: '#ffffff',
    tabInactiveBg: '#ffffff',
    tabInactiveText: '#111827',
    tabInactiveBorder: '#d1d5db',
    runBtnBg: '#111827',
    runBtnText: '#ffffff',
    runBtnBorder: '#111827',
    resetBtnBg: '#ffffff',
    resetBtnText: '#111827',
    resetBtnBorder: '#d1d5db',
    tileValueText: '#111827',
    noteBg: '#fff7ed',
    readonlyBg: '#eff6ff',
  };
}

// ─── Style factories ──────────────────────────────────────────────────────────

function pageStyle(t: ThemeTokens): React.CSSProperties {
  return {
    padding: 20,
    fontFamily: 'Arial, sans-serif',
    background: t.pageBg,
    minHeight: '100vh',
    color: t.text,
  };
}

function shellStyle(): React.CSSProperties {
  return { maxWidth: 950, margin: '0 auto' };
}

function subTextStyle(t: ThemeTokens): React.CSSProperties {
  return { color: t.textMuted, textAlign: 'center', lineHeight: 1.45 };
}

function tabBarStyle(): React.CSSProperties {
  return {
    display: 'flex',
    gap: 8,
    width: '100%',
    marginTop: 16,
    marginBottom: 16,
  };
}

function cardStyle(t: ThemeTokens): React.CSSProperties {
  return {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    border: `1px solid ${t.border}`,
    background: t.cardBg,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  };
}

function cardTitleStyle(): React.CSSProperties {
  return { textAlign: 'center', marginTop: 0 };
}

function labelStyle(t: ThemeTokens): React.CSSProperties {
  return {
    display: 'block',
    fontWeight: 800,
    color: t.textSubtle,
    marginTop: 12,
  };
}

function inputStyle(t: ThemeTokens): React.CSSProperties {
  return {
    display: 'block',
    width: '100%',
    marginTop: 6,
    marginBottom: 12,
    padding: 10,
    borderRadius: 10,
    border: `1px solid ${t.inputBorder}`,
    background: t.inputBg,
    color: t.text,
  };
}

function runButtonStyle(t: ThemeTokens): React.CSSProperties {
  return {
    flex: 1,
    padding: '12px 14px',
    borderRadius: 12,
    border: `1px solid ${t.runBtnBorder}`,
    background: t.runBtnBg,
    color: t.runBtnText,
    fontWeight: 900,
    cursor: 'pointer',
  };
}

function resetButtonStyle(t: ThemeTokens): React.CSSProperties {
  return {
    flex: 1,
    padding: '12px 14px',
    borderRadius: 12,
    border: `1px solid ${t.resetBtnBorder}`,
    background: t.resetBtnBg,
    color: t.resetBtnText,
    fontWeight: 800,
    cursor: 'pointer',
  };
}

function statusTint(
  status: 'PASS' | 'CAUTION' | 'FAIL',
  theme: Theme
): React.CSSProperties {
  if (theme === 'dark') {
    if (status === 'PASS')
      return { background: '#052e16', border: '1px solid #166534' };
    if (status === 'CAUTION')
      return { background: '#422006', border: '1px solid #92400e' };
    return { background: '#450a0a', border: '1px solid #b91c1c' };
  }
  if (status === 'PASS')
    return { background: '#ecfdf5', border: '1px solid #86efac' };
  if (status === 'CAUTION')
    return { background: '#fffbeb', border: '1px solid #fcd34d' };
  return { background: '#fff1f2', border: '1px solid #fca5a5' };
}

// ─── Types ────────────────────────────────────────────────────────────────────

type LvTab = 'setup' | 'results' | 'audit' | 'geometry' | 'docs';

type RunRecord = {
  ts: string;
  castingDisplay: string;
  tapCode: string;
  tapLabel: string;
  batchTarget: number;
  zDepthOverride?: number;
  logicStatus: 'PASS' | 'CAUTION' | 'FAIL';
  geometryStatus: 'PASS' | 'CAUTION' | 'FAIL';
  overallStatus: 'PASS' | 'CAUTION' | 'FAIL';
};

// ─── Runtime reflection helpers ───────────────────────────────────────────────

function getActiveSaddlesCount(): number {
  try {
    const stored = localStorage.getItem('jcm_workflow_runtime_state');
    const overrides: Record<string, { currentDepartment?: string; flowStatus?: string }> =
      stored ? (JSON.parse(stored) as Record<string, { currentDepartment?: string; flowStatus?: string }>) : {};
    const overrideDepts = new Set(
      Object.values(overrides)
        .filter((o) => o.flowStatus !== 'DONE' && o.flowStatus !== 'done' && o.flowStatus !== 'complete')
        .map((o) => o.currentDepartment)
        .filter(Boolean),
    );
    const overriddenCount = [...overrideDepts].filter(
      (d) => d === 'Saddles Dept' || d === 'Machine Shop',
    ).length;
    return Math.max(overriddenCount, 0);
  } catch {
    return 0;
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Lv4500JcmSimulatorProps {
  theme?: Theme;
  onGoToSaddles?: () => void;
}

export default function Lv4500JcmSimulator({
  theme = 'light',
  onGoToSaddles,
}: Lv4500JcmSimulatorProps) {
  const t = getThemeTokens(theme);

  const [activeTab, setActiveTab] = useState<LvTab>('setup');
  const [castingNumber, setCastingNumber] = useState(
    implementedCastings[0].castingNumber
  );
  const [tapCode, setTapCode] = useState(tapCodeTable[0].code);
  const [batchTarget, setBatchTarget] = useState(50);

  const [logicResult, setLogicResult] = useState<LogicResult | null>(null);
  const [geometryResult, setGeometryResult] = useState<GeometryResult | null>(null);
  const [cycleTime, setCycleTime] = useState<ReturnType<typeof estimateLv4500CycleTime> | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const [runHistory, setRunHistory] = useState<RunRecord[]>([]);
  const [zDepthOverride, setZDepthOverride] = useState<number | ''>('');

  const selectedCasting = implementedCastings.find((c) => c.castingNumber === castingNumber);
  const selectedTap = tapCodeTable.find((tc) => tc.code === tapCode);

  function runWith(casting: string, tap: string, batch: number, zOverride: number | '' = zDepthOverride) {
    const castingData = implementedCastings.find((c) => c.castingNumber === casting);
    const tapData = tapCodeTable.find((tc) => tc.code === tap);
    const numericZ = typeof zOverride === 'number' && zOverride > 0 ? zOverride : undefined;

    const logic = runLv4500Logic({
      castingNumber: casting,
      tapCode: tap,
      batchTarget: batch,
      actualCount: 0,
      gaugeCount: 0,
      interruptFlag: false,
      warmupDone: true,
      proveOutMode: false,
      bossType: castingData?.bossType ?? 'large',
    });

    const geometry = runLv4500Geometry(casting, tap, { zDepthOverride: numericZ });
    const time = estimateLv4500CycleTime(tap, { zDepthOverride: numericZ });

    const overallStatus: RunRecord['overallStatus'] =
      logic.status === 'FAIL' || geometry.status === 'FAIL' ? 'FAIL' :
      logic.status === 'CAUTION' || geometry.status === 'CAUTION' ? 'CAUTION' : 'PASS';

    const record: RunRecord = {
      ts: new Date().toISOString(),
      castingDisplay: castingData?.lastThree ?? casting,
      tapCode: tap,
      tapLabel: tapData?.label ?? tap,
      batchTarget: batch,
      zDepthOverride: numericZ,
      logicStatus: logic.status,
      geometryStatus: geometry.status,
      overallStatus,
    };

    setLogicResult(logic);
    setGeometryResult(geometry);
    setCycleTime(time);
    setHasRun(true);
    setRunHistory((prev) => [record, ...prev].slice(0, 12));
    setActiveTab('results');
  }

  function runSimulation() {
    runWith(castingNumber, tapCode, batchTarget);
  }

  function clearResults() {
    setLogicResult(null);
    setGeometryResult(null);
    setCycleTime(null);
    setHasRun(false);
    setRunHistory([]);
    setActiveTab('setup');
  }

  const lastDiff: string | null = (() => {
    if (runHistory.length < 2) return null;
    const [latest, prev] = runHistory;
    const parts: string[] = [];
    if (latest.castingDisplay !== prev.castingDisplay) parts.push(`casting ${prev.castingDisplay}→${latest.castingDisplay}`);
    if (latest.tapCode !== prev.tapCode) parts.push(`tap ${prev.tapCode}→${latest.tapCode}`);
    if (latest.overallStatus !== prev.overallStatus) parts.push(`status ${prev.overallStatus}→${latest.overallStatus}`);
    const prevZ = prev.zDepthOverride != null ? prev.zDepthOverride.toFixed(3) : 'default';
    const latestZ = latest.zDepthOverride != null ? latest.zDepthOverride.toFixed(3) : 'default';
    if (prevZ !== latestZ) parts.push(`Z ${prevZ}→${latestZ}`);
    if (parts.length === 0) return 'No change from prior run';
    return parts.join(' · ');
  })();

  const activeSaddlesCount = getActiveSaddlesCount();

  const auditRows = buildAuditRows();

  return (
    <div style={pageStyle(t)}>
      <div style={shellStyle()}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>
          LV4500 JCM Suite Simulator
        </h2>
        <p style={subTextStyle(t)}>
          Select casting, outlet/tap, batch, and optional Z-depth override. Run one selected cycle for geometry and cycle-time estimate.
        </p>

        <div style={tabBarStyle()}>
          <MiniTab
            theme={theme}
            active={activeTab === 'setup'}
            onClick={() => setActiveTab('setup')}
          >
            Setup
          </MiniTab>
          <MiniTab
            theme={theme}
            active={activeTab === 'results'}
            onClick={() => setActiveTab('results')}
          >
            Results
          </MiniTab>
          <MiniTab
            theme={theme}
            active={activeTab === 'audit'}
            onClick={() => setActiveTab('audit')}
          >
            Audit
          </MiniTab>
          <MiniTab
            theme={theme}
            active={activeTab === 'geometry'}
            onClick={() => setActiveTab('geometry')}
          >
            Geometry
          </MiniTab>
          <MiniTab
            theme={theme}
            active={activeTab === 'docs'}
            onClick={() => setActiveTab('docs')}
          >
            Docs
          </MiniTab>
        </div>

        {activeTab === 'setup' && (
          <div style={cardStyle(t)}>
            <h3 style={cardTitleStyle()}>Job Setup</h3>

            <label style={labelStyle(t)}>Casting</label>
            <select
              value={castingNumber}
              onChange={(e) => setCastingNumber(e.target.value)}
              style={inputStyle(t)}
            >
              {implementedCastings.map((c) => (
                <option key={c.castingNumber} value={c.castingNumber}>
                  {c.lastThree} — {c.displayName} — {c.bossType}
                </option>
              ))}
            </select>

            <label style={labelStyle(t)}>Tap Code</label>
            <select
              value={tapCode}
              onChange={(e) => setTapCode(e.target.value)}
              style={inputStyle(t)}
            >
              {tapCodeTable.map((tap) => (
                <option key={tap.code} value={tap.code}>
                  {tap.code} — {tap.label}
                </option>
              ))}
            </select>

            <label style={labelStyle(t)}>Batch Target</label>
            <input
              value={batchTarget}
              type="number"
              min={1}
              onChange={(e) => setBatchTarget(Number(e.target.value))}
              style={inputStyle(t)}
            />

            <label style={labelStyle(t)}>Thread Z-depth override</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={zDepthOverride}
                type="number"
                step="0.001"
                min={0}
                placeholder="Blank = macro table default"
                onChange={(e) => setZDepthOverride(e.target.value === '' ? '' : Number(e.target.value))}
                style={{ ...inputStyle(t), marginBottom: 0, flex: 1 }}
              />
              {zDepthOverride !== '' && (
                <button
                  onClick={() => setZDepthOverride('')}
                  style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${t.resetBtnBorder}`, background: t.resetBtnBg, color: t.resetBtnText, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 11 }}
                >
                  Use macro default
                </button>
              )}
            </div>
            <p style={{ margin: '4px 0 12px', fontSize: 11, color: t.textMuted }}>
              Overrides the thread end Z calculated from the macro table. Leave blank to use the default.
            </p>

            <InfoGrid>
              <InfoTile
                theme={theme}
                label="Selected casting"
                value={selectedCasting?.lastThree ?? 'Unknown'}
              />
              <InfoTile
                theme={theme}
                label="Boss type"
                value={selectedCasting?.bossType ?? 'Unknown'}
              />
              <InfoTile
                theme={theme}
                label="Tap"
                value={selectedTap?.label ?? 'Unknown'}
              />
              <InfoTile
                theme={theme}
                label="Z-depth override"
                value={zDepthOverride !== '' ? `${Number(zDepthOverride).toFixed(3)} in` : 'Macro default'}
              />
              <InfoTile theme={theme} label="Rapid rate" value={`${LV4500R_RAPID_RATE_IPM} IPM`} />
              <InfoTile theme={theme} label="G28 travel" value={`X${LV4500R_G28_TRAVEL_X.toFixed(3)} / Z${LV4500R_G28_TRAVEL_Z.toFixed(3)}`} />
              <InfoTile theme={theme} label="Index time" value={`${LV4500R_INDEX_SECONDS_PER_STEP} sec/step`} />
              <InfoTile
                theme={theme}
                label="Active at Saddles"
                value={activeSaddlesCount > 0 ? `${activeSaddlesCount} runtime order${activeSaddlesCount === 1 ? '' : 's'}` : 'None in runtime'}
              />
            </InfoGrid>

            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                marginTop: 16,
              }}
            >
              <button onClick={runSimulation} style={runButtonStyle(t)}>
                RUN SELECTED CYCLE
              </button>
              <button onClick={clearResults} style={resetButtonStyle(t)}>
                Clear Results
              </button>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <>
            {!hasRun && (
              <div style={cardStyle(t)}>
                <h3 style={cardTitleStyle()}>No Results Yet</h3>
                <p style={subTextStyle(t)}>
                  Go to Setup, choose casting/tap/batch, then run validation.
                </p>
              </div>
            )}

            {lastDiff && (
              <div style={{ ...cardStyle(t), background: t.noteBg, marginTop: 8 }}>
                <strong style={{ fontSize: 12 }}>LAST RUN DIFF:</strong>{' '}
                <span style={{ fontSize: 12, color: t.textSubtle }}>{lastDiff}</span>
              </div>
            )}

            {runHistory.length > 0 && (
              <EventTimeline records={runHistory} theme={theme} />
            )}

            {logicResult && (
              <div
                style={{
                  ...cardStyle(t),
                  ...statusTint(logicResult.status, theme),
                }}
              >
                <h3 style={cardTitleStyle()}>Logic Result</h3>
                <StatusPill status={logicResult.status} />

                <InfoGrid>
                  <InfoTile
                    theme={theme}
                    label="Result"
                    value={logicResult.valid ? 'Valid setup' : 'Rejected setup'}
                  />
                  <InfoTile
                    theme={theme}
                    label="Gauge required"
                    value={logicResult.gaugeRequired ? 'YES' : 'NO'}
                  />
                  <InfoTile
                    theme={theme}
                    label="Thread mode"
                    value={threadModeLabel(logicResult.adaptiveThreadMode)}
                  />
                  <InfoTile
                    theme={theme}
                    label="#3901 next"
                    value={String(logicResult.nextActualCount)}
                  />
                  <InfoTile
                    theme={theme}
                    label="#550 remaining"
                    value={String(logicResult.remainingCount)}
                  />
                </InfoGrid>

                <p style={{ textAlign: 'center', color: t.textSubtle }}>
                  <strong>Next path:</strong> {logicResult.nextProgramPath}
                </p>

                <MessageList
                  status={logicResult.status}
                  messages={logicResult.messages}
                />
              </div>
            )}

            {geometryResult && (
              <div
                style={{
                  ...cardStyle(t),
                  ...statusTint(geometryResult.status, theme),
                }}
              >
                <h3 style={cardTitleStyle()}>Geometry Result</h3>
                <StatusPill status={geometryResult.status} />

                <InfoGrid>
                  <InfoTile
                    theme={theme}
                    label="Max depth"
                    value={`${geometryResult.maxDepth.toFixed(3)} in`}
                  />
                  <InfoTile
                    theme={theme}
                    label="Fixture margin"
                    value={`${geometryResult.fixtureMargin.toFixed(3)} in`}
                  />
                  <InfoTile
                    theme={theme}
                    label="Drill"
                    value={geometryResult.drillZ.toFixed(3)}
                  />
                  <InfoTile
                    theme={theme}
                    label="Bore taper"
                    value={geometryResult.boreTaperZ.toFixed(3)}
                  />
                  <InfoTile
                    theme={theme}
                    label="Relief"
                    value={geometryResult.reliefZ.toFixed(3)}
                  />
                  <InfoTile
                    theme={theme}
                    label="Thread end"
                    value={geometryResult.threadEndZ.toFixed(3)}
                  />
                  <InfoTile
                    theme={theme}
                    label="G76 R"
                    value={geometryResult.g76R.toFixed(4)}
                  />
                </InfoGrid>

                <DepthBar
                  label="Max depth vs 1.5 inch fixture limit"
                  depth={geometryResult.maxDepth}
                  theme={theme}
                />
                <MessageList
                  status={geometryResult.status}
                  messages={geometryResult.messages}
                />
              </div>
            )}

            {cycleTime && (() => {
              const batchCycleMinutes = cycleTime.totalMinutes * batchTarget;
              const batchCycleHours = batchCycleMinutes / 60;
              const partsPerHour = cycleTime.totalMinutes > 0 ? 60 / cycleTime.totalMinutes : 0;
              return (
                <div style={cardStyle(t)}>
                  <h3 style={cardTitleStyle()}>Estimated Cycle Time</h3>
                  <InfoGrid>
                    <InfoTile
                      theme={theme}
                      label="Single Cycle"
                      value={`~${cycleTime.totalMinutes.toFixed(1)} min`}
                    />
                    <InfoTile
                      theme={theme}
                      label="Batch Target"
                      value={`${batchTarget} parts`}
                    />
                    <InfoTile
                      theme={theme}
                      label="Batch Total"
                      value={`~${batchCycleMinutes.toFixed(0)} min`}
                    />
                    <InfoTile
                      theme={theme}
                      label="Batch Hours"
                      value={`~${batchCycleHours.toFixed(1)} hr`}
                    />
                    <InfoTile
                      theme={theme}
                      label="Parts / Hour"
                      value={`~${partsPerHour.toFixed(1)}`}
                    />
                    <InfoTile
                      theme={theme}
                      label="Cutting"
                      value={`${cycleTime.cuttingMinutes.toFixed(1)} min`}
                    />
                    <InfoTile
                      theme={theme}
                      label="Rapid"
                      value={`${cycleTime.rapidMinutes.toFixed(1)} min`}
                    />
                    <InfoTile
                      theme={theme}
                      label="Overhead"
                      value={`${cycleTime.overheadMinutes.toFixed(1)} min`}
                    />
                    <InfoTile
                      theme={theme}
                      label="Confidence"
                      value={cycleTime.confidence}
                    />
                  </InfoGrid>

                  {cycleTime.notes.map((note, i) => (
                    <p
                      key={i}
                      style={{
                        color: t.textSubtle,
                        margin: '8px 0',
                        lineHeight: 1.45,
                      }}
                    >
                      • {note}
                    </p>
                  ))}

                  <p style={{ margin: '12px 0 0', fontSize: 11, color: t.textMuted, lineHeight: 1.5 }}>
                    Batch estimate multiplies the selected cycle estimate by batch target. It excludes operator stops, gauge holds, manual inspection, and unmodeled interruptions.
                  </p>
                </div>
              );
            })()}

            {hasRun && onGoToSaddles && (
              <div style={{ ...cardStyle(t), display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <strong style={{ fontSize: 13, color: t.text }}>Open Diagnostic Order</strong>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: t.textMuted }}>
                    Navigate to the Saddles department to review active LV4500 production orders.
                  </p>
                </div>
                <button onClick={onGoToSaddles} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #f97316', background: 'rgba(249,115,22,0.12)', color: '#f97316', fontWeight: 900, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  → SADDLES
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'audit' && (
          <div style={cardStyle(t)}>
            <h3 style={cardTitleStyle()}>Combination Audit</h3>
            <p style={subTextStyle(t)}>
              Runs all implemented castings against tap codes 06–16 and flags
              rejects.
            </p>

            <InfoGrid>
              <InfoTile
                theme={theme}
                label="Total combos"
                value={String(auditRows.length)}
              />
              <InfoTile
                theme={theme}
                label="Pass"
                value={String(
                  auditRows.filter((r) => r.status !== 'FAIL').length
                )}
              />
              <InfoTile
                theme={theme}
                label="Fail"
                value={String(
                  auditRows.filter((r) => r.status === 'FAIL').length
                )}
              />
              <InfoTile
                theme={theme}
                label="Small boss rejects"
                value={String(
                  auditRows.filter((r) => r.reason.includes('Small boss'))
                    .length
                )}
              />
            </InfoGrid>

            <div style={{ overflowX: 'auto', marginTop: 14 }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr>
                    <Th theme={theme}>Casting</Th>
                    <Th theme={theme}>Boss</Th>
                    <Th theme={theme}>Tap</Th>
                    <Th theme={theme}>Status</Th>
                    <Th theme={theme}>Max Depth</Th>
                    <Th theme={theme}>Margin</Th>
                    <Th theme={theme}>Reason</Th>
                  </tr>
                </thead>
                <tbody>
                  {auditRows.map((row, i) => (
                    <tr key={`${row.casting}-${row.tap}-${i}`}>
                      <Td theme={theme}>{row.casting}</Td>
                      <Td theme={theme}>{row.boss}</Td>
                      <Td theme={theme}>{row.tap}</Td>
                      <Td theme={theme}>
                        <span style={smallPill(row.status)}>{row.status}</span>
                      </Td>
                      <Td theme={theme}>{row.maxDepth.toFixed(3)}</Td>
                      <Td theme={theme}>{row.margin.toFixed(3)}</Td>
                      <Td theme={theme}>{row.reason}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'geometry' && (
          <div style={cardStyle(t)}>
            <h3 style={cardTitleStyle()}>Geometry View</h3>

            {!geometryResult ? (
              <p style={subTextStyle(t)}>
                Run validation first to generate the geometry view.
              </p>
            ) : (
              <>
                <StatusPill status={geometryResult.status} />

                <GeometryLine
                  theme={theme}
                  label="Drill"
                  value={geometryResult.drillZ}
                />
                <GeometryLine
                  theme={theme}
                  label="Bore taper"
                  value={geometryResult.boreTaperZ}
                />
                <GeometryLine
                  theme={theme}
                  label="Straight relief"
                  value={geometryResult.reliefZ}
                />
                <GeometryLine
                  theme={theme}
                  label="Thread end"
                  value={geometryResult.threadEndZ}
                />
                <GeometryLine
                  theme={theme}
                  label="Fixture danger"
                  value={1.5}
                  danger
                />

                <DepthBar
                  label="Fixture clearance check"
                  depth={geometryResult.maxDepth}
                  theme={theme}
                />

                <p
                  style={{
                    color: t.textSubtle,
                    textAlign: 'center',
                    lineHeight: 1.45,
                  }}
                >
                  This is a simple depth-based visualization. It shows whether
                  the simulated prep/thread depth approaches the 1.5 inch
                  fixture danger zone.
                </p>
              </>
            )}
          </div>
        )}

        {activeTab === 'docs' && (
          <div style={cardStyle(t)}>
            <h3 style={cardTitleStyle()}>Docs / Variable Map</h3>

            <InfoGrid>
              <InfoTile theme={theme} label="#121" value="Quick Load casting" />
              <InfoTile
                theme={theme}
                label="#122"
                value="Quick Load tap code"
              />
              <InfoTile
                theme={theme}
                label="#123"
                value="Quick Load batch target"
              />
              <InfoTile theme={theme} label="#501" value="Active casting" />
              <InfoTile theme={theme} label="#502" value="Active tap code" />
              <InfoTile theme={theme} label="#503" value="Batch target" />
              <InfoTile theme={theme} label="#504" value="Batch count" />
              <InfoTile theme={theme} label="#505" value="Gauge count" />
              <InfoTile theme={theme} label="#506" value="Reset breadcrumb" />
              <InfoTile theme={theme} label="#507" value="Interrupt flag" />
              <InfoTile theme={theme} label="#509" value="Warm-up date" />
              <InfoTile
                theme={theme}
                label="#520/#521"
                value="Thread profile state"
              />
              <InfoTile theme={theme} label="#550" value="Remaining count" />
              <InfoTile theme={theme} label="#3901" value="iHMI actual count" />
              <InfoTile theme={theme} label="#3902" value="iHMI target count" />
            </InfoGrid>

            <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: t.noteBg }}>
              <strong>Important:</strong>
              <p style={{ marginBottom: 0 }}>
                Do not use #3903. The current macro uses #550 for remaining count.
              </p>
            </div>

            <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: t.readonlyBg }}>
              <strong>Measured machine constants (LV4500R)</strong>
              <InfoGrid>
                <InfoTile theme={theme} label="Rapid rate" value={`${LV4500R_RAPID_RATE_IPM} IPM`} />
                <InfoTile theme={theme} label="G28 X travel" value={`${LV4500R_G28_TRAVEL_X.toFixed(3)} in`} />
                <InfoTile theme={theme} label="G28 Z travel" value={`${LV4500R_G28_TRAVEL_Z.toFixed(3)} in`} />
                <InfoTile theme={theme} label="Index time" value={`${LV4500R_INDEX_SECONDS_PER_STEP} sec/step`} />
              </InfoGrid>
            </div>

            <div
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 12,
                background: t.readonlyBg,
              }}
            >
              <strong>Read-only rule:</strong>
              <p style={{ marginBottom: 0 }}>
                This app simulates and explains the macro logic. It must not
                write variables, start cycles, or control the CNC.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Event Timeline component ─────────────────────────────────────────────────

function EventTimeline({ records, theme }: { records: RunRecord[]; theme: Theme }) {
  const t = getThemeTokens(theme);
  const pillColor = (s: RunRecord['overallStatus']) =>
    s === 'PASS' ? '#166534' : s === 'CAUTION' ? '#92400e' : '#b91c1c';
  const pillBg = (s: RunRecord['overallStatus']) =>
    s === 'PASS' ? '#dcfce7' : s === 'CAUTION' ? '#fef3c7' : '#fee2e2';

  return (
    <div style={{ ...cardStyle(t), marginTop: 8 }}>
      <h4 style={{ margin: '0 0 10px', fontSize: 13, color: t.text }}>RUN TIMELINE ({records.length})</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {records.map((rec, i) => (
          <div key={`${rec.ts}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, padding: '6px 8px', borderRadius: 6, background: i === 0 ? (theme === 'dark' ? '#1e293b' : '#f8fafc') : 'transparent', border: i === 0 ? `1px solid ${t.border}` : 'none' }}>
            <span style={{ padding: '2px 7px', borderRadius: 999, fontWeight: 900, background: pillBg(rec.overallStatus), color: pillColor(rec.overallStatus), fontSize: 10 }}>{rec.overallStatus}</span>
            <span style={{ color: t.text, fontWeight: 700 }}>Casting {rec.castingDisplay}</span>
            <span style={{ color: t.textMuted }}>Tap {rec.tapCode} — {rec.tapLabel}</span>
            {rec.zDepthOverride != null && <span style={{ color: t.textSubtle, fontSize: 10 }}>Z={rec.zDepthOverride.toFixed(3)}</span>}
            <span style={{ color: t.textSubtle, marginLeft: 'auto', whiteSpace: 'nowrap' }}>
              {new Date(rec.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Build audit rows (pure logic, no theme needed) ──────────────────────────

function buildAuditRows() {
  const rows: {
    casting: string;
    boss: string;
    tap: string;
    status: 'PASS' | 'CAUTION' | 'FAIL';
    maxDepth: number;
    margin: number;
    reason: string;
  }[] = [];

  for (const casting of implementedCastings) {
    for (const tap of tapCodeTable) {
      const logic = runLv4500Logic({
        castingNumber: casting.castingNumber,
        tapCode: tap.code,
        batchTarget: 1,
        actualCount: 0,
        gaugeCount: 0,
        interruptFlag: false,
        warmupDone: true,
        proveOutMode: false,
        bossType: casting.bossType,
      });

      const geometry = runLv4500Geometry(casting.castingNumber, tap.code);

      const status =
        logic.status === 'FAIL' || geometry.status === 'FAIL'
          ? 'FAIL'
          : logic.status === 'CAUTION' || geometry.status === 'CAUTION'
          ? 'CAUTION'
          : 'PASS';

      const reason =
        logic.messages.find((m) => m.includes('Small boss')) ||
        geometry.messages.find((m) => m.includes('CRITICAL')) ||
        geometry.messages.find((m) => m.includes('CAUTION')) ||
        logic.messages[0] ||
        geometry.messages[0] ||
        'OK';

      rows.push({
        casting: casting.lastThree,
        boss: casting.bossType,
        tap: `${tap.code} ${tap.label}`,
        status,
        maxDepth: geometry.maxDepth,
        margin: geometry.fixtureMargin,
        reason,
      });
    }
  }

  return rows;
}

// ─── Child components (all accept theme prop) ─────────────────────────────────

function MiniTab({
  active,
  onClick,
  children,
  theme,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  theme: Theme;
}) {
  const t = getThemeTokens(theme);
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '10px 8px',
        borderRadius: 12,
        border: active
          ? `1px solid ${t.tabActiveBg}`
          : `1px solid ${t.tabInactiveBorder}`,
        background: active ? t.tabActiveBg : t.tabInactiveBg,
        color: active ? t.tabActiveText : t.tabInactiveText,
        fontWeight: 800,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
        gap: 10,
        marginTop: 12,
      }}
    >
      {children}
    </div>
  );
}

function InfoTile({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: Theme;
}) {
  const t = getThemeTokens(theme);
  return (
    <div
      style={{
        border: `1px solid ${t.border}`,
        borderRadius: 12,
        padding: 10,
        background: t.cardBgAlt,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: t.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 5, fontWeight: 800, color: t.tileValueText }}>
        {value}
      </div>
    </div>
  );
}

// StatusPill colours are semantic (green/yellow/red) — no theme needed
function StatusPill({ status }: { status: 'PASS' | 'CAUTION' | 'FAIL' }) {
  const style =
    status === 'PASS'
      ? { bg: '#dcfce7', color: '#166534', border: '#86efac' }
      : status === 'CAUTION'
      ? { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' }
      : { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };

  return (
    <div style={{ textAlign: 'center', marginBottom: 12 }}>
      <span
        style={{
          display: 'inline-block',
          padding: '7px 12px',
          borderRadius: 999,
          fontWeight: 900,
          background: style.bg,
          color: style.color,
          border: `1px solid ${style.border}`,
        }}
      >
        {status}
      </span>
    </div>
  );
}

// MessageList colours are semantic — no theme needed
function MessageList({
  status,
  messages,
}: {
  status: 'PASS' | 'CAUTION' | 'FAIL';
  messages: string[];
}) {
  const color =
    status === 'FAIL'
      ? '#b91c1c'
      : status === 'CAUTION'
      ? '#92400e'
      : '#166534';
  return (
    <div style={{ marginTop: 12 }}>
      {messages.map((m, i) => (
        <p
          key={i}
          style={{
            color,
            margin: '8px 0',
            textAlign: 'center',
            lineHeight: 1.45,
          }}
        >
          • {m}
        </p>
      ))}
    </div>
  );
}

function DepthBar({
  label,
  depth,
  theme,
}: {
  label: string;
  depth: number;
  theme: Theme;
}) {
  const t = getThemeTokens(theme);
  const percent = Math.min((depth / 1.5) * 100, 100);
  const barColor =
    depth >= 1.5 ? '#dc2626' : depth >= 1.425 ? '#ea580c' : '#2563eb';

  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 14,
          gap: 12,
          color: t.text,
        }}
      >
        <strong>{label}</strong>
        <span>{depth.toFixed(3)} in</span>
      </div>
      <div
        style={{
          height: 10,
          borderRadius: 999,
          background: t.border,
          overflow: 'hidden',
          marginTop: 6,
        }}
      >
        <div
          style={{ height: '100%', width: `${percent}%`, background: barColor }}
        />
      </div>
    </div>
  );
}

function GeometryLine({
  label,
  value,
  danger = false,
  theme,
}: {
  label: string;
  value: number;
  danger?: boolean;
  theme: Theme;
}) {
  const t = getThemeTokens(theme);
  const percent = Math.min((value / 1.5) * 100, 100);
  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 13,
          color: t.text,
        }}
      >
        <strong>{label}</strong>
        <span>{value.toFixed(3)} in</span>
      </div>
      <div
        style={{
          height: 8,
          background: t.border,
          borderRadius: 999,
          overflow: 'hidden',
          marginTop: 5,
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: danger ? '#dc2626' : '#2563eb',
          }}
        />
      </div>
    </div>
  );
}

function Th({ children, theme }: { children: React.ReactNode; theme: Theme }) {
  const t = getThemeTokens(theme);
  return (
    <th
      style={{
        textAlign: 'left',
        padding: 8,
        borderBottom: `1px solid ${t.borderStrong}`,
        color: t.text,
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, theme }: { children: React.ReactNode; theme: Theme }) {
  const t = getThemeTokens(theme);
  return (
    <td
      style={{
        padding: 8,
        borderBottom: `1px solid ${t.border}`,
        color: t.text,
      }}
    >
      {children}
    </td>
  );
}

// smallPill colours are semantic — no theme needed
function smallPill(status: 'PASS' | 'CAUTION' | 'FAIL'): React.CSSProperties {
  if (status === 'PASS')
    return {
      padding: '4px 8px',
      borderRadius: 999,
      background: '#dcfce7',
      color: '#166534',
      fontWeight: 800,
    };
  if (status === 'CAUTION')
    return {
      padding: '4px 8px',
      borderRadius: 999,
      background: '#fef3c7',
      color: '#92400e',
      fontWeight: 800,
    };
  return {
    padding: '4px 8px',
    borderRadius: 999,
    background: '#fee2e2',
    color: '#b91c1c',
    fontWeight: 800,
  };
}

function threadModeLabel(mode: 0 | 1 | 2) {
  if (mode === 1) return '1 — Guarded';
  if (mode === 2) return '2 — Finish lock';
  return '0 — Normal';
}
