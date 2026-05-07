import type { Language } from './language';
import type { AppTab } from '../types/app';
import type { NavigationGroupId } from '../logic/navigationAccess';

export type TranslationKey =
  // Settings / chrome
  | 'settings' | 'theme' | 'language' | 'dark' | 'light' | 'english' | 'spanish'
  | 'close' | 'menu' | 'back' | 'home'
  | 'commandNavigation' | 'workCenters' | 'allDepartments' | 'nashTexas'
  // Nav group names
  | 'navCommand' | 'navProduction' | 'navDepartments' | 'navWorkflow' | 'navTools'
  // Nav group short descriptions
  | 'navDescCommand' | 'navDescProduction' | 'navDescDepartments' | 'navDescWorkflow' | 'navDescTools'
  // Tab labels
  | 'tabDashboard' | 'tabWorkflow' | 'tabMachines' | 'tabAlerts' | 'tabSimulation'
  | 'tabMaintenance' | 'tabReceiving' | 'tabCoverage' | 'tabOrders' | 'tabPlantMap'
  | 'tabSales' | 'tabEngineering' | 'tabDocuments' | 'tabRisk' | 'tabShiftHandoff'
  | 'tabKanban' | 'tabWarRoomContext' | 'tabMaterialHandling' | 'tabFab' | 'tabCoating'
  | 'tabAssembly' | 'tabShipping' | 'tabQa' | 'tabSaddles' | 'tabMachineShop'
  // Home button suffixes
  | 'homeWorkflow' | 'homeMaintenance' | 'homeReceiving' | 'homeQASafety' | 'homeCommand'
  // Misc
  | 'alert' | 'alerts' | 'pagesSuffix' | 'itemsSuffix';

const dict: Record<TranslationKey, Record<Language, string>> = {
  // Settings
  settings:           { en: 'Settings',            es: 'Configuración' },
  theme:              { en: 'Theme',                es: 'Tema' },
  language:           { en: 'Language',             es: 'Idioma' },
  dark:               { en: 'Dark',                 es: 'Oscuro' },
  light:              { en: 'Light',                es: 'Claro' },
  english:            { en: 'English',              es: 'Inglés' },
  spanish:            { en: 'Spanish',              es: 'Español' },
  // Shell chrome
  close:              { en: 'Close',                es: 'Cerrar' },
  menu:               { en: 'Menu',                 es: 'Menú' },
  back:               { en: 'Back',                 es: 'Atrás' },
  home:               { en: 'Home',                 es: 'Inicio' },
  commandNavigation:  { en: 'Command Navigation',   es: 'Navegación de comando' },
  workCenters:        { en: 'Work Centers',         es: 'Centros de trabajo' },
  allDepartments:     { en: 'All Departments',      es: 'Todos los departamentos' },
  nashTexas:          { en: 'Nash, Texas',          es: 'Nash, Texas' },
  // Nav group names
  navCommand:         { en: 'Command',              es: 'Comando' },
  navProduction:      { en: 'Production',           es: 'Producción' },
  navDepartments:     { en: 'Departments',          es: 'Departamentos' },
  navWorkflow:        { en: 'Workflow',             es: 'Flujo de trabajo' },
  navTools:           { en: 'Tools',                es: 'Herramientas' },
  // Nav group short descriptions
  navDescCommand:      { en: 'status + decisions',  es: 'estado + decisiones' },
  navDescProduction:   { en: 'orders + equipment',  es: 'órdenes + equipo' },
  navDescDepartments:  { en: 'dept focus + lanes',  es: 'enfoque de dept + filas' },
  navDescWorkflow:     { en: 'movement + crew',     es: 'movimiento + personal' },
  navDescTools:        { en: 'tools + references',  es: 'herramientas + referencias' },
  // Tab labels
  tabDashboard:       { en: 'Command Center',       es: 'Centro de comando' },
  tabWorkflow:        { en: 'My Workflow',          es: 'Mi flujo de trabajo' },
  tabMachines:        { en: 'Equipment',            es: 'Equipo' },
  tabAlerts:          { en: 'Equipment Alerts',     es: 'Alertas de equipo' },
  tabSimulation:      { en: 'Simulation',           es: 'Simulación' },
  tabMaintenance:     { en: 'Maintenance',          es: 'Mantenimiento' },
  tabReceiving:       { en: 'Receiving',            es: 'Recibo' },
  tabCoverage:        { en: 'Crew / Coverage',      es: 'Personal / Cobertura' },
  tabOrders:          { en: 'Orders',               es: 'Órdenes' },
  tabPlantMap:        { en: 'Plant Map',            es: 'Mapa de planta' },
  tabSales:           { en: 'Sales',                es: 'Ventas' },
  tabEngineering:     { en: 'Engineering',          es: 'Ingeniería' },
  tabDocuments:       { en: 'Documents',            es: 'Documentos' },
  tabRisk:            { en: 'QA / Safety',          es: 'Calidad / Seguridad' },
  tabShiftHandoff:    { en: 'Shift Handoff',        es: 'Entrega de turno' },
  tabKanban:          { en: 'War Board',            es: 'Tablero de guerra' },
  tabWarRoomContext:  { en: 'War Room Context',     es: 'Contexto de sala de guerra' },
  tabMaterialHandling:{ en: 'Material Handling',    es: 'Manejo de materiales' },
  tabFab:             { en: 'Fab',                  es: 'Fabricación' },
  tabCoating:         { en: 'Coating',              es: 'Recubrimiento' },
  tabAssembly:        { en: 'Assembly',             es: 'Ensamble' },
  tabShipping:        { en: 'Shipping',             es: 'Envío' },
  tabQa:              { en: 'QA',                   es: 'Calidad' },
  tabSaddles:         { en: 'Saddles',              es: 'Departamento de saddles' },
  tabMachineShop:     { en: 'Machine Shop',         es: 'Taller de maquinado' },
  // Home button suffixes
  homeWorkflow:       { en: 'Workflow',             es: 'Flujo de trabajo' },
  homeMaintenance:    { en: 'Maintenance',          es: 'Mantenimiento' },
  homeReceiving:      { en: 'Receiving',            es: 'Recibo' },
  homeQASafety:       { en: 'QA / Safety',          es: 'Calidad / Seguridad' },
  homeCommand:        { en: 'Command',              es: 'Comando' },
  // Misc
  alert:              { en: 'Alert',                es: 'Alerta' },
  alerts:             { en: 'Alerts',               es: 'Alertas' },
  pagesSuffix:        { en: 'Pages',                es: 'Páginas' },
  itemsSuffix:        { en: 'Items',                es: 'Elementos' },
};

