import type { Department } from '../types/machine';

export type DepartmentMaterial = {
  partNumber: string;
  description: string;
  unit: string;
};

export const departmentMaterialCatalog: Record<Department, DepartmentMaterial[]> = {
  Receiving: [],
  'Machine Shop': [
    { partNumber: 'RAW-4140-RD-2.000', description: '4140 round bar, 2.000 in', unit: 'ft' },
    { partNumber: 'RAW-1018-RD-1.500', description: '1018 cold rolled round, 1.500 in', unit: 'ft' },
    { partNumber: 'RAW-DI-CAST-SADDLE', description: 'Ductile iron saddle casting', unit: 'ea' },
    { partNumber: 'RAW-PLATE-0.750', description: 'Carbon steel plate, 0.750 in', unit: 'sq ft' },
  ],
  'Material Handling': [
    { partNumber: 'PLATE-A36-0.500', description: 'A36 plate, 0.500 in', unit: 'sheet' },
    { partNumber: 'PLATE-A36-0.750', description: 'A36 plate, 0.750 in', unit: 'sheet' },
    { partNumber: 'PIPE-BLANK-6IN', description: '6 in pipe blank stock', unit: 'ea' },
    { partNumber: 'LASER-CONSUMABLE-KIT', description: 'Laser table consumable kit', unit: 'kit' },
  ],
  Fab: [
    { partNumber: 'WELD-WIRE-045', description: 'MIG wire, 0.045 in', unit: 'spool' },
    { partNumber: 'GAS-MIX-75-25', description: '75/25 shielding gas cylinder', unit: 'cyl' },
    { partNumber: 'PLATE-A36-0.375', description: 'A36 plate, 0.375 in', unit: 'sheet' },
    { partNumber: 'BRACKET-KIT-FAB', description: 'Fab bracket kit', unit: 'kit' },
  ],
  Assembly: [
    { partNumber: 'BOLT-KIT-400', description: '400 series bolt kit', unit: 'kit' },
    { partNumber: 'GASKET-STD-400', description: '400 series gasket', unit: 'ea' },
    { partNumber: 'COMPONENT-MACHINED-SADDLE', description: 'Machined saddle component', unit: 'ea' },
    { partNumber: 'LABEL-PACK-ASSY', description: 'Assembly label pack', unit: 'pack' },
  ],
  'Saddles Dept': [
    { partNumber: 'CAST-400-SADDLE', description: '400 series saddle casting', unit: 'ea' },
    { partNumber: 'TAP-GAUGE-NPT', description: 'NPT thread gauge kit', unit: 'kit' },
    { partNumber: 'BOLT-KIT-SADDLE', description: 'Saddle bolt kit', unit: 'kit' },
  ],
  'Patch Clamps': [
    { partNumber: 'CLAMP-BAND-PC', description: 'Patch clamp band', unit: 'ea' },
    { partNumber: 'GASKET-PC', description: 'Patch clamp gasket', unit: 'ea' },
    { partNumber: 'HARDWARE-PC-KIT', description: 'Patch clamp hardware kit', unit: 'kit' },
  ],
  Clamps: [
    { partNumber: 'CLAMP-BAND-STD', description: 'Standard clamp band', unit: 'ea' },
    { partNumber: 'GASKET-CLAMP-STD', description: 'Standard clamp gasket', unit: 'ea' },
    { partNumber: 'HARDWARE-CLAMP-KIT', description: 'Clamp hardware kit', unit: 'kit' },
  ],
  Coating: [
    { partNumber: 'MEDIA-BLAST-STD', description: 'Blast media / shot', unit: 'bag' },
    { partNumber: 'PAINT-ENAMEL-STD', description: 'Enamel coating material', unit: 'gal' },
    { partNumber: 'POWDER-PLASTIC-DIP', description: 'Plastic dip coating powder', unit: 'bag' },
  ],
  QA: [
    { partNumber: 'GAUGE-CHECK-STD', description: 'Inspection gauge / verification tool', unit: 'ea' },
    { partNumber: 'TAG-QA-HOLD', description: 'QA hold tag', unit: 'pack' },
  ],
  Shipping: [
    { partNumber: 'PALLET-STD', description: 'Standard shipping pallet', unit: 'ea' },
    { partNumber: 'WRAP-STRETCH', description: 'Stretch wrap roll', unit: 'roll' },
    { partNumber: 'BANDING-KIT', description: 'Banding supplies kit', unit: 'kit' },
  ],
  Maintenance: [
    { partNumber: 'HYD-OIL-ISO46', description: 'Hydraulic oil ISO 46', unit: 'gal' },
    { partNumber: 'WAY-LUBE-68', description: 'Way lube 68', unit: 'gal' },
    { partNumber: 'AIR-FILTER-STD', description: 'Standard air filter', unit: 'ea' },
  ],
  Office: [
    { partNumber: 'OFFICE-PAPER-CASE', description: 'Printer paper case', unit: 'case' },
    { partNumber: 'TONER-BLACK', description: 'Black printer toner', unit: 'ea' },
    { partNumber: 'PENS-BLUE-BOX', description: 'Blue pens box', unit: 'box' },
  ],
};

export function getMaterialsForDepartment(department: Department): DepartmentMaterial[] {
  return departmentMaterialCatalog[department] ?? [];
}

export function getMaterialLabel(material: DepartmentMaterial): string {
  return `${material.partNumber} - ${material.description} (${material.unit})`;
}
