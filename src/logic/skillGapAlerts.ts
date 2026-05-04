import type { Department } from '../types/machine';
import type { CoveragePerson } from '../types/coverage';
import type { WorkerSkill } from '../types/worker';
import type { ProductionOrder } from '../types/productionOrder';

const SKILL_TAG_KEYWORDS: Record<WorkerSkill, string[]> = {
  receiving: ['receiving', 'driver dispatch', 'intake'],
  material_handling: ['forklift', 'put-away', 'material handling', 'material staging', 'material delivery'],
  machine_operation: ['CNC', 'KH80', 'LV4500', 'Yama', 'turning', 'offset setup', 'saddle boring', 'thread tapping', 'machining', 'coupling bores', 'heavy roughing'],
  welding: ['welding', 'GMAW', 'GTAW', 'weld'],
  fitting: ['fitting', 'fit-up'],
  assembly: ['assembly', 'torque', 'gasket'],
  shipping: ['shipping', 'loading', 'freight', 'dock'],
  maintenance: ['maintenance', 'electrical', 'hydraulic'],
  quality_check: ['weld inspection', 'CWI', 'inspection', 'quality'],
  leadership: ['leadership', 'lead', 'supervisor'],
};

function personHasSkill(person: CoveragePerson, skill: WorkerSkill): boolean {
  const keywords = SKILL_TAG_KEYWORDS[skill];
  return person.skillTags.some((tag) =>
    keywords.some((kw) => tag.toLowerCase().includes(kw.toLowerCase()))
  );
}

export interface SkillGapAlert {
  skill: WorkerSkill;
  orderNumbers: string[];
  suggestions: string[];
}

export function getSkillGapAlerts(
  department: Department,
  orders: ProductionOrder[],
  coverage: CoveragePerson[],
): SkillGapAlert[] {
  const deptOrders = orders.filter(
    (o) => o.currentDepartment === department &&
      String(o.flowStatus).toLowerCase() !== 'blocked',
  );
  if (deptOrders.length === 0) return [];

  const availableCrew = coverage.filter(
    (p) => p.department === department && p.status === 'AVAILABLE',
  );

  const requiredSkillsMap = new Map<WorkerSkill, string[]>();
  for (const order of deptOrders) {
    for (const skill of order.requiredSkills) {
      if (!requiredSkillsMap.has(skill)) requiredSkillsMap.set(skill, []);
      requiredSkillsMap.get(skill)!.push(order.orderNumber);
    }
  }

  const gaps: SkillGapAlert[] = [];
  for (const [skill, orderNumbers] of requiredSkillsMap.entries()) {
    const covered = availableCrew.some((p) => personHasSkill(p, skill));
    if (!covered) {
      const suggestions = coverage
        .filter((p) => p.status === 'AVAILABLE' && p.department !== department && personHasSkill(p, skill))
        .map((p) => p.name)
        .slice(0, 3);
      gaps.push({ skill, orderNumbers, suggestions });
    }
  }
  return gaps;
}
