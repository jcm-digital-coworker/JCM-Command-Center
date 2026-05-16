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
    title: 'Canonical Context',
    items: [
      'docs/CURRENT_CONTEXT.md is the source of truth for current repo state.',
      'docs/LATEST_ACTION_RUN.md is the source of truth for latest recorded build state.',
      'New chats should read both docs before proposing or changing code.',
      'The in-app context page is a quick pointer, not a second memory source.',
    ],
  },
  {
    title: 'Current Stable State',
    items: [
      'Main is green and deployed at 6c104d7c with run 25942778604.',
      'LV4500 simulator is a selected-cycle estimator, not an auto tap demo.',
      'LV4500 displayed cycle time is anchored to the time-study chart baseline.',
      'LV4500 selected cycle uses casting/body, outlet/tap, batch target, boss type, and optional Z-depth override.',
      'Z-depth override now applies a deterministic default-vs-override depth time delta and reports the delta in seconds.',
      'DEV toolkit is one bottom-right floating DEV button and is available on work-center detail pages.',
    ],
  },
  {
    title: 'Next Mission',
    items: [
      'Smoke test the live LV4500 timing estimator.',
      'Confirm RUN SELECTED CYCLE only runs current casting/tap/Z-depth/batch.',
      'Confirm single-cycle time, batch total, batch hours, geometry, and Z-depth time delta update for the selected setup.',
      'Polish display precision so the Single Cycle tile shows minutes plus seconds or two decimals.',
      'Delete or clearly deprecate Lv4500JcmSimulatorV2 if it is unused.',
    ],
  },
  {
    title: 'Core App Rules',
    items: [
      'Guidance > Control',
      'Structured selections > free text',
      'Selections drive logic; notes explain exceptions',
      'App.tsx mostly routes',
      'Pages compose',
      'Logic modules think',
      'Components display',
      'LV4500 simulator is read-only and must not create real machine command behavior',
    ],
  },
];

export const warRoomContextBlocks: WarRoomContextBlock[] = [
  {
    id: 'startup-instruction',
    title: 'New Chat Startup',
    body: `Read these files first from main:

1. docs/CURRENT_CONTEXT.md
2. docs/LATEST_ACTION_RUN.md

Then inspect the specific target file for the current task. Do not rely on memory or old handoff templates.`,
  },
  {
    id: 'protected-files',
    title: 'Protected Shared Files',
    body: `Handle these carefully and avoid large rewrites unless the task specifically requires them:

- src/App.tsx
- src/components/shell/AppDrawer.tsx
- src/components/shell/AppHeader.tsx
- src/components/shell/DevToolkitFlyout.tsx
- src/components/Lv4500JcmSimulator.tsx`,
  },
  {
    id: 'current-target',
    title: 'Current Target',
    body: `Smoke test the LV4500 timing estimator:

- Open Simulation -> LV4500R
- Confirm casting/body, outlet/tap, batch target, and Z-depth override are visible
- Run selected cycle only
- Confirm single-cycle and batch-time estimates update
- Confirm geometry and G76 values reflect the selected setup
- Confirm Z-depth time delta appears in the notes and changes when override depth changes

Then polish display precision and retire/deprecate the unused V2 simulator component.`,
  },
];
