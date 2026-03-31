import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import TicketSystem from './pages/TicketSystem';
import TicketDetail from './pages/TicketDetail';
import BuergerForum from './pages/BuergerForum';
import IdeaDetail from './pages/IdeaDetail';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Impressum from './pages/Impressum';
import Datenschutz from './pages/Datenschutz';
import Barrierefreiheit from './pages/Barrierefreiheit';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/ticket-system" element={<TicketSystem />} />
              <Route path="/ticket/:id" element={<TicketDetail />} />
              <Route path="/forum" element={<BuergerForum />} />
              <Route path="/forum/:id" element={<IdeaDetail />} />
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/impressum" element={<Impressum />} />
              <Route path="/datenschutz" element={<Datenschutz />} />
              <Route path="/barrierefreiheit" element={<Barrierefreiheit />} />
            </Routes>
          </main>
          
          <footer className="bg-afd-dark text-white py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
               <h2 className="text-2xl font-bold mb-2">Wir für Nümbrecht</h2>
               <p className="text-gray-400 mb-8 max-w-md mx-auto">Ein Projekt der AfD Fraktion Nümbrecht zur Stärkung der echten Bürgerbeteiligung.</p>
               <div className="flex justify-center flex-wrap gap-6 mb-8 border-t border-gray-700 pt-8">
                 <Link to="/impressum" className="hover:text-afd-blue transition">Impressum</Link>
                 <Link to="/datenschutz" className="hover:text-afd-blue transition">Datenschutz</Link>
                 <Link to="/barrierefreiheit" className="hover:text-afd-blue transition">Barrierefreiheit</Link>
               </div>
               <p className="text-gray-500">© 2026 AfD Fraktion Nümbrecht. Alle Rechte vorbehalten.</p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
