import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    console.log('認証状態を監視します');

    // 1. 認証の永続性を設定（デフォルトはローカル）
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log('Auth persistence set to local');
      })
      .catch((error) => {
        console.error('Persistence setting error:', error);
      });

    // 2. リダイレクト結果を取得
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          console.log('リダイレクト結果:', result.user);
          navigate('/main');
        } else {
          console.log('リダイレクト結果なし');
        }
      })
      .catch((error) => {
        console.error('リダイレクト結果取得エラー:', error);
      });

    // 3. 認証状態の変化を監視
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('ユーザーがログインしています:', user);
        navigate('/main');
      } else {
        console.log('ユーザーは未ログインです');
      }
    });

    // クリーンアップ
    return () => unsubscribe();
  }, [auth, navigate]);

  function handleGoogleLogin() {
    console.log('Googleログインを実行します');
    signInWithRedirect(auth, provider)
      .then(() => console.log('リダイレクトします'))
      .catch((e) => console.error('リダイレクトエラー:', e));
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>ユーザー登録 / ログイン</h2>
      <button
        onClick={handleGoogleLogin}
        style={{ padding: '10px 20px', fontSize: '16px' }}
      >
        Googleでログイン
      </button>
    </div>
  );
}