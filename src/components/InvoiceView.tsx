import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

type LineItem = {
  item: string;
  qty: number;
  price: number;
  total: number;
};

type Invoice = {
  invoice_number: string;
  recipient: string;
  event_type: string;
  event_date: string;
  address: {
    line_1: string;
    line_2?: string;
  };
  line_items: LineItem[];
  total_due: number;
  deposit_paid?: number;
  balance_due: number;
  payment_link?: string;
};

const InvoiceView = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/invoices/${invoiceId}.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Invoice not found");
        return res.json();
      })
      .then(setInvoice)
      .catch(() => setError(true));
  }, [invoiceId]);

  if (error) return <div>Invoice not found.</div>;
  if (!invoice) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 font-sans">
      <h1 className="text-2xl font-bold mb-2">Invoice #{invoice.invoice_number}</h1>
      <p className="mb-1"><strong>Recipient:</strong> {invoice.recipient}</p>
      <p className="mb-1"><strong>Event:</strong> {invoice.event_type} on {invoice.event_date}</p>
      <p className="mb-4">
        <strong>Address:</strong><br />
        {invoice.address.line_1}<br />
        {invoice.address.line_2 && <>{invoice.address.line_2}<br /></>}
      </p>

      <table className="w-full border-collapse mb-4">
        <thead>
          <tr>
            <th className="border-b text-left">Item</th>
            <th className="border-b text-right">Qty</th>
            <th className="border-b text-right">Price</th>
            <th className="border-b text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.line_items.map((item, idx) => (
            <tr key={idx}>
              <td>{item.item}</td>
              <td className="text-right">{item.qty}</td>
              <td className="text-right">${item.price.toFixed(2)}</td>
              <td className="text-right">${item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right mb-2">
        <p><strong>Total Due:</strong> ${invoice.total_due.toFixed(2)}</p>
        {invoice.deposit_paid != null && (
          <p><strong>Deposit Paid:</strong> ${invoice.deposit_paid.toFixed(2)}</p>
        )}
        <p><strong>Balance Due:</strong> ${invoice.balance_due.toFixed(2)}</p>
      </div>

      {invoice.payment_link && (
        <div className="mt-4 text-center">
          <a
            href={invoice.payment_link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Pay Now
          </a>
        </div>
      )}
    </div>
  );
};

export default InvoiceView;
