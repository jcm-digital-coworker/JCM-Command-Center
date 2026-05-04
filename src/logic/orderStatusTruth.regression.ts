import assert from 'node:assert/strict';
import {
  isBlockedProductionOrder,
  isClosedProductionStatus,
  isMaterialActionNeeded,
  isMaterialIssueStatus,
  isRunnableProductionOrder,
  normalizeOrderToken,
} from './orderStatusTruth.ts';

const cleanOrder = {
  status: 'READY',
  flowStatus: 'RUNNABLE',
  blockers: [],
} as const;

assert.equal(normalizeOrderToken(' running '), 'RUNNING');
assert.equal(isClosedProductionStatus('DONE'), true);
assert.equal(isClosedProductionStatus('complete'), true);
assert.equal(isClosedProductionStatus('completed'), true);
assert.equal(isClosedProductionStatus('RUNNING'), false);

assert.equal(isBlockedProductionOrder({ status: 'READY', flowStatus: 'BLOCKED', blockers: [] }), true);
assert.equal(isBlockedProductionOrder({ status: 'blocked', flowStatus: 'RUNNABLE', blockers: [] }), true);
assert.equal(isBlockedProductionOrder({ status: 'READY', flowStatus: 'RUNNABLE', blockers: [{ type: 'process', message: 'fixture review' }] }), true);
assert.equal(isBlockedProductionOrder(cleanOrder), false);

assert.equal(isRunnableProductionOrder(cleanOrder), true);
assert.equal(isRunnableProductionOrder({ status: 'RUNNING', flowStatus: 'RUNNABLE', blockers: [] }), true);
assert.equal(isRunnableProductionOrder({ status: 'READY', flowStatus: 'BLOCKED', blockers: [] }), false);

assert.equal(isMaterialIssueStatus('STAGED'), false);
assert.equal(isMaterialIssueStatus('RECEIVED'), false);
assert.equal(isMaterialIssueStatus('UNKNOWN'), false);
assert.equal(isMaterialIssueStatus('MISSING'), true);
assert.equal(isMaterialActionNeeded('MISSING'), true);
assert.equal(isMaterialActionNeeded('NOT_RECEIVED'), true);
assert.equal(isMaterialActionNeeded('ORDER_REQUIRED'), true);
assert.equal(isMaterialActionNeeded('STAGED'), false);

console.log('order status truth regression checks passed');
