import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Clock, CheckCircle, CreditCard } from 'lucide-react';
import { InvoiceData } from '../types/invoice';
import PaymentButton from './PaymentButton';
import { formatCurrency, isAfterEventDate, calculateDepositAmount } from '../utils/invoiceUtils';

const InvoiceView: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastModified, setLastModified] = useState<number>(0);

  const loadInvoice = async () => {
    try {
      const response = await fetch(`/invoices/${invoiceId}.json`);
      if (!response.ok) {
        throw new Error('Invoice not found');
      }
      const data = await response.json();
      setInvoice(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoice');
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  };

  // Real-time file monitoring
  useEffect(() => {
    if (!invoiceId) return;

    loadInvoice();

    // Poll for changes every 2 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/invoices/${invoiceId}.json`);
        if (response.ok) {
          const lastMod = response.headers.get('last-modified');
          const modTime = lastMod ? new Date(lastMod).getTime() : Date.now();
          
          if (modTime > lastModified) {
            setLastModified(modTime);
            const data = await response.json();
            setInvoice(data);
          }
        }
      } catch (err) {
        // Silently handle polling errors
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [invoiceId, lastModified]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h2>
          <p className="text-gray-600 mb-6">
            The invoice "{invoiceId}" could not be found or loaded.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isPostEvent = isAfterEventDate(invoice.eventDetails.dateTime.end);
  const depositAmount = calculateDepositAmount(invoice.totalAmount);
  const balanceAmount = invoice.totalAmount - depositAmount;

  // Check if deposit has been paid
  const hasDepositBeenPaid = invoice.paymentHistory && 
    invoice.paymentHistory.some(payment => payment.type === 'Deposit');

  // Check if we should show tipping option
  // Show if: deposit paid OR event is today/after OR one day before event
  const eventDate = new Date(invoice.eventDetails.dateTime.start);
  const today = new Date();
  const oneDayBefore = new Date(eventDate);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);
  
  const shouldShowTipping = hasDepositBeenPaid || 
    today >= oneDayBefore || 
    isPostEvent;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-indigo-600 hover:text-indigo-700 flex items-center transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>

        {/* Payment Status Alert */}
        {isPostEvent && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <div>
                <h3 className="text-red-800 font-medium">Payment Required</h3>
                <p className="text-red-700 text-sm">
                  This event has concluded. Full payment is now required.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Invoice */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-white p-8 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                    Invoice #{invoice.invoiceNumber}
                  </h1>
                  <div className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                    {invoice.clientName}
                  </div>
                  <div className="text-gray-600 space-y-1" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                    <div>Deposit Due: {invoice.paymentTerms.depositDue}</div>
                    <div>Balance Due: {invoice.paymentTerms.balanceDue}</div>
                  </div>
                  <div className="text-xl font-bold text-gray-900 mt-4" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                    {invoice.eventDetails.type} for {invoice.eventDetails.childName}
                  </div>
                  <div className="text-gray-700" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                    {invoice.eventDetails.dateTime.start} - {invoice.eventDetails.dateTime.end}
                  </div>
                </div>
              </div>
              <div className="ml-8">
                <div className="w-64 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Company Logo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Event and Address Info */}
          <div className="p-8 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                  Event Address
                </h3>
                <div className="text-gray-700 space-y-1" style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '15px' }}>
                  <div>{invoice.eventDetails.venue.address.line1}</div>
                  {invoice.eventDetails.venue.address.line2 && (
                    <div>{invoice.eventDetails.venue.address.line2}</div>
                  )}
                  <div>{invoice.eventDetails.venue.address.city}, {invoice.eventDetails.venue.address.state} {invoice.eventDetails.venue.address.zipCode}</div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                  Event Info
                </h3>
                <div className="text-gray-700" style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '15px' }}>
                  {invoice.eventDetails.details}
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="p-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-yellow-300">
                    <th className="text-left py-3 px-4 font-bold text-gray-900" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                      Description
                    </th>
                    <th className="text-center py-3 px-4 font-bold text-gray-900" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                      Qty
                    </th>
                    <th className="text-center py-3 px-4 font-bold text-gray-900" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                      Price
                    </th>
                    <th className="text-center py-3 px-4 font-bold text-gray-900" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-3 px-4 text-gray-700" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                        {item.description}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-700" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-700" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-700" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                        {formatCurrency(item.quantity * item.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total and Payment */}
            <div className="mt-8 flex flex-col md:flex-row justify-between items-start">
              <div className="mb-6 md:mb-0 md:w-1/2">
                <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                  {invoice.memo}
                </div>
              </div>
              
              <div className="md:w-1/3 space-y-4">
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                    Total: {formatCurrency(invoice.totalAmount)}
                  </div>
                </div>

                {/* Payment Buttons */}
                <div className="space-y-3">
                  {/* Full Payment Button - ALWAYS visible */}
                  <PaymentButton
                    amount={invoice.totalAmount}
                    label={`Pay Full Amount (${formatCurrency(invoice.totalAmount)})`}
                    variant="full"
                    invoiceId={invoice.invoiceNumber}
                    icon={<CreditCard className="w-4 h-4" />}
                    showTipSection={shouldShowTipping}
                  />

                  {/* Deposit Button - Only show if deposit hasn't been paid */}
                  {!hasDepositBeenPaid && (
                    <PaymentButton
                      amount={depositAmount}
                      label={`Pay Deposit (${formatCurrency(depositAmount)})`}
                      variant="deposit"
                      invoiceId={invoice.invoiceNumber}
                      icon={<Clock className="w-4 h-4" />}
                      showTipSection={shouldShowTipping}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        {invoice.paymentHistory && invoice.paymentHistory.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Payment History</h3>
            <div className="space-y-3">
              {invoice.paymentHistory.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">{payment.type}</div>
                      <div className="text-sm text-gray-600">{payment.date}</div>
                    </div>
                  </div>
                  <div className="font-bold text-green-600">
                    {formatCurrency(payment.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceView;