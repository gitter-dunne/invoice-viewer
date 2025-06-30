import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search } from 'lucide-react';

const Home: React.FC = () => {
  const [invoiceId, setInvoiceId] = useState('');
  const navigate = useNavigate();

  const handleViewInvoice = () => {
    if (invoiceId.trim()) {
      navigate(`/${invoiceId.trim()}`);
    }
  };

  const sampleInvoices = [
    'betty25',
    'john-birthday-2024',
    'sarah-party-inv'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <FileText className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice System</h1>
          <p className="text-gray-600">Enter an invoice ID to view or pay</p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="invoiceId" className="block text-sm font-medium text-gray-700 mb-2">
              Invoice ID
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="invoiceId"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleViewInvoice()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., betty25"
              />
            </div>
          </div>

          <button
            onClick={handleViewInvoice}
            disabled={!invoiceId.trim()}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            View Invoice
          </button>

          <div className="border-t pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Sample Invoices:</h3>
            <div className="space-y-2">
              {sampleInvoices.map((id) => (
                <button
                  key={id}
                  onClick={() => navigate(`/${id}`)}
                  className="w-full text-left px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;