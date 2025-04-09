import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Calculator } from './pages/Calculator';
import { Settings } from './pages/Settings';
import { Orders } from './pages/Orders';
import { Reports } from './pages/Reports';
import { Expenses } from './pages/Expenses';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <Routes>
          <Route path="/" element={<Orders />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/expenses" element={<Expenses />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;