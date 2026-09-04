import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DiagnosticReport } from '../types/diagnostic';

export function generateReportPdf(report: DiagnosticReport): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Dark background header
  doc.setFillColor(7, 11, 20);
  doc.rect(0, 0, 210, 42, 'F');

  // AuthentiX Header Brand
  doc.setTextColor(54, 225, 204);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('AUTHENTIX', 14, 18);

  doc.setTextColor(132, 150, 168);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Mobile Device Authenticity & Diagnostic Report', 14, 25);
  doc.text('Know the device. Trust the decision.', 14, 31);

  // Top right report metadata
  doc.setFontSize(8);
  doc.setTextColor(244, 248, 252);
  doc.text(`REPORT ID: ${report.id}`, 145, 16);
  doc.setTextColor(132, 150, 168);
  doc.text(`DATE: ${new Date(report.timestamp).toLocaleString()}`, 145, 22);
  doc.text(`DEVICE: ${report.device.deviceName}`, 145, 28);
  doc.text(`STATUS: ${report.gradeLabel}`, 145, 34);

  // Trust Score Banner
  doc.setFillColor(11, 17, 28);
  doc.roundedRect(14, 48, 182, 30, 3, 3, 'F');
  
  doc.setTextColor(244, 248, 252);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('AUTHENTIX TRUST SCORE', 22, 60);

  doc.setFontSize(26);
  if (report.overallScore >= 90) {
    doc.setTextColor(57, 229, 140);
  } else if (report.overallScore >= 75) {
    doc.setTextColor(32, 184, 255);
  } else if (report.overallScore >= 60) {
    doc.setTextColor(255, 184, 77);
  } else {
    doc.setTextColor(255, 92, 108);
  }
  doc.text(`${report.overallScore} / 100`, 22, 72);

  doc.setFontSize(11);
  doc.text(`GRADE: ${report.gradeLabel.toUpperCase()}`, 120, 64);
  doc.setFontSize(8);
  doc.setTextColor(132, 150, 168);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tests: ${report.stats.passed} Passed • ${report.stats.warning} Warnings • ${report.stats.failed} Failed`, 120, 71);

  // Device Info Table
  const deviceInfoRows = [
    ['Device Name', report.device.deviceName, 'Operating System', `${report.device.os} ${report.device.osVersion}`],
    ['Manufacturer', report.device.manufacturer, 'Browser Engine', report.device.browser],
    ['Screen Resolution', `${report.device.screenRes} (@${report.device.pixelRatio}x)`, 'CPU Logical Cores', `${report.device.cpuCores} Threads`],
    ['Storage Quota', report.device.storageQuotaGb ? `${report.device.storageQuotaGb} GB` : 'Flash Quota', 'Network State', report.device.connectionType || 'Nominal']
  ];

  autoTable(doc, {
    startY: 84,
    head: [['DEVICE ATTRIBUTE', 'SPECIFICATION', 'HARDWARE ATTRIBUTE', 'SPECIFICATION']],
    body: deviceInfoRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 38], textColor: [54, 225, 204], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fillColor: [255, 255, 255], textColor: [20, 30, 45], fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 248, 250] },
    margin: { left: 14, right: 14 }
  });

  // Individual Hardware Tests Checklist Table
  const testRows = Object.values(report.tests).map(t => [
    t.title,
    t.category.toUpperCase().replace('_', ' & '),
    t.status,
    t.details || 'Test executed according to standard procedure'
  ]);

  const lastTableY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 135;

  autoTable(doc, {
    startY: lastTableY + 8,
    head: [['TEST MODULE', 'CATEGORY', 'STATUS', 'OUTCOME / DETAILS']],
    body: testRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 38], textColor: [32, 184, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fillColor: [255, 255, 255], textColor: [20, 30, 45], fontSize: 7.5 },
    alternateRowStyles: { fillColor: [245, 248, 250] },
    margin: { left: 14, right: 14 }
  });

  // Check if new page needed
  let nextY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  if (nextY > 230) {
    doc.addPage();
    nextY = 20;
  }

  // Physical Inspection Summary Table
  const phys = report.physicalInspection;
  const physRows = [
    ['Screen Glass', phys.screenGlass, 'Body / Frame', phys.bodyFrame],
    ['Camera Lens', phys.cameraLens, 'Charging Port', phys.chargingPort],
    ['Power Button', phys.powerButton, 'Volume Buttons', phys.volumeButtons],
    ['SIM Tray', phys.simTray, 'Back Panel', phys.backPanel]
  ];

  autoTable(doc, {
    startY: nextY,
    head: [['PHYSICAL COMPONENT', 'CONDITION', 'PHYSICAL COMPONENT', 'CONDITION']],
    body: physRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 38], textColor: [255, 184, 77], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fillColor: [255, 255, 255], textColor: [20, 30, 45], fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 248, 250] },
    margin: { left: 14, right: 14 }
  });

  nextY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  if (nextY > 230) {
    doc.addPage();
    nextY = 20;
  }

  // Warnings & Recommendations
  if (report.warnings.length > 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 92, 108);
    doc.text('IDENTIFIED WARNINGS & IRREGULARITIES:', 14, nextY);
    nextY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(50, 50, 50);
    report.warnings.forEach(w => {
      doc.text(`• ${w}`, 18, nextY);
      nextY += 4.5;
    });
    nextY += 3;
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(54, 225, 204);
  doc.text('RECOMMENDATIONS & INSPECTOR NOTES:', 14, nextY);
  nextY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);
  report.recommendations.forEach(r => {
    doc.text(`• ${r}`, 18, nextY);
    nextY += 4.5;
  });

  // Footer Disclaimer
  doc.setFillColor(7, 11, 20);
  doc.rect(0, 275, 210, 22, 'F');
  doc.setTextColor(132, 150, 168);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'AUTHENTIX TECHNICAL DISCLAIMER: AuthentiX provides diagnostic indicators and decision-support information.',
    14,
    282
  );
  doc.text(
    'It does not guarantee manufacturer authenticity, device ownership, or certification. Sensor tests reflect real browser capabilities.',
    14,
    287
  );

  // Save the PDF
  doc.save(`AuthentiX_Report_${report.id}.pdf`);
}
