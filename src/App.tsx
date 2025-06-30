import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InvoiceView from './components/InvoiceView';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:invoiceId" element={<InvoiceView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;