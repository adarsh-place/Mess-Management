const PDFDocument = require('pdfkit');


function generateMenuPDF(days, timings = ["", "", ""]) {
  const doc = new PDFDocument({ margin: 30, layout: 'landscape' });
  let buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {});
  doc.fontSize(18).text('Mess Menu Timetable', { align: 'center' });
  doc.moveDown(1);

  // Table headers
  const table = {
    headers: ['Day', 'Breakfast', 'Lunch', 'Dinner'],
    rows: []
  };
  // Timings row
  table.rows.push(['', timings[0], timings[1], timings[2]]);
  // Menu rows
  Object.keys(days).forEach(day => {
    const arr = days[day] || ["", "", ""];
    table.rows.push([
      day,
      arr[0] || '',
      arr[1] || '',
      arr[2] || ''
    ]);
  });

  // Draw table centered
  const colWidths = [100, 200, 200, 200];
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  const pageWidth = doc.page.width;
  const startX = Math.floor((pageWidth - tableWidth) / 2);
  let y = doc.y;
  // Draw header
  table.headers.forEach((header, i) => {
    doc.rect(startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y, colWidths[i], 25).stroke();
    doc.font('Helvetica-Bold').fontSize(12).text(header, startX + 5 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y + 7, { width: colWidths[i] - 10, align: 'center' });
  });
  y += 25;
  // Draw rows with dynamic height
  table.rows.forEach(row => {
    // Calculate the max height needed for this row
    const cellHeights = row.map((cell, i) => {
      return doc.heightOfString(cell, { width: colWidths[i] - 10, align: 'center', font: 'Helvetica', fontSize: 11 });
    });
    const rowHeight = Math.max(...cellHeights, 25) + 14; // 14 for padding
    row.forEach((cell, i) => {
      doc.rect(startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y, colWidths[i], rowHeight).stroke();
      doc.font('Helvetica').fontSize(11).text(cell, startX + 5 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y + 7, { width: colWidths[i] - 10, align: 'center' });
    });
    y += rowHeight;
    // tableBottomY = y;
  });
  // Draw outer border for the table
//   doc.rect(startX, tableTopY, tableWidth, tableBottomY - tableTopY).lineWidth(2).stroke();

  doc.end();
  return new Promise(resolve => {
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
  });
}

module.exports = { generateMenuPDF };