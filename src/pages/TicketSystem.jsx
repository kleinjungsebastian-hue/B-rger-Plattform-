import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, Info, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TicketSystem = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    category: 'Infrastruktur',
    title: '',
    description: '',
    phone: '',
    visibility: 'public'
  });
  
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Fehler beim Laden:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Sie müssen sich anmelden, um ein Ticket einzureichen.");

    try {
      const authorName = profile?.display_name || user.email.split('@')[0];
      
      const { error, data } = await supabase
        .from('tickets')
        .insert([{
          category: formData.category,
          title: formData.title,
          message: formData.description,
          phone: formData.phone,
          visibility: formData.visibility,
          author: authorName,
          user_id: user.id
        }]).select();

      if (error) throw error;
      
      setSubmitted(true);
      fetchTickets();
      if(formData.visibility === 'public') {
          setTimeout(() => setSubmitted(false), 5000);
      } else {
          // Navigiere zum Chat-Fenster
          if(data && data[0]) {
             navigate(`/ticket/${data[0].id}`);
          }
      }
      
      setFormData({ category: 'Infrastruktur', title: '', description: '', phone: '', visibility: 'public' });
    } catch (error) {
      console.error('Speicherfehler:', error);
      alert('Es gab einen Fehler. Bitte überprüfen Sie die Datenbankverbindung.');
    }
  };

  const statusColors = {
    'Offen': 'bg-red-100 text-red-800',
    'In Bearbeitung': 'bg-blue-100 text-blue-800',
    'Erledigt': 'bg-green-100 text-green-800'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-12">
      <div className="lg:w-1/3">
        <h2 className="text-3xl font-bold text-afd-dark mb-6">Neues Anliegen melden</h2>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 relative">
          
          {!user && (
            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-6 text-center">
               <Lock className="w-12 h-12 text-afd-blue mb-4" />
               <h3 className="text-xl font-bold text-afd-dark mb-2">Login erforderlich</h3>
               <p className="text-gray-600 mb-6 text-sm">Um ein verifiziertes Ticket einzureichen und den Live-Chat mit der Fraktion zu nutzen, melden Sie sich bitte an.</p>
               <button onClick={() => navigate('/login')} className="bg-afd-blue w-full text-white font-bold py-3 px-6 rounded-lg shadow-sm hover:bg-afd-dark transition">
                 Bürger-Account erstellen / Login
               </button>
            </div>
          )}

          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Ticket gesendet!</h3>
              <p className="text-gray-600">Ihre Meldung wurde sicher an die Fraktion übermittelt und ein privater Chat-Raum für Rückfragen wurde eröffnet.</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-6 text-afd-blue font-semibold hover:underline"
              >
                Weiteres Anliegen melden
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Kategorie</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afd-blue outline-none bg-gray-50"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option>Infrastruktur</option>
                  <option>Verkehr & Sicherheit</option>
                  <option>Familie & Soziales</option>
                  <option>Wirtschaft</option>
                  <option>Sonstiges</option>
                </select>
              </div>

              <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1">Ihre Telefonnummer (Optional)</label>
                 <input 
                   type="tel" 
                   value={formData.phone}
                   onChange={(e) => setFormData({...formData, phone: e.target.value})}
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afd-blue outline-none" 
                   placeholder="Für schnelle telefonische Rückfragen"
                 />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Thema (Kurz)</label>
                <input 
                  type="text" 
                  required 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afd-blue outline-none" 
                  placeholder="Z.B. Schlagloch auf der Hauptstraße"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Genaue Beschreibung</label>
                <textarea 
                  required rows="4" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afd-blue outline-none resize-none" 
                  placeholder="Bitte beschreiben Sie das Problem möglichst genau..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sichtbarkeit</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`border p-3 rounded-lg cursor-pointer text-center font-medium transition ${formData.visibility === 'public' ? 'border-afd-blue bg-afd-blue/5 text-afd-blue' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    <input type="radio" name="visibility" value="public" className="hidden" 
                      onChange={() => setFormData({...formData, visibility: 'public'})} 
                      checked={formData.visibility === 'public'} />
                    Sichtbar für alle
                  </label>
                  <label className={`border p-3 rounded-lg cursor-pointer text-center font-medium transition ${formData.visibility === 'private' ? 'border-afd-dark bg-afd-dark/5 text-afd-dark' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    <input type="radio" name="visibility" value="private" className="hidden" 
                      onChange={() => setFormData({...formData, visibility: 'private'})} 
                      checked={formData.visibility === 'private'} />
                    Nur für den Rat
                  </label>
                </div>
                <div className="flex items-start gap-2 mt-3 text-xs text-gray-500">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>Private Tickets sind nur für Sie und die Fraktion im Live-Chat sichtbar (höchster Datenschutz).</p>
                </div>
              </div>

              <button type="submit" className="w-full bg-afd-blue hover:bg-afd-dark text-white font-bold py-3 px-8 rounded-lg transition shadow-md flex items-center justify-center gap-2">
                <Send className="w-5 h-5" /> Ticket verbindlich einreichen
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="lg:w-2/3">
        <h2 className="text-3xl font-bold text-afd-dark mb-6">Öffentliche Bürgeranliegen</h2>
        
        {loading ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500 font-medium">Lade transparente Meldungen...</div>
        ) : (
          <div className="space-y-4">
            {tickets.length === 0 ? (
               <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500 italic">Noch keine öffentlichen Anliegen gemeldet.</div>
            ) : tickets.map((ticket) => (
              <div key={ticket.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 hover:shadow-md transition">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-afd-blue bg-afd-blue/10 px-2 py-1 rounded">{ticket.category}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${statusColors[ticket.status] || 'bg-gray-100 text-gray-800'}`}>
                      {ticket.status}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">{new Date(ticket.created_at).toLocaleDateString('de-DE')}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{ticket.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{ticket.message}</p>
                  <p className="text-xs font-semibold text-gray-500">Eingereicht von: <span className="text-afd-red">{ticket.author}</span></p>
                </div>
                
                {/* Zeige Button zum Chat für Admins ODER den Besitzer */}
                {(profile?.is_admin || user?.id === ticket.user_id) && (
                   <div className="sm:border-l sm:pl-4 flex items-center justify-center">
                      <Link to={`/ticket/${ticket.id}`} className="w-full sm:w-auto text-center bg-gray-100 hover:bg-afd-blue text-gray-600 hover:text-white px-4 py-2 rounded font-bold text-sm transition">
                        Zum Chat
                      </Link>
                   </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketSystem;
