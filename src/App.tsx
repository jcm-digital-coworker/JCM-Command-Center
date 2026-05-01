import type { CSSProperties } from 'react';
import { darkTheme, lightTheme, type ThemeColors } from './theme/theme';
import { useMemo, useState, useEffect } from 'react';

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

import WorkflowPage from './pages/WorkflowPage';
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
import WarRoomContextPage from './pages/WarRoomContextPage';

type DetailTab = 'overview' | 'events' | 'patterns' | 'notes';

const departmentOrder = plantDepartmentOrder;

function priorityRank(priority: Machine['alarmPriority']) {
  if (priority === 'ESTOP') return 0;
  if (priority === 'ALARM') return 1;
  if (priority === 'RESET') return 2;
  return 3;
}

function filterByDepartment<T extends { department: Department }>(
  items: T[],
  filter: DepartmentFilter
) {
  if (filter === 'All') return items;
  return items.filter((item) => item.department === filter);
}

export default function App() {
  const [selected, setSelected] = useState<Machine | null>(null);
  const [tab, setTab] = useState<AppTab>('dashboard');
  const [tabHistory, setTabHistory] = useState<AppTab[]>([]);
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');
  const [simulatorMachine, setSimulatorMachine] = useState<Machine | null>(
    null
  );
  const [departmentFilter, setDepartmentFilter] =
    useState<DepartmentFilter>('All');
  const [roleView, setRoleView] = useState<RoleView>('Manager');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedWorkCenter, setSelectedWorkCenter] =
    useState<WorkCenter | null>(null);
  const [receivingInitialView, setReceivingInitialView] = useState<
    'hub' | 'submit' | 'arriving' | 'ready' | 'claimed' | 'delivered' | 'holds'
  >('hub');
  const [receivingSubmitDepartment, setReceivingSubmitDepartment] =
    useState<Department>('Machine Shop');
  const [coverageInitialView, setCoverageInitialView] = useState<
    'hub' | 'signin' | 'available' | 'assigned' | 'break' | 'offline'
  >('hub');

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('jcm_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('jcm_theme', newTheme);
  };

  // Add this useEffect to toggle body class
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  const currentTheme: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;

  function navigateTo(nextTab: AppTab) {
    if (nextTab === tab) return;
    setTabHistory((prev) => [...prev, tab]);
    setTab(nextTab);
  }

  function goBack() {
    if (tabHistory.length === 0) return;
    const prev = tabHistory[tabHistory.length - 1];
    setTabHistory((h) => h.slice(0, -1));
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

    const matchingWorkCenter = workCenters.find(
      (workCenter) => workCenter.department === nextDepartment
    );
    setSelectedWorkCenter(matchingWorkCenter ?? null);
    navigateTo('dashboard');
  }

  function changeRoleView(nextRole: RoleView) {
    setRoleView(nextRole);
    setSelected(null);
    setSimulatorMachine(null);

    if (nextRole === 'Forklift / Receiving') {
      setSelectedWorkCenter(null);
      setDepartmentFilter('Receiving');
      setReceivingInitialView('ready');
      navigateTo('receiving');
      return;
    }

    if (nextRole === 'Maintenance') {
      setSelectedWorkCenter(null);
      setMaintenanceView('requests');
      navigateTo('maintenance');
      return;
    }

    if (nextRole === 'Lead / Supervisor' || nextRole === 'Manager') {
      setSelectedWorkCenter(null);
      navigateTo('workflow');
      return;
    }

    if (nextRole === 'Operator') {
      navigateTo('workflow');
      return;
    }

    navigateTo('workflow');
  }

  const statusBarStyle: CSSProperties = {
    background: currentTheme.card,
    padding: '16px 20px',
    borderRadius: 0,
    border: `1px solid ${currentTheme.border}`,
    borderLeft: '4px solid #f97316',
    display: 'flex',
    gap: 24,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  };

  const statusLabelStyle: CSSProperties = {
    color: currentTheme.textMuted,
    fontSize: 11,
    fontWeight: 700,
    textAlign: 'center',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  };

  const getAlertsButtonStyle = (alertCount: number): CSSProperties => {
    return {
      padding: '12px 24px',
      borderRadius: 4,
      border: alertCount > 0 ? '2px solid #dc2626' : '2px solid #10b981',
      background:
        alertCount > 0
          ? theme === 'dark'
            ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)'
            : '#fee2e2'
          : theme === 'dark'
          ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)'
          : '#d1fae5',
      color:
        theme === 'dark' ? 'white' : alertCount > 0 ? '#991b1b' : '#065f46',
      fontWeight: 800,
      fontSize: 13,
      cursor: 'pointer',
      transition: 'all 0.2s',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    };
  };

  const pageStyle: CSSProperties = {
    padding: 16,
    fontFamily: 'Arial, sans-serif',
    background: currentTheme.background,
    minHeight: '100vh',
  };
  
  const [maintenanceView, setMaintenanceView] = useState<'tasks' | 'requests' | 'analytics'
