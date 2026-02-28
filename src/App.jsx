import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import SuppliersPage from './pages/SuppliersPage';
import BrandsPage from './pages/BrandsPage';
import IvlLensesPage from './pages/IvlLensesPage';
import ContactLensesPage from './pages/ContactLensesPage';
import GridEditorPage from './pages/GridEditorPage';
import ImportPage from './pages/ImportPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              {/* Grid editor is full-page, outside normal Layout */}
              <Route
                path="/suppliers/:supplierId/brands/:brandId/ivl/:lensId/grid"
                element={<GridEditorPage />}
              />

              {/* Main app with sidebar layout */}
              <Route element={<Layout />}>
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/suppliers/:supplierId/brands" element={<BrandsPage />} />
                <Route
                  path="/suppliers/:supplierId/brands/:brandId/ivl"
                  element={<IvlLensesPage />}
                />
                <Route
                  path="/suppliers/:supplierId/brands/:brandId/contact"
                  element={<ContactLensesPage />}
                />
                <Route path="/import" element={<ImportPage />} />
              </Route>
            </Route>

            <Route path="/" element={<Navigate to="/suppliers" replace />} />
            <Route path="*" element={<Navigate to="/suppliers" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
