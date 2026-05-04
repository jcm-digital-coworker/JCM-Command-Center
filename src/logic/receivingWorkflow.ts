import type { ReceivingOrder, ReceivingOrderDraft, ReceivingOrderStatus } from '../types/receiving';

export const RECEIVING_STORAGE_KEY = 'jcm_receiving_orders_v1';

export function createReceivingOrder(draft: ReceivingOrderDraft): ReceivingOrder {
  const now = new Date().toISOString();
  const status: ReceivingOrderStatus = isToday(draft.expectedDate) ? 'ARRIVING_TODAY' : 'ORDERED';

  return {
    id: `recv-${Date.now()}`,
    ...draft,
    status,
    notificationLog: [
      {
        id: `note-${Date.now()}`,
        at: now,
        audience: 'Receiving',
        message: `${draft.orderedBy} submitted ${draft.itemName} for ${draft.destinationDepartment}.`,
      },
    ],
  };
}

export function checkInReceivingOrder(order: ReceivingOrder, checkedBy: string, notes: string): ReceivingOrder {
  const now = new Date().toISOString();
  return {
    ...order,
    status: 'CHECKED_IN',
    receiverCheckedBy: checkedBy || 'Receiving',
    receiverCheckedAt: now,
    receiverNotes: notes,
    notificationLog: [
      ...order.notificationLog,
      {
        id: `note-${Date.now()}`,
        at: now,
        audience: `${order.orderedBy} + ${order.destinationDepartment} Supervisor`,
        message: `${order.itemName} was checked in by ${checkedBy || 'Receiving'} and is ready for delivery to ${order.destinationDetail}.`,
      },
    ],
  };
}

export function claimReceivingDelivery(order: ReceivingOrder, driverName: string): ReceivingOrder {
  const now = new Date().toISOString();
  return {
    ...order,
    status: 'CLAIMED_FOR_DELIVERY',
    claimedBy: driverName || 'Forklift Driver',
    claimedAt: now,
    notificationLog: [
      ...order.notificationLog,
      {
        id: `note-${Date.now()}`,
        at: now,
        audience: 'Receiving Lead',
        message: `${driverName || 'Forklift Driver'} claimed delivery of ${order.itemName} to ${order.destinationDepartment}.`,
      },
    ],
  };
}

export function deliverReceivingOrder(order: ReceivingOrder, deliveredBy: string, notes: string): ReceivingOrder {
  const now = new Date().toISOString();
  return {
    ...order,
    status: 'DELIVERED',
    deliveredBy: deliveredBy || order.claimedBy || 'Forklift Driver',
    deliveredAt: now,
    deliveryNotes: notes,
    notificationLog: [
      ...order.notificationLog,
      {
        id: `note-${Date.now()}`,
        at: now,
        audience: `${order.orderedBy} + ${order.destinationDepartment} Supervisor`,
        message: `${order.itemName} was delivered to ${order.destinationDetail}.`,
      },
    ],
  };
}

export function putReceivingOrderOnHold(order: ReceivingOrder, notes: string): ReceivingOrder {
  const now = new Date().toISOString();
  return {
    ...order,
    status: 'PROBLEM_HOLD',
    receiverNotes: notes,
    notificationLog: [
      ...order.notificationLog,
      {
        id: `note-${Date.now()}`,
        at: now,
        audience: `${order.orderedBy} + Receiving Supervisor`,
        message: `${order.itemName} is on hold: ${notes || 'receiver issue needs review'}.`,
      },
    ],
  };
}

export function getReceivingNextAction(order: ReceivingOrder): string {
  if (order.status === 'ORDERED') return `Waiting for arrival from ${order.supplier || 'supplier'}.`;
  if (order.status === 'ARRIVING_TODAY') return 'Receiver should verify quantity, condition, PO/receiver, and destination.';
  if (order.status === 'CHECKED_IN') return 'Forklift driver should claim this delivery.';
  if (order.status === 'CLAIMED_FOR_DELIVERY') return 'Driver should deliver and press Delivered/Handoff.';
  if (order.status === 'PROBLEM_HOLD') return 'Supervisor or requester should review the receiver hold before delivery continues.';
  return 'Delivered. Notification trail is complete.';
}

export function getReceivingStatusLabel(status: ReceivingOrderStatus): string {
  return status.replace(/_/g, ' ');
}

export function isToday(dateString: string): boolean {
  return dateString === new Date().toISOString().slice(0, 10);
}
