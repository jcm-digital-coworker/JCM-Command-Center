import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { plantDepartmentOrder } from '../data/workCenters';
import { seedReceivingOrders } from '../data/receivingOrders';
import { getMaterialLabel, getMaterialsForDepartment } from '../data/materialCatalog';
import type { Department } from '../types/machine';
import type { ReceivingExceptionType, ReceivingGateStatus, ReceivingOrder, ReceivingOrderDraft, ReceivingOrderPriority } from '../types/receiving';
import {
  RECEIVING_STORAGE_KEY,
  checkInReceivingOrder,
  claimReceivingDelivery,
  createReceivingOrder,
  deliverReceivingOrder,
  getReceivingStatusLabel,
  putReceivingOrderOnHold,
  reportReceivingException,
} from '../logic/receivingWorkflow';
import {
  getReceivingAgeLabel,
  getReceivingDestinationLane,
  getReceivingGateAction,
  getReceivingGateLabel,
  getReceivingGateStatus,
  getReceivingGateTone,
  getReceivingLaneLabel,
  getReceivingLaneType,
  getReceivingOrderAgeHours,
  getReceivingPressureSummary,
} from '../logic/receivingGate';

type ThemeMode = 'dark' | 'light';
type ReceivingView = 'hub' | 'submit' | 'ordered' | 'arriving' | 'ready' | 'claimed' | 'delivered' | 'holds';

interface ReceivingPageProps {
  theme?: ThemeMode;
  initialView?: ReceivingView;
  submitDepartment?: Department;
}

function createBlankDraft(department: Department): ReceivingOrderDraft {
  const material = getMaterialsForDepartment(department)[0];
  return {
    itemName: material ? getMaterialLabel(material) : '',
    description: '',
    quantity: '',
    orderedBy: '',
    requesterDepartment: department,
    destinationDepartment: department,
    destinationDetail: '',
    expectedDate: new Date().toISOString().slice(0, 10),
    supplier: '',
    poOrReceiver: '',
    priority: 'NORMAL',
  };
}

