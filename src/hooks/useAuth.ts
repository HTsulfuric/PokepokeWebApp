import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

export const useAuth = () => {
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      alert('User not logged in');
      navigate('/');
    }

  }, [auth, navigate]);

  return auth.currentUser;
};
