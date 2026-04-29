import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { plantDepartmentOrder } from '../data/workCenters';
import { seedCoverage } from '../data/coverage';
import type { RoleView, DepartmentFilter } from '../types/app';
import { isSupervisorRole } from '../data/workRoles';
import type { Department } from '../types/machine';
import type { CoverageDraft, CoveragePerson, CoverageStatus, ShiftName } from '../types/coverage';
import {
  assignCoveragePerson,
  COVERAGE_STORAGE_KEY,
  createCoveragePerson,
  getCoverageNextAction,
  getCoverageSummary,
  signOutCoveragePerson,
  updateCoverageStatus,
} from '../logic/coverage';

interface CoveragePageProps {
  roleView: RoleView;
  departmentFilter: DepartmentFilter;
  theme?: 'dark' | 'light';
  initialView?: CoverageView;
}

type ThemeMode = 'dark' | 'light';
type CoverageView = 'hub' | 'signin' | 'available' | 'assigned' | 'break' | 'offline';

const blankDraft: CoverageDraft = { name: '', department: 'Receiving', role: 'Machine Operator', station: '', shift: 'Day' };

export default function CoveragePage({ roleView, departmentFilter, theme = 'dark', initialView = 'hub' }: CoveragePageProps) {
  const selectedDepartment = departmentFilter === 'All' ? undefined : (departmentFilter as Department);
  const isSupervisorView = isSupervisorRole(roleView);
  const [people, setPeople] = useState<CoveragePerson[]>(() => loadCoverage());
  const [view, setView] = useState<CoverageView>(initialView);
  const [draft, setDraft] = useState<CoverageDraft>({ ...blankDraft, department: selectedDepartment ?? 'Receiving' });
  const [assignmentText, setAssignmentText] = useState('');

  useEffect(() => {
    localStorage.setItem(COVERAGE_STORAGE_KEY, JSON.stringify(people));
  }, [people]);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  useEffect(() => {
    if (selectedDepartment) setDraft((current) => ({ ...current, department: selectedDepartment }));
  }, [selectedDepartment]);

  const summary = useMemo(() => getCoverageSummary(people, selectedDepartment), [people, selectedDepartment]);
  const visiblePeople = useMemo(() => filterPeople(people, view, selectedDepartment), [people, view, selectedDepartment]);

  function addPerson() {
    if (!draft.name.trim() || !draft.station.trim()) return;
    setPeople((current) => [createCoveragePerson(draft), ...current]);
    setDraft({ ...blankDraft, department: selectedDepartment ?? draft.department });
    setView('available');
  }

  function updatePerson(nextPerson: CoveragePerson) {
    setPeople((current) => current.map((person) => (person.id === nextPerson.id ? nextPerson : person)));
  }

  function removeOffline() {
    setPeople((current) => current.filter((person) => person.status !== 'OFFLINE'));
  }

  return (
    <div style={pageStyle}>
      <section style={getHeroStyle(theme)}>
        <div>
          <div style={eyebrowStyle}>LIVE COVERAGE / ROLL CALL</div>
          <h2 style={getTitleStyle(theme)}>{selectedDepartment ? `${selectedDepartment} coverage` : 'Plant coverage'}</h2>
          <p style={getSubTextStyle(theme)}>{getCoverageNextAction(people, selectedDepartment)}</p>
        </div>
        <button onClick={() => setView('signin')} style={getPrimaryButtonStyle(theme)}>SIGN IN</button>
      </section>

      <section style={getMetricGridStyle()}>
        <StatusButton label="Available" value={summary.available} tone="OK" active={view === 'available'} onClick={() => setView('available')} theme={theme} />
        <StatusButton label="Assigned" value={summary.assigned} tone="WARN" active={view === 'assigned'} onClick={() => setView('assigned')} theme={theme} />
        <StatusButton label="Break" value={summary.breakCount} tone="HOLD" active={view === 'break'} onClick={() => setView('break')} theme={theme} />
        <StatusButton label="Signed out" value={summary.offline} tone="OFF" active={view === 'offline'} onClick={() => setView('offline')} theme={theme} />
      </section>

      <section style={getNoticeStyle(theme, isSupervisorView)}>
        <strong>{isSupervisorView ? 'Supervisor / management view:' : 'Worker station view:'}</strong>{' '}
        {isSupervisorView
          ? 'Use the buttons above to jump directly into available people, assigned people, breaks, or signed-out records.'
          : 'Sign in to make yourself visible. Daily work still stays on the work-center screen.'}
      </section>

      {view === 'hub' ? (
        <section style={getPanelStyle(theme)}>
          <div style={eyebrowStyle}>START HERE</div>
          <h3 style={getSectionTitleStyle(theme)}>Tap a status tile to open that coverage list.</h3>
          <p style={getSubTextStyle(theme)}>This replaces the long scrolling roll-call wall with smaller station-tablet queues.</p>
        </section>
      ) : null}

      {view === 'signin' ? (
        <section style={getPanelStyle(theme)}>
          <div style={getPanelHeaderStyle()}>
            <h3 style={getSectionTitleStyle(theme)}>Station sign-in</h3>
            <button onClick={() => setView('hub')} style={getGhostButtonStyle(theme)}>BACK TO COVERAGE</button>
          </div>
          <div style={getFormGridStyle()}>
            <Field label="Name" value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} theme={theme} />
            <SelectField label="Department" value={draft.department} options={plantDepartmentOrder} onChange={(value) => setDraft({ ...draft, department: value as Department })} disabled={Boolean(selectedDepartment)} theme={theme} />
            <Field label="Role" value={draft.role} onChange={(value) => setDraft({ ...draft, role: value })} theme={theme} />
            <Field label="Station" value={draft.station} onChange={(value) => setDraft({ ...draft, station: value })} theme={theme} />
            <SelectField label="Shift" value={draft.shift} options={['Day', 'Night', 'Weekend']} onChange={(value) => setDraft({ ...draft, shift: value as ShiftName })} theme={theme} />
          </div>
          <button onClick={addPerson} style={getPrimaryButtonStyle(theme)}>SIGN INTO STATION</button>
        </section>
      ) : null}

      {view !== 'hub' && view !== 'signin' ? (
        <section style={getPanelStyle(theme)}>
          <div style={getPanelHeaderStyle()}>
            <h3 style={getSectionTitleStyle(theme)}>{getViewTitle(view)}</h3>
            <div style={buttonRowStyle}>
              <button onClick={() => setView('hub')} style={getGhostButtonStyle(theme)}>ALL COVERAGE</button>
              {view === 'offline' ? <button onClick={removeOffline} style={getDangerButtonStyle()}>CLEAR SIGNED OUT</button> : null}
            </div>
          </div>

          <div style={getPeopleGridStyle()}>
            {visiblePeople.length === 0 ? <div style={getEmptyStyle(theme)}>Nobody is in this coverage list.</div> : null}
            {visiblePeople.map((person) => (
              <article key={person.id} style={getPersonCardStyle(theme, person.status)}>
                <div style={getPersonHeaderStyle()}>
                  <div>
                    <div style={getPersonNameStyle(theme)}>{person.name}</div>
                    <div style={getSubTextStyle(theme)}>{person.role} / {person.station}</div>
                  </div>
                  <span style={getStatusBadgeStyle(person.status)}>{person.status}</span>
                </div>
                <div style={getMiniGridStyle()}>
                  <Info label="Dept" value={person.department} theme={theme} />
                  <Info label="Shift" value={person.shift} theme={theme} />
                  <Info label="Signed in" value={person.signedInAt ?? 'Not recorded'} theme={theme} />
                  <Info label="Assigned" value={person.assignedTo ?? 'None'} theme={theme} />
                </div>
                <div style={buttonRowStyle}>
                  <button onClick={() => updatePerson(updateCoverageStatus(person, 'AVAILABLE'))} style={getSmallButtonStyle(theme)}>AVAILABLE</button>
                  <button onClick={() => updatePerson(updateCoverageStatus(person, 'BREAK'))} style={getSmallButtonStyle(theme)}>BREAK</button>
                  <button onClick={() => updatePerson(signOutCoveragePerson(person))} style={getDangerButtonStyle()}>SIGN OUT</button>
                </div>
                <div style={assignRowStyle}>
                  <input value={assignmentText} onChange={(event) => setAssignmentText(event.target.value)} placeholder="Assign task or station" style={getInputStyle(theme)} />
                  <button onClick={() => updatePerson(assignCoveragePerson(person, assignmentText))} style={getPrimaryButtonStyle(theme)}>ASSIGN</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function loadCoverage(): CoveragePerson[] {
  try {
    const stored = localStorage.getItem(COVERAGE_STORAGE_KEY);
    if (!stored) return seedCoverage;
    const parsed = JSON.parse(stored) as CoveragePerson[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedCoverage;
  } catch {
    return seedCoverage;
  }
}

function filterPeople(people: CoveragePerson[], view: CoverageView, department?: Department) {
  const visible = department ? people.filter((person) => person.department === department) : people;
  if (view === 'available') return visible.filter((person) => person.status === 'AVAILABLE');
  if (view === 'assigned') return visible.filter((person) => person.status === 'ASSIGNED');
  if (view === 'break') return visible.filter((person) => person.status === 'BREAK');
  if (view === 'offline') return visible.filter((person) => person.status === 'OFFLINE');
  return visible;
}

function getViewTitle(view: CoverageView) { if (view === 'available') return 'Available people'; if (view === 'assigned') return 'Assigned people'; if (view === 'break') return 'People on break'; if (view === 'offline') return 'Signed out'; return 'Coverage'; }
function StatusButton({ label, value, tone, active, onClick, theme }: { label: string; value: number; tone: string; active: boolean; onClick: () => void; theme: ThemeMode }) { return <button onClick={onClick} style={getMetricButtonStyle(theme, tone, active)}><div style={getMetricValueStyle(theme)}>{value}</div><div style={getMetricLabelStyle(theme)}>{label}</div></button>; }
function Field({ label, value, onChange, theme }: { label: string; value: string; onChange: (value: string) => void; theme: ThemeMode }) { return <label style={fieldWrapStyle}><span style={getFieldLabelStyle(theme)}>{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} style={getInputStyle(theme)} /></label>; }
function SelectField({ label, value, options, onChange, disabled, theme }: { label: string; value: string; options: string[]; onChange: (value: string) => void; disabled?: boolean; theme: ThemeMode }) { return <label style={fieldWrapStyle}><span style={getFieldLabelStyle(theme)}>{label}</span><select disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} style={getInputStyle(theme)}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>; }
function Info({ label, value, theme }: { label: string; value: string; theme: ThemeMode }) { return <div style={getInfoStyle(theme)}><div style={getInfoLabelStyle(theme)}>{label}</div><div style={getInfoValueStyle(theme)}>{value}</div></div>; }

const pageStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 14 };
const eyebrowStyle: CSSProperties = { color: '#f97316', fontSize: 11, fontWeight: 900, letterSpacing: '1.3px', textTransform: 'uppercase', marginBottom: 8 };
const fieldWrapStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 };
const buttonRowStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 8 };
const assignRowStyle: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginTop: 10 };
function getHeroStyle(theme: ThemeMode): CSSProperties { return { padding: 18, borderRadius: 8, background: theme === 'dark' ? 'linear-gradient(135deg, #1e293b, #0f172a)' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start' }; }
function getTitleStyle(theme: ThemeMode): CSSProperties { return { margin: 0, fontSize: 24, color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontWeight: 900 }; }
function getSubTextStyle(theme: ThemeMode): CSSProperties { return { margin: '6px 0 0 0', color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 13, lineHeight: 1.45 }; }
function getMetricGridStyle(): CSSProperties { return { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }; }
function getToneColor(tone: string): string { if (tone === 'OK') return '#10b981'; if (tone === 'WARN') return '#f59e0b'; if (tone === 'HOLD') return '#8b5cf6'; if (tone === 'OFF') return '#64748b'; return '#38bdf8'; }
function getMetricButtonStyle(theme: ThemeMode, tone: string, active: boolean): CSSProperties { const color = getToneColor(tone); return { textAlign: 'left', padding: 14, borderRadius: 8, background: active ? `${color}24` : theme === 'dark' ? '#1e293b' : '#ffffff', border: `1px solid ${active ? color : theme === 'dark' ? '#334155' : '#e2e8f0'}`, borderLeft: `5px solid ${color}`, cursor: 'pointer' }; }
function getMetricValueStyle(theme: ThemeMode): CSSProperties { return { color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 25, fontWeight: 900 }; }
function getMetricLabelStyle(theme: ThemeMode): CSSProperties { return { color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 900, letterSpacing: '0.8px', textTransform: 'uppercase' }; }
function getNoticeStyle(theme: ThemeMode, supervisor: boolean): CSSProperties { const color = supervisor ? '#f97316' : '#38bdf8'; return { padding: 14, borderRadius: 6, border: `1px solid ${color}66`, borderLeft: `4px solid ${color}`, background: theme === 'dark' ? '#1e293b' : '#ffffff', color: theme === 'dark' ? '#cbd5e1' : '#475569', fontSize: 13, lineHeight: 1.5 }; }
function getPanelStyle(theme: ThemeMode): CSSProperties { return { padding: 16, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function getPanelHeaderStyle(): CSSProperties { return { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 12 }; }
function getSectionTitleStyle(theme: ThemeMode): CSSProperties { return { margin: 0, color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 16, fontWeight: 900, letterSpacing: '0.7px', textTransform: 'uppercase' }; }
function getFormGridStyle(): CSSProperties { return { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10, marginBottom: 12 }; }
function getPeopleGridStyle(): CSSProperties { return { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }; }
function getPersonCardStyle(theme: ThemeMode, status: CoverageStatus): CSSProperties { const color = getCoverageColor(status); return { padding: 14, borderRadius: 7, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: `1px solid ${color}66`, borderLeft: `4px solid ${color}` }; }
function getPersonHeaderStyle(): CSSProperties { return { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }; }
function getPersonNameStyle(theme: ThemeMode): CSSProperties { return { color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 15, fontWeight: 900 }; }
function getMiniGridStyle(): CSSProperties { return { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8 }; }
function getInfoStyle(theme: ThemeMode): CSSProperties { return { padding: 9, borderRadius: 4, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function getInfoLabelStyle(theme: ThemeMode): CSSProperties { return { color: '#64748b', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px' }; }
function getInfoValueStyle(theme: ThemeMode): CSSProperties { return { color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 12, fontWeight: 800, lineHeight: 1.3 }; }
function getFieldLabelStyle(theme: ThemeMode): CSSProperties { return { color: theme === 'dark' ? '#94a3b8' : '#475569', fontSize: 11, fontWeight: 900, letterSpacing: '0.8px', textTransform: 'uppercase' }; }
function getInputStyle(theme: ThemeMode): CSSProperties { return { minWidth: 0, padding: '10px 11px', borderRadius: 4, border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1', background: theme === 'dark' ? '#0f172a' : '#ffffff', color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontWeight: 700, outline: 'none' }; }
function getPrimaryButtonStyle(theme: ThemeMode): CSSProperties { return { padding: '10px 13px', borderRadius: 4, border: '1px solid #f97316', background: '#f97316', color: theme === 'dark' ? '#111827' : '#ffffff', fontWeight: 900, fontSize: 11, letterSpacing: '0.7px', cursor: 'pointer' }; }
function getGhostButtonStyle(theme: ThemeMode): CSSProperties { return { padding: '8px 10px', borderRadius: 4, border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1', background: 'transparent', color: theme === 'dark' ? '#cbd5e1' : '#475569', fontWeight: 900, fontSize: 11, cursor: 'pointer' }; }
function getSmallButtonStyle(theme: ThemeMode): CSSProperties { return { padding: '8px 9px', borderRadius: 4, border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1', background: theme === 'dark' ? '#1e293b' : '#ffffff', color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontWeight: 900, fontSize: 10, cursor: 'pointer' }; }
function getDangerButtonStyle(): CSSProperties { return { padding: '8px 9px', borderRadius: 4, border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', fontWeight: 900, fontSize: 10, cursor: 'pointer' }; }
function getCoverageColor(status: CoverageStatus): string { if (status === 'AVAILABLE') return '#10b981'; if (status === 'ASSIGNED') return '#f59e0b'; if (status === 'BREAK') return '#8b5cf6'; return '#64748b'; }
function getStatusBadgeStyle(status: CoverageStatus): CSSProperties { const color = getCoverageColor(status); return { padding: '5px 8px', borderRadius: 4, border: `1px solid ${color}66`, background: `${color}18`, color, fontSize: 10, fontWeight: 900, letterSpacing: '0.6px' }; }
function getEmptyStyle(theme: ThemeMode): CSSProperties { return { padding: 14, borderRadius: 6, background: theme === 'dark' ? '#0f172a' : '#f8fafc', color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 13, fontWeight: 800 }; }
