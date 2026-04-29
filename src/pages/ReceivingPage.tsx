import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { plantDepartmentOrder } from "../data/workCenters";
import { seedReceivingOrders } from "../data/receivingOrders";
import {
  getMaterialLabel,
  getMaterialsForDepartment,
} from "../data/materialCatalog";
import type { Department } from "../types/machine";
import type {
  ReceivingOrder,
  ReceivingOrderDraft,
  ReceivingOrderPriority,
  ReceivingOrderStatus,
} from "../types/receiving";
import {
  RECEIVING_STORAGE_KEY,
  checkInReceivingOrder,
  claimReceivingDelivery,
  createReceivingOrder,
  deliverReceivingOrder,
  getReceivingNextAction,
  getReceivingStatusLabel,
  putReceivingOrderOnHold,
} from "../logic/receivingWorkflow";

type ThemeMode = "dark" | "light";
type ReceivingView =
  | "hub"
  | "submit"
  | "arriving"
  | "ready"
  | "claimed"
  | "delivered"
  | "holds";

interface ReceivingPageProps {
  theme?: ThemeMode;
  initialView?: ReceivingView;
  submitDepartment?: Department;
}

function createBlankDraft(department: Department): ReceivingOrderDraft {
  const material = getMaterialsForDepartment(department)[0];
  return {
    itemName: material ? getMaterialLabel(material) : "",
    description: "",
    quantity: "",
    orderedBy: "",
    requesterDepartment: department,
    destinationDepartment: department,
    destinationDetail: "",
    expectedDate: new Date().toISOString().slice(0, 10),
    supplier: "",
    poOrReceiver: "",
    priority: "NORMAL",
  };
}

