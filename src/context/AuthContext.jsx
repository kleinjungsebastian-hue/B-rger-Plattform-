import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Session initial laden
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await handleSession(session);
      setLoading(false);
    });

    // Auf Login/Logouts hören
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSession = async (session) => {
    if (session?.user) {
      try {
        // Profil aus eigener Tabelle abrufen
        let { data: userProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // Wenn kein Profil da ist (z.B. alter Testaccount), lege es sofort an (Auto-Heilung)
        if (!userProfile) {
            const isAdmin = session.user.email.toLowerCase() === 'kleinjungsebastian@gmail.com'; // Root Admin
            const { data: newProfile } = await supabase.from('profiles').insert([{
                 id: session.user.id,
                 email: session.user.email,
                 display_name: session.user.user_metadata?.display_name || session.user.email.split('@')[0],
                 is_admin: isAdmin,
                 is_banned: false
            }]).select().single();
            userProfile = newProfile;
        }

        // Bann-Check
        if (userProfile?.is_banned) {
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            alert("Zugang verweigert. Dieser Account wurde von der Fraktion dauerhaft gesperrt.");
            return;
        }

        setUser(session.user);
        setProfile(userProfile);
      } catch (e) {
          console.error("Fehler beim Profilabruf (Fehlt evtl. die Tabelle 'profiles'?):", e.message);
          // Fallback, damit die App nicht crasht, falls SQL noch nicht ausgeführt wurde
          setUser(session.user);
          setProfile(null);
      }
    } else {
      setUser(null);
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
