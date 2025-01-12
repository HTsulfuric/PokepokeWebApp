import { useNavigate } from 'react-router-dom';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export function LoginPage() {
  const navigate = useNavigate();

  function handleGoogleLogin() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(() => {
        navigate('/main');
      })
      .catch((e) => console.error(e));
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>ユーザー登録 / ログイン</h2>
      <button onClick={handleGoogleLogin}>Googleでログイン</button>
    </div>
  );
}