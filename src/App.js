import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CurrencyProvider } from "./component/context/currencyContext";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./component/Auth/ProtectedRoute";
import LoadingSpinner from "./component/common/LoadingSpinner";

// Static imports for initial shell layout
import Navbar from "./component/Navbar";
import LandingFooterLayout from "./component/LandingFooterLayout";

// Lazy-loaded page components for route-level code splitting
const LandingPage = lazy(() => import("./component/Sellytics/LandingPage/LandingPage"));
const WarehouseLanding = lazy(() => import("./component/Sellytics/Hub/WarehouseLandingPage/WarehouseLanding"));
const Login = lazy(() => import("./component/Auth/Login"));
const Registration = lazy(() => import("./component/Auth/Registration"));
const Forgotpassword = lazy(() => import("./component/Auth/Forgotpassword"));
const ResetPassword = lazy(() => import("./component/Auth/ResetPassword"));
const TeamSignup = lazy(() => import("./component/Auth/TeamSignup"));
const AdminRegistration = lazy(() => import("./component/Auth/AdminRegistration"));
const Admins = lazy(() => import("./component/AdminAuth/Admins"));

// Protected Dashboard Routes
const RegisteredDashboards = lazy(() => import("./component/RegisteredDashboards"));
const StoreDashboard = lazy(() => import("./component/Sellytics/StoreDashboard"));
const AdminHome = lazy(() => import("./component/AdminDashboard/AdminHome"));
const StoreUsersHome = lazy(() => import("./component/Sellytics/StoreUsersHome"));
const MultiStoreDashboard = lazy(() => import("./component/Sellytics/MultiStoreDB/MultiStoreDashboard"));
const MultiSalesDashboard = lazy(() => import("./component/Sellytics/MultiStoreDB/MultiSales/MultiSalesDashboard"));
const WarehouseHub = lazy(() => import("./component/Sellytics/Hub/WarehouseHub"));
const ClientPortalManager = lazy(() => import("./component/Sellytics/Hub/ClientPortal/ClientPortalManager"));
const SellyticsPayment = lazy(() => import("./component/Payments/SellyticsPayment"));
const PricingFeatures = lazy(() => import("./component/Payments/PricingFeatures"));
const ShareholderModule = lazy(() => import("./component/Shareholders"));
const ReceiptModules = lazy(() => import("./component/Services/ReceiptModules"));
const ReceiptQRCode = lazy(() => import("./component/VariexContents/ReceiptQRCode"));
const ReceiptQRCodeWrapper = lazy(() => import("./component/VariexContents/ReceiptQRCodeWrapper"));
const ReceiptView = lazy(() => import("./component/Sellytics/ReceiptManager/ReceiptView"));

const App = () => {
  return (
    <CurrencyProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes with Navbar & Footer */}
            <Route
              element={
                <>
                  <Navbar />
                  <LandingFooterLayout />
                </>
              }
            >
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<Forgotpassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/team-signup" element={<TeamSignup />} />
              <Route path="/register" element={<Registration />} />
            </Route>

            {/* Public Landing Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/warehouse" element={<WarehouseLanding />} />
            <Route path="/adminregister" element={<AdminRegistration />} />
            <Route path="/admin" element={<Admins />} />
            <Route path="/rec" element={<ReceiptModules />} />
            <Route path="/qrcodes" element={<ReceiptQRCode />} />
            <Route path="/receipts/:receiptId" element={<ReceiptQRCodeWrapper />} />
            <Route path="/receipt/:receipt_id" element={<ReceiptView />} />
            <Route path="/portal/:token" element={<ClientPortalManager />} />

            {/* Protected Routes (Authentication Required) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/regdashboard" element={<RegisteredDashboards />} />
              <Route path="/dashboard" element={<StoreDashboard />} />
              <Route path="/admin-dashboard" element={<AdminHome />} />
              <Route path="/team-dashboard" element={<StoreUsersHome />} />
              <Route path="/owner-dashboard" element={<MultiStoreDashboard />} />
              <Route path="/payment" element={<SellyticsPayment />} />
              <Route path="/upgrade" element={<PricingFeatures />} />
              <Route path="/shareholders" element={<ShareholderModule />} />
              <Route path="/ano" element={<MultiSalesDashboard />} />
              <Route path="/c" element={<WarehouseHub />} />
            </Route>
          </Routes>
        </Suspense>

        {/* Global Toaster */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerStyle={{ top: 20 }}
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1e293b",
              color: "#fff",
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "15px",
            },
            success: {
              icon: "",
              style: { background: "#10b981" },
            },
            error: {
              icon: "×",
              style: { background: "#ef4444" },
            },
            loading: {
              icon: "MagnifyingGlass",
              style: { background: "#f59e0b" },
            },
          }}
        />
      </Router>
    </CurrencyProvider>
  );
};

export default App;