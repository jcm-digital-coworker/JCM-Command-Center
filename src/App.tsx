import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { darkTheme, lightTheme, type ThemeColors } from './theme/theme';

import { machines } from './data/machine';
import { maintenanceTasks } from './data/maintenance';
import { plantDocuments } from './data/documents';
import { riskItems } from './data/risk';
import { plantDepartmentOrder, workCenters } from './data/workCenters';

import type { Department, Machine } from './types/machine';
import type { WorkCenter } from './types/plant';
import type { AppTab, DepartmentFilter, RoleView } from './types/app';

import MachineDetail from './components/MachineDetail';
import Lv4500JcmSimulator from './components/Lv4500JcmSimulator';
import AppHeader from './components/shell/AppHeader';
import AppDrawer from './components/shell/AppDrawer';
import CommandNavigationBar from './components/shell/CommandNavigationBar';
import { getHomeTabForRole } from './logic/navigationAccess';

import WorkflowPage from './pages/WorkflowMobilePage';
import DashboardPage from './pages/DashboardPage';
import MachinesPage, { AlertsPage } from './pages/MachinesPage';
import SimulationPage from './pages/SimulationPage';
import MaintenancePage from './pages/MaintenancePage';
import MaintenanceRequestsPage from './pages/MaintenanceRequestsPage';
import MaintenanceAnalyticsPage from './pages/MaintenanceAnalyticsPage';
import DocumentsPage from './pages/DocumentsPage';
import RiskPage from './pages/RiskPage';
import WorkCenterDetailPage from './pages/WorkCenterDetailPage';
import CoveragePage from './pages/CoveragePage';
import ReceivingPage from './pages/ReceivingPage';
import OrdersPage from './pages/OrdersPage';
import PlantMapPage from './pages/PlantMapPage';
import MaterialHandlingDepartmentPage from './pages/departments/MaterialHandlingDepartmentPage';
import FabDepartmentPage from './pages/departments/FabDepartmentPage';
import CoatingDepartmentPage from './pages/departments/CoatingDepartmentPage';
import AssemblyDepartmentPage from './pages/departments/AssemblyDepartmentPage';
import ShippingDepartmentPage from './pages/departments/ShippingDepartmentPage';
import QADepartmentPage from './pages/departments/QADepartmentPage';
import SalesDepartmentPage from './pages/departments/SalesDepartmentPage';
import EngineeringDepartmentPage from './pages/departments/EngineeringDepartmentPage';
import SaddlesDepartmentPage from './pages/departments/SaddlesDepartmentPage';
import ShiftHandoffPage from './pages/ShiftHandoffPage';
import WarRoomContextPage from './pages/WarRoomContextPage';

type DetailTab = 'overview' | 'events' | 'patterns' | 'notes';
type MaintenanceView = 'tasks' | 'requests' | 'analytics';
type ReceivingView = 'hub' | 'submit' | 'arriving' | 'ready' | 'claimed' | 'delivered' | 'holds';
type CoverageView = 'hub' | 'signin' | 'available' | 'assigned' | 'break' | 'offline';

const departmentOrder = plantDepartmentOrder;
const JCM_NAVIGATE_EVENT = 'jcm:navigate';
const ROLE_STORAGE_KEY = 'jcm_role_view';
const ROLE_OPTIONS: RoleView[] = ['Production', 'Department Lead', 'Department Supervisor', 'Management', 'Maintenance', 'Support'];
const LEGACY_ROLE_MAP: Record<string, RoleView> = {
  Operator: 'Production',
  operator: 'Production',
  'Lead / Supervisor': 'Department Lead',
  lead: 'Department Lead',
  supervisor: 'Department Supervisor',
  Manager: 'Management',
  management: 'Management',
  Maintenance: 'Maintenance',
  maintenance: 'Maintenance',
  'Forklift / Receiving': 'Support',
  QA: 'Support',
  qa: 'Support',
};

function priorityRank(priority: Machine['alarmPriority']) {
  if (priority === 'ESTOP') return 0;
  if (priority === 'ALARM') return 1;
  if (priority === 'RESET') return 2;
  return 3;
}

function filterByDepartment<T extends { department: Department }>(items: T[], filter: DepartmentFilter) {
  if (filter === 'All') return items;
  return items.filter((item) => item.department === filter);
}