>('requests');

  const sortedMachines = useMemo(() => {
    return [...machines].sort((a, b) => {
      const deptDiff =
        departmentOrder.indexOf(a.department) -
        departmentOrder.indexOf(b.department);
      if (deptDiff !== 0) return deptDiff;

      const priorityDiff =
        priorityRank(a.alarmPriority) - priorityRank(b.alarmPriority);
      if (priorityDiff !== 0) return priorityDiff;

      return a.name.localeCompare(b.name);
    });
  }, []);

  const alerts = useMemo(() => {
    return sortedMachines.filter(
      (m) =>
        m.alarmPriority !== 'NORMAL' ||
        m.state === 'ALARM' ||
        m.state === 'OFFLINE'
    );
  }, [sortedMachines]);

  const maintenanceWithDepartment = maintenanceTasks.map((task) => {
    const machine = machines.find((m) => m.id === task.machineId);
    return { ...task, department: machine?.department ?? 'Machine Shop' };
  });

  const serviceMachineIds = new Set(
    maintenanceWithDepartment
      .filter((task) => task.status !== 'OK')
      .map((task) => task.machineId)
  );

  const machinesNeedingService = sortedMachines.filter(
    (machine) =>
      machine.state === 'ALARM' ||
      machine.state === 'OFFLINE' ||
      machine.alarmPriority !== 'NORMAL' ||
      serviceMachineIds.has(machine.id)
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
  const filteredDocuments = filterByDepartment(
    plantDocuments,
    departmentFilter
  );
  const filteredRisks = filterByDepartment(riskItems, departmentFilter);

  if (simulatorMachine) {
    return (
      <div style={{ background: currentTheme.background, minHeight: '100vh' }}>
        <div style={getSimulatorHeaderStyle(theme)}>
          <button
            onClick={() => setSimulatorMachine(null)}
            style={getSimBackButtonStyle(theme)}
          >
            ← BACK TO SIMULATION
          </button>
          <h3
            style={{
              marginBottom: 4,
              marginTop: 16,
              color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
              letterSpacing: '0.5px',
            }}
          >
            {simulatorMachine.name}
          </h3>
          <p
            style={{
              marginTop: 4,
              color: '#64748b',
              fontSize: 13,
              letterSpacing: '0.5px',
            }}
          >
            READ-ONLY EQUIPMENT SIMULATOR
          </p>
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
          machines={
            selectedWorkCenter.department === 'Maintenance'
              ? machinesNeedingService
              : sortedMachines
          }
          tasks={
            selectedWorkCenter.department === 'Maintenance'
              ? maintenanceWithDepartment.filter((task) => task.status !== 'OK')
              : maintenanceWithDepartment.filter(
                  (task) => task.department === selectedWorkCenter.department
                )
          }
          risks={riskItems.filter(
            (risk) => risk.department === selectedWorkCenter.department
          )}
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
            setDepartmentFilter(
              view === 'submit'
                ? requesterDepartment ?? 'Machine Shop'
                : 'Receiving'
            );
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
        showBack={tabHistory.length > 0}
        theme={theme}
      />

      {/* Command Mode Bar: global navigation is mission-based. Page filters handle local context. */}
      <div style={statusBarStyle}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            minWidth: 150,
          }}
        >
          <span style={statusLabelStyle}>Command Mode</span>
          <strong
            style={{
              color: currentTheme.text,
              fontSize: 14,
              letterSpacing: '0.7px',
              textTransform: 'uppercase',
            }}
          >
            {getCommandLabel(tab)}
          </strong>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => navigateTo('workflow')}
            style={getModeButtonStyle(tab === 'workflow', theme)}
          >
            Workflow
          </button>
          <button
            onClick={() => navigateTo('dashboard')}
            style={getModeButtonStyle(tab === 'dashboard', theme)}
          >
            Command
          </button>
          <button
            onClick={() => navigateTo('orders')}
            style={getModeButtonStyle(tab === 'orders', theme)}
          >
            Orders
          </button>
          <button
            onClick={() => navigateTo('coverage')}
            style={getModeButtonStyle(tab === 'coverage', theme)}
          >
            Crew
          </button>
          <button
            onClick={() => navigateTo('plantMap')}
            style={getModeButtonStyle(tab === 'plantMap', theme)}
          >
            Plant Map
          </button>
          <button
            onClick={() => navigateTo('fab')}
            style={getModeButtonStyle(tab === 'fab', theme)}
          >
            Fab
          </button>
          <button
            onClick={() => navigateTo('coating')}
            style={getModeButtonStyle(tab === 'coating', theme)}
          >
            Coating
          </button>
          <button
            onClick={() => navigateTo('shipping')}
            style={getModeButtonStyle(tab === 'shipping', theme)}
          >
            Shipping
          </button>
          <button
            onClick={() => navigateTo('maintenance')}
            style={getModeButtonStyle(tab === 'maintenance', theme)}
          >
            Maintenance
          </button>
          <button
            onClick={() => navigateTo('receiving')}
            style={getModeButtonStyle(tab === 'receiving', theme)}
          >
            Receiving
          </button>
          <button
            onClick={() => navigateTo('risk')}
            style={getModeButtonStyle(tab === 'risk', theme)}
          >
            QA / Safety
          </button>
        </div>

        <button
          onClick={() => navigateTo('alerts')}
          style={getAlertsButtonStyle(filteredAlerts.length)}
        >
          {filteredAlerts.length}{' '}
          {filteredAlerts.length === 1 ? 'Equipment Alert' : 'Equipment Alerts'}
        </button>
      </div>

      {tab === 'workflow' && (
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
      )}

      {tab === 'dashboard' && (
        <DashboardPage
          machines={filteredMachines}
          alerts={filteredAlerts}
          tasks={filteredMaintenanceTasks}
          risks={filteredRisks}
          roleView={roleView}
          onOpenMachine={setSelected}
          onOpenWorkCenter={setSelectedWorkCenter}
          onGoToTab={setTab}
          workCenters={workCenters}
          departmentFilter={departmentFilter}
          theme={theme}
        />
      )}

      {tab === 'machines' && (
        <MachinesPage
          machines={filteredMachines}
          onOpenMachine={setSelected}
          theme={theme}
        />
      )}

      {tab === 'alerts' && (
        <AlertsPage
          alerts={filteredAlerts}
          onOpenMachine={setSelected}
          theme={theme}
        />
      )}

      {tab === 'simulation' && (
        <SimulationPage
          machines={filteredMachines}
          onOpenSimulator={setSimulatorMachine}
          theme={theme}
        />
      )}

      {tab === 'maintenance' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <button
              onClick={() => setMaintenanceView('requests')}
              style={
                maintenanceView === 'requests'
                  ? activeTabButtonStyle
                  : tabButtonStyle
              }
            >
              Requests
            </button>
            <button
              onClick={() => setMaintenanceView('tasks')}
              style={
                maintenanceView === 'tasks'
                  ? activeTabButtonStyle
                  : tabButtonStyle
              }
            >
              Scheduled Tasks
            </button>
          </div>

<button
        onClick={() => setMaintenanceView('analytics')}
        style={
          maintenanceView === 'analytics'
            ? activeTabButtonStyle
            : tabButtonStyle
        }
      >
        Analytics
      </button>

          {maintenanceView === 'requests' ? (
      <MaintenanceRequestsPage theme={theme} />
    ) : maintenanceView === 'tasks' ? (
      <MaintenancePage
        machines={filteredMachines}
        tasks={filteredMaintenanceTasks}
        theme={theme}
      />
    ) : (
      <MaintenanceAnalyticsPage theme={theme} />
    )}
  </div>
)}


      {tab === 'receiving' && (
        <ReceivingPage
          initialView={receivingInitialView}
          submitDepartment={receivingSubmitDepartment}
          theme={theme}
        />
      )}

      {tab === 'coverage' && (
        <CoveragePage
          roleView={roleView}
          departmentFilter={departmentFilter}
          initialView={coverageInitialView}
          theme={theme}
        />
      )}

      {tab === 'orders' && <OrdersPage theme={theme} />}

      {tab === 'plantMap' && <PlantMapPage theme={theme} />}

      {tab === 'sales' && <SalesDepartmentPage theme={theme} />}

      {tab === 'engineering' && <EngineeringDepartmentPage theme={theme} />}

      {tab === 'materialHandling' && (
        <MaterialHandlingDepartmentPage theme={theme} />
      )}

      {tab === 'fab' && <FabDepartmentPage theme={theme} />}

      {tab === 'coating' && <CoatingDepartmentPage theme={theme} />}

      {tab === 'assembly' && <AssemblyDepartmentPage theme={theme} />}

      {tab === 'shipping' && <ShippingDepartmentPage theme={theme} />}

      {tab === 'qa' && <QADepartmentPage theme={theme} />}

      {tab === 'documents' && (
        <DocumentsPage documents={filteredDocuments} theme={theme} />
      )}

      {tab === 'risk' && (
        <RiskPage risks={filteredRisks} roleView={roleView} theme={theme} />
      )}

      {tab === 'warRoomContext' && <WarRoomContextPage theme={theme} />}
    </div>
  );
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
    warRoomContext: 'War Room Context',
  };
  return labels[tab];
}

function getModeButtonStyle(
  active: boolean,
  theme: 'dark' | 'light'
): CSSProperties {
  return {
    padding: '10px 12px',
    borderRadius: 4,
    border: active
      ? '1px solid #f97316'
      : theme === 'dark'
      ? '1px solid #334155'
      : '1px solid #cbd5e1',
    background: active
      ? 'rgba(249, 115, 22, 0.18)'
      : theme === 'dark'
      ? '#0f172a'
      : '#ffffff',
    color: active ? '#f97316' : theme === 'dark' ? '#cbd5e1' : '#475569',
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '0.7px',
    textTransform: 'uppercase',
    cursor: 'pointer',
  };
}

const getSimulatorHeaderStyle = (theme: 'dark' | 'light'): CSSProperties => {
  return {
    padding: 16,
    background: theme === 'dark' ? '#1e293b' : '#f8fafc',
    textAlign: 'center',
    borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
  };
};

const getSimBackButtonStyle = (theme: 'dark' | 'light'): CSSProperties => {
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
