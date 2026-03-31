import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import HeroSection from '../components/HeroSection';
import { Trash2, Image as ImageIcon, Plus } from 'lucide-react';

const Home = () => {
  const { user, profile } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Admin Form States
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AfD Logo mit Pfeil als eleganter Standard
  const defaultImage = "https://upload.wikimedia.org/wikipedia/commons/b/b8/AfD-Logo_2017.svg";

  useEffect(() => {
    if (user) {
      fetchAnnouncements();
    } else {
      setAnnouncements([]);
      setLoading(false);
    }
  }, [user]);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
        
      // Wenn Fehler 42P01 "relation does not exist", ist die Tabelle noch nicht erstellt
      if (error && error.code !== '42P01') throw error;
      setAnnouncements(data || []);
    } catch (e) {
      console.error("News Fehler:", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!profile?.is_admin || !newTitle.trim() || !newContent.trim()) return;
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('announcements').insert([{
        title: newTitle.trim(),
        content: newContent.trim(),
        image_url: newImageUrl.trim() || defaultImage
      }]);
      if (error) throw error;
      
      setNewTitle('');
      setNewContent('');
      setNewImageUrl('');
      setShowAdminForm(false);
      fetchAnnouncements();
    } catch (error) {
      alert("Fehler! Hast du die Tabelle 'announcements' wie in meiner Anleitung in Supabase angelegt?");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Diese Meldung wirklich für alle löschen?")) return;
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
      fetchAnnouncements();
    } catch (e) {
      console.error("Löschfehler:", e);
    }
  };

  return (
    <>
      <HeroSection />
      
      {/* ---------------- NEWS BEREICH (NUR EINGELOGGT) ---------------- */}
      {user && (
        <section className="bg-afd-blue/5 border-y border-afd-blue/10 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
              <h2 className="text-3xl font-bold text-afd-dark tracking-tight">Wichtige Info der Fraktion</h2>
              
              {profile?.is_admin && (
                <button 
                  onClick={() => setShowAdminForm(!showAdminForm)}
                  className="bg-afd-blue hover:bg-afd-dark text-white font-bold py-2.5 px-6 rounded-lg transition shadow-sm flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" /> {showAdminForm ? 'Abbrechen' : 'Neue Info posten'}
                </button>
              )}
            </div>

            {/* Admin Eingabe Formular */}
            {profile?.is_admin && showAdminForm && (
              <form onSubmit={handlePost} className="bg-white p-6 rounded-xl shadow-md border border-afd-blue/20 mb-10 animate-fade-in">
                 <h3 className="font-bold text-lg mb-4 text-afd-dark">Neue Fraktions-Information auf die Startseite pinnen</h3>
                 <div className="space-y-4">
                   <div>
                     <input type="text" required placeholder="Titel der Meldung" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afd-blue outline-none font-bold text-gray-800" />
                   </div>
                   <div>
                     <textarea required rows="4" placeholder="Dein Text an die Bürger..." value={newContent} onChange={e => setNewContent(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afd-blue outline-none resize-none text-gray-700"></textarea>
                   </div>
                   <div>
                     <p className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-1.5"><ImageIcon className="w-4 h-4"/> URL zu einem externen Bild (z.B. https://abc.de/bild.jpg)</p>
                     <input type="url" placeholder="Leer lassen für Standard AfD-Logo" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-afd-blue outline-none" />
                   </div>
                   <div className="flex justify-end pt-2">
                     <button type="submit" disabled={isSubmitting} className="bg-afd-red hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-sm transition disabled:opacity-50">
                       {isSubmitting ? 'Wird gespeichert...' : 'Veröffentlichen'}
                     </button>
                   </div>
                 </div>
              </form>
            )}

            {/* Meldungen Liste */}
            {loading ? (
               <div className="text-center py-10 text-gray-500 font-medium">Prüfe Aushänge...</div>
            ) : announcements.length === 0 ? (
               <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
                 Zurzeit gibt es keine neuen Bekanntmachungen der Fraktion.
               </div>
            ) : (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {announcements.map(item => (
                   <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col sm:flex-row relative group hover:shadow-md transition">
                     {profile?.is_admin && (
                        <button onClick={() => handleDelete(item.id)} className="absolute top-2 right-2 bg-white/80 backdrop-blur p-2 rounded-full text-gray-500 hover:text-afd-red hover:bg-red-50 transition z-10 shadow-sm" title="Löschen">
                          <Trash2 className="w-4 h-4" />
                        </button>
                     )}
                     <div className="sm:w-2/5 bg-gray-50/50  h-48 sm:h-auto flex-shrink-0 relative overflow-hidden flex items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-gray-100">
                        <img 
                          src={item.image_url || defaultImage} 
                          alt="Fraktions-News" 
                          className="w-full h-full object-contain mix-blend-multiply opacity-90 transition group-hover:opacity-100 group-hover:scale-105 duration-500"
                          onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }} 
                        />
                     </div>
                     <div className="p-6 sm:w-3/5 flex flex-col justify-center">
                        <span className="text-[11px] uppercase font-black tracking-widest text-afd-red mb-2">{new Date(item.created_at).toLocaleDateString('de-DE')}</span>
                        <h4 className="text-xl font-bold text-afd-dark mb-3 leading-tight">{item.title}</h4>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{item.content}</p>
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </section>
      )}

      {/* ---------------- URSPRÜNGLICHER BEREICH ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
           <h3 className="text-3xl font-bold text-afd-dark mb-4">Digitale Bürgerbeteiligung für Nümbrecht</h3>
           <p className="text-gray-600 max-w-2xl mx-auto text-lg">
             Transparenz, direkter Dialog und schnelle Lösungen. Wir bringen Ihre Anliegen direkt in den Gemeinderat.
           </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-afd-blue/10 text-afd-blue flex items-center justify-center rounded-lg mb-6 text-xl font-bold">1</div>
            <h4 className="text-xl font-bold text-afd-dark mb-3">Informieren</h4>
            <p className="text-gray-600">Verfolgen Sie die aktuellen Themen, Bauprojekte und Beschlüsse aus dem Nümbrechter Rat.</p>
          </div>
          
           <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-afd-red/10 text-afd-red flex items-center justify-center rounded-lg mb-6 text-xl font-bold">2</div>
            <h4 className="text-xl font-bold text-afd-dark mb-3">Mitdiskutieren</h4>
            <p className="text-gray-600">Bringen Sie Ihre eigenen Ideen in unser Bürger-Forum ein und diskutieren Sie mit Nachbarn.</p>
          </div>
          
           <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-afd-blue/10 text-afd-blue flex items-center justify-center rounded-lg mb-6 text-xl font-bold">3</div>
            <h4 className="text-xl font-bold text-afd-dark mb-3">Direkt Kontaktieren</h4>
            <p className="text-gray-600">Stellen Sie über unser Ticket-System konkrete Fragen an Fraktionsmitglieder.</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
