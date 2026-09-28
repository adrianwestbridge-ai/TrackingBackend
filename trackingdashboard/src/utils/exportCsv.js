/**
 * Senior Enterprise Multi-Format Data Export Utility
 * Supports CSV (with UTF-8 BOM for Excel), JSON, Call Logs Export, and Print/PDF Report Generation
 */

// 1. Export Sessions & Leads to UTF-8 CSV (Excel Compatible)
export function exportSessionsToCSV(sessions, customFilename) {
  if (!sessions || sessions.length === 0) {
    alert('No tracking data available to export.');
    return;
  }

  const headers = [
    'Session ID',
    'Reference ID',
    'Customer Name',
    'Email Address',
    'Mobile Number',
    'Query Category',
    'Traffic Source',
    'Ad Platform',
    'Landing Page',
    'Client IP',
    'Device',
    'OS',
    'Browser',
    'Captured Timestamp',
    'Message Content',
  ];

  const csvRows = [];
  csvRows.push(headers.join(','));

  sessions.forEach((s) => {
    const row = [
      `"${(s.id || '').replace(/"/g, '""')}"`,
      `"${(s.referenceId || '').replace(/"/g, '""')}"`,
      `"${(s.customerName || '').replace(/"/g, '""')}"`,
      `"${(s.customerEmail || '').replace(/"/g, '""')}"`,
      `"${(s.mobile || '').replace(/"/g, '""')}"`,
      `"${(s.queryType || '').replace(/"/g, '""')}"`,
      `"${(s.trafficSource || '').replace(/"/g, '""')}"`,
      `"${(s.adPlatform || '').replace(/"/g, '""')}"`,
      `"${(s.landingPage || '').replace(/"/g, '""')}"`,
      `"${(s.ip || '').replace(/"/g, '""')}"`,
      `"${(s.device || '').replace(/"/g, '""')}"`,
      `"${(s.os || '').replace(/"/g, '""')}"`,
      `"${(s.browser || '').replace(/"/g, '""')}"`,
      `"${(s.timestamp || '').replace(/"/g, '""')}"`,
      `"${(s.feedbackMessage || '').replace(/"/g, '""')}"`,
    ];
    csvRows.push(row.join(','));
  });

  // Include UTF-8 BOM so Excel opens special characters correctly
  const csvString = '\uFEFF' + csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const filename = customFilename || `MongoDB_Tracking_Audit_Report_${new Date().toISOString().slice(0, 10)}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 2. Export Sessions & Leads to JSON File
export function exportSessionsToJSON(sessions, customFilename) {
  if (!sessions || sessions.length === 0) {
    alert('No data available to export.');
    return;
  }

  const jsonString = JSON.stringify(sessions, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const filename = customFilename || `MongoDB_Tracking_Raw_Data_${new Date().toISOString().slice(0, 10)}.json`;

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 3. Export Call Logs to CSV File
export function exportCallLogsToCSV(callLogs, customFilename) {
  if (!callLogs || callLogs.length === 0) {
    alert('No call log data available to export.');
    return;
  }

  const headers = ['Call ID', 'Caller Phone Number', 'Associated User ID', 'Duration', 'Traffic Source'];
  const csvRows = [headers.join(',')];

  callLogs.forEach((call) => {
    const row = [
      `"${(call.id || '').replace(/"/g, '""')}"`,
      `"${(call.caller || '').replace(/"/g, '""')}"`,
      `"${(call.userId || '').replace(/"/g, '""')}"`,
      `"${(call.duration || '').replace(/"/g, '""')}"`,
      `"${(call.source || '').replace(/"/g, '""')}"`,
    ];
    csvRows.push(row.join(','));
  });

  const csvString = '\uFEFF' + csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const filename = customFilename || `Inbound_Call_Logs_${new Date().toISOString().slice(0, 10)}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 4. Trigger Senior Executive Print/PDF Report Preview
export function printExecutiveAuditReport() {
  window.print();
}
