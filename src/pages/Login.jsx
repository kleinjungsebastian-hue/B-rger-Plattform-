import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        if (!name) throw new Error("Bitte geben Sie einen Benutzernamen an.");
        
        const { error, data } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    display_name: name
                }
            }
        });
        if (error) throw error;
        setSuccessMsg('Konto erstellt! Sie sind nun eingeloggt.');
        
        // Timeout so user can see success message before redirect
        setTimeout(() => navigate('/'), 1500);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      }
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-20 min-h-[60vh] flex flex-col justify-center">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-afd-dark mb-6 text-center">
          {isSignUp ? 'Bürgerkonto anlegen' : 'Bürger-Login'}
        </h2>
        
        {errorMsg && <div className="bg-red-50 text-afd-red p-4 rounded mb-4 text-sm font-semibold border border-red-100">{errorMsg}</div>}
        {successMsg && <div className="bg-green-50 text-green-700 p-4 rounded mb-4 text-sm font-semibold border border-green-100">{successMsg}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
             <div>
               <label className="block text-sm font-semibold text-gray-700 mb-1">Angezeigter Name (oder Synonym)</label>
               <input 
                 type="text" 
                 required={isSignUp}
                 value={name} 
                 onChange={e => setName(e.target.value)} 
                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afd-blue outline-none" 
               />
             </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">E-Mail Adresse</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afd-blue outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Passwort</label>
            <div className="relative">
               <input 
                 type={showPassword ? "text" : "password"} 
                 required minLength="6"
                 value={password} 
                 onChange={e => setPassword(e.target.value)} 
                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afd-blue outline-none pr-12" 
               />
               <button 
                 type="button" 
                 onClick={() => setShowPassword(!showPassword)} 
                 className="absolute right-3 top-3 text-gray-400 hover:text-afd-blue transition focus:outline-none"
                 title={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
               >
                 {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
               </button>
            </div>
          </div>

          <button type="submit" className="w-full bg-afd-blue hover:bg-afd-dark text-white font-bold py-3 px-8 rounded-lg mt-2 transition shadow-sm">
            {isSignUp ? 'Konto erstellen' : 'Einloggen'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600 border-t pt-4">
          {isSignUp ? 'Bereits registriert?' : 'Neu hier?'}
          <button onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setSuccessMsg(''); }} className="text-afd-blue font-bold ml-2 hover:underline">
            {isSignUp ? 'Jetzt anmelden' : 'Hier registrieren'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
