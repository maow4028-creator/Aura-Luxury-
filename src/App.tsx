import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';

// Separated Dedicated Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { FacilitiesPage } from './pages/FacilitiesPage';
import { ProgramsPage } from './pages/ProgramsPage';
import { MembershipPage } from './pages/MembershipPage';
import { BookingPage } from './pages/BookingPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { MyAccountPage } from './pages/MyAccountPage';
import { MyMembershipPage } from './pages/MyMembershipPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [navParams, setNavParams] = useState<any>({});

  // Sync with browser hash routing for deep linking and back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      const [page, queryString] = hash.split('?');
      setCurrentPage(page);

      if (queryString) {
        const params = new URLSearchParams(queryString);
        const obj: any = {};
        params.forEach((val, key) => {
          obj[key] = val;
        });
        setNavParams(obj);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setNavParams(params);

    let hash = `#${page}`;
    const keys = Object.keys(params);
    if (keys.length > 0) {
      const qs = new URLSearchParams(params).toString();
      hash += `?${qs}`;
    }
    window.location.hash = hash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage navigate={navigate} />;
      case 'about':
        return <AboutPage navigate={navigate} />;
      case 'facilities':
        return <FacilitiesPage navigate={navigate} />;
      case 'programs':
        return <ProgramsPage navigate={navigate} />;
      case 'membership':
        return <MembershipPage navigate={navigate} />;
      case 'booking':
        return <BookingPage initialPlanId={navParams.planId ? Number(navParams.planId) : undefined} navigate={navigate} />;
      case 'gallery':
        return <GalleryPage />;
      case 'contact':
        return <ContactPage />;
      case 'login':
        return <LoginPage returnTo={navParams.returnTo} planId={navParams.planId ? Number(navParams.planId) : undefined} navigate={navigate} />;
      case 'register':
        return <RegisterPage returnTo={navParams.returnTo} planId={navParams.planId ? Number(navParams.planId) : undefined} navigate={navigate} />;
      case 'forgot-password':
        return <ForgotPasswordPage navigate={navigate} />;
      case 'my-account':
        return <MyAccountPage navigate={navigate} />;
      case 'my-membership':
        return <MyMembershipPage navigate={navigate} />;
      case 'admin':
        return <AdminDashboardPage navigate={navigate} />;
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#183247] selection:bg-[#55B9E8] selection:text-white">
      {/* Sticky Top Navigation */}
      <Navbar currentPage={currentPage} navigate={navigate} />

      {/* Main Page Body */}
      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      {/* Floating WhatsApp Quick Connect Button */}
      <FloatingWhatsApp />

      {/* Global Luxury Footer */}
      <Footer navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
