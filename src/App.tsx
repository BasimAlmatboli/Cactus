import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Calculator } from './pages/Calculator';
import { Settings } from './pages/Settings';
import { Orders } from './pages/Orders';
import { Reports } from './pages/Reports';
import { Expenses } from './pages/Expenses';
import { Offers } from './pages/Offers';
import { ProductMigrationTest } from './components/ProductMigrationTest';


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <Routes>
          <Route path="/" element={<Orders />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/migration-test" element={<ProductMigrationTest />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;