function getSavedRoleView(): RoleView {
  const savedRole = localStorage.getItem(ROLE_STORAGE_KEY);
  if (!savedRole) return 'Management';
  if (ROLE_OPTIONS.includes(savedRole as RoleView)) return savedRole as RoleView;
  const migratedRole = LEGACY_ROLE_MAP[savedRole];
  if (migratedRole) {
    localStorage.setItem(ROLE_STORAGE_KEY, migratedRole);
    return migratedRole;
  }
  return 'Management';
}

export default function App() {
  const [selected, setSelected] = useState<Machine | null>(null);
  const [tab, setTab] = useState<AppTab>('dashboard');
  const [tabHistory, setTabHistory] = useState<AppTab[]>([]);
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');
  const [simulatorMachine, setSimulatorMachine] = useState<Machine | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentFilter>('All');
  const [roleView, setRoleView] = useState<RoleView>(getSavedRoleView);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedWorkCenter, setSelectedWorkCenter] = useState<WorkCenter | null>(null);
  const [receivingInitialView, setReceivingInitialView] = useState<ReceivingView>('hub');
  const [receivingSubmitDepartment, setReceivingSubmitDepartment] = useState<Department>('Machine Shop');
  const [coverageInitialView, setCoverageInitialView] = useState<CoverageView>('hub');
  const [maintenanceView, setMaintenanceView] = useState<MaintenanceView>('requests');

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('jcm_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  const currentTheme: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  // QR / URL deep-link: ?wc=<workCenterId> opens that station tablet directly
  useEffect(() => {
    const wcId = new URLSearchParams(window.location.search).get('wc');
    if (!wcId) return;
    const wc = workCenters.find((w) => w.id === wcId);
    if (wc) {
      setSelectedWorkCenter(wc);
      setDepartmentFilter(wc.department);
    }
  }, []);

  function toggleTheme() {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('jcm_theme', newTheme);
  }

  function navigateTo(nextTab: AppTab) {
    if (nextTab === tab) return;
    setTabHistory((prev) => [...prev, tab]);
    setTab(nextTab);
  }

  function goHome() {
    setSelected(null);
    setSimulatorMachine(null);
    setSelectedWorkCenter(null);
    setTabHistory([]);
    setTab(getHomeTabForRole(roleView));
  }

  useEffect(() => {
    const handleNavigationEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ tab?: AppTab }>;
      const nextTab = customEvent.detail?.tab;
      if (nextTab) navigateTo(nextTab);
    };

    window.addEventListener(JCM_NAVIGATE_EVENT, handleNavigationEvent);
    return () => window.removeEventListener(JCM_NAVIGATE_EVENT, handleNavigationEvent);
  }, [tab]);

  function goBack() {
    if (tabHistory.length === 0) return;
    const prev = tabHistory[tabHistory.length - 1];
    setTabHistory((history) => history.slice(0, -1));
    setTab(prev);
  }

  function openWorkCenterForDepartment(nextDepartment: DepartmentFilter) {
    setSelected(null);
    setSimulatorMachine(null);

    if (nextDepartment === 'All') {
      setSelectedWorkCenter(null);
      setDepartmentFilter('All');
      setReceivingInitialView('hub');
      setCoverageInitialView('hub');
      setTabHistory([]);
      setTab('dashboard');
      return;
    }

    setDepartmentFilter(nextDepartment);
    setReceivingInitialView('hub');
    setCoverageInitialView('hub');

    if (nextDepartment === 'Receiving') {
      setSelectedWorkCenter(null);
      navigateTo('receiving');
      return;
    }

    const matchingWorkCenter = workCenters.find((workCenter) => workCenter.department === nextDepartment);
    setSelectedWorkCenter(matchingWorkCenter ?? null);
    navigateTo('dashboard');
  }

  function changeRoleView(nextRole: RoleView) {
    localStorage.setItem(ROLE_STORAGE_KEY, nextRole);
    setRoleView(nextRole);
    setSelected(null);
    setSimulatorMachine(null);
    setSelectedWorkCenter(null);

    if (nextRole === 'Support') {
      setDepartmentFilter('Receiving');
      setReceivingInitialView('ready');
      navigateTo('receiving');
      return;
    }

    if (nextRole === 'Maintenance') {
      setMaintenanceView('requests');
      navigateTo('maintenance');
      return;
    }

    navigateTo(getHomeTabForRole(nextRole));
  }

  const pageStyle: CSSProperties = {
    padding: 16,
    fontFamily: 'Arial, sans-serif',
    background: currentTheme.background,
    minHeight: '100vh',
  };

  const sortedMachines = useMemo(() => {
    return [...machines].sort((a, b) => {
      const deptDiff = departmentOrder.indexOf(a.department) - departmentOrder.indexOf(b.department);
      if (deptDiff !== 0) return deptDiff;

      const priorityDiff = priorityRank(a.alarmPriority) - priorityRank(b.alarmPriority);
      if (priorityDiff !== 0) return priorityDiff;

      return a.name.localeCompare(b.name);
    });
  }, []);

  const alerts = useMemo(() => {
    return sortedMachines.filter(
      (machine) =>
        machine.alarmPriority !== 'NORMAL' ||
        machine.state === 'ALARM' ||
        machine.state === 'OFFLINE',
    );
  }, [sortedMachines]);

  const maintenanceWithDepartment = maintenanceTasks.map((task) => {
    const machine = machines.find((item) => item.id === task.machineId);
    return { ...task, department: machine?.department ?? 'Machine Shop' };
  });

  const serviceMachineIds = new Set(
    maintenanceWithDepartment.filter((task) => task.status !== 'OK').map((task) => task.machineId),
  );

  const machinesNeedingService = sortedMachines.filter(
    (machine) =>
      machine.state === 'ALARM' ||
      machine.state === 'OFFLINE' ||
      machine.alarmPriority !== 'NORMAL' ||
      serviceMachineIds.has(machine.id),
  );

  function getVisibleMachinesForRole() {
    if (roleView === 'Maintenance') return machinesNeedingService;
    if (departmentFilter === 'Receiving') return [];
    return filterByDepartment(sortedMachines, departmentFilter);
  }

  function getVisibleAlertsForRole() {
    if (roleView === 'Maintenance') return machinesNeedingService;
    if (departmentFilter === 'Receiving') return [];
    return filterByDepartment(alerts, departmentFilter);
  }

  function getVisibleMaintenanceTasksForRole() {
    if (roleView === 'Maintenance') {
      return maintenanceWithDepartment.filter((task) => task.status !== 'OK');
    }
    return filterByDepartment(maintenanceWithDepartment, departmentFilter);
  }

  const filteredMachines = getVisibleMachinesForRole();
  const filteredAlerts = getVisibleAlertsForRole();
  const filteredMaintenanceTasks = getVisibleMaintenanceTasksForRole();
  const filteredDocuments = filterByDepartment(plantDocuments, departmentFilter);
  const filteredRisks = filterByDepartment(riskItems, departmentFilter);

  if (simulatorMachine) {
    return (
      <div style={{ background: currentTheme.background, minHeight: '100vh' }}>
        <div style={getSimulatorHeaderStyle(theme)}>
          <button onClick={() => setSimulatorMachine(null)} style={getSimBackButtonStyle(theme)}>
            BACK TO SIMULATION
          </button>
          <h3 style={getSimulatorTitleStyle(theme)}>{simulatorMachine.name}</h3>
          <p style={simulatorSubtitleStyle}>READ-ONLY EQUIPMENT SIMULATOR</p>
        </div>
        <Lv4500JcmSimulator theme={theme} />
      </div>
    );
  }

  if (selectedWorkCenter) {
    return (
      <div style={pageStyle}>
        <WorkCenterDetailPage
          workCenter={selectedWorkCenter}
          machines={selectedWorkCenter.department === 'Maintenance' ? machinesNeedingService : sortedMachines}
          tasks={
            selectedWorkCenter.department === 'Maintenance'
              ? maintenanceWithDepartment.filter((task) => task.status !== 'OK')
              : maintenanceWithDepartment.filter((task) => task.department === selectedWorkCenter.department)
          }
          risks={riskItems.filter((risk) => risk.department === selectedWorkCenter.department)}
          roleView={roleView}
          onBack={() => setSelectedWorkCenter(null)}
          onOpenMachine={setSelected}
          onGoToMaintenance={() => {
            setSelectedWorkCenter(null);
            setDepartmentFilter(selectedWorkCenter.department);
            setMaintenanceView('requests');
            navigateTo('maintenance');
          }}
          onOpenCoverage={(view = 'hub') => {
            setSelectedWorkCenter(null);
            setDepartmentFilter(selectedWorkCenter.department);
            setCoverageInitialView(view);
            navigateTo('coverage');
          }}
          onOpenReceiving={(view, requesterDepartment) => {
            setSelectedWorkCenter(null);
            setReceivingSubmitDepartment(requesterDepartment ?? 'Machine Shop');
            setDepartmentFilter(view === 'submit' ? requesterDepartment ?? 'Machine Shop' : 'Receiving');
            setReceivingInitialView(view);
            navigateTo('receiving');
          }}
          onOpenEngineering={() => {
            setSelectedWorkCenter(null);
            navigateTo('orders');
          }}
          theme={theme}
        />
      </div>
    );
  }

  if (selected) {
    return (
      <MachineDetail
        machine={selected}
        detailTab={detailTab}
        setDetailTab={setDetailTab}
        onClose={() => {
          setSelected(null);
          setDetailTab('overview');
        }}
        onOpenSimulator={() => {
          setSimulatorMachine(selected);
          setSelected(null);
        }}
        theme={theme}
      />
    );
  }

  return (
    <div style={pageStyle}>
      <AppDrawer
        open={menuOpen}
        tab={tab}
        setTab={(nextTab) => {
          navigateTo(nextTab);
          setMenuOpen(false);
        }}
        roleView={roleView}
        setRoleView={changeRoleView}
        departmentFilter={departmentFilter}
        setDepartmentFilter={openWorkCenterForDepartment}
        onClose={() => setMenuOpen(false)}
        workCenters={workCenters}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <AppHeader
        onMenuClick={() => setMenuOpen(true)}
        onBackClick={goBack}
        onHomeClick={goHome}
        showBack={tabHistory.length > 0}
        theme={theme}
      />

      <CommandNavigationBar
        tab={tab}
        roleView={roleView}
        currentLabel={getCommandLabel(tab)}
        alertCount={filteredAlerts.length}
        theme={theme}
        onNavigate={navigateTo}
      />

      {renderCurrentPage()}
    </div>
  );

  function renderCurrentPage() {
    if (tab === 'workflow') {
      return (
        <WorkflowPage
          roleView={roleView}
          departmentFilter={departmentFilter}
          machines={filteredMachines}
          theme={theme}
          onGoToMaintenance={() => {
            setMaintenanceView('requests');
            navigateTo('maintenance');
          }}
          onGoToTab={navigateTo}
        />
      );
    }

    if (tab === 'dashboard') {
      return (
        <DashboardPage
          machines={filteredMachines}
          alerts={filteredAlerts}
          tasks={filteredMaintenanceTasks}
          risks={filteredRisks}
          roleView={roleView}
          onOpenMachine={setSelected}
          onOpenWorkCenter={setSelectedWorkCenter}
          onGoToTab={navigateTo}
          workCenters={workCenters}
          departmentFilter={departmentFilter}
          theme={theme}
        />
      );
    }

    if (tab === 'machines') return <MachinesPage machines={filteredMachines} onOpenMachine={setSelected} theme={theme} />;
    if (tab === 'alerts') return <AlertsPage alerts={filteredAlerts} onOpenMachine={setSelected} theme={theme} />;
    if (tab === 'simulation') return <SimulationPage machines={filteredMachines} onOpenSimulator={setSimulatorMachine} theme={theme} />;
    if (tab === 'receiving') return <ReceivingPage initialView={receivingInitialView} submitDepartment={receivingSubmitDepartment} theme={theme} />;
    if (tab === 'coverage') return <CoveragePage roleView={roleView} departmentFilter={departmentFilter} initialView={coverageInitialView} theme={theme} />;
    if (tab === 'orders') return <OrdersPage theme={theme} />;
    if (tab === 'plantMap') return <PlantMapPage theme={theme} />;
    if (tab === 'sales') return <SalesDepartmentPage theme={theme} />;
    if (tab === 'engineering') return <EngineeringDepartmentPage theme={theme} />;
    if (tab === 'saddles') return <SaddlesDepartmentPage theme={theme} />;
    if (tab === 'materialHandling') return <MaterialHandlingDepartmentPage theme={theme} />;
    if (tab === 'fab') return <FabDepartmentPage theme={theme} />;
    if (tab === 'coating') return <CoatingDepartmentPage theme={theme} />;
    if (tab === 'assembly') return <AssemblyDepartmentPage theme={theme} />;
    if (tab === 'shipping') return <ShippingDepartmentPage theme={theme} />;
    if (tab === 'qa') return <QADepartmentPage theme={theme} />;
    if (tab === 'documents') return <DocumentsPage documents={filteredDocuments} theme={theme} />;
    if (tab === 'risk') return <RiskPage risks={filteredRisks} roleView={roleView} theme={theme} />;
    if (tab === 'shiftHandoff') return <ShiftHandoffPage theme={theme} />;
    if (tab === 'warRoomContext') return <WarRoomContextPage theme={theme} />;

    if (tab === 'maintenance') {
      return (
        <div>
          <div style={maintenanceTabBarStyle}>
            <button onClick={() => setMaintenanceView('requests')} style={maintenanceView === 'requests' ? activeTabButtonStyle : tabButtonStyle}>
              Requests
            </button>
            <button onClick={() => setMaintenanceView('tasks')} style={maintenanceView === 'tasks' ? activeTabButtonStyle : tabButtonStyle}>
              Scheduled Tasks
            </button>
            <button onClick={() => setMaintenanceView('analytics')} style={maintenanceView === 'analytics' ? activeTabButtonStyle : tabButtonStyle}>
              Analytics
            </button>
          </div>

          {maintenanceView === 'requests' ? (
            <MaintenanceRequestsPage theme={theme} />
          ) : maintenanceView === 'tasks' ? (
            <MaintenancePage machines={filteredMachines} tasks={filteredMaintenanceTasks} theme={theme} />
          ) : (
            <MaintenanceAnalyticsPage theme={theme} />
          )}
        </div>
      );
    }

    return <DashboardPage machines={filteredMachines} alerts={filteredAlerts} tasks={filteredMaintenanceTasks} risks={filteredRisks} roleView={roleView} onOpenMachine={setSelected} onOpenWorkCenter={setSelectedWorkCenter} onGoToTab={navigateTo} workCenters={workCenters} departmentFilter={departmentFilter} theme={theme} />;
  }
}

