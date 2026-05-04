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

  // ── JCM ENGINEERING MANUAL ────────────────────────────────────────────────────
  {
    id: "doc-engineering-manual",
    title: "JCM Engineering Manual",
    department: "Engineering",
    category: "Manual",
    status: "Available",
    ownerRole: "Lead / Engineer",
    description:
      "JCM's primary engineering reference covering product design criteria, dimensional standards, pressure ratings, and application guidance for repair, connection, branching, and engineered fitting families. Reference for all engineered-to-order work and non-standard pipe diameter applications.",
  },
  {
    id: "doc-hdpe-manual",
    title: "JCM High Density Polyethylene Pipe Fittings Manual",
    department: "Engineering",
    category: "Manual",
    status: "Available",
    ownerRole: "Lead / Engineer",
    description:
      "Application and installation guide for JCM HDPE pipe fittings. Covers product selection, pipe OD tolerance ranges, thrust restraint requirements, and compatibility with HDPE distribution pipe. Reference for any order specifying HDPE pipe material.",
  },

  // ── PRODUCT CATALOG / PRICE BOOK ──────────────────────────────────────────────
  {
    id: "doc-product-catalog",
    title: "JCM Product Catalog",
    department: "Sales",
    category: "Reference",
    status: "Available",
    ownerRole: "Shared",
    description:
      "Full JCM product catalog covering all product lines: Repair Fittings (100-series), Connection Fittings (200-300-series), Branching Fittings / Service Saddles and Tapping Sleeves (400-500-series), Restrainers (600-series), and Engineered / Pipe Fabrications (800-900-series). Reference for model number lookup, size ranges, and product family assignment.",
  },
  {
    id: "doc-price-book",
    title: "Current Price Book",
    department: "Sales",
    category: "Reference",
    status: "Available",
    ownerRole: "Lead / Engineer",
    description:
      "Current JCM price book (PDF and Excel). Used by Sales for order quoting. Reference for standard product pricing by model, size, and material. Not for shop floor use — applies to Sales and Office order intake workflow.",
  },

  // ── COMPLIANCE / CERTIFICATIONS ────────────────────────────────────────────────
  {
    id: "doc-ais-buy-american",
    title: "American Iron and Steel (AIS) / Buy American Compliance Guide",
    department: "QA",
    category: "Inspection",
    status: "Available",
    ownerRole: "Shared",
    description:
      "JCM's AIS / Buy American Act compliance documentation. Required for federally funded water infrastructure projects (EPA, USDA Rural Development, FHWA). All steel and iron products used in JCM fittings must meet AIS requirements when specified by the customer. Reference for QA cert packet when AIS compliance is required on an order.",
  },
  {
    id: "doc-industry-crossref",
    title: "Industry Cross Reference Chart",
    department: "Sales",
    category: "Reference",
    status: "Available",
    ownerRole: "Shared",
    description:
      "JCM model cross-reference chart comparing JCM products to competitor and industry-standard model numbers. Used by Sales and Engineering to match customer specifications to the correct JCM product family and model. Relevant for engineered orders where a customer specifies a non-JCM part number.",
  },

  // ── INSTALLATION INSTRUCTIONS ─────────────────────────────────────────────────
  {
    id: "doc-install-service-saddle",
    title: "Service Saddle Installation Instructions — 401/402/403/404 Series",
    department: "Assembly",
    category: "Setup Guide",
    status: "Available",
    ownerRole: "Operator",
    description:
      "Step-by-step installation guide for JCM DI service saddles (single-strap, double-strap, wide-body). Covers pipe surface preparation, saddle seating, strap torque sequence, and outlet drilling procedure. Required reference for Assembly technicians on saddle orders.",
  },
  {
    id: "doc-install-tapping-sleeve",
    title: "Tapping Sleeve Installation Instructions — 412/414/432/452 Series",
    department: "Assembly",
    category: "Setup Guide",
    status: "Available",
    ownerRole: "Operator",
    description:
      "Installation guide for carbon steel and stainless steel tapping sleeves. Covers pipe size verification, gasket seating, bolt torque pattern, and outlet branch connection. Applies to plain outlet, MJ outlet, and threaded outlet variants. Reference for Assembly and QA on tapping sleeve orders.",
  },
  {
    id: "doc-install-ucc",
    title: "UCC / Repair Clamp Installation Instructions — 101/102/131/132 Series",
    department: "Assembly",
    category: "Setup Guide",
    status: "Available",
    ownerRole: "Operator",
    description:
      "Installation instructions for JCM Universal Clamp Couplings (single-band 101, multi-band 102) and stainless variants (131, 132). Covers pipe surface requirements, middle ring and gasket placement, T-bolt positioning, and final torque specification. Required reference for all UCC and repair clamp assembly work.",
  },
  {
    id: "doc-product-specs",
    title: "Product Specifications — All Series",
    department: "QA",
    category: "Reference",
    status: "Available",
    ownerRole: "Shared",
    description:
      "JCM product specifications library covering dimensional data, pressure ratings, pipe size ranges (1/2\" through 144\"+ for engineered products), and material specifications for all model families. Reference for QA dimensional verification, engineering review, and customer submittal packages.",
  },
];