export function t(key: TranslationKey, lang: Language): string {
  return dict[key][lang];
}

const TAB_KEY_MAP: Partial<Record<AppTab, TranslationKey>> = {
  dashboard:       'tabDashboard',
  workflow:        'tabWorkflow',
  machines:        'tabMachines',
  alerts:          'tabAlerts',
  simulation:      'tabSimulation',
  maintenance:     'tabMaintenance',
  receiving:       'tabReceiving',
  coverage:        'tabCoverage',
  orders:          'tabOrders',
  plantMap:        'tabPlantMap',
  sales:           'tabSales',
  engineering:     'tabEngineering',
  documents:       'tabDocuments',
  risk:            'tabRisk',
  shiftHandoff:    'tabShiftHandoff',
  kanban:          'tabKanban',
  warRoomContext:  'tabWarRoomContext',
  materialHandling:'tabMaterialHandling',
  fab:             'tabFab',
  coating:         'tabCoating',
  assembly:        'tabAssembly',
  shipping:        'tabShipping',
  qa:              'tabQa',
  saddles:         'tabSaddles',
  machineShop:     'tabMachineShop',
};

export function tabLabel(tab: AppTab, lang: Language): string {
  const key = TAB_KEY_MAP[tab];
  return key ? t(key, lang) : tab;
}

const GROUP_LABEL_KEY: Record<NavigationGroupId, TranslationKey> = {
  command:     'navCommand',
  production:  'navProduction',
  departments: 'navDepartments',
  workflow:    'navWorkflow',
  support:     'navTools',
};

const GROUP_DESC_KEY: Record<NavigationGroupId, TranslationKey> = {
  command:     'navDescCommand',
  production:  'navDescProduction',
  departments: 'navDescDepartments',
  workflow:    'navDescWorkflow',
  support:     'navDescTools',
};

export function navGroupLabel(groupId: NavigationGroupId, lang: Language): string {
  return t(GROUP_LABEL_KEY[groupId], lang);
}

export function navGroupDesc(groupId: NavigationGroupId, lang: Language): string {
  return t(GROUP_DESC_KEY[groupId], lang);
}
