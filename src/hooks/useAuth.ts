import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

export function useAuth() {
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    if (!auth.currentUser) {
      alert('ログインしてください');
      navigate('/');
    }
  }, [auth, navigate]);
}
