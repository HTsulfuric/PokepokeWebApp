import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  getAdditionalUserInfo,
} from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Helmet } from 'react-helmet';

export function LoginPage() {
  const navigate = useNavigate();
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const db = getFirestore();

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

    // 2. 認証状態の変化を監視
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data()?.username) {
          console.log('ユーザーは既に登録済みです:', user);
          navigate('/main');
        } else {
          console.log('ユーザーは未登録です');
          navigate('/setup-username');
        }
      } else {
        console.log('ユーザーは未ログインです');
      }
    });

    // クリーンアップ
    return () => unsubscribe();
  }, [auth, navigate, db]);

  function handleGoogleLogin() {
    console.log('Googleログインを実行します');
    signInWithPopup(auth, provider)
      .then((result) => {
        const isNewUser = getAdditionalUserInfo(result)?.isNewUser;
        if (isNewUser) {
          navigate('/setup-username');
        } else {
          navigate('/main');
        }
      })
      .catch((e) => {
        console.error('ポップアップエラー:', e);
        alert('ポップアップがブロックされています。ポップアップを許可してください。');
      });
  }

  return (
    <div className='d-flex flex-column align-items-center mt-5'>
      <Helmet>
        <title>ログイン</title>
      </Helmet>
      <h2>ユーザー登録 / ログイン</h2>
      <button
        className='btn btn-primary mt-3' onClick={handleGoogleLogin}>
        Googleでログイン
      </button>
    </div>
  );
}
