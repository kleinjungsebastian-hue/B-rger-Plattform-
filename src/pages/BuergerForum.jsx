import React, { useState, useEffect } from 'react';
import { ThumbsUp, MessageCircle, Pin, Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BuergerForum = () => {
  const [ideas, setIdeas] = useState([]);
  const [userLikes, setUserLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showIdeaForm, setShowIdeaForm] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    fetchIdeas();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserLikes();
    } else {
      setUserLikes([]);
    }
  }, [user]);

  const fetchIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('pinned', { ascending: false })
        .order('likes', { ascending: false });
      
      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      console.error('Fehler beim Laden:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('idea_likes')
        .select('idea_id')
        .eq('user_id', user.id);
      
      // Fehler ignorieren, falls Tabelle noch nicht von Nutzer erstellt wurde
      if (!error && data) {
         setUserLikes(data.map(like => like.idea_id));
      }
    } catch (e) {
      console.log('Tabelle idea_likes evtl noch nicht vorhanden');
    }
  };

  const handleLike = async (e, id, currentLikes) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    
    if (!user) {
        alert("Bitte loggen Sie sich ein, um abzustimmen!");
        return navigate('/login');
    }

    if (userLikes.includes(id)) {
        alert("Ihre Stimme wurde für dieses Thema bereits gezählt.");
        return; 
    }

    try {
      // Optimistisches UI Update
      setIdeas(ideas.map(idea => idea.id === id ? { ...idea, likes: idea.likes + 1 } : idea));
      setUserLikes([...userLikes, id]);
      
      const { error: insertError } = await supabase
        .from('idea_likes')
        .insert([{ user_id: user.id, idea_id: id }]);
        
      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from('ideas')
        .update({ likes: currentLikes + 1 })
        .eq('id', id);
        
      if (updateError) throw updateError;
    } catch (error) {
      console.error('Fehler beim Abstimmen:', error);
      alert("Es gab einen Fehler beim Speichern der Stimme (Fehlt evtl. die Datenbank-Tabelle?).");
      fetchIdeas(); 
      fetchUserLikes();
    }
  };

  const handleNewIdea = () => {
      if (!user) {
          alert("Sie müssen angemeldet sein, um eine neue Idee einzureichen.");
          navigate('/login');
      } else {
          setShowIdeaForm(!showIdeaForm);
      }
  };

  const submitIdea = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!newIdeaTitle.trim()) return;

    setSubmitLoading(true);
    const authorName = profile?.display_name || user.email.split('@')[0];

    try {
      const { error } = await supabase
        .from('ideas')
        .insert([{
          title: newIdeaTitle.trim(),
          author: authorName,
          user_id: user.id,
          likes: 0,
          replies: 0,
          pinned: false
        }]);

      if (error) throw error;

      setNewIdeaTitle('');
      setShowIdeaForm(false);
      fetchIdeas();
    } catch (error) {
      console.error('Speicherfehler:', error);
      alert('Es gab einen Fehler beim Veröffentlichen. Evtl. fehlt eine Tabelle oder RLS Rechte.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-afd-dark mb-4">Bürger-Forum & Ideen-Wand</h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Bringen Sie sich ein! Teilen Sie Ihre Ideen für Nümbrecht, diskutieren Sie mit anderen Bürgern und unterstützen Sie gute Vorschläge mit Ihrer Stimme.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex gap-2 w-full md:w-auto">
          <button className="bg-afd-dark text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm text-sm">Beliebteste Ideen</button>
          <button className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 px-5 py-2.5 rounded-lg font-semibold shadow-sm text-sm transition">Neueste</button>
        </div>
        <button onClick={handleNewIdea} className={`${showIdeaForm ? 'bg-gray-200 text-gray-700' : 'bg-afd-blue text-white hover:bg-opacity-90'} w-full md:w-auto px-6 py-2.5 rounded-lg font-bold shadow-md flex items-center justify-center gap-2 transition`}>
          {showIdeaForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showIdeaForm ? 'Abbrechen' : 'Neue Idee einreichen'}
        </button>
      </div>

      {showIdeaForm && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-10 animate-fade-in relative z-10">
          <h3 className="text-xl font-bold text-afd-dark mb-4 drop-shadow-sm">Welches Thema brennt Ihnen unter den Nägeln?</h3>
          <form onSubmit={submitIdea}>
            <input 
              type="text" 
              required 
              autoFocus
              value={newIdeaTitle}
              onChange={e => setNewIdeaTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afd-blue outline-none mb-4 text-gray-800 font-medium" 
              placeholder="Geben Sie Ihre Idee in einem kurzen, prägnanten Titel ein..."
            />
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setShowIdeaForm(false)} 
                className="px-5 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition"
              >
                Abbrechen
              </button>
              <button 
                type="submit" 
                disabled={submitLoading || !newIdeaTitle.trim()} 
                className="bg-afd-blue hover:bg-afd-dark text-white font-bold py-2.5 px-6 rounded-lg transition shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {submitLoading ? "Wird gespeichert..." : "Idee veröffentlichen"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Lade Forum-Beiträge ...</div>
      ) : ideas.length === 0 ? (
         <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">Noch keine Ideen vorhanden.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea) => {
            const hasLiked = userLikes.includes(idea.id);
            return (
              <Link to={`/forum/${idea.id}`} key={idea.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-afd-blue hover:shadow-md transition p-6 flex flex-col h-full relative overflow-hidden group">
                {idea.pinned && (
                    <div className="absolute top-0 right-0 bg-afd-red text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 z-10">
                        <Pin className="w-3 h-3" /> Angeheftet
                    </div>
                )}
                <div className="flex justify-between items-start mb-4 mt-1">
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{idea.author}</span>
                </div>
                
                <h3 className="font-bold text-xl text-afd-dark mb-3 flex-1 group-hover:text-afd-blue transition">{idea.title}</h3>
                
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-4 text-gray-500">
                    <button 
                      onClick={(e) => handleLike(e, idea.id, idea.likes)}
                      className={`flex items-center gap-1.5 transition relative z-10 p-1 rounded ${hasLiked ? 'text-afd-blue' : 'hover:text-afd-blue'}`}
                      title={hasLiked ? "Ihre Stimme wurde gezählt" : "Stimme abgeben"}
                    >
                      <ThumbsUp className={`w-5 h-5 ${hasLiked ? 'fill-afd-blue' : ''}`} />
                      <span className="font-semibold">{idea.likes}</span>
                    </button>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-semibold">{idea.replies}</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-afd-blue underline">
                    Mitdiskutieren
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BuergerForum;
