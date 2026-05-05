import { useEffect, useMemo, useState } from 'react';
import { seedReceivingOrders } from '../data/receivingOrders';
import { getMaterialLabel, getMaterialsForDepartment } from '../data/materialCatalog';
import { plantDepartmentOrder } from '../data/workCenters';
import { getReceivingAgeLabel, getReceivingDestinationLane, getReceivingGateAction, getReceivingGateLabel, getReceivingGateStatus, getReceivingGateTone, getReceivingLaneLabel, getReceivingLaneType, getReceivingOrderAgeHours, getReceivingPressureSummary } from '../logic/receivingGate';
import { RECEIVING_STORAGE_KEY, checkInReceivingOrder, claimReceivingDelivery, createReceivingOrder, deliverReceivingOrder, reportReceivingException } from '../logic/receivingWorkflow';
import type { Department } from '../types/machine';
import type { ReceivingOrder, ReceivingOrderDraft } from '../types/receiving';

type ThemeMode = 'dark' | 'light';
type ReceivingView = 'hub' | 'submit' | 'arriving' | 'ready' | 'claimed' | 'delivered' | 'holds';
interface ReceivingPageProps { theme?: ThemeMode; initialView?: ReceivingView; submitDepartment?: Department; }

function createBlankDraft(department: Department): ReceivingOrderDraft {
  const material = getMaterialsForDepartment(department)[0];
  return { itemName: material ? getMaterialLabel(material) : '', description: '', quantity: '', orderedBy: '', requesterDepartment: department, destinationDepartment: department, destinationDetail: '', expectedDate: new Date().toISOString().slice(0, 10), supplier: '', poOrReceiver: '', priority: 'NORMAL' };
}

export default function ReceivingGatePage({ theme = 'dark', initialView = 'hub', submitDepartment = 'Machine Shop' }: ReceivingPageProps) {
  const [orders, setOrders] = useState<ReceivingOrder[]>(() => loadOrders());
  const [view, setView] = useState<ReceivingView>(initialView);
  const [draft, setDraft] = useState<ReceivingOrderDraft>(() => createBlankDraft(submitDepartment));
  const [workerName, setWorkerName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => localStorage.setItem(RECEIVING_STORAGE_KEY, JSON.stringify(orders)), [orders]);
  useEffect(() => setView(initialView), [initialView]);
  useEffect(() => { if (initialView === 'submit') setDraft(createBlankDraft(submitDepartment)); }, [initialView, submitDepartment]);

  const pressure = useMemo(() => getReceivingPressureSummary(orders), [orders]);
  const visible = useMemo(() => filterOrders(orders, view), [orders, view]);

  function update(next: ReceivingOrder) { setOrders((o) => o.map((x) => (x.id === next.id ? next : x))); setNotes(''); }

  return (<section>
    <h2>Receiving Gate</h2>
    <div>{pressure.total} total • {pressure.ready} ready • {pressure.holds} holds</div>
    <div>
      {(['hub','submit','arriving','ready','claimed','delivered','holds'] as ReceivingView[]).map((v) => <button key={v} onClick={() => setView(v)}>{v}</button>)}
    </div>
    {view === 'submit' ? <form onSubmit={(e)=>{e.preventDefault(); const n=createReceivingOrder(draft); setOrders((o)=>[n,...o]); setSubmitMessage('Submitted');}}>
      <input value={draft.itemName} onChange={(e)=>setDraft({...draft,itemName:e.target.value})} placeholder='Item' />
      <select value={draft.requesterDepartment} onChange={(e)=>setDraft(createBlankDraft(e.target.value as Department))}>{plantDepartmentOrder.map((d)=><option key={d}>{d}</option>)}</select>
      <button type='submit'>Submit material</button><span>{submitMessage}</span>
    </form> : null}

    {visible.map((order) => {
      const gate = getReceivingGateStatus(order);
      const tone = getReceivingGateTone(gate);
      const lane = getReceivingDestinationLane(order.destinationDepartment);
      const laneType = getReceivingLaneType(order.destinationDepartment);
      const age = getReceivingOrderAgeHours(order);
      const action = getReceivingGateAction(order);
      return <article key={order.id} style={{ border: `1px solid ${tone}`, margin: 8, padding: 8 }}>
        <strong>{order.itemName}</strong> <span>{getReceivingGateLabel(gate)}</span>
        <div>Lane: {lane} ({getReceivingLaneLabel(laneType)}) • Age {getReceivingAgeLabel(age)}</div>
        <div>
          {action === 'VERIFY' ? <button onClick={() => update(checkInReceivingOrder(order, workerName, notes))}>Verify / Check-in</button> : null}
          {action === 'CLAIM' ? <button onClick={() => update(claimReceivingDelivery(order, workerName))}>Claim delivery</button> : null}
          {action === 'DELIVER' ? <button onClick={() => update(deliverReceivingOrder(order, workerName, notes))}>Delivered / Handoff</button> : null}
          {action === 'RESOLVE_HOLD' ? <button onClick={() => setView('holds')}>Problem hold</button> : null}
          <button onClick={() => update(reportReceivingException(order, 'OTHER', workerName || 'Receiving', notes || 'Needs review'))}>Exception: Other</button>
          <button onClick={() => update(reportReceivingException(order, 'DAMAGE', workerName || 'Receiving', notes || 'Damage found'))}>Exception: Damage</button>
        </div>
      </article>;
    })}
    <input value={workerName} onChange={(e)=>setWorkerName(e.target.value)} placeholder='Worker' />
    <input value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder='Notes' />
  </section>);
}

function filterOrders(orders: ReceivingOrder[], view: ReceivingView) {
  if (view === 'hub') return orders;
  if (view === 'arriving') return orders.filter((o) => o.status === 'ARRIVING_TODAY' || o.status === 'ORDERED');
  if (view === 'ready') return orders.filter((o) => o.status === 'CHECKED_IN');
  if (view === 'claimed') return orders.filter((o) => o.status === 'CLAIMED_FOR_DELIVERY');
  if (view === 'delivered') return orders.filter((o) => o.status === 'DELIVERED');
  if (view === 'holds') return orders.filter((o) => o.status === 'PROBLEM_HOLD');
  return orders;
}

function loadOrders(): ReceivingOrder[] {
  try { const raw = localStorage.getItem(RECEIVING_STORAGE_KEY); if (!raw) return seedReceivingOrders; const parsed = JSON.parse(raw) as ReceivingOrder[]; return Array.isArray(parsed) ? parsed : seedReceivingOrders; } catch { return seedReceivingOrders; }
}
