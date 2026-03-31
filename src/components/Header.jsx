import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User, LogOut, ShieldAlert, Menu, X } from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasNewAnnouncements, setHasNewAnnouncements] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const isActive = (path) => {
    return location.pathname === path ? "text-afd-blue font-bold flex items-center gap-1.5 relative" : "text-gray-600 hover:text-afd-blue transition flex items-center gap-1.5 relative";
  };

  useEffect(() => {
    if (user) {
      const checkNewAnnouncements = async () => {
        try {
          if (location.pathname === '/') {
            localStorage.setItem('last_seen_announcements', Date.now().toString());
            setHasNewAnnouncements(false);
            return;
          }

          const { data, error } = await supabase
            .from('announcements')
            .select('created_at')
            .order('created_at', { ascending: false })
            .limit(1);

          if (data && data.length > 0) {
            const latestTime = new Date(data[0].created_at).getTime();
            const lastSeen = localStorage.getItem('last_seen_announcements');
            if (!lastSeen || latestTime > parseInt(lastSeen, 10)) {
              setHasNewAnnouncements(true);
            }
          }
        } catch(e) { /* ignore */ }
      };
      
      checkNewAnnouncements();
    }
  }, [user, location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Bürger';
  
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-white shadow relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 hover:opacity-90 transition" onClick={closeMenu}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-afd-blue rounded-sm shadow-sm flex items-center justify-center text-white font-bold text-lg sm:text-xl shrink-0">
            AfD
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-afd-dark leading-none tracking-tight">Wir für Nümbrecht</h1>
            <p className="text-[10px] sm:text-xs text-afd-red font-bold tracking-widest mt-1 uppercase hidden sm:block">Ein Projekt der AfD Fraktion Nümbrecht</p>
          </div>
        </Link>
        <div className="flex items-center gap-8">
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 font-medium">
            <Link to="/" className={isActive('/')}>
               Startseite
               {hasNewAnnouncements && <span className="absolute -top-1 -right-3 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>}
            </Link>
            <Link to="/forum" className={isActive('/forum')}>Bürger-Forum</Link>
            <Link to="/ticket-system" className={isActive('/ticket-system')}>Ticket-System</Link>
          </nav>
          
          <div className="border-l pl-8 hidden md:flex items-center gap-4">
            {profile?.is_admin && (
               <Link to="/admin" className="flex items-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm transition mr-2">
                  <ShieldAlert className="w-4 h-4" /> Admin-Leitstelle
               </Link>
            )}

            {user ? (
               <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 text-sm font-semibold text-afd-dark">
                   <User className="w-4 h-4 text-afd-blue" />
                   {displayName}
                 </div>
                 <button onClick={handleLogout} className="text-gray-400 hover:text-afd-red transition" title="Ausloggen">
                   <LogOut className="w-5 h-5" />
                 </button>
               </div>
            ) : (
               <Link to="/login" className="bg-afd-blue/10 text-afd-blue hover:bg-afd-blue hover:text-white px-5 py-2 rounded-lg font-bold text-sm transition">
                 Login
               </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-600 hover:text-afd-blue transition p-2 relative"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {hasNewAnnouncements && <span className="absolute top-2 right-2 flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span></span>}
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-24 left-0 w-full bg-white shadow-xl border-t border-gray-100 py-4 flex flex-col px-6 pb-8 z-40 animate-fade-in">
          <div className="flex flex-col gap-4">
            <Link to="/" className={`text-lg font-medium py-2 border-b border-gray-50 flex items-center justify-between ${isActive('/')}`} onClick={closeMenu}>
              Startseite
              {hasNewAnnouncements && <span className="bg-red-500 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded-full animate-pulse">Neu</span>}
            </Link>
            <Link to="/forum" className={`text-lg font-medium py-2 border-b border-gray-50 flex items-center ${isActive('/forum')}`} onClick={closeMenu}>Bürger-Forum</Link>
            <Link to="/ticket-system" className={`text-lg font-medium py-2 border-b border-gray-50 flex items-center ${isActive('/ticket-system')}`} onClick={closeMenu}>Ticket-System</Link>
          </div>
          
          <div className="mt-6 pt-2 flex flex-col gap-4">
            {profile?.is_admin && (
               <Link to="/admin" className="flex items-center justify-center gap-2 bg-red-100/80 hover:bg-red-200 text-red-800 px-4 py-3.5 rounded-lg text-base font-bold shadow-sm transition" onClick={closeMenu}>
                  <ShieldAlert className="w-5 h-5" /> Admin-Leitstelle öffnen
               </Link>
            )}

            {user ? (
               <div className="bg-gray-50 rounded-xl p-4 mt-2">
                 <div className="flex flex-col items-center justify-center gap-1 mb-4">
                   <User className="w-10 h-10 text-afd-blue bg-white p-2 rounded-full shadow-sm mb-1" />
                   <span className="text-gray-500 text-xs">Eingeloggt als</span>
                   <span className="text-afd-dark font-bold text-lg">{displayName}</span>
                 </div>
                 <button onClick={handleLogout} className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-100 text-afd-red py-3 rounded-lg font-bold transition w-full shadow-sm">
                   <LogOut className="w-5 h-5" /> Sicher abmelden
                 </button>
               </div>
            ) : (
               <Link to="/login" className="bg-afd-blue text-white text-center py-4 rounded-lg font-bold text-lg shadow-md hover:bg-afd-dark transition mt-2" onClick={closeMenu}>
                 Bürger-Login / Registrierung
               </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
