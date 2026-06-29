import { Request, Response, NextFunction } from 'express';
import PDFDocument from 'pdfkit';
import { Invoice } from '../models/Invoice';
import { Booking } from '../models/Booking';
import { AppError } from '../utils/AppError';

// Mock function to create a basic Invoice record based on a Booking
export const generateInvoiceRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate('service');
    if (!booking) return next(new AppError('Booking not found', 404));

    // Check if invoice already exists
    let invoice = await Invoice.findOne({ booking: bookingId });
    if (invoice) {
      return res.status(200).json({ success: true, data: invoice });
    }

    const servicePrice = booking.totalAmount || 500;
    const platformFee = 49;
    const tax = Math.round(servicePrice * 0.18);
    const total = servicePrice + platformFee + tax;

    invoice = await Invoice.create({
      booking: booking._id,
      customer: booking.customer,
      technician: booking.technician,
      invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      items: [
        {
          description: (booking.service as any).name || 'Home Service',
          amount: servicePrice
        }
      ],
      subtotal: servicePrice,
      platformFee,
      tax,
      total,
      status: booking.paymentStatus === 'completed' ? 'paid' : 'draft'
    });

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('customer', 'name')
      .populate({ path: 'technician', populate: { path: 'user', select: 'name' } });

    res.status(201).json({ success: true, data: populatedInvoice });
  } catch (error) {
    next(error);
  }
};

// Generate and stream PDF Invoice
export const downloadInvoicePdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name email')
      .populate({ path: 'technician', populate: { path: 'user', select: 'name' } });

    if (!invoice) return next(new AppError('Invoice not found', 404));

    // Only allow customer, technician, or admin to download
    const isCustomer = invoice.customer._id.toString() === req.user?.id;
    const isTech = invoice.technician._id.toString() === req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    if (!isCustomer && !isTech && !isAdmin) {
      return next(new AppError('Unauthorized access to invoice', 403));
    }

    // Set headers to force PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Stream the PDF to the response
    doc.pipe(res);

    // Build PDF Content
    doc.fontSize(20).text('FixNow AI Invoice', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${invoice.createdAt.toLocaleDateString()}`);
    doc.text(`Status: ${invoice.status.toUpperCase()}`);
    
    doc.moveDown();
    doc.text(`Customer: ${(invoice.customer as any).name}`);
    
    const techName = (invoice.technician as any)?.user?.name || 'Technician';
    doc.text(`Technician: ${techName}`);
    
    doc.moveDown().moveDown();
    doc.fontSize(14).text('Items:', { underline: true });
    doc.moveDown(0.5);

    invoice.items.forEach(item => {
      doc.fontSize(12).text(`${item.description} ................................... Rs. ${item.amount}`);
    });

    doc.moveDown();
    doc.text(`Subtotal: Rs. ${invoice.subtotal}`);
    doc.text(`Platform Fee: Rs. ${invoice.platformFee}`);
    doc.text(`Tax (18%): Rs. ${invoice.tax}`);
    doc.moveDown();
    doc.fontSize(16).text(`Total: Rs. ${invoice.total}`, { underline: true });

    doc.moveDown().moveDown();
    doc.fontSize(10).text('Thank you for using FixNow AI!', { align: 'center' });

    // Finalize PDF file
    doc.end();

  } catch (error) {
    next(error);
  }
};
