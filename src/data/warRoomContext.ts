export type WarRoomStatus = 'complete' | 'active' | 'next' | 'risk';

export interface WarRoomContextSection {
  title: string;
  items: string[];
}

export interface WarRoomContext {
  updatedAt: string;
  currentMission: string;
  lastCompleted: string;
  nextTarget: string;
  status: WarRoomStatus;
  doctrine: string[];
  knownFailureModes: string[];
  systemState: WarRoomContextSection[];
  updateTriggers: string[];
  codeTentHandoffRules: string[];
  activeRisks: string[];
}

export const warRoomContext: WarRoomContext = {
  updatedAt: '2026-04-29',
  currentMission: 'War Room Context / Context Reducer System V1',
  lastCompleted: 'APP-TSX LEGACY STATE CLEANOUT: no patch required; App.tsx reported clean by Code Tent, but latest zip contained duplicate src/src and required source-package cleanup.',
  nextTarget: 'Crew Guidance Depth V1 after context reliability is locked.',
  status: 'active',
  doctrine: [
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
  knownFailureModes: [
    'Duplicate src folders',
    'Full zip overwrites',
    'Free-text data poisoning',
    'Import/path drift',
    'Chat context overload',
    'War Room / Code Tent coordination drift',
  ],
  systemState: [
    {
      title: 'Foundation',
      items: [
        'Plant-first Command Center established',
        'Command Mode navigation active',
        'Department pages active for Receiving, Material Handling, Fab, Coating, Assembly, Shipping, and QA',
      ],
    },
    {
      title: 'Data Integrity',
      items: [
        'Structured selection system mostly implemented',
        'Major free-text removal complete',
        'Other fallback controlled',
      ],
    },
    {
      title: 'Logic',
      items: [
        'Flow logic active for runnable vs blocked work',
        'Crew guidance introduced and partially integrated',
        'Orders system functional',
      ],
    },
    {
      title: 'Stability',
      items: [
        'Build previously reported as running',
        'Imports mostly clean',
        'Latest package cleanup removed duplicate src/src from exported source',
      ],
    },
  ],
  updateTriggers: [
    'Update this file when a mission completes',
    'Update before exporting a new project zip',
    'Update when chat context feels heavy',
    'Update before starting a major new task',
  ],
  codeTentHandoffRules: [
    'Patch only unless a full snapshot is explicitly requested',
    'No duplicate src folders',
    'No feature drift',
    'No full zip overwrite into an existing project',
    'Preserve working systems unless mission explicitly changes them',
    'Return files changed, summary, risks/unknowns, and validation/build status',
  ],
  activeRisks: [
    'Crew guidance is still shallow and needs dependency-aware logic',
    'Context can get too heavy unless regularly compressed into this file',
    'Zip exports must be inspected before use because duplicate src has occurred',
  ],
};
