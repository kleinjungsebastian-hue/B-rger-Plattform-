import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Trash2, ShieldCheck, Ban, MessagesSquare, CheckCircle, Clock, User, Archive } from 'lucide-react';

const Dashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tickets');

  const [tickets, setTickets] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [comments, setComments] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (!authLoading && !profile?.is_admin) {
      navigate('/'); // Sperre für normale Bürger
    } else if (profile?.is_admin) {
      loadData();
    }
  }, [profile, authLoading, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Lade Tickets (ALLE, egal ob public oder private)
      const { data: ticketsData } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
      setTickets(ticketsData || []);

      // Lade Forum Ideen
      const { data: ideasData } = await supabase.from('ideas').select('*').order('created_at', { ascending: false });
      setIdeas(ideasData || []);

      // Lade Kommentare
      const { data: commentsData } = await supabase.from('comments').select('*').order('created_at', { ascending: false });
      setComments(commentsData || []);

      // Lade Profile (Benutzer)
      const { data: profilesData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setProfiles(profilesData || []);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // --- TICKET AKTIONEN ---
  const updateTicketStatus = async (id, newStatus) => {
    await supabase.from('tickets').update({ status: newStatus }).eq('id', id);
    setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const deleteTicket = async (id) => {
    if(!window.confirm("Dieses Ticket endgültig löschen? Alle Nachrichten in der Datenbank gehen verloren!")) return;
    try {
      const { error } = await supabase.from('tickets').delete().eq('id', id);
      if (error) throw error;
      setTickets(tickets.filter(t => t.id !== id));
    } catch (e) {
      console.error("Löschfehler:", e);
      alert("Fehler beim Löschen des Tickets.");
    }
  };

  // --- FORUM AKTIONEN ---
  const deleteIdea = async (id) => {
    if(!window.confirm("Achtung: Soll dieses Thema inkl. aller Likes und Kommentare endgültig vom Server gelöscht werden?")) return;
    await supabase.from('ideas').delete().eq('id', id);
    setIdeas(ideas.filter(i => i.id !== id));
  };
  
  const deleteComment = async (id) => {
    if(!window.confirm("Kommentar als Troll/SPAM markieren und löschen?")) return;
    await supabase.from('comments').delete().eq('id', id);
    setComments(comments.filter(c => c.id !== id));
  };

  // --- BENUTZER AKTIONEN ---
  const toggleBan = async (id, currentState) => {
    const newState = !currentState;
    await supabase.from('profiles').update({ is_banned: newState }).eq('id', id);
    setProfiles(profiles.map(p => p.id === id ? { ...p, is_banned: newState } : p));
  };

  const toggleAdmin = async (id, currentState, email) => {
    if(email === 'kleinjungsebastian@gmail.com') return alert("Der Haupt-Administrator kann nicht degradiert werden.");
    const newState = !currentState;
    await supabase.from('profiles').update({ is_admin: newState }).eq('id', id);
    setProfiles(profiles.map(p => p.id === id ? { ...p, is_admin: newState } : p));
  };

  const tabClasses = (tab) => `px-6 py-4 font-bold border-b-2 transition ${activeTab === tab ? 'border-afd-blue text-afd-blue bg-white' : 'border-transparent text-gray-500 hover:text-afd-blue hover:bg-gray-50'}`;

  if (authLoading || loading) return <div className="text-center py-20 font-bold text-gray-500">Lade sicheren Admin-Bereich...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
         <ShieldAlert className="w-8 h-8 text-afd-red" />
         <div>
            <h1 className="text-3xl font-bold text-afd-dark">Kommandozentrale der Fraktion</h1>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mt-1">Streng Vertraulich (Nur für Administratoren)</p>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-t-xl overflow-hidden border-b shadow-sm">
         <button className={tabClasses('tickets')} onClick={() => setActiveTab('tickets')}>
            <span className="flex items-center gap-2"><MessagesSquare className="w-5 h-5"/> Ticket-Büro ({tickets.filter(t => t.status !== 'Erledigt').length})</span>
         </button>
         <button className={tabClasses('forum')} onClick={() => setActiveTab('forum')}>
            <span className="flex items-center gap-2"><Trash2 className="w-5 h-5"/> Foren-Polizei ({ideas.length})</span>
         </button>
         <button className={tabClasses('users')} onClick={() => setActiveTab('users')}>
            <span className="flex items-center gap-2"><ShieldCheck className="w-5 h-5"/> Bürger / Rechte ({profiles.length})</span>
         </button>
      </div>

      {/* Content Area */}
      <div className="bg-white p-6 shadow-sm rounded-b-xl border border-t-0 border-gray-200">

         {/* TICKETS TAB */}
         {activeTab === 'tickets' && (
            <div className="overflow-x-auto relative">
               <div className="flex justify-between items-end mb-4 px-2">
                 <p className="text-sm font-semibold text-gray-500">Liste aller Bürger-Anfragen</p>
                 <button onClick={() => setShowArchived(!showArchived)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition ${showArchived ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-afd-blue'}`}>
                   <Archive className="w-4 h-4" /> {showArchived ? 'Erledigte Tickets ausblenden' : 'Archiv (Erledigt) anzeigen'}
                 </button>
               </div>
               
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-gray-50 text-gray-500 text-sm border-b">
                        <th className="p-4 font-bold">Datum</th>
                        <th className="p-4 font-bold">Bürger (Telefon)</th>
                        <th className="p-4 font-bold">Sichtbarkeit</th>
                        <th className="p-4 font-bold">Titel / Problem</th>
                        <th className="p-4 font-bold text-right pr-8">Bearbeitung / Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                     {tickets.filter(t => showArchived || t.status !== 'Erledigt').map(t => (
                        <tr key={t.id} className={`${t.status === 'Erledigt' ? 'opacity-60 bg-gray-50' : 'hover:bg-blue-50/50'} transition`}>
                           <td className="p-4 text-gray-500">{new Date(t.created_at).toLocaleDateString('de-DE')}</td>
                           <td className="p-4 font-semibold text-gray-700">
                             {t.author} <br/>
                             {t.phone && <span className="text-xs text-afd-red opacity-80">{t.phone}</span>}
                           </td>
                           <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${t.visibility === 'public' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-afd-red'}`}>{t.visibility === 'public' ? 'Öffentlich' : 'Privat'}</span></td>
                           <td className="p-4">
                             <div className="font-bold text-afd-dark">{t.title}</div>
                             <Link to={`/ticket/${t.id}`} className="text-afd-blue text-xs font-bold hover:underline">Zum Live-Chat & Details &rarr;</Link>
                           </td>
                           <td className="p-4 flex items-center justify-end gap-2">
                              <select 
                                value={t.status} 
                                onChange={(e) => updateTicketStatus(t.id, e.target.value)}
                                className="bg-white border border-gray-300 text-gray-700 text-xs rounded-lg focus:ring-afd-blue focus:border-afd-blue block w-32 p-2 font-bold shadow-sm cursor-pointer"
                              >
                                <option value="Offen">Markieren: Offen</option>
                                <option value="In Bearbeitung">In Bearbeitung</option>
                                <option value="Erledigt">Erledigt (Archiv)</option>
                              </select>
                              <button onClick={() => deleteTicket(t.id)} className="p-2 text-gray-400 hover:text-white hover:bg-afd-red rounded-lg transition" title="In den Müll (Komplett löschen)">
                                <Trash2 className="w-4 h-4" />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               
               {tickets.filter(t => showArchived || t.status !== 'Erledigt').length === 0 && (
                 <div className="text-center py-12 text-gray-400 italic">Die Liste ist leer. Alle Tickets wurden abgearbeitet.</div>
               )}
            </div>
         )}

         {/* FORUM TAB */}
         {activeTab === 'forum' && (
            <div className="space-y-8">
               <div>
                 <h3 className="text-lg font-bold text-afd-dark mb-4 border-b pb-2">Ideen-Posts (Themen)</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ideas.map(idea => (
                       <div key={idea.id} className="border p-4 rounded-lg bg-gray-50 relative">
                          <button onClick={() => deleteIdea(idea.id)} className="absolute top-4 right-4 text-red-400 hover:text-afd-red transition" title="Komplettes Thema löschen">
                             <Trash2 className="w-5 h-5" />
                          </button>
                          <div className="text-xs text-gray-400 mb-1">{new Date(idea.created_at).toLocaleDateString()} - {idea.author}</div>
                          <div className="font-bold text-gray-800 pr-8">{idea.title}</div>
                       </div>
                    ))}
                 </div>
               </div>
               
               <div>
                 <h3 className="text-lg font-bold text-afd-dark mb-4 border-b pb-2">Bürger-Kommentare (Unter den Ideen)</h3>
                 <div className="space-y-2">
                    {comments.map(c => (
                       <div key={c.id} className="border p-4 rounded-lg flex items-start gap-4 hover:border-red-200 transition">
                          <div className="flex-1">
                             <div className="text-xs text-gray-400 mb-1">Von <strong className="text-afd-blue">{c.author_name}</strong></div>
                             <div className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</div>
                          </div>
                          <button onClick={() => deleteComment(c.id)} className="bg-red-50 text-afd-red hover:bg-afd-red hover:text-white px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1">
                             <Trash2 className="w-4 h-4" /> Löschen
                          </button>
                       </div>
                    ))}
                 </div>
               </div>
            </div>
         )}

         {/* USERS TAB */}
         {activeTab === 'users' && (
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-gray-50 text-gray-500 text-sm border-b">
                        <th className="p-4 font-bold">E-Mail (Verifiziert via Supabase)</th>
                        <th className="p-4 font-bold">Angezeigter Name</th>
                        <th className="p-4 font-bold text-center">Status (Bann)</th>
                        <th className="p-4 font-bold text-center">Rechte (Admin)</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                     {profiles.map(p => (
                        <tr key={p.id} className={`${p.is_banned ? 'bg-red-50/50' : 'hover:bg-gray-50'} transition`}>
                           <td className="p-4 font-mono text-xs text-gray-500">{p.email}</td>
                           <td className="p-4 font-bold text-gray-800">{p.display_name}</td>
                           <td className="p-4 text-center">
                              <button 
                                onClick={() => toggleBan(p.id, p.is_banned)}
                                className={`flex items-center justify-center gap-1.5 mx-auto px-3 py-1.5 rounded-full text-xs font-bold transition ${p.is_banned ? 'bg-afd-red text-white' : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-afd-red'}`}
                              >
                                 <Ban className="w-3 h-3" /> {p.is_banned ? 'Gesperrt' : 'Aktiv'}
                              </button>
                           </td>
                           <td className="p-4 text-center">
                              <button 
                                onClick={() => toggleAdmin(p.id, p.is_admin, p.email)}
                                className={`flex items-center justify-center gap-1.5 mx-auto px-3 py-1.5 rounded-full text-xs font-bold transition ${p.is_admin ? 'bg-afd-blue text-white' : 'bg-gray-100 text-gray-600'}`}
                              >
                                 {p.is_admin ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />} 
                                 {p.is_admin ? 'Fraktion / Admin' : 'Bürger'}
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               
               <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                 <ShieldCheck className="w-5 h-5 inline-block mr-2 -mt-0.5" />
                 Der Haupt-Admin (`kleinjungsebastian@gmail.com`) kann nicht gesperrt oder degradiert werden. Alle anderen Nutzer können als <strong>Fraktion / Admin</strong> hochgestuft werden, um ebenfalls dieses Dashboard sehen zu können.
               </div>
            </div>
         )}
         
      </div>
    </div>
  );
};

export default Dashboard;