export default function ReceivingPage({ theme = 'dark', initialView = 'hub', submitDepartment = 'Machine Shop' }: ReceivingPageProps) {
  const [orders, setOrders] = useState<ReceivingOrder[]>(() => loadOrders());
  const [view, setView] = useState<ReceivingView>(initialView);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReceivingOrderDraft>(() => createBlankDraft(submitDepartment));
  const [workerName, setWorkerName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    localStorage.setItem(RECEIVING_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => setView(initialView), [initialView]);

  useEffect(() => {
    if (initialView === 'submit') setDraft(createBlankDraft(submitDepartment));
  }, [initialView, submitDepartment]);

  const pressure = useMemo(() => getReceivingPressureSummary(orders), [orders]);
  const summary = useMemo(() => getSummary(orders), [orders]);
  const visibleOrders = useMemo(() => filterOrders(orders, view), [orders, view]);
  const activeOrder = orders.find((order) => order.id === activeId) ?? visibleOrders[0] ?? orders[0];
  const departmentMaterials = getMaterialsForDepartment(draft.requesterDepartment);
  const materialOptions = departmentMaterials.length > 0 ? departmentMaterials.map(getMaterialLabel) : ['No catalog items yet'];

  function updateOrder(nextOrder: ReceivingOrder) {
    setOrders((current) => current.map((order) => (order.id === nextOrder.id ? nextOrder : order)));
    setActiveId(nextOrder.id);
    setWorkerName('');
    setNotes('');
  }

  function updateRequesterDepartment(department: Department) {
    const firstMaterial = getMaterialsForDepartment(department)[0];
    setSubmitMessage('');
    setDraft({
      ...draft,
      requesterDepartment: department,
      destinationDepartment: department,
      itemName: firstMaterial ? getMaterialLabel(firstMaterial) : '',
    });
  }

  function submitOrder() {
    if (!draft.itemName.trim() || !draft.quantity.trim() || !draft.orderedBy.trim() || !draft.destinationDetail.trim()) return;
    const nextOrder = createReceivingOrder(draft);
    setOrders((current) => [nextOrder, ...current]);
    setActiveId(nextOrder.id);
    setDraft(createBlankDraft(draft.requesterDepartment));
    setSubmitMessage(`Submitted ${nextOrder.itemName} to Receiving. Form cleared for the next request.`);
    setView('submit');
  }

  function reportException(type: ReceivingExceptionType) {
    if (!activeOrder) return;
    updateOrder(reportReceivingException(activeOrder, type, notes));
    setView('holds');
  }

  return (
    <div style={pageStyle}>
      <section style={heroStyle(theme)}>
        <div>
          <div style={eyebrowStyle}>{view === 'submit' ? 'DEPARTMENT MATERIAL REQUEST' : 'RECEIVING COMMAND QUEUE'}</div>
          <h2 style={titleStyle(theme)}>{view === 'submit' ? 'Request material' : 'Digital receiver'}</h2>
          <p style={subTextStyle(theme)}>
            {view === 'submit'
              ? 'Departments request known material here. Receiving verifies inventory, records exceptions, drivers claim delivery, and the handoff trail follows the material.'
              : 'Receiving now runs from gate status, pressure, destination lanes, exceptions, and traceable handoff actions.'}
          </p>
        </div>
      </section>

      {view !== 'submit' && (
        <section style={metricGridStyle}>
          <Metric label="Open gates" value={pressure.open} tone="HOT" theme={theme} />
          <Metric label="Ready to stage" value={pressure.readyToStage} tone="INFO" theme={theme} />
          <Metric label="Exceptions" value={pressure.exceptionHolds} tone="DANGER" theme={theme} />
          <Metric label="Hot / Critical" value={pressure.hotOrCritical} tone="WARN" theme={theme} />
          <Metric label="Oldest open" value={getReceivingAgeLabel(pressure.oldestOpenAgeHours)} tone="SLATE" theme={theme} />
        </section>
      )}

      {view !== 'submit' && (
        <section style={metricGridStyle}>
          <StatusButton label="On order" value={summary.ordered} tone="SLATE" active={view === 'ordered'} onClick={() => setView('ordered')} theme={theme} />
          <StatusButton label="Arriving today" value={summary.arriving} tone="HOT" active={view === 'arriving'} onClick={() => setView('arriving')} theme={theme} />
          <StatusButton label="Ready to stage" value={summary.ready} tone="INFO" active={view === 'ready'} onClick={() => setView('ready')} theme={theme} />
          <StatusButton label="Claimed" value={summary.claimed} tone="WARN" active={view === 'claimed'} onClick={() => setView('claimed')} theme={theme} />
          <StatusButton label="Delivered" value={summary.delivered} tone="OK" active={view === 'delivered'} onClick={() => setView('delivered')} theme={theme} />
          <StatusButton label="Exception holds" value={summary.holds} tone="DANGER" active={view === 'holds'} onClick={() => setView('holds')} theme={theme} />
        </section>
      )}

      {view === 'hub' && (
        <section style={panelStyle(theme)}>
          <div style={eyebrowStyle}>START HERE</div>
          <h3 style={sectionTitleStyle(theme)}>Receiving pressure is live.</h3>
          <p style={subTextStyle(theme)}>
            Choose a queue above. Use exceptions for shortage, damage, wrong material, paperwork, vendor, or engineering-review problems. Use delivered/handoff only when material physically reaches the destination lane.
          </p>
        </section>
      )}

      {view === 'submit' && (
        <section style={panelStyle(theme)}>
          <div style={panelHeaderStyle}>
            <h3 style={sectionTitleStyle(theme)}>Submit material request to Receiving</h3>
            <button type="button" onClick={() => setView('hub')} style={ghostButtonStyle(theme)}>BACK TO RECEIVING</button>
          </div>
          <div style={formGridStyle}>
            <SelectField label="Requesting department" value={draft.requesterDepartment} options={plantDepartmentOrder.filter((d) => d !== 'Receiving')} onChange={(value) => updateRequesterDepartment(value as Department)} theme={theme} />
            <SelectField label="Known material" value={draft.itemName || materialOptions[0]} options={materialOptions} onChange={(value) => setDraft({ ...draft, itemName: value })} theme={theme} />
            <Field label="Quantity" value={draft.quantity} onChange={(value) => setDraft({ ...draft, quantity: value })} theme={theme} />
            <Field label="Weekly order / job number" value={draft.poOrReceiver} onChange={(value) => setDraft({ ...draft, poOrReceiver: value })} theme={theme} />
            <Field label="Requested by" value={draft.orderedBy} onChange={(value) => setDraft({ ...draft, orderedBy: value })} theme={theme} />
            <SelectField label="Deliver to department" value={draft.destinationDepartment} options={plantDepartmentOrder.filter((d) => d !== 'Receiving')} onChange={(value) => setDraft({ ...draft, destinationDepartment: value as Department })} theme={theme} />
            <Field label="Station / drop location" value={draft.destinationDetail} onChange={(value) => setDraft({ ...draft, destinationDetail: value })} theme={theme} />
            <Field label="Supplier / vendor" value={draft.supplier} onChange={(value) => setDraft({ ...draft, supplier: value })} theme={theme} />
            <Field label="Needed by date" type="date" value={draft.expectedDate} onChange={(value) => setDraft({ ...draft, expectedDate: value })} theme={theme} />
            <SelectField label="Priority" value={draft.priority} options={['NORMAL', 'HOT', 'CRITICAL']} onChange={(value) => setDraft({ ...draft, priority: value as ReceivingOrderPriority })} theme={theme} />
          </div>
          <TextAreaField label="Notes / special handling" value={draft.description} onChange={(value) => setDraft({ ...draft, description: value })} theme={theme} />
          {submitMessage && <div style={successNoticeStyle(theme)}>{submitMessage}</div>}
          <button type="button" onClick={submitOrder} style={primaryButtonStyle(theme)}>SUBMIT TO RECEIVING</button>
        </section>
      )}

      {view !== 'hub' && view !== 'submit' && (
        <div style={workGridStyle}>
          <section style={panelStyle(theme)}>
            <div style={panelHeaderStyle}>
              <h3 style={sectionTitleStyle(theme)}>{getViewTitle(view)}</h3>
              <button type="button" onClick={() => setView('hub')} style={ghostButtonStyle(theme)}>ALL QUEUES</button>
            </div>
            <div style={stackStyle}>
              {visibleOrders.length === 0 && <div style={emptyStyle(theme)}>Nothing in this queue.</div>}
              {visibleOrders.map((order) => (
                <button key={order.id} type="button" onClick={() => setActiveId(order.id)} style={orderRowStyle(theme, activeOrder?.id === order.id, getReceivingGateStatus(order))}>
                  <div style={{ minWidth: 0 }}>
                    <div style={orderTitleStyle(theme)}>{order.itemName}</div>
                    <div style={orderMetaStyle(theme)}>{order.quantity} · {order.poOrReceiver || 'No order #'} · {getReceivingDestinationLane(order)}</div>
                    <div style={orderMetaStyle(theme)}>{getReceivingLaneLabel(getReceivingLaneType(order))} · age {getReceivingAgeLabel(getReceivingOrderAgeHours(order))}</div>
                  </div>
                  <GateBadge status={getReceivingGateStatus(order)} />
                </button>
              ))}
            </div>
          </section>

          {activeOrder && (
            <section style={panelStyle(theme)}>
              <div style={panelHeaderStyle}>
                <div>
                  <h3 style={sectionTitleStyle(theme)}>{activeOrder.itemName}</h3>
                  <p style={subTextStyle(theme)}>{getReceivingGateAction(activeOrder)}</p>
                </div>
                <GateBadge status={getReceivingGateStatus(activeOrder)} />
              </div>

              <div style={infoGridStyle}>
                <Info label="Requester" value={`${activeOrder.orderedBy} / ${activeOrder.requesterDepartment}`} theme={theme} />
                <Info label="Destination lane" value={getReceivingDestinationLane(activeOrder)} theme={theme} />
                <Info label="Material lane" value={getReceivingLaneLabel(getReceivingLaneType(activeOrder))} theme={theme} />
                <Info label="Order / job" value={activeOrder.poOrReceiver || 'Not entered'} theme={theme} />
                <Info label="Priority" value={activeOrder.priority} theme={theme} />
                <Info label="Age" value={getReceivingAgeLabel(getReceivingOrderAgeHours(activeOrder))} theme={theme} />
                <Info label="Legacy status" value={getReceivingStatusLabel(activeOrder.status)} theme={theme} />
              </div>

              <div style={formGridStyle}>
                <Field label="Name / initials" value={workerName} onChange={setWorkerName} theme={theme} />
                <TextAreaField label="Receiver / exception / delivery notes" value={notes} onChange={setNotes} theme={theme} />
              </div>

              <div style={buttonRowStyle}>
                <button type="button" onClick={() => updateOrder(checkInReceivingOrder(activeOrder, workerName, notes))} style={primaryButtonStyle(theme)}>VERIFY / CHECK IN</button>
                <button type="button" onClick={() => updateOrder(claimReceivingDelivery(activeOrder, workerName))} style={secondaryButtonStyle(theme)}>CLAIM DELIVERY</button>
                <button type="button" onClick={() => updateOrder(deliverReceivingOrder(activeOrder, workerName, notes))} style={successButtonStyle}>DELIVERED / HANDOFF</button>
                <button type="button" onClick={() => updateOrder(putReceivingOrderOnHold(activeOrder, notes))} style={dangerButtonStyle}>PROBLEM HOLD</button>
              </div>

              <div style={exceptionGridStyle}>
                {(['SHORTAGE', 'DAMAGE', 'WRONG_MATERIAL', 'MISSING_PAPERWORK', 'VENDOR_ISSUE', 'ENGINEERING_REVIEW'] as ReceivingExceptionType[]).map((type) => (
                  <button key={type} type="button" onClick={() => reportException(type)} style={exceptionButtonStyle(theme)}>{type.replace(/_/g, ' ')}</button>
                ))}
              </div>

              <div style={logStyle(theme)}>
                <div style={eyebrowStyle}>NOTIFICATION TRAIL</div>
                {activeOrder.notificationLog.map((note) => (
                  <div key={note.id} style={logRowStyle(theme)}>
                    <strong>{note.audience}</strong>
                    <div>{note.message}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function loadOrders(): ReceivingOrder[] {
  try {
    const stored = localStorage.getItem(RECEIVING_STORAGE_KEY);
    if (!stored) return seedReceivingOrders;
    const parsed = JSON.parse(stored) as ReceivingOrder[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedReceivingOrders;
  } catch {
    return seedReceivingOrders;
  }
}

function getPriorityScore(priority: ReceivingOrderPriority): number {
  if (priority === 'CRITICAL') return 2;
  if (priority === 'HOT') return 1;
  return 0;
}

function sortByPriority(orders: ReceivingOrder[]): ReceivingOrder[] {
  return [...orders].sort((a, b) => getPriorityScore(b.priority) - getPriorityScore(a.priority));
}

function getSummary(orders: ReceivingOrder[]) {
  return {
    ordered: orders.filter((order) => order.status === 'ORDERED').length,
    arriving: orders.filter((order) => order.status === 'ARRIVING_TODAY').length,
    ready: orders.filter((order) => order.status === 'CHECKED_IN').length,
    claimed: orders.filter((order) => order.status === 'CLAIMED_FOR_DELIVERY').length,
    delivered: orders.filter((order) => order.status === 'DELIVERED').length,
    holds: orders.filter((order) => order.status === 'PROBLEM_HOLD').length,
  };
}

function filterOrders(orders: ReceivingOrder[], view: ReceivingView) {
  if (view === 'ordered') return sortByPriority(orders.filter((order) => order.status === 'ORDERED'));
  if (view === 'arriving') return sortByPriority(orders.filter((order) => order.status === 'ARRIVING_TODAY'));
  if (view === 'ready') return sortByPriority(orders.filter((order) => order.status === 'CHECKED_IN'));
  if (view === 'claimed') return sortByPriority(orders.filter((order) => order.status === 'CLAIMED_FOR_DELIVERY'));
  if (view === 'delivered') return orders.filter((order) => order.status === 'DELIVERED');
  if (view === 'holds') return sortByPriority(orders.filter((order) => order.status === 'PROBLEM_HOLD'));
  return orders;
}

function getViewTitle(view: ReceivingView) {
  if (view === 'ordered') return 'On order / expected';
  if (view === 'arriving') return 'Today inbound gate';
  if (view === 'ready') return 'Ready to stage';
  if (view === 'claimed') return 'Claimed deliveries';
  if (view === 'delivered') return 'Delivered handoffs';
  if (view === 'holds') return 'Exception holds';
  return 'Receiving queue';
}

function GateBadge({ status }: { status: ReceivingGateStatus }) {
  const color = toneColor(getReceivingGateTone(status));
  return <span style={{ color, background: `${color}20`, border: `1px solid ${color}66`, borderRadius: 999, padding: '5px 8px', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap' }}>{getReceivingGateLabel(status)}</span>;
}

function StatusButton({ label, value, tone, active, onClick, theme }: { label: string; value: number; tone: string; active: boolean; onClick: () => void; theme: ThemeMode }) {
  return <button type="button" onClick={onClick} style={metricButtonStyle(theme, tone, active)}><div style={metricValueStyle(theme)}>{value}</div><div style={metricLabelStyle(theme)}>{label}</div></button>;
}

function Metric({ label, value, tone, theme }: { label: string; value: number | string; tone: string; theme: ThemeMode }) {
  const color = toneColor(tone);
  return <div style={{ ...metricButtonStyle(theme, tone, false), cursor: 'default', borderLeft: `5px solid ${color}` }}><div style={metricValueStyle(theme)}>{value}</div><div style={metricLabelStyle(theme)}>{label}</div></div>;
}

function Field({ label, value, onChange, theme, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; theme: ThemeMode; type?: string }) {
  return <label style={fieldWrapStyle}><span style={fieldLabelStyle(theme)}>{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} style={inputStyle(theme)} /></label>;
}

function TextAreaField({ label, value, onChange, theme }: { label: string; value: string; onChange: (value: string) => void; theme: ThemeMode }) {
  return <label style={fieldWrapStyle}><span style={fieldLabelStyle(theme)}>{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} style={{ ...inputStyle(theme), minHeight: 72, resize: 'vertical' }} /></label>;
}

function SelectField({ label, value, options, onChange, theme }: { label: string; value: string; options: string[]; onChange: (value: string) => void; theme: ThemeMode }) {
  return <label style={fieldWrapStyle}><span style={fieldLabelStyle(theme)}>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} style={inputStyle(theme)}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function Info({ label, value, theme }: { label: string; value: string; theme: ThemeMode }) {
  return <div style={infoStyle(theme)}><div style={infoLabelStyle(theme)}>{label}</div><div style={infoValueStyle(theme)}>{value}</div></div>;
}

function toneColor(tone: string): string {
  if (tone === 'OK') return '#10b981';
  if (tone === 'WARN') return '#f59e0b';
  if (tone === 'DANGER') return '#dc2626';
  if (tone === 'INFO') return '#38bdf8';
  if (tone === 'SLATE') return '#64748b';
  return '#f97316';
}

function getStatusColor(status: ReceivingGateStatus): string {
  return toneColor(getReceivingGateTone(status));
}

const pageStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 14 };
const fieldWrapStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 };
const stackStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 10 };
const buttonRowStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 };
const exceptionGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginTop: 12 };
const panelHeaderStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 12 };
const metricGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 };
const formGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10, marginBottom: 12 };
const workGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, alignItems: 'start' };
const infoGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 12 };
const eyebrowStyle: CSSProperties = { color: '#f97316', fontSize: 11, fontWeight: 900, letterSpacing: '1.3px', textTransform: 'uppercase', marginBottom: 8 };
const successButtonStyle: CSSProperties = { padding: '10px 13px', borderRadius: 4, border: '1px solid #10b981', background: 'rgba(16,185,129,0.14)', color: '#10b981', fontWeight: 900, fontSize: 11, cursor: 'pointer' };
const dangerButtonStyle: CSSProperties = { padding: '10px 13px', borderRadius: 4, border: '1px solid #ef4444', background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontWeight: 900, fontSize: 11, cursor: 'pointer' };

function heroStyle(theme: ThemeMode): CSSProperties { return { padding: 18, borderRadius: 8, background: theme === 'dark' ? 'linear-gradient(135deg, #1e293b, #0f172a)' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function titleStyle(theme: ThemeMode): CSSProperties { return { margin: 0, fontSize: 24, color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontWeight: 900 }; }
function subTextStyle(theme: ThemeMode): CSSProperties { return { margin: '6px 0 0 0', color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 13, lineHeight: 1.45 }; }
function sectionTitleStyle(theme: ThemeMode): CSSProperties { return { margin: 0, color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 16, fontWeight: 900, letterSpacing: '0.7px', textTransform: 'uppercase' }; }
function panelStyle(theme: ThemeMode): CSSProperties { return { padding: 16, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function metricButtonStyle(theme: ThemeMode, tone: string, active: boolean): CSSProperties { const color = toneColor(tone); return { textAlign: 'left', padding: 14, borderRadius: 8, background: active ? `${color}24` : theme === 'dark' ? '#1e293b' : '#ffffff', border: `1px solid ${active ? color : theme === 'dark' ? '#334155' : '#e2e8f0'}`, borderLeft: `5px solid ${color}`, cursor: 'pointer' }; }
function metricValueStyle(theme: ThemeMode): CSSProperties { return { color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 25, fontWeight: 900 }; }
function metricLabelStyle(theme: ThemeMode): CSSProperties { return { color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 900, letterSpacing: '0.8px', textTransform: 'uppercase' }; }
function orderRowStyle(theme: ThemeMode, active: boolean, gate: ReceivingGateStatus): CSSProperties { const color = getStatusColor(gate); return { display: 'flex', justifyContent: 'space-between', gap: 12, textAlign: 'left', padding: 12, borderRadius: 6, background: active ? `${color}22` : theme === 'dark' ? '#0f172a' : '#f8fafc', border: `1px solid ${active ? color : theme === 'dark' ? '#334155' : '#e2e8f0'}`, cursor: 'pointer' }; }
function orderTitleStyle(theme: ThemeMode): CSSProperties { return { color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 14, fontWeight: 900 }; }
function orderMetaStyle(theme: ThemeMode): CSSProperties { return { color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12, marginTop: 4, lineHeight: 1.35 }; }
function infoStyle(theme: ThemeMode): CSSProperties { return { padding: 10, borderRadius: 6, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function infoLabelStyle(theme: ThemeMode): CSSProperties { return { color: '#64748b', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px' }; }
function infoValueStyle(theme: ThemeMode): CSSProperties { return { color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 12, fontWeight: 800, marginTop: 4 }; }
function fieldLabelStyle(theme: ThemeMode): CSSProperties { return { color: theme === 'dark' ? '#94a3b8' : '#475569', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px' }; }
function inputStyle(theme: ThemeMode): CSSProperties { return { padding: '10px 11px', borderRadius: 4, border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1', background: theme === 'dark' ? '#0f172a' : '#ffffff', color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontWeight: 700, outline: 'none' }; }
function primaryButtonStyle(theme: ThemeMode): CSSProperties { return { padding: '10px 13px', borderRadius: 4, border: '1px solid #f97316', background: '#f97316', color: theme === 'dark' ? '#111827' : '#ffffff', fontWeight: 900, fontSize: 11, letterSpacing: '0.7px', cursor: 'pointer' }; }
function secondaryButtonStyle(theme: ThemeMode): CSSProperties { return { ...primaryButtonStyle(theme), background: 'rgba(59,130,246,0.12)', color: '#38bdf8', border: '1px solid #38bdf8' }; }
function ghostButtonStyle(theme: ThemeMode): CSSProperties { return { padding: '8px 10px', borderRadius: 4, border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1', background: 'transparent', color: theme === 'dark' ? '#cbd5e1' : '#475569', fontWeight: 900, fontSize: 11, cursor: 'pointer' }; }
function exceptionButtonStyle(theme: ThemeMode): CSSProperties { return { padding: '8px 9px', borderRadius: 4, border: '1px solid #ef4444', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontWeight: 900, fontSize: 10, cursor: 'pointer' }; }
function successNoticeStyle(theme: ThemeMode): CSSProperties { return { padding: 10, borderRadius: 6, background: theme === 'dark' ? 'rgba(16,185,129,0.14)' : '#dcfce7', border: '1px solid #10b981', color: theme === 'dark' ? '#86efac' : '#166534', fontSize: 12, fontWeight: 800, marginBottom: 12 }; }
function emptyStyle(theme: ThemeMode): CSSProperties { return { padding: 14, borderRadius: 6, border: theme === 'dark' ? '1px dashed #334155' : '1px dashed #cbd5e1', color: '#64748b', fontSize: 13, fontWeight: 700 }; }
function logStyle(theme: ThemeMode): CSSProperties { return { marginTop: 14, padding: 12, borderRadius: 6, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function logRowStyle(theme: ThemeMode): CSSProperties { return { padding: '8px 0', borderTop: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0', color: theme === 'dark' ? '#cbd5e1' : '#475569', fontSize: 12, lineHeight: 1.4 }; }
