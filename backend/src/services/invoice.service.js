const PDFDocument = require('pdfkit');

/**
 * Generate Invoice PDF and pipe to stream
 * @param {Object} order - Order document
 * @param {Object} user - User document
 * @param {Stream} stream - Writable stream (res)
 */
const generateInvoicePDF = (order, user, stream) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Add header
  doc
    .fillColor('#0070d1')
    .fontSize(24)
    .text('SHOEHUB', 50, 50)
    .fillColor('#444444')
    .fontSize(10)
    .text('123 Shoe Street', 200, 50, { align: 'right' })
    .text('Jakarta, Indonesia 12345', 200, 65, { align: 'right' })
    .text('support@shoehub.com', 200, 80, { align: 'right' });

  doc.moveTo(50, 100).lineTo(545, 100).stroke('#f3f3f3');

  // Add Invoice info
  doc
    .fillColor('#121314')
    .fontSize(20)
    .text('INVOICE', 50, 130);

  doc
    .fontSize(10)
    .fillColor('#6b6b6b')
    .text(`Invoice Number:`, 50, 160)
    .fillColor('#121314')
    .text(order.orderNumber, 130, 160)
    .fillColor('#6b6b6b')
    .text(`Date:`, 50, 175)
    .fillColor('#121314')
    .text(new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' }), 130, 175)
    .fillColor('#6b6b6b')
    .text(`Status:`, 50, 190)
    .fillColor('#121314')
    .text(order.paymentStatus.toUpperCase(), 130, 190);

  // Add Billing & Shipping info
  doc
    .fillColor('#121314')
    .fontSize(12)
    .text('Bill To:', 50, 225)
    .fontSize(10)
    .fillColor('#444444')
    .text(`${user.firstName} ${user.lastName}`, 50, 240)
    .text(order.shippingAddress.street, 50, 255)
    .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`, 50, 270)
    .text(order.shippingAddress.country, 50, 285);

  // Add Table Header
  const tableTop = 340;
  doc
    .fillColor('#121314')
    .fontSize(10)
    .text('ITEM DESCRIPTION', 50, tableTop)
    .text('SIZE', 280, tableTop)
    .text('QTY', 330, tableTop)
    .text('UNIT PRICE', 380, tableTop, { width: 80, align: 'right' })
    .text('TOTAL', 470, tableTop, { width: 75, align: 'right' });

  doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke('#121314');

  // Add Table Items
  let i = 0;
  order.items.forEach(item => {
    const y = tableTop + 30 + (i * 30);
    doc
      .fillColor('#444444')
      .text(item.name, 50, y, { width: 220 })
      .text(item.size, 280, y)
      .text(item.quantity.toString(), 330, y)
      .text(`$${item.price.toFixed(2)}`, 380, y, { width: 80, align: 'right' })
      .text(`$${(item.price * item.quantity).toFixed(2)}`, 470, y, { width: 75, align: 'right' });
    
    doc.moveTo(50, y + 20).lineTo(545, y + 20).stroke('#f3f3f3');
    i++;
  });

  const footerTop = tableTop + 30 + (i * 30) + 20;

  // Add Totals
  doc
    .fillColor('#6b6b6b')
    .text('Subtotal:', 350, footerTop, { width: 100, align: 'right' })
    .fillColor('#121314')
    .text(`$${order.subtotal.toFixed(2)}`, 460, footerTop, { width: 85, align: 'right' })
    
    .fillColor('#6b6b6b')
    .text('Shipping:', 350, footerTop + 20, { width: 100, align: 'right' })
    .fillColor('#121314')
    .text(order.shippingCost === 0 ? 'FREE' : `$${order.shippingCost.toFixed(2)}`, 460, footerTop + 20, { width: 85, align: 'right' })
    
    .fillColor('#6b6b6b')
    .text('Tax (8%):', 350, footerTop + 40, { width: 100, align: 'right' })
    .fillColor('#121314')
    .text(`$${order.tax.toFixed(2)}`, 460, footerTop + 40, { width: 85, align: 'right' })
    
    .fontSize(14)
    .fillColor('#121314')
    .text('Total Amount:', 330, footerTop + 70, { width: 120, align: 'right' })
    .text(`$${order.total.toFixed(2)}`, 460, footerTop + 70, { width: 85, align: 'right' });

  // Add Footer
  doc
    .fontSize(10)
    .fillColor('#6b6b6b')
    .text('If you have any questions about this invoice, please contact us at support@shoehub.com', 50, 750, { align: 'center', width: 500 })
    .fontSize(12)
    .fillColor('#0070d1')
    .text('Thank you for shopping with ShoeHub!', 50, 770, { align: 'center', width: 500 });

  doc.pipe(stream);
  doc.end();
};

module.exports = {
  generateInvoicePDF
};
