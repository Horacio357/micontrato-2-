import { Toaster } from "@/components/ui/toaster"
import OfflineBanner from "@/components/ui/OfflineBanner"
import InstallPWA from "@/components/ui/InstallPWA"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from './pages/Home';
import SelectCategory from './pages/SelectCategory';
import SelectContract from './pages/SelectContract';
import SelectProvince from './pages/SelectProvince';
import Wizard from './pages/Wizard';
import Preview from './pages/Preview';
import CheckoutSuccess from './pages/CheckoutSuccess';
import ContractDownload from './pages/ContractDownload';
import MyAccount from './pages/MyAccount';
import MisContratos from './pages/MisContratos';
import ChatBubble from './components/chat/ChatBubble';
import RequireAuth from './components/RequireAuth';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminContratos from './pages/admin/AdminContratos';
import AdminMetricas from './pages/admin/AdminMetricas';
import AdminPrecios from './pages/admin/AdminPrecios';
import AdminPagos from './pages/admin/AdminPagos';
import AdminLegal from './pages/admin/AdminLegal';
import AdminPlantillas from './pages/admin/AdminPlantillas';

const AuthenticatedApp = () => {
  const { isLoadingAuth, authError } = useAuth();

  // Show loading spinner while checking auth
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    // auth_required and other errors: let the app render normally.
    // RequireAuth guards handle login redirects per-route.
  }

  // Render the main app
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/crear" element={<SelectCategory />} />
        <Route path="/crear/:categoria" element={<SelectContract />} />
        <Route path="/crear/:categoria/:contrato" element={<SelectProvince />} />
        <Route path="/generar/:contrato/:provincia" element={<RequireAuth><Wizard /></RequireAuth>} />
        <Route path="/preview/:contractId" element={<RequireAuth><Preview /></RequireAuth>} />
        <Route path="/checkout/success/:contractId" element={<RequireAuth><CheckoutSuccess /></RequireAuth>} />
        <Route path="/mi-cuenta" element={<RequireAuth><MyAccount /></RequireAuth>} />
        <Route path="/mis-contratos" element={<RequireAuth><MisContratos /></RequireAuth>} />
        <Route path="/mi-cuenta/contrato/:contractId" element={<RequireAuth><ContractDownload /></RequireAuth>} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="contratos" element={<AdminContratos />} />
          <Route path="metricas" element={<AdminMetricas />} />
          <Route path="precios" element={<AdminPrecios />} />
          <Route path="pagos" element={<AdminPagos />} />
          <Route path="legal" element={<AdminLegal />} />
          <Route path="plantillas" element={<AdminPlantillas />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <ChatBubble />
    </>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <OfflineBanner />
        <InstallPWA />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App