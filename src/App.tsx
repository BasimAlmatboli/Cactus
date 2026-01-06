import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/MainLayout';
import { Calculator } from './pages/Calculator';
import { Settings } from './pages/Settings';
import { Orders } from './pages/Orders';
import { Reports } from './pages/Reports';
import { Expenses } from './pages/Expenses';
import SallaImport from './pages/SallaImport';
import { ErrorBoundary } from './components/ErrorBoundary';


function App() {
  return (
    <ErrorBoundary>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Orders />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/salla-import" element={<SallaImport />} />
          </Routes>
        </MainLayout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;