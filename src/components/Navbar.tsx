import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Menu, X, User as UserIcon, ShieldCheck, CreditCard, LogOut, ChevronRight } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  navigate: (page: string, params?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, navigate }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'programs', label: 'Programs' },
    { id: 'membership', label: 'Membership' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (pageId: string) => {
    navigate(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#DCE5EB]/60 py-3'
          : 'bg-white border-b border-[#EAF6FC] py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 group focus:outline-none text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#123B5D] to-[#55B9E8] flex items-center justify-center text-white shadow-md shadow-[#55B9E8]/20 group-hover:scale-105 transition-transform duration-300">
              <Dumbbell className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="block text-xl font-extrabold tracking-wider text-[#123B5D] uppercase font-['Outfit']">
                Aura
              </span>
              <span className="block text-[10px] font-semibold tracking-[0.25em] text-[#55B9E8] uppercase -mt-1">
                Luxury Fitness
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-[#55B9E8] bg-[#EAF6FC]'
                      : 'text-[#183247] hover:text-[#55B9E8] hover:bg-[#F5F7F9]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                {user.role === 'admin' && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#123B5D] hover:bg-[#183247] rounded-lg shadow-sm transition-all"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#55B9E8]" />
                    Admin Panel
                  </button>
                )}

                <button
                  onClick={() => handleNavClick('my-membership')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    currentPage === 'my-membership'
                      ? 'bg-[#55B9E8] text-white shadow-md shadow-[#55B9E8]/30'
                      : 'text-[#123B5D] bg-[#EAF6FC] hover:bg-[#55B9E8]/20'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  My Membership
                </button>

                <button
                  onClick={() => handleNavClick('my-account')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    currentPage === 'my-account'
                      ? 'bg-[#123B5D] text-white'
                      : 'text-[#718596] hover:text-[#183247] hover:bg-[#F5F7F9]'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  Account
                </button>

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-[#718596] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('admin')}
                  className="px-2.5 py-1.5 text-xs font-bold text-[#718596] hover:text-[#123B5D] flex items-center gap-1 rounded-lg hover:bg-[#F5F7F9] transition-colors"
                  title="Admin Portal"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#55B9E8]" />
                  <span>Admin</span>
                </button>
                <button
                  onClick={() => handleNavClick('login')}
                  className="px-3 py-2 text-sm font-semibold text-[#183247] hover:text-[#55B9E8] transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="px-3 py-2 text-sm font-semibold text-[#123B5D] bg-[#EAF6FC] hover:bg-[#DCE5EB] rounded-lg transition-colors"
                >
                  Register
                </button>
              </div>
            )}

            <button
              onClick={() => handleNavClick('membership')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-[#55B9E8] to-[#123B5D] hover:opacity-95 shadow-md shadow-[#55B9E8]/30 hover:shadow-lg transition-all transform active:scale-95"
            >
              <span>Join Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => handleNavClick('membership')}
              className="px-3 py-1.5 text-xs font-bold rounded-lg text-white bg-[#55B9E8]"
            >
              Join
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#183247] hover:bg-[#F5F7F9] rounded-lg focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#DCE5EB] px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-left px-3 py-2.5 rounded-lg text-base font-semibold ${
                  currentPage === link.id
                    ? 'text-[#55B9E8] bg-[#EAF6FC]'
                    : 'text-[#183247] hover:bg-[#F5F7F9]'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="pt-3 border-t border-[#EAF6FC] mt-2 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="px-3 py-1.5 text-xs text-[#718596] font-medium">
                    Signed in as <span className="font-bold text-[#183247]">{user.full_name}</span>
                  </div>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => handleNavClick('admin')}
                      className="text-left px-3 py-2 rounded-lg text-sm font-bold text-white bg-[#123B5D]"
                    >
                      Admin Panel
                    </button>
                  )}
                  <button
                    onClick={() => handleNavClick('my-membership')}
                    className="text-left px-3 py-2 rounded-lg text-sm font-bold text-[#55B9E8] bg-[#EAF6FC]"
                  >
                    My Membership
                  </button>
                  <button
                    onClick={() => handleNavClick('my-account')}
                    className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-[#183247] hover:bg-[#F5F7F9]"
                  >
                    My Account
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleNavClick('login')}
                      className="w-full py-2.5 text-center text-sm font-semibold text-[#183247] border border-[#DCE5EB] rounded-lg"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => handleNavClick('register')}
                      className="w-full py-2.5 text-center text-sm font-semibold text-white bg-[#123B5D] rounded-lg"
                    >
                      Register
                    </button>
                  </div>
                  <button
                    onClick={() => handleNavClick('admin')}
                    className="w-full py-2 text-center text-xs font-bold text-[#123B5D] bg-[#EAF6FC] hover:bg-[#DCE5EB] rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#55B9E8]" />
                    <span>Executive Admin Portal</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
