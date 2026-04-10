import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// TiliGo Pages
import LocationPermissionPrompt from './components/LocationPermissionPrompt';
import CustomerLayout from './components/CustomerLayout';
import Home from './pages/Home';
import BusinessPage from './pages/BusinessPage';
import Checkout from './pages/Checkout';
import TrackOrder from './pages/TrackOrder';
import MyOrders from './pages/MyOrders';
import BusinessRegister from './pages/BusinessRegister';
import BusinessLogin from './pages/BusinessLogin';
import BusinessDashboard from './pages/BusinessDashboard';
import DeliveryRegister from './pages/DeliveryRegister';
import DeliveryLogin from './pages/DeliveryLogin';
import DeliveryDashboard from './pages/DeliveryDashboard';
import AdminPanel from './pages/AdminPanel';
import DownloadApp from './pages/DownloadApp';
import DownloadProject from './pages/DownloadProject';
import StaffHub from './pages/StaffHub';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <img
            src="https://media.base44.com/images/public/69d519273be8cf966434f77a/9ac65c451_IMG_0066.png"
            alt="TiliGo" className="h-16 object-contain animate-pulse"
          />
          <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <>
    <LocationPermissionPrompt />
    <Routes>
      {/* Customer screens — persistent MobileBottomNav via CustomerLayout */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/dyqani/:id" element={<BusinessPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/gjurmo/:code" element={<TrackOrder />} />
        <Route path="/gjurmo" element={<TrackOrder />} />
        <Route path="/porositjet-e-mia" element={<MyOrders />} />
        <Route path="/shkarko-app" element={<DownloadApp />} />
        <Route path="/staff" element={<StaffHub />} />
      </Route>
      {/* Staff/business screens — no bottom nav */}
      <Route path="/biznesi/register" element={<BusinessRegister />} />
      <Route path="/biznesi/login" element={<BusinessLogin />} />
      <Route path="/biznesi/dashboard" element={<BusinessDashboard />} />
      <Route path="/dorezuesi/register" element={<DeliveryRegister />} />
      <Route path="/dorezuesi/login" element={<DeliveryLogin />} />
      <Route path="/dorezuesi/dashboard" element={<DeliveryDashboard />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/download.zip" element={<DownloadProject />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
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
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App