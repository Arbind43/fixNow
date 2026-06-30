import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Download, FileText, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Badge } from '../../components/ui';
import { showToast } from '../../components/ui/Toast';
import { format } from 'date-fns';

export default function InvoicePage() {
  const { bookingId } = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateAndFetchInvoice = async () => {
      try {
        const res = await axios.post('/api/invoices/generate', { bookingId });
        setInvoice(res.data.data);
      } catch (error) {
        showToast.error('Failed to load invoice');
      } finally {
        setIsLoading(false);
      }
    };

    if (bookingId) generateAndFetchInvoice();
  }, [bookingId]);

  const handleDownload = async () => {
    if (!invoice?._id) return;
    try {
      const res = await axios.get(`/api/invoices/${invoice._id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${invoice.invoiceNumber || invoice._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      showToast.error('Failed to download invoice');
    }
  };

  if (isLoading) {
    return <DashboardLayout><div className="p-8 text-center text-[var(--text-secondary)]">Generating Invoice...</div></DashboardLayout>;
  }

  if (!invoice) {
    return <DashboardLayout><div className="p-8 text-center text-[var(--color-error)]">Invoice could not be found or generated.</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <Link to="/dashboard/bookings" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2 transition-colors">
            <ArrowLeft size={16} /> Back to Bookings
          </Link>
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download size={18} /> Download PDF
          </Button>
        </div>

        <Card className="p-8 sm:p-12 print:shadow-none print:border-none">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-[var(--border-primary)] pb-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-[var(--color-primary-600)] mb-4">
                <div className="w-10 h-10 bg-[var(--color-primary-600)] rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                <span className="text-2xl font-bold tracking-tight">FixNow AI</span>
              </div>
              <p className="text-[var(--text-secondary)] text-sm">123 Tech Park, Cyber City</p>
              <p className="text-[var(--text-secondary)] text-sm">Gurugram, Haryana 122002</p>
              <p className="text-[var(--text-secondary)] text-sm">GSTIN: 06AAACA1234A1Z5</p>
            </div>
            <div className="mt-6 sm:mt-0 text-left sm:text-right">
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">INVOICE</h1>
              <p className="text-[var(--text-primary)] font-medium">{invoice.invoiceNumber}</p>
              <p className="text-[var(--text-secondary)] text-sm mt-1">
                Date: {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
              </p>
              <Badge variant={invoice.status === 'paid' ? 'success' : 'warning'} className="mt-2">
                {invoice.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-8">
            <p className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Bill To:</p>
            <p className="font-bold text-[var(--text-primary)]">{(invoice.customer as any)?.name || 'Customer'}</p>
            <p className="text-[var(--text-secondary)] text-sm">Service provided by: {(invoice.technician as any)?.user?.name || (invoice.technician as any)?.name || 'Technician'}</p>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <div className="w-full text-left border-b-2 border-[var(--border-primary)] pb-2 mb-4 flex">
              <span className="flex-1 font-bold text-[var(--text-primary)]">Description</span>
              <span className="w-32 text-right font-bold text-[var(--text-primary)]">Amount</span>
            </div>
            
            {invoice.items.map((item: any, idx: number) => (
              <div key={idx} className="flex py-3 border-b border-[var(--border-primary)]">
                <span className="flex-1 text-[var(--text-secondary)]">{item.description}</span>
                <span className="w-32 text-right text-[var(--text-primary)]">₹{item.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full sm:w-64 space-y-3">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal</span>
                <span>₹{invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Platform Fee</span>
                <span>₹{invoice.platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)] pb-3 border-b border-[var(--border-primary)]">
                <span>Tax (18% GST)</span>
                <span>₹{invoice.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-[var(--text-primary)] pt-1">
                <span>Total</span>
                <span>₹{invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-[var(--border-primary)] text-center text-sm text-[var(--text-tertiary)]">
            <p className="flex items-center justify-center gap-2 mb-1">
              <FileText size={16} /> Thank you for choosing FixNow AI!
            </p>
            <p>If you have any questions concerning this invoice, please contact support@fixnow.ai</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
