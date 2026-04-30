/**
 * Universal Export Utilities
 * Provides CSV export and print-friendly report generation
 */

export function exportToCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
) {
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function printReport(title: string, content: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print reports');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @media print {
            @page { margin: 0.75in; }
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #1e293b;
          }
          h1 {
            font-size: 24px;
            margin-bottom: 8px;
            color: #0f172a;
            letter-spacing: 0.5px;
          }
          .subtitle {
            color: #64748b;
            font-size: 13px;
            margin-bottom: 24px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
          }
          th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
          }
          th {
            background: #f8fafc;
            font-weight: 800;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #475569;
          }
          td {
            font-size: 13px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        ${content}
        <div class="footer">
          Generated: ${new Date().toLocaleString()} | JCM Command Center
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}

export function generateMaintenanceReport(requests: any[]): string {
  const rows = requests
    .map(
      (r) => `
    <tr>
      <td>${r.id}</td>
      <td>${r.machineName}</td>
      <td>${r.department}</td>
      <td>${r.priority}</td>
      <td>${r.status}</td>
      <td>${r.submittedBy}</td>
      <td>${new Date(r.submittedAt).toLocaleDateString()}</td>
      <td>${r.completedBy || '-'}</td>
    </tr>
  `
    )
    .join('');

  return `
    <h1>Maintenance Requests Report</h1>
    <div class="subtitle">${requests.length} total requests</div>
    <table>
      <thead>
        <tr>
          <th>Request ID</th>
          <th>Machine</th>
          <th>Department</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Submitted By</th>
          <th>Submitted</th>
          <th>Completed By</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

export function generateTasksReport(tasks: any[], machines: any[]): string {
  const rows = tasks
    .map((t) => {
      const machine = machines.find((m) => m.id === t.machineId);
      return `
    <tr>
      <td>${machine?.name || 'Unknown'}</td>
      <td>${machine?.department || '-'}</td>
      <td>${t.title}</td>
      <td>${t.category}</td>
      <td>${t.status}</td>
      <td>${t.lastCompleted}</td>
      <td>${t.nextDue}</td>
    </tr>
  `;
    })
    .join('');

  return `
    <h1>Scheduled Maintenance Tasks</h1>
    <div class="subtitle">${tasks.length} total tasks</div>
    <table>
      <thead>
        <tr>
          <th>Machine</th>
          <th>Department</th>
          <th>Task</th>
          <th>Category</th>
          <th>Status</th>
          <th>Last Completed</th>
          <th>Next Due</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

export function generateCoverageReport(people: any[]): string {
  const rows = people
    .map(
      (p) => `
    <tr>
      <td>${p.name}</td>
      <td>${p.department}</td>
      <td>${p.role}</td>
      <td>${p.station || '-'}</td>
      <td>${p.shift}</td>
      <td>${p.status}</td>
      <td>${p.assignment || '-'}</td>
    </tr>
  `
    )
    .join('');

  return `
    <h1>Coverage Schedule</h1>
    <div class="subtitle">${people.length} workers</div>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Department</th>
          <th>Role</th>
          <th>Station</th>
          <th>Shift</th>
          <th>Status</th>
          <th>Assignment</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

export function generateOrdersReport(orders: any[]): string {
  const rows = orders
    .map(
      (o) => `
    <tr>
      <td>${o.orderNumber}</td>
      <td>${o.customer}</td>
      <td>${o.productFamily || '-'}</td>
      <td>${o.quantity || '-'}</td>
      <td>${o.status}</td>
      <td>${o.currentDepartment}</td>
      <td>${o.projectedShipDate || '-'}</td>
    </tr>
  `
    )
    .join('');

  return `
    <h1>Production Orders</h1>
    <div class="subtitle">${orders.length} total orders</div>
    <table>
      <thead>
        <tr>
          <th>Order Number</th>
          <th>Customer</th>
          <th>Product Family</th>
          <th>Quantity</th>
          <th>Status</th>
          <th>Current Area</th>
          <th>Ship Date</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}
