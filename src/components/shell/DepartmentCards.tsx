import type { Machine } from "../../types/machine";
import type { MaintenanceTask } from "../../types/maintenance";
import type { DepartmentFilter } from "../../types/app";
import type { WorkCenter } from "../../types/plant";
import { getDepartmentOperatingProfile } from "../../data/departmentOperatingProfiles";
import type { CSSProperties } from "react";

export default function DepartmentCards({
  machines,
  alerts,
  tasks,
  selected,
  onSelect,
  workCenters,
}: {
  machines: Machine[];
  alerts: Machine[];
  tasks: MaintenanceTask[];
  selected: DepartmentFilter;
  onSelect: (department: DepartmentFilter) => void;
  workCenters: WorkCenter[];
}) {
  const options: DepartmentFilter[] = ["All", ...workCenters.map((center) => center.department)];

  return (
    <div style={departmentCardGridStyle}>
      {options.map((department) => {
        const center = workCenters.find((item) => item.department === department);
        const profile = center ? getDepartmentOperatingProfile(center.department) : null;
        const deptMachines =
          department === "All"
            ? machines
            : machines.filter((machine) => machine.department === department);

        const deptAlerts =
          department === "All"
            ? alerts
            : alerts.filter((machine) => machine.department === department);

        const deptTasks =
          department === "All"
            ? tasks
            : tasks.filter((task) => {
                const machine = machines.find((item) => item.id === task.machineId);
                return machine?.department === department;
              });

        const active = selected === department;
        const status = department === "All" ? "PLANT" : center?.status ?? "PLANNED";

        return (
          <button
            key={department}
            onClick={() => onSelect(department)}
            style={{
              ...departmentCardStyle,
              border: active ? "2px solid #111827" : "1px solid #d1d5db",
              background: active ? "#f8fafc" : "white",
            }}
          >
            <div style={cardTopLineStyle}>
              <span style={{ fontWeight: 900 }}>{department}</span>
              <span style={statusPillStyle}>{status}</span>
            </div>
            <div style={resourceLabelStyle}>
              {department === "All" ? "Plant command" : profile?.resourceLabel ?? "Work center"}
            </div>
            <div style={cardPurposeStyle}>
              {department === "All"
                ? "Whole plant command view"
                : profile?.operatingSummary ?? center?.primaryFunction ?? "Planned work center"}
            </div>
            <div style={metricRowStyle}>
              <span>{deptMachines.length} machines</span>
              <span>{deptAlerts.length} alerts</span>
              <span>{deptTasks.filter((task) => task.status !== "OK").length} maint.</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

const departmentCardGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
  gap: 10,
  marginBottom: 16,
};

const departmentCardStyle: CSSProperties = {
  padding: 14,
  borderRadius: 18,
  cursor: "pointer",
  textAlign: "left",
  minHeight: 150,
};

const cardTopLineStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
};

const statusPillStyle: CSSProperties = {
  border: "1px solid #cbd5e1",
  borderRadius: 999,
  padding: "4px 8px",
  fontSize: 10,
  fontWeight: 900,
  color: "#334155",
  background: "#f8fafc",
};

const resourceLabelStyle: CSSProperties = {
  color: "#f97316",
  marginTop: 8,
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: "0.4px",
  textTransform: "uppercase",
};

const cardPurposeStyle: CSSProperties = {
  color: "#475569",
  marginTop: 6,
  fontSize: 13,
  lineHeight: 1.35,
};

const metricRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  color: "#64748b",
  marginTop: 12,
  fontSize: 12,
  fontWeight: 800,
};
