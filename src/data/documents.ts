import type { PlantDocument } from "../types/documents";

export const plantDocuments: PlantDocument[] = [
  // ── QUALITY / CERTIFICATIONS ──────────────────────────────────────────────────
  {
    id: "doc-cert-nsf61",
    title: "ANSI/NSF 61 — Drinking Water System Components",
    department: "QA",
    category: "Inspection",
    status: "Available",
    ownerRole: "Shared",
    description:
      "NSF 61 certification requirements for all JCM products in potable water contact. Required on cert packet before shipment. Covers saddles, sleeves, couplings, and UCCs in DI and SS construction.",
  },
  {
    id: "doc-cert-nsf372",
    title: "NSF 372 — Lead-Free Compliance",
    department: "QA",
    category: "Inspection",
    status: "Available",
    ownerRole: "Shared",
    description:
      "Lead-free certification for wetted surface components. All JCM fittings must comply with NSF 372 / Safe Drinking Water Act requirements. Reference for material selection and hardware procurement.",
  },
  {
    id: "doc-cert-awwac219",
    title: "AWWA C219 — Bolted Sleeve-Type Couplings",
    department: "QA",
    category: "Inspection",
    status: "Available",
    ownerRole: "Shared",
    description:
      "AWWA C219 standard for bolted sleeve-type couplings for plain-end pipe. Applies to JCM Model 101 (CC type) and Model 102 (MC type) Universal Couplings and Clamps. Reference for dimensional tolerances, pressure ratings, and gasket requirements.",
  },
  {
    id: "doc-cert-awwac800",
    title: "AWWA C800 — Underground Service Line Valves",
    department: "QA",
    category: "Inspection",
    status: "Available",
    ownerRole: "Shared",
    description:
      "AWWA C800 standard covering underground service line fittings including corporation stops, curb stops, and service saddles. Reference for JCM Model 400-series (DI Service Saddle) and 406 (SS Service Saddle) dimensional and pressure compliance.",
  },

  // ── WELDING / FAB ─────────────────────────────────────────────────────────────
  {
    id: "doc-wps-cs",
    title: "WPS — Carbon Steel Welding Procedure (GMAW)",
    department: "Fab",
    category: "Manual",
    status: "Available",
    ownerRole: "Lead / Engineer",
    description:
      "Welding Procedure Specification for ASTM A516 Gr.70 carbon steel plate. Applies to CS Tapping Sleeve (Model 415) and Fabricated Repair Sleeve. Covers joint design, preheat requirements, filler metal classification (ER70S-6), and CWI sign-off requirements.",
  },
  {
    id: "doc-wps-ss",
    title: "WPS — Stainless Steel Welding Procedure (GTAW)",
    department: "Fab",
    category: "Manual",
    status: "Available",
    ownerRole: "Lead / Engineer",
    description:
      "Welding Procedure Specification for 304/316 stainless steel construction. Applies to SS Tapping Sleeve (Model 432) and SS Service Saddle (Model 406). Covers GTAW process, ER308/ER316L filler, purge gas requirements, and discoloration acceptance criteria.",
  },
  {
    id: "doc-cwi-checklist",
    title: "CWI Weld Inspection Checklist",
    department: "Fab",
    category: "Inspection",
    status: "Available",
    ownerRole: "Shared",
    description:
      "Certified Welding Inspector (CWI) pre-release checklist. Required before any fabricated weld assembly moves to Coating or Assembly. Covers visual inspection, dimensional verification, discontinuity acceptance per AWS D1.1, and release signature.",
  },

  // ── COATING ───────────────────────────────────────────────────────────────────
  {
    id: "doc-coating-sop",
    title: "Powercron 590-534 Epoxy Coating SOP",
    department: "Coating",
    category: "Manual",
    status: "Available",
    ownerRole: "Lead / Engineer",
    description:
      "Standard Operating Procedure for applying Powercron 590-534 fusion-bonded epoxy coating per NSF 61 requirements. Covers surface blast prep (SSPC-SP6 minimum), application thickness (10–14 mils DFT), cure time at ambient temperature, and move-hold requirements before handling.",
  },
  {
    id: "doc-coating-cure",
    title: "Coating Cure Time Reference Chart",
    department: "Coating",
    category: "Setup Guide",
    status: "Available",
    ownerRole: "Operator",
    description:
      "Temperature-dependent cure time table for Powercron 590-534 epoxy. Parts MUST reach full cure before moving to QA or Assembly. Do not stack or contact coated surfaces until cure is confirmed. Reference ambient temp vs. minimum hold time.",
  },

  // ── ASSEMBLY ─────────────────────────────────────────────────────────────────
  {
    id: "doc-gasket-guide",
    title: "Gasket Selection Guide — NBR vs EPDM",
    department: "Assembly",
    category: "Setup Guide",
    status: "Available",
    ownerRole: "Shared",
    description:
      "Gasket material selection for JCM fittings. NBR (Nitrile) for standard water service; EPDM for chemical resistance and high-temp applications. Identifies correct size and hardness by product family. Mixing gasket types is a critical non-conformance — do not substitute without QA approval.",
  },
  {
    id: "doc-torque-spec",
    title: "Hardware Torque Specification — All Fittings",
    department: "Assembly",
    category: "Setup Guide",
    status: "Available",
    ownerRole: "Operator",
    description:
      "Torque values (ft-lbs) for T-bolts and hex bolts by coupling size and material (DI, CS, SS). Required reference for all assembly bench technicians. Under-torque causes leaks; over-torque cracks flanges. Must be verified with calibrated torque wrench before QA handoff.",
  },
  {
    id: "doc-coupling-assembly",
    title: "Coupling Assembly Procedure — Model 101/102 UCC",
    department: "Assembly",
    category: "Setup Guide",
    status: "Available",
    ownerRole: "Operator",
    description:
      "Step-by-step assembly instructions for JCM Universal Couplings and Clamps. Covers middle ring placement, gasket seating, T-bolt alignment, and final torque sequence. Applies to single-band (101) and multi-band (102) variants across all pipe sizes.",
  },

  // ── MACHINE SHOP ─────────────────────────────────────────────────────────────
  {
    id: "doc-lv4500-macro",
    title: "LV4500 JCM Macro Suite Reference",
    department: "Saddles Dept",
    machineId: "7",
    category: "Program / Macro",
    status: "Available",
    ownerRole: "Lead / Engineer",
    description:
      "Reference for O0001 setup menu, O0002 logic commander, O8000 bore prep, O9000 thread engine, and O8888 warm-up. Used to configure saddle boring and tapping for DI and SS service saddle orders.",
  },
  {
    id: "doc-lv4500-fixture",
    title: "LV4500 Fixture Clearance Guide",
    department: "Saddles Dept",
    machineId: "7",
    category: "Setup Guide",
    status: "Available",
    ownerRole: "Operator",
    description:
      "Hard reminder that simulated prep/thread depth near the 1.5-inch top-of-part to fixture limit must be treated as high risk. Verify in JCM simulator before running.",
  },
  {
    id: "doc-tap-code-reference",
    title: "JCM Casting / Tap Code Reference",
    department: "Saddles Dept",
    machineId: "7",
    category: "Simulation",
    status: "Available",
    ownerRole: "Shared",
    description:
      "Reference for casting validation, small boss restrictions, tap code routing, and simulator audit checks. Small boss castings only permit approved lower tap codes — validate before machining.",
  },
  {
    id: "doc-kh80-setup",
    title: "KH80 Heavy Roughing Setup Notes",
    department: "Machine Shop",
    machineId: "1",
    category: "Setup Guide",
    status: "Placeholder",
    ownerRole: "Operator",
    description:
      "Placeholder for spindle load trends, heavy roughing tool condition, entry engagement notes, and alarm recovery checks specific to DI Coupling and sleeve body machining.",
  },
  {
    id: "doc-yama-setup",
    title: "Yama Touch-off / Offset Guide",
    department: "Machine Shop",
    machineId: "3",
    category: "Setup Guide",
    status: "Placeholder",
    ownerRole: "Operator",
    description:
      "Placeholder for setup-sensitive touch-off notes, reused offset warnings, heavy tool alignment, and Z0 verification for turning operations.",
  },
  {
    id: "doc-fleet-pm",
    title: "Machine Fleet PM Reference",
    department: "Machine Shop",
    category: "Maintenance",
    status: "Placeholder",
    ownerRole: "Maintenance",
    description:
      "Placeholder for PM sheets, lubrication schedules, coolant checks, recurring problems, and weekly/monthly inspection items for all CNC and manual machines.",
  },

  // ── MATERIAL HANDLING ────────────────────────────────────────────────────────
  {
    id: "doc-material-cut-file",
    title: "Material Handling Cut File Reference",
    department: "Material Handling",
    category: "Program / Macro",
    status: "Needs Upload",
    ownerRole: "Shared",
    description:
      "Future location for plasma, laser, roll, and material handling program/file readiness references for CS and SS plate stock.",
  },
  {
    id: "doc-plasma-consumables",
    title: "Plasma / Laser Consumable Checklist",
    department: "Material Handling",
    category: "Maintenance",
    status: "Placeholder",
    ownerRole: "Maintenance",
    description:
      "Checklist for nozzle, torch, and optics condition. Tracks cut quality issues and consumable replacement intervals for plasma and laser cutting equipment.",
  },

  // ── SHOP PRINTS ───────────────────────────────────────────────────────────────
  {
    id: "doc-print-library",
    title: "Shop Print Library",
    department: "Machine Shop",
    category: "Print",
    status: "Needs Upload",
    ownerRole: "Shared",
    description:
      "Future location for engineering prints tied to machine, part family, setup, and simulator workflows. Will cover all JCM product models: 101, 102, 401, 406, 415, 432, 801.",
  },
];
