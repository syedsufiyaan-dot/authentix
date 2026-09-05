import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { DiagnosticReport } from '../types/diagnostic';

export async function generateReportPdf(report: DiagnosticReport): Promise<void> {
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
  doc.text(`Tests: ${report.stats.passed} Passed • ${report.stats.warning} Warnings - ${report.stats.failed} Failed`, 120, 71);

  // Category Score Breakdown
  const categoryRows = Object.values(report.categoryScores).map((category) => [
    category.name,
    `${category.score} / 100`,
    `${category.weight}%`,
    `${category.testsCount}`,
  ]);

  autoTable(doc, {
    startY: 84,
    head: [['CATEGORY', 'SCORE', 'WEIGHT', 'TESTS']],
    body: categoryRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 38],
      textColor: [54, 225, 204],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
      textColor: [20, 30, 45],
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [245, 248, 250],
    },
    margin: { left: 14, right: 14 },
  });

  const categoryTableY =
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 120;

  // Device Info Table
  const deviceInfoRows = [
    ['Device Name', report.device.deviceName, 'Operating System', `${report.device.os} ${report.device.osVersion}`],
    ['Manufacturer', report.device.manufacturer, 'Browser Engine', report.device.browser],
    ['Screen Resolution', `${report.device.screenRes} (@${report.device.pixelRatio}x)`, 'CPU Logical Cores', `${report.device.cpuCores} Threads`],
    ['Storage Quota', report.device.storageQuotaGb ? `${report.device.storageQuotaGb} GB` : 'Not available', 'Network State', report.device.connectionType || 'Nominal'],
  ];

  autoTable(doc, {
    startY: categoryTableY + 8,
    head: [['DEVICE ATTRIBUTE', 'SPECIFICATION', 'HARDWARE ATTRIBUTE', 'SPECIFICATION']],
    body: deviceInfoRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 38],
      textColor: [32, 184, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
      textColor: [20, 30, 45],
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [245, 248, 250],
    },
    margin: { left: 14, right: 14 },
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

  // Final Verdict
  let verdictTitle = '';
  let verdictDescription = '';

  if (report.overallScore >= 90) {
    verdictTitle = 'RECOMMENDED TO BUY';
    verdictDescription =
      'The device shows strong overall diagnostic health with no major concerns detected.';
    doc.setTextColor(57, 229, 140);
  } else if (report.overallScore >= 75) {
    verdictTitle = 'GOOD DEVICE - PROCEED WITH NORMAL CHECKS';
    verdictDescription =
      'The device is generally healthy, but review any warnings before completing the purchase.';
    doc.setTextColor(32, 184, 255);
  } else if (report.overallScore >= 60) {
    verdictTitle = 'INSPECTION RECOMMENDED';
    verdictDescription =
      'Some diagnostic areas need attention. Review failed tests, warnings, and physical condition carefully.';
    doc.setTextColor(255, 184, 77);
  } else {
    verdictTitle = 'NOT RECOMMENDED WITHOUT REPAIR';
    verdictDescription =
      'The device has significant diagnostic concerns. Repair or professional inspection is recommended before purchase.';
    doc.setTextColor(255, 92, 108);
  }
  // Make sure the purchase verdict is clearly visible
  if (nextY > 215) {
    doc.addPage();
    nextY = 20;
  }

  // Verdict box
  doc.setFillColor(245, 249, 250);
  doc.setDrawColor(54, 225, 204);
  doc.roundedRect(14, nextY, 182, 34, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(54, 110, 105);
  doc.text('AUTHENTIX FINAL PURCHASE VERDICT', 20, nextY + 8);

  doc.setFontSize(13);

  if (report.overallScore >= 90) {
    doc.setTextColor(30, 170, 95);
  } else if (report.overallScore >= 75) {
    doc.setTextColor(32, 140, 220);
  } else if (report.overallScore >= 60) {
    doc.setTextColor(220, 145, 35);
  } else {
    doc.setTextColor(220, 70, 80);
  }

  doc.text(verdictTitle, 20, nextY + 17);

  doc.setTextColor(70, 70, 70);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  const verdictLines = doc.splitTextToSize(verdictDescription, 165);
  doc.text(verdictLines, 20, nextY + 24);

  nextY += 42;
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
      doc.text(`- ${w}`, 18, nextY);
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
    doc.text(`- ${r}`, 18, nextY);
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

  // Public verification QR code
  const verificationUrl =
    `https://authentix-mobile.vercel.app/verify/${encodeURIComponent(report.id)}`;

  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 500,
    margin: 1,
    errorCorrectionLevel: 'M',
  });

  // Add a new verification section near the bottom
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(54, 225, 204);
  doc.text('VERIFY THIS AUTHENTIX REPORT', 145, 248);

  doc.addImage(
    qrDataUrl,
    'PNG',
    158,
    252,
    28,
    28
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(90, 100, 110);
  doc.text(
    'Scan to verify report authenticity',
    145,
    284
  );
  // Save the PDF
  doc.save(`AuthentiX_Report_${report.id}.pdf`);
}






