import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, Clock, ThumbsUp, MessageSquare } from 'lucide-react';

const IdeaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [idea, setIdea] = useState(null);
  const [comments, setComments] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchIdeaAndComments();
  }, [id]);

  useEffect(() => {
    if (user && idea) {
      checkUserLike();
    } else {
      setHasLiked(false);
    }
  }, [user, idea]);

  const checkUserLike = async () => {
    try {
      const { data, error } = await supabase
        .from('idea_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('idea_id', id)
        .single();
        
      if (data) setHasLiked(true);
    } catch (e) {
      // ignore, either not liked (Row not found) or table doesn't exist
    }
  };

  const fetchIdeaAndComments = async () => {
    try {
      const { data: ideaData, error: ideaError } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', id)
        .single();
      if (ideaError) throw ideaError;
      setIdea(ideaData);

      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('idea_id', id)
        .order('created_at', { ascending: true });
      
      if (commentsError) {
          console.error("Kommentare Fehler:", commentsError.message);
      } else {
          setComments(commentsData || []);
      }
    } catch (error) {
      setErrorMsg("Konnte den Beitrag nicht aus der Datenbank laden.");
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setErrorMsg("Bitte loggen Sie sich ein.");
    if (!newComment.trim()) return;

    const displayName = user.user_metadata?.display_name || user.email.split('@')[0];

    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          idea_id: id,
          author_name: displayName,
          content: newComment
        }]);

      if (error) throw error;
      
      await supabase
        .from('ideas')
        .update({ replies: idea.replies + 1 })
        .eq('id', id);

      setNewComment('');
      fetchIdeaAndComments(); 
    } catch (error) {
       setErrorMsg("Fehler beim Senden: " + error.message);
    }
  };

  const handleLike = async () => {
    if(!user) return alert("Bitte loggen Sie sich ein, um abzustimmen!");
    if(hasLiked) return alert("Sie haben Ihre Stimme für dieses Thema bereits abgegeben.");

    try {
      setIdea({ ...idea, likes: idea.likes + 1 });
      setHasLiked(true);
      
      const { error: insertError } = await supabase.from('idea_likes').insert([{ user_id: user.id, idea_id: id }]);
      if (insertError) throw insertError;
      
      await supabase.from('ideas').update({ likes: idea.likes + 1 }).eq('id', idea.id);
    } catch (e) { 
      console.error(e);
      setHasLiked(false);
      fetchIdeaAndComments();
    }
  };

  if(loading) return <div className="text-center py-20 font-bold text-gray-500">Lade Beitrag...</div>;
  if(errorMsg || !idea) return <div className="text-center py-20 text-afd-red font-bold">{errorMsg || "Beitrag nicht gefunden."}<br/><br/><button onClick={() => navigate('/forum')} className="text-afd-blue underline mt-4">Zurück ins Forum</button></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => navigate('/forum')} className="flex items-center gap-2 text-gray-500 hover:text-afd-blue font-semibold mb-6 transition">
        <ArrowLeft className="w-5 h-5" /> Zurück zum Forum
      </button>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8 relative">
        <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                <User className="w-5 h-5" />
             </div>
             <div>
               <div className="font-bold text-gray-800">{idea.author}</div>
               <div className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(idea.created_at).toLocaleString('de-DE')}</div>
             </div>
          </div>
          {idea.pinned && <span className="text-xs font-bold text-white bg-afd-red px-2 py-1 rounded">Angeheftet</span>}
        </div>
        
        <h1 className="text-3xl font-bold text-afd-dark mb-6">{idea.title}</h1>

        <div className="flex items-center gap-6 mt-8">
           <button 
             onClick={handleLike} 
             className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${hasLiked ? 'bg-afd-blue text-white cursor-default' : 'bg-gray-50 hover:bg-afd-blue/10 text-gray-600 hover:text-afd-blue'}`}
             title={hasLiked ? "Ihre Stimme wurde gezählt" : "Stimme geben"}
           >
             <ThumbsUp className={`w-5 h-5 ${hasLiked ? 'fill-white' : ''}`} /> 
             {hasLiked ? "Zugestimmt" : "Stimme geben"} ({idea.likes})
           </button>
           <div className="flex items-center gap-2 text-gray-500 font-bold">
             <MessageSquare className="w-5 h-5" /> {comments.length} Diskussionen
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-afd-dark mb-4 border-b pb-2">Diskussion (Kommentare)</h3>
        
        {comments.map(comment => (
           <div key={comment.id} className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex gap-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 flex-shrink-0 mt-1">
                <User className="w-4 h-4" />
             </div>
             <div className="flex-1">
               <div className="flex items-baseline justify-between mb-2">
                 <strong className="text-gray-800 text-sm">{comment.author_name}</strong>
                 <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleString('de-DE')}</span>
               </div>
               <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
             </div>
           </div>
        ))}

        {comments.length === 0 && <p className="text-gray-500 text-sm italic">Noch keine Kommentare vorhanden. Schreiben Sie den ersten Beitrag!</p>}

        <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           {user ? (
              <form onSubmit={handleCommentSubmit}>
                 <h4 className="font-bold text-afd-dark mb-3">Ihre Meinung</h4>
                 <textarea required rows="4" value={newComment} onChange={(e) => setNewComment(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-afd-blue outline-none resize-none" placeholder="Schreiben Sie einen konstruktiven Kommentar..."></textarea>
                 <button type="submit" className="mt-3 bg-afd-blue hover:bg-afd-dark text-white font-bold py-2.5 px-6 rounded-lg transition">Kommentar senden</button>
              </form>
           ) : (
              <div className="text-center py-6">
                 <p className="text-gray-500 mb-4 font-medium">Sie müssen als Bürger angemeldet sein, um an der Diskussion teilzunehmen.</p>
                 <button onClick={() => navigate('/login')} className="bg-afd-blue text-white font-bold py-2.5 px-6 rounded-lg shadow-sm hover:bg-afd-dark transition">Hier Einloggen</button>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default IdeaDetail;
