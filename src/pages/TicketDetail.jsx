import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, User, ShieldAlert, Phone } from 'lucide-react';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchTicketAndChat();
  }, [id]);

  const fetchTicketAndChat = async () => {
    try {
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single();
        
      if (ticketError) throw ticketError;
      
      if (!profile?.is_admin && user?.id !== ticketData.user_id) {
         throw new Error("Zugriff verweigert. Dies ist nicht Ihr Ticket.");
      }
      
      setTicket(ticketData);

      const { data: msgData, error: msgError } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', id)
        .order('created_at', { ascending: true });
      
      if (!msgError) {
          setMessages(msgData || []);
      }
    } catch (error) {
      setErrorMsg(error.message || "Konnte das Ticket nicht laden.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      const displayName = profile?.display_name || user.email.split('@')[0];
      
      const { error } = await supabase.from('ticket_messages').insert([{
        ticket_id: id,
        user_id: user.id,
        author_name: displayName,
        is_from_admin: profile?.is_admin || false,
        message: newMessage
      }]);

      if (error) throw error;
      setNewMessage('');
      fetchTicketAndChat(); 
    } catch (e) {
      alert("Nachricht konnte nicht gesendet werden. Fehlt die Datenbank-Tabelle ticket_messages oder die neue Spalte author_name?");
      console.error(e);
    }
  };

  if(loading) return <div className="text-center py-20 font-bold text-gray-500">Lade sicheren Chat-Raum...</div>;
  if(errorMsg || !ticket) return <div className="text-center py-20 text-afd-red font-bold">{errorMsg}<br/><br/><button onClick={() => navigate('/ticket-system')} className="text-afd-blue underline mt-4">Zurück System</button></div>;

  const isAdmin = profile?.is_admin;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-8">
      
      <div className="md:w-1/3 space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-afd-blue font-semibold mb-2 transition">
          <ArrowLeft className="w-5 h-5" /> Zurück
        </button>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-4 pb-4 border-b">
             <span className="text-xs font-bold text-white bg-afd-blue px-2 py-1 rounded">{ticket.category}</span>
             <span className="text-xs font-bold text-gray-500">{new Date(ticket.created_at).toLocaleDateString('de-DE')}</span>
           </div>
           
           <h2 className="text-xl font-bold text-afd-dark mb-3">{ticket.title}</h2>
           <p className="text-gray-700 text-sm mb-6">{ticket.message}</p>
           
           <div className="space-y-3 pt-4 border-t text-sm">
             <div className="flex justify-between">
                <span className="text-gray-500">Bürger:</span>
                <span className="font-bold text-afd-dark">{ticket.author}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="font-bold text-afd-red">{ticket.status}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-gray-500">Sichtbarkeit:</span>
                <span className="font-semibold text-gray-800">{ticket.visibility === 'public' ? 'Öffentlich sichtbar' : 'Vertraulich (Privat)'}</span>
             </div>
             
             {isAdmin && ticket.phone && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-800">
                   <Phone className="w-4 h-4 mt-0.5" />
                   <div>
                     <div className="font-bold text-xs uppercase mb-1">Intern - Telefonnummer</div>
                     <div className="font-semibold">{ticket.phone}</div>
                   </div>
                </div>
             )}
           </div>
        </div>
      </div>

      <div className="md:w-2/3 flex flex-col h-[700px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
            <h3 className="font-bold text-afd-dark">Direkt-Chat zur Problemlösung</h3>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-bold">End-to-End Verbindung</span>
         </div>
         
         <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
            {messages.length === 0 && (
               <div className="text-center text-gray-400 text-sm italic py-10">Noch keine Nachrichten. Schreiben Sie die erste Nachricht, um den Kontakt aufzunehmen.</div>
            )}
            
            {messages.map(msg => {
               const isOwn = msg.user_id === user?.id;
               const authorLabel = msg.is_from_admin 
                   ? `Fraktion Nümbrecht (${msg.author_name || 'Admin'})` 
                   : (msg.author_name || 'Bürger');
               
               return (
                 <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[80%] rounded-2xl p-4 ${isOwn ? 'bg-afd-blue text-white rounded-br-sm' : 'bg-white border rounded-bl-sm text-gray-800 shadow-sm'}`}>
                      <div className={`text-xs font-bold mb-1 flex items-center gap-1 ${isOwn ? 'text-blue-100' : (msg.is_from_admin ? 'text-afd-red' : 'text-gray-500')}`}>
                         {msg.is_from_admin && <ShieldAlert className="w-3 h-3" />}
                         {authorLabel}
                      </div>
                      <div className="whitespace-pre-wrap text-sm">{msg.message}</div>
                      <div className={`text-[10px] mt-2 text-right ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})}
                      </div>
                   </div>
                 </div>
               )
            })}
         </div>

         <div className="p-4 bg-white border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
               <input 
                 type="text" 
                 value={newMessage}
                 onChange={(e) => setNewMessage(e.target.value)}
                 placeholder={isAdmin ? "Offizielle Antwort an den Bürger tippen..." : "Nachricht an die Fraktion tippen..."}
                 className="flex-1 px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:border-afd-blue focus:ring-2 focus:ring-afd-blue outline-none transition"
               />
               <button type="submit" disabled={!newMessage.trim()} className="bg-afd-blue hover:bg-afd-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-lg transition flex-shrink-0">
                  <Send className="w-6 h-6" />
               </button>
            </form>
         </div>
      </div>
    </div>
  );
};

export default TicketDetail;