export default function ReceivingPage({
  theme = "dark",
  initialView = "hub",
  submitDepartment = "Machine Shop",
}: ReceivingPageProps) {
  const [orders, setOrders] = useState<ReceivingOrder[]>(() => loadOrders());
  const [view, setView] = useState<ReceivingView>(initialView);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReceivingOrderDraft>(() =>
    createBlankDraft(submitDepartment),
  );
  const [workerName, setWorkerName] = useState("");
  const [notes, setNotes] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    localStorage.setItem(RECEIVING_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  useEffect(() => {
    if (initialView === "submit") {
      setDraft(createBlankDraft(submitDepartment));
    }
  }, [initialView, submitDepartment]);

  const summary = useMemo(() => getSummary(orders), [orders]);
  const visibleOrders = useMemo(
    () => filterOrders(orders, view),
    [orders, view],
  );
  const activeOrder =
    orders.find((order) => order.id === activeId) ??
    visibleOrders[0] ??
    orders[0];
  const departmentMaterials = getMaterialsForDepartment(
    draft.requesterDepartment,
  );
  const materialOptions =
    departmentMaterials.length > 0
      ? departmentMaterials.map(getMaterialLabel)
      : ["No catalog items yet"];

  function updateOrder(nextOrder: ReceivingOrder) {
    setOrders((current) =>
      current.map((order) => (order.id === nextOrder.id ? nextOrder : order)),
    );
    setActiveId(nextOrder.id);
    setWorkerName("");
    setNotes("");
  }

  function updateRequesterDepartment(department: Department) {
    const firstMaterial = getMaterialsForDepartment(department)[0];
    setSubmitMessage("");
    setDraft({
      ...draft,
      requesterDepartment: department,
      destinationDepartment: department,
      itemName: firstMaterial ? getMaterialLabel(firstMaterial) : "",
    });
  }

  function submitOrder() {
    if (
      !draft.itemName.trim() ||
      !draft.quantity.trim() ||
      !draft.orderedBy.trim() ||
      !draft.destinationDetail.trim()
    )
      return;
    const nextOrder = createReceivingOrder(draft);
    setOrders((current) => [nextOrder, ...current]);
    setActiveId(nextOrder.id);
    setDraft(createBlankDraft(draft.requesterDepartment));
    setSubmitMessage(
      `Submitted ${nextOrder.itemName} to Receiving. Form cleared for the next request.`,
    );
    setView("submit");
  }

  return (
    <div style={pageStyle}>
      <section style={getHeroStyle(theme)}>
        <div>
          <div style={eyebrowStyle}>
            {view === "submit"
              ? "DEPARTMENT MATERIAL REQUEST"
              : "RECEIVING COMMAND QUEUE"}
          </div>
          <h2 style={getTitleStyle(theme)}>
            {view === "submit" ? "Request material" : "Digital receiver"}
          </h2>
          <p style={getSubTextStyle(theme)}>
            {view === "submit"
              ? "Departments request known material here. Receiving verifies inventory, drivers claim delivery, and the handoff trail follows the material."
              : "Orders come in, Receiving verifies them, drivers claim deliveries, and handoff history stays attached to the material."}
          </p>
        </div>
      </section>

      {view !== "submit" ? (
        <section style={getMetricGridStyle()}>
          <StatusButton
            label="Arriving today"
            value={summary.arriving}
            tone="HOT"
            active={view === "arriving"}
            onClick={() => setView("arriving")}
            theme={theme}
          />
          <StatusButton
            label="Ready for driver"
            value={summary.ready}
            tone="INFO"
            active={view === "ready"}
            onClick={() => setView("ready")}
            theme={theme}
          />
          <StatusButton
            label="Claimed"
            value={summary.claimed}
            tone="WARN"
            active={view === "claimed"}
            onClick={() => setView("claimed")}
            theme={theme}
          />
          <StatusButton
            label="Delivered"
            value={summary.delivered}
            tone="OK"
            active={view === "delivered"}
            onClick={() => setView("delivered")}
            theme={theme}
          />
          <StatusButton
            label="Problem holds"
            value={summary.holds}
            tone="DANGER"
            active={view === "holds"}
            onClick={() => setView("holds")}
            theme={theme}
          />
        </section>
      ) : null}

      {view === "hub" ? (
        <section style={getPanelStyle(theme)}>
          <div style={eyebrowStyle}>START HERE</div>
          <h3 style={getSectionTitleStyle(theme)}>Choose a queue above.</h3>
          <p style={getSubTextStyle(theme)}>
            Receiving does not request from itself. Production departments
            submit material requests from their own station screens; Receiving
            works the fulfillment queue.
          </p>
        </section>
      ) : null}

      {view === "submit" ? (
        <section style={getPanelStyle(theme)}>
          <div style={getPanelHeaderStyle()}>
            <h3 style={getSectionTitleStyle(theme)}>
              Submit material request to Receiving
            </h3>
            <button
              onClick={() => setView("hub")}
              style={getGhostButtonStyle(theme)}
            >
              BACK TO RECEIVING
            </button>
          </div>
          <div style={getFormGridStyle()}>
            <SelectField
              label="Requesting department"
              value={draft.requesterDepartment}
              options={plantDepartmentOrder.filter(
                (department) => department !== "Receiving",
              )}
              onChange={(value) =>
                updateRequesterDepartment(value as Department)
              }
              theme={theme}
            />
            <SelectField
              label="Known material"
              value={draft.itemName || materialOptions[0]}
              options={materialOptions}
              onChange={(value) => setDraft({ ...draft, itemName: value })}
              theme={theme}
            />
            <Field
              label="Quantity"
              value={draft.quantity}
              onChange={(value) => setDraft({ ...draft, quantity: value })}
              theme={theme}
            />
            <Field
              label="Weekly order / job number"
              value={draft.poOrReceiver}
              onChange={(value) => setDraft({ ...draft, poOrReceiver: value })}
              theme={theme}
            />
            <Field
              label="Requested by"
              value={draft.orderedBy}
              onChange={(value) => setDraft({ ...draft, orderedBy: value })}
              theme={theme}
            />
            <SelectField
              label="Deliver to department"
              value={draft.destinationDepartment}
              options={plantDepartmentOrder.filter(
                (department) => department !== "Receiving",
              )}
              onChange={(value) =>
                setDraft({
                  ...draft,
                  destinationDepartment: value as Department,
                })
              }
              theme={theme}
            />
            <Field
              label="Station / drop location"
              value={draft.destinationDetail}
              onChange={(value) =>
                setDraft({ ...draft, destinationDetail: value })
              }
              theme={theme}
            />
            <Field
              label="Needed by date"
              type="date"
              value={draft.expectedDate}
              onChange={(value) => setDraft({ ...draft, expectedDate: value })}
              theme={theme}
            />
            <SelectField
              label="Priority"
              value={draft.priority}
              options={["NORMAL", "HOT", "CRITICAL"]}
              onChange={(value) =>
                setDraft({
                  ...draft,
                  priority: value as ReceivingOrderPriority,
                })
              }
              theme={theme}
            />
          </div>
          <TextAreaField
            label="Notes / special handling"
            value={draft.description}
            onChange={(value) => setDraft({ ...draft, description: value })}
            theme={theme}
          />
          {submitMessage ? (
            <div style={getSuccessNoticeStyle(theme)}>{submitMessage}</div>
          ) : null}
          <button onClick={submitOrder} style={getPrimaryButtonStyle(theme)}>
            SUBMIT TO RECEIVING
          </button>
        </section>
      ) : null}

      {view !== "hub" && view !== "submit" ? (
        <div style={getWorkGridStyle()}>
          <section style={getPanelStyle(theme)}>
            <div style={getPanelHeaderStyle()}>
              <h3 style={getSectionTitleStyle(theme)}>{getViewTitle(view)}</h3>
              <button
                onClick={() => setView("hub")}
                style={getGhostButtonStyle(theme)}
              >
                ALL QUEUES
              </button>
            </div>
            <div style={stackStyle}>
              {visibleOrders.length === 0 ? (
                <div style={getEmptyStyle(theme)}>Nothing in this queue.</div>
              ) : null}
              {visibleOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => setActiveId(order.id)}
                  style={getOrderRowStyle(
                    theme,
                    activeOrder?.id === order.id,
                    order.status,
                  )}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={getOrderTitleStyle(theme)}>
                      {order.itemName}
                    </div>
                    <div style={getOrderMetaStyle(theme)}>
                      {order.quantity} · {order.poOrReceiver || "No order #"} ·
                      to {order.destinationDepartment} /{" "}
                      {order.destinationDetail}
                    </div>
                  </div>
                  <span style={getStatusBadgeStyle(order.status)}>
                    {getReceivingStatusLabel(order.status)}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {activeOrder ? (
            <section style={getPanelStyle(theme)}>
              <div style={getPanelHeaderStyle()}>
                <div>
                  <h3 style={getSectionTitleStyle(theme)}>
                    {activeOrder.itemName}
                  </h3>
                  <p style={getSubTextStyle(theme)}>
                    {getReceivingNextAction(activeOrder)}
                  </p>
                </div>
                <span style={getStatusBadgeStyle(activeOrder.status)}>
                  {getReceivingStatusLabel(activeOrder.status)}
                </span>
              </div>
              <div style={getInfoGridStyle()}>
                <Info
                  label="Requester"
                  value={`${activeOrder.orderedBy} / ${activeOrder.requesterDepartment}`}
                  theme={theme}
                />
                <Info
                  label="Destination"
                  value={`${activeOrder.destinationDepartment} / ${activeOrder.destinationDetail}`}
                  theme={theme}
                />
                <Info
                  label="Order / job"
                  value={activeOrder.poOrReceiver || "Not entered"}
                  theme={theme}
                />
                <Info
                  label="Priority"
                  value={activeOrder.priority}
                  theme={theme}
                />
              </div>
              <div style={getFormGridStyle()}>
                <Field
                  label="Name / initials"
                  value={workerName}
                  onChange={setWorkerName}
                  theme={theme}
                />
                <TextAreaField
                  label="Receiver / delivery notes"
                  value={notes}
                  onChange={setNotes}
                  theme={theme}
                />
              </div>
              <div style={buttonRowStyle}>
                <button
                  onClick={() =>
                    updateOrder(
                      checkInReceivingOrder(activeOrder, workerName, notes),
                    )
                  }
                  style={getPrimaryButtonStyle(theme)}
                >
                  VERIFY INVENTORY / CHECK IN
                </button>
                <button
                  onClick={() =>
                    updateOrder(claimReceivingDelivery(activeOrder, workerName))
                  }
                  style={getSecondaryButtonStyle(theme)}
                >
                  CLAIM DELIVERY
                </button>
                <button
                  onClick={() =>
                    updateOrder(
                      deliverReceivingOrder(activeOrder, workerName, notes),
                    )
                  }
                  style={getSuccessButtonStyle()}
                >
                  DELIVERED / HANDOFF
                </button>
                <button
                  onClick={() =>
                    updateOrder(putReceivingOrderOnHold(activeOrder, notes))
                  }
                  style={getDangerButtonStyle()}
                >
                  PROBLEM HOLD
                </button>
              </div>
              <div style={getLogStyle(theme)}>
                <div style={eyebrowStyle}>NOTIFICATION TRAIL</div>
                {activeOrder.notificationLog.map((note) => (
                  <div key={note.id} style={getLogRowStyle(theme)}>
                    <strong>{note.audience}</strong>
                    <div>{note.message}</div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function loadOrders(): ReceivingOrder[] {
  try {
    const stored = localStorage.getItem(RECEIVING_STORAGE_KEY);
    if (!stored) return seedReceivingOrders;
    const parsed = JSON.parse(stored) as ReceivingOrder[];
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : seedReceivingOrders;
  } catch {
    return seedReceivingOrders;
  }
}

function getSummary(orders: ReceivingOrder[]) {
  return {
    arriving: orders.filter((order) => order.status === "ARRIVING_TODAY")
      .length,
    ready: orders.filter((order) => order.status === "CHECKED_IN").length,
    claimed: orders.filter((order) => order.status === "CLAIMED_FOR_DELIVERY")
      .length,
    delivered: orders.filter((order) => order.status === "DELIVERED").length,
    holds: orders.filter((order) => order.status === "PROBLEM_HOLD").length,
  };
}

function filterOrders(orders: ReceivingOrder[], view: ReceivingView) {
  if (view === "arriving")
    return orders.filter((order) => order.status === "ARRIVING_TODAY");
  if (view === "ready")
    return orders.filter((order) => order.status === "CHECKED_IN");
  if (view === "claimed")
    return orders.filter((order) => order.status === "CLAIMED_FOR_DELIVERY");
  if (view === "delivered")
    return orders.filter((order) => order.status === "DELIVERED");
  if (view === "holds")
    return orders.filter((order) => order.status === "PROBLEM_HOLD");
  return orders;
}

function getViewTitle(view: ReceivingView) {
  if (view === "arriving") return "Today's inbound queue";
  if (view === "ready") return "Ready for driver";
  if (view === "claimed") return "Claimed deliveries";
  if (view === "delivered") return "Delivered handoffs";
  if (view === "holds") return "Problem holds";
  return "Receiving queue";
}

function StatusButton({
  label,
  value,
  tone,
  active,
  onClick,
  theme,
}: {
  label: string;
  value: number;
  tone: string;
  active: boolean;
  onClick: () => void;
  theme: ThemeMode;
}) {
  return (
    <button onClick={onClick} style={getMetricButtonStyle(theme, tone, active)}>
      <div style={getMetricValueStyle(theme)}>{value}</div>
      <div style={getMetricLabelStyle(theme)}>{label}</div>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  theme,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  theme: ThemeMode;
  type?: string;
}) {
  return (
    <label style={fieldWrapStyle}>
      <span style={getFieldLabelStyle(theme)}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={getInputStyle(theme)}
      />
    </label>
  );
}
function TextAreaField({
  label,
  value,
  onChange,
  theme,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  theme: ThemeMode;
}) {
  return (
    <label style={fieldWrapStyle}>
      <span style={getFieldLabelStyle(theme)}>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ ...getInputStyle(theme), minHeight: 72, resize: "vertical" }}
      />
    </label>
  );
}
function SelectField({
  label,
  value,
  options,
  onChange,
  theme,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  theme: ThemeMode;
}) {
  return (
    <label style={fieldWrapStyle}>
      <span style={getFieldLabelStyle(theme)}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={getInputStyle(theme)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
function Info({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: ThemeMode;
}) {
  return (
    <div style={getInfoStyle(theme)}>
      <div style={getInfoLabelStyle(theme)}>{label}</div>
      <div style={getInfoValueStyle(theme)}>{value}</div>
    </div>
  );
}

const pageStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};
const eyebrowStyle: CSSProperties = {
  color: "#f97316",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: "1.3px",
  textTransform: "uppercase",
  marginBottom: 8,
};
const fieldWrapStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};
const stackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};
const buttonRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 14,
};

function getHeroStyle(theme: ThemeMode): CSSProperties {
  return {
    padding: 18,
    borderRadius: 8,
    background:
      theme === "dark"
        ? "linear-gradient(135deg, #1e293b, #0f172a)"
        : "#ffffff",
    border: theme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "flex-start",
  };
}
function getTitleStyle(theme: ThemeMode): CSSProperties {
  return {
    margin: 0,
    fontSize: 24,
    color: theme === "dark" ? "#e2e8f0" : "#0f172a",
    fontWeight: 900,
  };
}
function getSubTextStyle(theme: ThemeMode): CSSProperties {
  return {
    margin: "6px 0 0 0",
    color: theme === "dark" ? "#94a3b8" : "#64748b",
    fontSize: 13,
    lineHeight: 1.45,
  };
}
function getMetricGridStyle(): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: 10,
  };
}
function getToneColor(tone: string): string {
  if (tone === "OK") return "#10b981";
  if (tone === "WARN") return "#f59e0b";
  if (tone === "DANGER") return "#dc2626";
  if (tone === "INFO") return "#38bdf8";
  return "#f97316";
}
function getMetricButtonStyle(
  theme: ThemeMode,
  tone: string,
  active: boolean,
): CSSProperties {
  const color = getToneColor(tone);
  return {
    textAlign: "left",
    padding: 14,
    borderRadius: 8,
    background: active
      ? `${color}24`
      : theme === "dark"
        ? "#1e293b"
        : "#ffffff",
    border: `1px solid ${active ? color : theme === "dark" ? "#334155" : "#e2e8f0"}`,
    borderLeft: `5px solid ${color}`,
    cursor: "pointer",
  };
}
function getMetricValueStyle(theme: ThemeMode): CSSProperties {
  return {
    color: theme === "dark" ? "#f8fafc" : "#0f172a",
    fontSize: 25,
    fontWeight: 900,
  };
}
function getMetricLabelStyle(theme: ThemeMode): CSSProperties {
  return {
    color: theme === "dark" ? "#94a3b8" : "#64748b",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  };
}
function getPanelStyle(theme: ThemeMode): CSSProperties {
  return {
    padding: 16,
    borderRadius: 8,
    background: theme === "dark" ? "#1e293b" : "#ffffff",
    border: theme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
  };
}
function getPanelHeaderStyle(): CSSProperties {
  return {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    marginBottom: 12,
  };
}
function getSectionTitleStyle(theme: ThemeMode): CSSProperties {
  return {
    margin: 0,
    color: theme === "dark" ? "#e2e8f0" : "#0f172a",
    fontSize: 16,
    fontWeight: 900,
    letterSpacing: "0.7px",
    textTransform: "uppercase",
  };
}
function getFormGridStyle(): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 10,
    marginBottom: 12,
  };
}
function getWorkGridStyle(): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 14,
    alignItems: "start",
  };
}
function getOrderRowStyle(
  theme: ThemeMode,
  active: boolean,
  status: ReceivingOrderStatus,
): CSSProperties {
  const color = getStatusColor(status);
  return {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    textAlign: "left",
    padding: 12,
    borderRadius: 6,
    background: active
      ? `${color}22`
      : theme === "dark"
        ? "#0f172a"
        : "#f8fafc",
    border: `1px solid ${active ? color : theme === "dark" ? "#334155" : "#e2e8f0"}`,
    cursor: "pointer",
  };
}
function getOrderTitleStyle(theme: ThemeMode): CSSProperties {
  return {
    color: theme === "dark" ? "#e2e8f0" : "#0f172a",
    fontSize: 14,
    fontWeight: 900,
  };
}
function getOrderMetaStyle(theme: ThemeMode): CSSProperties {
  return {
    color: theme === "dark" ? "#94a3b8" : "#64748b",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 1.35,
  };
}
function getInfoGridStyle(): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 10,
    marginBottom: 12,
  };
}
function getInfoStyle(theme: ThemeMode): CSSProperties {
  return {
    padding: 10,
    borderRadius: 6,
    background: theme === "dark" ? "#0f172a" : "#f8fafc",
    border: theme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
  };
}
function getInfoLabelStyle(theme: ThemeMode): CSSProperties {
  return {
    color: theme === "dark" ? "#64748b" : "#64748b",
    fontSize: 10,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  };
}
function getInfoValueStyle(theme: ThemeMode): CSSProperties {
  return {
    color: theme === "dark" ? "#e2e8f0" : "#0f172a",
    fontSize: 12,
    fontWeight: 800,
    marginTop: 4,
  };
}
function getFieldLabelStyle(theme: ThemeMode): CSSProperties {
  return {
    color: theme === "dark" ? "#94a3b8" : "#475569",
    fontSize: 11,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  };
}
function getInputStyle(theme: ThemeMode): CSSProperties {
  return {
    padding: "10px 11px",
    borderRadius: 4,
    border: theme === "dark" ? "1px solid #334155" : "1px solid #cbd5e1",
    background: theme === "dark" ? "#0f172a" : "#ffffff",
    color: theme === "dark" ? "#e2e8f0" : "#0f172a",
    fontWeight: 700,
    outline: "none",
  };
}
function getPrimaryButtonStyle(theme: ThemeMode): CSSProperties {
  return {
    padding: "10px 13px",
    borderRadius: 4,
    border: "1px solid #f97316",
    background: "#f97316",
    color: theme === "dark" ? "#111827" : "#ffffff",
    fontWeight: 900,
    fontSize: 11,
    letterSpacing: "0.7px",
    cursor: "pointer",
  };
}
function getSecondaryButtonStyle(theme: ThemeMode): CSSProperties {
  return {
    ...getPrimaryButtonStyle(theme),
    background: "rgba(59,130,246,0.12)",
    color: "#38bdf8",
    border: "1px solid #38bdf8",
  };
}
function getGhostButtonStyle(theme: ThemeMode): CSSProperties {
  return {
    padding: "8px 10px",
    borderRadius: 4,
    border: theme === "dark" ? "1px solid #334155" : "1px solid #cbd5e1",
    background: "transparent",
    color: theme === "dark" ? "#cbd5e1" : "#475569",
    fontWeight: 900,
    fontSize: 11,
    cursor: "pointer",
  };
}
function getSuccessButtonStyle(): CSSProperties {
  return {
    padding: "10px 13px",
    borderRadius: 4,
    border: "1px solid #10b981",
    background: "rgba(16,185,129,0.14)",
    color: "#10b981",
    fontWeight: 900,
    fontSize: 11,
    cursor: "pointer",
  };
}
function getDangerButtonStyle(): CSSProperties {
  return {
    padding: "10px 13px",
    borderRadius: 4,
    border: "1px solid #ef4444",
    background: "rgba(239,68,68,0.12)",
    color: "#ef4444",
    fontWeight: 900,
    fontSize: 11,
    cursor: "pointer",
  };
}
function getStatusColor(status: ReceivingOrderStatus) {
  if (status === "ARRIVING_TODAY") return "#f97316";
  if (status === "CHECKED_IN") return "#38bdf8";
  if (status === "CLAIMED_FOR_DELIVERY") return "#f59e0b";
  if (status === "DELIVERED") return "#10b981";
  if (status === "PROBLEM_HOLD") return "#ef4444";
  return "#64748b";
}
function getStatusBadgeStyle(status: ReceivingOrderStatus): CSSProperties {
  const color = getStatusColor(status);
  return {
    alignSelf: "flex-start",
    padding: "5px 8px",
    borderRadius: 4,
    border: `1px solid ${color}66`,
    background: `${color}18`,
    color,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: "0.5px",
    whiteSpace: "nowrap",
  };
}
function getLogStyle(theme: ThemeMode): CSSProperties {
  return {
    marginTop: 16,
    padding: 12,
    borderRadius: 6,
    background: theme === "dark" ? "#0f172a" : "#f8fafc",
    border: theme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
  };
}
function getLogRowStyle(theme: ThemeMode): CSSProperties {
  return {
    padding: "9px 0",
    borderTop: theme === "dark" ? "1px solid #1e293b" : "1px solid #e2e8f0",
    color: theme === "dark" ? "#cbd5e1" : "#475569",
    fontSize: 12,
    lineHeight: 1.4,
  };
}
function getSuccessNoticeStyle(theme: ThemeMode): CSSProperties {
  return {
    padding: "12px 14px",
    borderRadius: 4,
    border: theme === "dark" ? "1px solid #10b981" : "1px solid #34d399",
    background: theme === "dark" ? "rgba(16, 185, 129, 0.12)" : "#d1fae5",
    color: theme === "dark" ? "#a7f3d0" : "#065f46",
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: "0.3px",
    marginTop: 12,
    marginBottom: 12,
  };
}

function getEmptyStyle(theme: ThemeMode): CSSProperties {
  return {
    padding: 14,
    borderRadius: 6,
    background: theme === "dark" ? "#0f172a" : "#f8fafc",
    color: theme === "dark" ? "#94a3b8" : "#64748b",
    fontSize: 13,
    fontWeight: 800,
  };
}
