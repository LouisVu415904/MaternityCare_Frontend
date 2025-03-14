import { Provider } from 'react-redux';
import { store } from './store/config';
import ManageUsersPage from './pages/Admin/ManageUsersPage';
import Profile from './pages/Profile/Profile';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import CreateFetus from './pages/CreateFetus/CreateFetus';
import CreateFetusHealth from './pages/CreateFetusHealth/CreateFetusHealth';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Register from './pages/Register/Register';
import LoginPage from './pages/Login/Login';
import { AuthProvider } from './constants/AuthContext';
import ViewFetusHealth from './pages/ViewFetusHealth/ViewFetusHealth';
import Blog from './pages/Community/Blog';
import { ToastContainer } from 'react-toastify';
import Censor from './pages/AdminCensor/Censor';
import PackageList from './pages/PackageList/PackageList';
import CreatePackage from './pages/Admin/CreatePackage';
import { ThemeProvider } from './constants/ThemeContext';
import { FetusProvider } from './constants/FetusContext';
import AdminLayout from './components/layout/AdminLayout';
import ManagePackagePage from './pages/Admin/manage-package/ManagePackagePage';
import ViewSlot from './pages/ViewSlot/ViewSlot';
import CreateSlot from './pages/AdminCreateSlot/CreateSlot';
import Forgot from './pages/ForgotPassword/ForgetP';
import ManageFetusHealth from './pages/Admin/ManageFetusHealth/ManageFetusHealth';
import PregnancyWeek from './pages/Pregnancy/PregnancyWeek';
import PaymentDetail from './pages/PaymentDetail/PaymentDetail';
import PaymentFailurePage from './pages/PaymentPage/PaymentFailurePage';
import PaymentSuccessPage from './pages/PaymentPage/PaymentSuccessPage';
import TransactionManagementPage from './pages/Admin/TransactionManagementPage/TransactionManagementPage';

function Layout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isLoginRegister = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="app">
      {!isLoginRegister && <Header />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-fetus" element={<CreateFetus />} />
          <Route path="/create-fetus-health" element={<CreateFetusHealth />} />
          <Route path="/register" element={<Register />} />
          <Route path="/management-users" element={<ManageUsersPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/view-fetus-health" element={<ViewFetusHealth />} />
          <Route path="/community" element={<Blog />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/package-list" element={<PackageList />} />
          <Route path="/create-package" element={<CreatePackage />} />
          <Route path="/payment-detail/:packageId" element={<PaymentDetail />} />
          <Route path="/Censor" element={<Censor />} />
          <Route path="/booking" element={<ViewSlot />} />
          <Route path="/pregnancy" element={<PregnancyWeek />} />
          <Route path="/createslot" element={<CreateSlot />} />
          <Route path="/forget" element={<Forgot />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/payment-failure" element={<PaymentFailurePage />} />

          {/* Route cho admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="manage-user" element={<ManageUsersPage />} />
            <Route path="manage-packages" element={<ManagePackagePage />} />
            <Route path="manage-fetus-health" element={<ManageFetusHealth />} />
          <Route path="manage-transaction" element={<TransactionManagementPage/>}/>
          </Route>
        </Routes>
        <ToastContainer />
      </main>
      {!isLoginRegister && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Provider store={store}>
          <FetusProvider>
            <Router>
              <Layout />
            </Router>
          </FetusProvider>
        </Provider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;