function getCommandLabel(tab: AppTab): string {
  const labels: Record<AppTab, string> = {
    workflow: 'My Workflow',
    dashboard: 'Command Center',
    machines: 'Equipment',
    alerts: 'Equipment Alerts',
    simulation: 'Simulation',
    maintenance: 'Maintenance',
    receiving: 'Receiving',
    coverage: 'Crew / Coverage',
    orders: 'Orders',
    plantMap: 'Plant Map',
    sales: 'Sales',
    engineering: 'Engineering',
    materialHandling: 'Material Handling',
    fab: 'Fab',
    coating: 'Coating',
    assembly: 'Assembly',
    shipping: 'Shipping',
    qa: 'QA',
    documents: 'Documents',
    risk: 'QA / Safety',
    saddles: 'Saddles Dept',
    shiftHandoff: 'Shift Handoff',
    warRoomContext: 'War Room Context',
  };
  return labels[tab];
}

function getSimulatorHeaderStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: 16,
    background: theme === 'dark' ? '#1e293b' : '#f8fafc',
    textAlign: 'center',
    borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
  };
}

function getSimBackButtonStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    marginBottom: 16,
    padding: '10px 16px',
    borderRadius: 4,
    border: theme === 'dark' ? '1px solid #475569' : '1px solid #cbd5e1',
    background: theme === 'dark' ? 'rgba(100, 116, 139, 0.2)' : 'white',
    color: theme === 'dark' ? '#cbd5e1' : '#475569',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: '0.5px',
  };
}

function getSimulatorTitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    marginBottom: 4,
    marginTop: 16,
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    letterSpacing: '0.5px',
  };
}

const simulatorSubtitleStyle: CSSProperties = {
  marginTop: 4,
  color: '#64748b',
  fontSize: 13,
  letterSpacing: '0.5px',
};

const maintenanceTabBarStyle: CSSProperties = {
  display: 'flex',
  gap: 12,
  marginBottom: 20,
  flexWrap: 'wrap',
};

const tabButtonStyle: CSSProperties = {
  padding: '10px 20px',
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  background: 'white',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 14,
  color: '#64748b',
};

const activeTabButtonStyle: CSSProperties = {
  padding: '10px 20px',
  borderRadius: 8,
  border: '1px solid #2563eb',
  background: '#2563eb',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 14,
  color: 'white',
};
