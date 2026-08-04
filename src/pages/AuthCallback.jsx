import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Make sure this path points to your Supabase client file

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth error:', error.message);
        navigate('/');
      } else if (data?.session) {
        navigate('/'); // Redirect to homepage or dashboard after successful login
      } else {
        navigate('/');
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h2>Logging you in, please wait...</h2>
    </div>
  );
}