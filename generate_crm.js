const ExcelJS = require('exceljs');
const path = require('path');

async function createCRM() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Tekton CRM Generator';
  workbook.created = new Date();

  // SHEET 1: BOOKINGS
  const bookingsSheet = workbook.addWorksheet('Bookings', {
    properties: { tabColor: { argb: 'FFFACC15' } },
    views: [{ state: 'frozen', ySplit: 1 }]
  });

  bookingsSheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'Service', key: 'service', width: 20 },
    { header: 'Location', key: 'location', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Amount (₹)', key: 'amount', width: 15 },
    { header: 'Payment', key: 'payment', width: 15 }
  ];

  // Header styling
  bookingsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  bookingsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F172A' } // slate-900
  };

  // Sample data
  bookingsSheet.addRows([
    { date: '2026-05-30', name: 'Rahul Sharma', phone: '9876543210', service: 'Plumber', location: 'MP Nagar', status: 'NEW', amount: 0, payment: 'PENDING' },
    { date: '2026-05-29', name: 'Priya Singh', phone: '9876543211', service: 'Electrician', location: 'Arera Colony', status: 'ASSIGNED', amount: 450, payment: 'PENDING' },
    { date: '2026-05-28', name: 'Amit Patel', phone: '9876543212', service: 'Painter', location: 'Kolar', status: 'COMPLETED', amount: 2500, payment: 'PAID' },
    { date: '2026-05-28', name: 'Neha Gupta', phone: '9876543213', service: 'Carpenter', location: 'Awadhpuri', status: 'COMPLETED', amount: 800, payment: 'PAID' },
  ]);

  // Data Validation for Dropdowns
  for (let i = 2; i <= 1000; i++) {
    // Service Dropdown
    bookingsSheet.getCell(`D${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Plumber,Electrician,Painter,Carpenter,AC Repair,Cleaning"']
    };
    // Status Dropdown
    bookingsSheet.getCell(`F${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"NEW,ASSIGNED,COMPLETED,CANCELLED"']
    };
    // Payment Dropdown
    bookingsSheet.getCell(`H${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"PENDING,PAID"']
    };
  }

  // SHEET 2: DASHBOARD
  const dashboardSheet = workbook.addWorksheet('Dashboard', {
    properties: { tabColor: { argb: 'FF10B981' } }
  });

  dashboardSheet.getColumn('A').width = 25;
  dashboardSheet.getColumn('B').width = 20;

  // Title
  dashboardSheet.mergeCells('A1:B1');
  const titleCell = dashboardSheet.getCell('A1');
  titleCell.value = 'TEKTON CRM DASHBOARD';
  titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  dashboardSheet.getRow(1).height = 40;

  // Metrics Setup
  const metrics = [
    { row: 3, label: 'Total Bookings', formula: 'COUNTA(Bookings!B2:B1000)' },
    { row: 4, label: 'Completed Jobs', formula: 'COUNTIF(Bookings!F2:F1000, "COMPLETED")' },
    { row: 5, label: 'Pending Jobs', formula: 'COUNTIF(Bookings!F2:F1000, "NEW") + COUNTIF(Bookings!F2:F1000, "ASSIGNED")' },
    { row: 6, label: 'Total Earnings (₹)', formula: 'SUMIFS(Bookings!G2:G1000, Bookings!H2:H1000, "PAID")' },
    { row: 7, label: 'Pending Revenue (₹)', formula: 'SUMIFS(Bookings!G2:G1000, Bookings!H2:H1000, "PENDING")' }
  ];

  metrics.forEach(m => {
    const labelCell = dashboardSheet.getCell(`A${m.row}`);
    labelCell.value = m.label;
    labelCell.font = { bold: true };
    labelCell.border = { bottom: { style: 'thin' }, top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

    const valCell = dashboardSheet.getCell(`B${m.row}`);
    valCell.value = { formula: m.formula };
    valCell.font = { size: 12, bold: true, color: { argb: 'FF0F172A' } };
    valCell.border = { bottom: { style: 'thin' }, top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    if (m.label.includes('₹')) {
      valCell.numFmt = '₹#,##0.00';
    }
  });

  // Save the file
  const filePath = path.join(process.cwd(), 'Tekton_Offline_CRM.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log(`Excel CRM successfully generated at: ${filePath}`);
}

createCRM().catch(console.error);
