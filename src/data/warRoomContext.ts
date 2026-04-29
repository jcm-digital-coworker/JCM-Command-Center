export type WarRoomContextSection = {
  title: string;
  items: string[];
};

export type WarRoomContextBlock = {
  id: string;
  title: string;
  body: string;
};

export const warRoomContextSections: WarRoomContextSection[] = [
  {
    title: 'Core Laws',
    items: [
      'Guidance > Control',
      'Structured selections > free text',
      'Selections drive logic; notes explain exceptions',
      'Global command = mission visibility',
      'Department views = local action',
      'App.tsx routes only',
      'Pages compose',
      'Modules think',
      'Components display',
    ],
  },
  {
    title: 'System Model',
    items: [
      'Plant-first Command Center',
      'Department-specific action pages: Receiving, Fab, Coating, Assembly, Shipping, QA, Material Handling',
      'Flow-driven decisions: what can run vs blocked',
      'Crew Guidance integrated into departments: who is needed where',
      'Structured selection inputs tied to real plant data: workers, assets, orders',
    ],
  },
  {
    title: 'Execution Rules',
    items: [
      'Patch only unless a full zip is explicitly ordered',
      'Do not create duplicate src folders',
      'Do not wrap the project in another folder',
      'Do not overwrite root blindly',
      'Keep changes surgical and stable',
      'Prefer patch-style updates over full rewrites',
      'Call out bad ideas or weak logic directly',
      'Maintain mobile-first simplicity',
      'Always tie UI to real plant behavior',
    ],
  },
  {
    title: 'Current Architecture Direction',
    items: [
      'src/modules/command',
      'src/modules/orders',
      'src/modules/flow',
      'src/modules/crew',
      'src/modules/departments',
      'src/modules/maintenance',
      'src/modules/plant',
    ],
  },
];

export const warRoomContextBlocks: WarRoomContextBlock[] = [
  {
    id: 'war-room-handoff',
    title: 'War Room Handoff Template',
    body: `JCM Command Center Project

We are building a plant-wide command system, not a machine dashboard.

Core Laws:
- Guidance > Control
- Structured selections > free text
- Selections drive logic, notes explain exceptions
- Global command = mission visibility
- Department views = local action
- App.tsx routes only
- Pages compose
- Modules think
- Components display

System Model:
- Plant-first Command Center
- Department-specific action pages (Receiving, Fab, Coating, Assembly, Shipping, QA, Material Handling)
- Flow-driven decisions (what can run vs blocked)
- Crew Guidance integrated into departments (who is needed where)
- Structured selection inputs tied to real data (workers, assets, orders)

Current Architecture Direction:
- Moving toward modular structure:
  src/modules/
    command/
    orders/
    flow/
    crew/
    departments/
    maintenance/
    plant/

Current Focus:
[INSERT CURRENT TASK HERE]

Expectations:
- Keep changes surgical and stable
- No breaking working systems unless necessary
- Prefer patch-style updates over full rewrites
- Call out bad ideas or weak logic directly
- Maintain mobile-first simplicity
- Always tie UI to real plant behavior

Here is the latest project zip:
[ATTACH ZIP]`,
  },
  {
    id: 'code-tent-rules',
    title: 'Code Tent Rules',
    body: `You are the Code Tent.

Your role:
Execute, not design.

Default delivery method:
PATCH ONLY.

Execution Rules:
- Follow the mission exactly
- Do not expand scope
- Do not introduce new ideas
- Do not redesign without instruction
- Protect stability
- Do not break working systems
- If risk exists, isolate changes
- Prefer patch-style updates over full rewrites

Structure Rules:
- App.tsx -> routing only
- Pages -> composition only
- Logic -> in /logic or modules
- Data -> in /data
- Components -> reusable UI only

Validation Before Delivery:
- Only one src directory exists
- Imports resolve correctly
- No duplicate folders introduced
- npm run build passes

Mission Priority:
Correct > Stable > Clean > Safe integration`,
  },
  {
    id: 'war-room-report-template',
    title: 'War Room Report Template',
    body: `JCM COMMAND CENTER - WAR ROOM REPORT
MISSION: [MISSION NAME]

MISSION OBJECTIVE:
[OBJECTIVE]

RESULT:
[RESULT]

FILES AFFECTED:
[FILES]

SYSTEM INTEGRITY:
- Command Mode navigation: [STATUS]
- Orders: [STATUS]
- Flow: [STATUS]
- Crew Guidance: [STATUS]
- Maintenance: [STATUS]
- QA / Safety: [STATUS]
- Department pages: [STATUS]

STRUCTURE VALIDATION:
- Single src directory: [STATUS]
- No duplicate src/src: [STATUS]
- Imports: [STATUS]

BUILD STATUS:
[BUILD RESULT]

RISK ASSESSMENT:
[RISK]

RECOMMENDATION:
[NEXT ACTION]

CODE TENT STATUS:
[STATUS]`,
  },
];
