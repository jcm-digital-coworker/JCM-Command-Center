import type { RiskItem } from "../types/risk";

export const riskItems: RiskItem[] = [
  // ── MACHINE SHOP ─────────────────────────────────────────────────────────────
  {
    id: "risk-1",
    machineId: "7",
    department: "Saddles Dept",
    title: "LV4500 fixture clearance — thread depth near limit",
    level: "HIGH_RISK",
    source: "Simulation",
    description:
      "Any simulated prep or thread depth approaching the 1.5-inch top-of-part to fixture clearance limit must be treated as HIGH RISK. Exceeding clearance risks tool crash into fixture and machine damage.",
    recommendedAction:
      "Run the JCM simulator and require supervisor review before executing any combination near the clearance boundary.",
    requiredSignoff: "Supervisor",
    signoffStatus: "Pending",
  },
  {
    id: "risk-2",
    machineId: "7",
    department: "Saddles Dept",
    title: "LV4500 small boss — restricted tap code combinations",
    level: "CAUTION",
    source: "Program",
    description:
      "Small boss castings (DI Service Saddle) only allow approved lower tap codes. Running invalid casting-to-tap-code combinations will result in a scrapped casting and possible machine fault.",
    recommendedAction:
      "Validate casting size and tap code in the JCM simulator before initiating production run.",
    requiredSignoff: "Co-worker",
    signoffStatus: "Pending",
  },
  {
    id: "risk-3",
    machineId: "1",
    department: "Machine Shop",
    title: "KH80 spindle load fault — DI Coupling order blocked",
    level: "HIGH_RISK",
    source: "Maintenance",
    description:
      "KH80 horizontal machining center has an active ALARM — spindle load fault. Order 2509 (DI Coupling) is blocked. Running with an active spindle load alarm risks tooling failure and machine damage.",
    recommendedAction:
      "Do not restart KH80 until Maintenance clears the spindle fault. Check tool condition and recent roughing engagement before returning to production.",
    requiredSignoff: "Maintenance",
    signoffStatus: "Pending",
  },
  {
    id: "risk-4",
    machineId: "3",
    department: "Machine Shop",
    title: "Yama touch-off / reused offset risk",
    level: "CAUTION",
    source: "Setup",
    description:
      "The Yama lathe is setup-sensitive with operator-dependent touch-off and significant heavy-tool alignment risk. Reusing offsets from a previous setup without re-verification can cause out-of-tolerance parts or tool crashes.",
    recommendedAction:
      "Use second-look touch-off verification with a co-worker before running after any setup change.",
    requiredSignoff: "Co-worker",
    signoffStatus: "Pending",
  },

  // ── FAB / WELDING ─────────────────────────────────────────────────────────────
  {
    id: "risk-5",
    department: "Fab",
    title: "CWI sign-off required before Coating move",
    level: "HIGH_RISK",
    source: "System",
    description:
      "All fabricated weld assemblies require CWI (Certified Welding Inspector) sign-off before moving to Coating. Skipping CWI inspection violates AWWA and customer quality requirements and may result in field failures.",
    recommendedAction:
      "Hold all fab orders at weld complete. G. Landry (CWI) must inspect and sign release form before any order moves to Coating.",
    requiredSignoff: "Supervisor",
    signoffStatus: "Pending",
  },
  {
    id: "risk-6",
    department: "Fab",
    title: "ASTM A516 Gr.70 material traceability — heat number required",
    level: "CAUTION",
    source: "Material",
    description:
      "Carbon steel plate used in CS Tapping Sleeves and Repair Sleeves must be traceable to a certified heat number (ASTM A516 Gr.70 MTR). Using untraced plate violates pressure vessel fabrication requirements and NSF 61.",
    recommendedAction:
      "Verify heat number on incoming CS plate against MTR before cutting or welding. Receiving must stage certified plate only.",
    requiredSignoff: "Co-worker",
    signoffStatus: "Pending",
  },

  // ── COATING ───────────────────────────────────────────────────────────────────
  {
    id: "risk-7",
    department: "Coating",
    title: "Powercron 590-534 — do not move before full cure",
    level: "HIGH_RISK",
    source: "Maintenance",
    description:
      "Order 2508 (CS Tapping Sleeve) is currently in cure. Moving coated parts before Powercron 590-534 epoxy reaches full cure time causes coating adhesion failure, surface damage, and NSF 61 non-compliance. Cure time is temperature-dependent — see Cure Time Reference Chart.",
    recommendedAction:
      "Do not move, stack, or contact coated parts until cure is confirmed. H. Bergeron (Coating Lead) must verify cure before releasing to QA.",
    requiredSignoff: "Supervisor",
    signoffStatus: "Pending",
  },
  {
    id: "risk-8",
    department: "Coating",
    title: "Surface prep minimum — SSPC-SP6 required before coating",
    level: "CAUTION",
    source: "Setup",
    description:
      "Powercron 590-534 requires minimum SSPC-SP6 (Commercial Blast) surface preparation. Under-blasted surfaces result in adhesion failure and coating delamination in service. Visual inspection of profile is required before application.",
    recommendedAction:
      "Coating Operator must visually confirm blast profile before applying epoxy. Reject and re-blast any parts showing mill scale, rust, or contamination.",
    requiredSignoff: "Operator",
    signoffStatus: "Pending",
  },

  // ── ASSEMBLY ─────────────────────────────────────────────────────────────────
  {
    id: "risk-9",
    department: "Assembly",
    title: "Gasket type mismatch — NBR vs EPDM critical non-conformance",
    level: "HIGH_RISK",
    source: "Material",
    description:
      "NBR and EPDM gaskets must not be substituted without QA approval. NBR is standard for water service; EPDM is required for chemical resistance applications. Incorrect gasket type causes field failures, warranty claims, and NSF 61 non-compliance.",
    recommendedAction:
      "Assemblers must verify gasket type and size against the order traveler and Gasket Selection Guide before installation. Flag any substitutions to QA immediately.",
    requiredSignoff: "Co-worker",
    signoffStatus: "Pending",
  },
  {
    id: "risk-10",
    department: "Assembly",
    title: "Hardware torque spec — under-torque and over-torque both failure modes",
    level: "CAUTION",
    source: "Setup",
    description:
      "T-bolt and hex bolt torque must match the Hardware Torque Specification by product size and material. Under-torque results in field leaks; over-torque causes flange cracking on DI bodies. Calibrated torque wrench required — do not estimate by feel.",
    recommendedAction:
      "Use calibrated torque wrench for all final assembly. Verify torque values on Hardware Torque Specification sheet before starting. Report out-of-spec hardware to Lead.",
    requiredSignoff: "Operator",
    signoffStatus: "Pending",
  },

  // ── QA ───────────────────────────────────────────────────────────────────────
  {
    id: "risk-11",
    department: "QA",
    title: "NSF 61 cert packet incomplete — cannot ship without documentation",
    level: "HIGH_RISK",
    source: "System",
    description:
      "Order 2514 (Flanged Adapter) is blocked in QA — NSF 61 paperwork not complete. Shipping any product to a potable water customer without the NSF 61 certification packet is a regulatory violation and grounds for product recall.",
    recommendedAction:
      "QA Lead (C. Bourgeois) must complete and attach NSF 61 certification packet before this order is released to Shipping. Do not move order until paperwork is signed.",
    requiredSignoff: "Supervisor",
    signoffStatus: "Pending",
  },
  {
    id: "risk-12",
    department: "QA",
    title: "Pressure test required before cert release — all pressure fittings",
    level: "CAUTION",
    source: "System",
    description:
      "All pressure-rated fittings (tapping sleeves, couplings, repair sleeves) must pass hydrostatic pressure test before QA cert release. Test pressure is typically 2x working pressure per AWWA standard. No exceptions for expedited orders.",
    recommendedAction:
      "QA Inspector must log test pressure, duration, and pass/fail result on the inspection record. Attach to order traveler before Shipping handoff.",
    requiredSignoff: "Co-worker",
    signoffStatus: "Pending",
  },

  // ── SHIPPING ─────────────────────────────────────────────────────────────────
  {
    id: "risk-13",
    department: "Shipping",
    title: "Forklift certification required — no uncertified loading",
    level: "CAUTION",
    source: "System",
    description:
      "Order 2516 (DI Service Saddle) is blocked in Shipping — no certified forklift operator available. Only OSHA-certified forklift operators may load outbound freight. Loading by uncertified personnel is an OSHA violation.",
    recommendedAction:
      "Contact Receiving (D. Holloway) or Maintenance (D. Fontenot) for certified forklift coverage. Do not load until a certified operator is on-site.",
    requiredSignoff: "Supervisor",
    signoffStatus: "Pending",
  },

  // ── MATERIAL HANDLING ────────────────────────────────────────────────────────
  {
    id: "risk-14",
    department: "Material Handling",
    title: "Material staging readiness — verify spec before cutting",
    level: "WATCH",
    source: "Material",
    description:
      "Material Handling must confirm material spec, thickness, and heat number before cutting plates or tubes for Fab. Cutting wrong material wastes certified stock and can introduce non-conforming material into production.",
    recommendedAction:
      "Check order traveler and MTR before staging material to plasma table or saw. Confirm with Fab Lead before cutting begins.",
    requiredSignoff: "Operator",
    signoffStatus: "Pending",
  },
];
