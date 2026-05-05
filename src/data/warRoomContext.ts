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
      'DEV toolkit is one bottom-right floating DEV button.',
      'Receiving gate page is active through the stable ReceivingPage.ts shim.',
      'Receiving entrypoint cleanup is parked until intentionally requested.',
      'Codespaces is configured with .devcontainer/devcontainer.json.',
    ],
  },
  {
    title: 'Next Mission',
    items: [
      'Dynamic traveler integration and department card consistency.',
      'Start with src/pages/departments/DepartmentPageTools.tsx.',
      'Audit before coding: GREEN traveler-driven, YELLOW partial, RED local status logic.',
      'Patch the smallest safe bundle after the audit is clear.',
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
- src/components/shell/DevToolkitFlyout.tsx`,
  },
  {
    id: 'current-target',
    title: 'Current Target',
    body: `Dynamic traveler integration should begin with an audit of:

- src/pages/departments/DepartmentPageTools.tsx
- src/logic/dynamicTraveler.ts
- src/logic/orderStatusTruth.ts

Return GREEN / YELLOW / RED findings before making code changes.`,
  },
];
