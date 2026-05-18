import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();

const checks = [
  {
    name: 'Pilot Tools exposes RESET DEMO SESSION',
    file: 'src/components/shell/DevToolkitFlyout.tsx',
    includes: ['RESET DEMO SESSION', 'resetDemoSessionState()', "detail: { tab: 'dashboard' }"]
  },
  {
    name: 'Demo reset clears drift-prone browser state',
    file: 'src/logic/demoSessionReset.ts',
    includes: [
      'jcm-classification-review-target-v1',
      'jcm_workflow_runtime_state',
      'jcm_workflow_action_log',
      'jcm_plant_simulation_session',
      'jcm_maintenance_requests',
      'clearWorkCenterQueryParam',
      'DEMO_SESSION_RESET_EVENT'
    ]
  },
  {
    name: 'Sticky Mission Bar keeps command navigation visible',
    file: 'src/components/shell/StickyMissionBar.tsx',
    includes: ['position: \'sticky\'', 'COMMAND', 'ORDERS', 'MENU', 'BACK']
  },
  {
    name: 'App shell mounts Sticky Mission Bar in normal and work-center views',
    file: 'src/App.tsx',
    includes: ['<StickyMissionBar', 'goCommandCenter', 'selectedWorkCenter={selectedWorkCenter}', 'selectedWorkCenter={null}']
  },
  {
    name: 'Accountability triage is wired above department health',
    file: 'src/components/dashboard/DeptHealthTilesPanel.tsx',
    includes: ['RoleAccountabilityPanel', 'getDashboardAccountabilitySignals', 'roleView={roleView}', 'signals={accountabilitySignals}']
  },
  {
    name: 'Accountability signals show ownership and next safe action',
    file: 'src/logic/accountabilitySignals.ts',
    includes: ['owningDepartment', 'neededNext', 'safeAction', 'proofLine', 'getAudienceForRole']
  },
  {
    name: 'Hold-location target is consumed after traveler opens',
    file: 'src/components/WorkCenterWorkflowPanelV2.tsx',
    includes: ['localStorage.removeItem(REVIEW_TARGET_STORAGE_KEY)', 'setReviewTargetVersion', 'REVIEW_TARGET_EVENT']
  },
  {
    name: 'Focus Mode exists for targeted hold-location landings',
    file: 'src/components/WorkCenterWorkflowPanelV2.tsx',
    includes: ['FOCUS MODE - OPENED FROM HOLD LOCATION', 'landingFocusTraveler', 'This focus panel does not clear holds']
  }
];

let failures = 0;

for (const check of checks) {
  const absolutePath = resolve(root, check.file);
  let content = '';
  try {
    content = readFileSync(absolutePath, 'utf8');
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${check.name}`);
    console.error(`  Missing file: ${check.file}`);
    continue;
  }

  const missing = check.includes.filter((needle) => !content.includes(needle));
  if (missing.length > 0) {
    failures += 1;
    console.error(`FAIL ${check.name}`);
    for (const needle of missing) console.error(`  Missing: ${needle}`);
    continue;
  }

  console.log(`PASS ${check.name}`);
}

if (failures > 0) {
  console.error(`\nDemo smoke regression failed: ${failures} check${failures === 1 ? '' : 's'} failed.`);
  process.exit(1);
}

console.log('\nDemo smoke regression passed.');
