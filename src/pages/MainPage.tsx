import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import { DeckRegister } from '../components/DeckRegister';
import { MatchRecord } from '../components/MatchRecord';
import { ResultSearch } from '../components/ResultSearch';
import { Decklist } from '../components/Decklist';



export function MainPage() {
  const [tab, setTab] = useState<'deck' | 'decklist' | 'match' | 'search'>('decklist');
  const [username, setUsername] = useState('');
  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  useEffect(() => {
    const fetchUsername = async () => {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
      if (userDoc.exists() && userDoc.data().username) {
        setUsername(userDoc.data().username);
      }
    };

    fetchUsername();
  }, [auth, db]);

  return (
    <div>
      <h1>戦績管理ベータ - {username}さん</h1>
      <button onClick={() => handleSignOut()}>ログアウト</button>
      <div>
        <button onClick={() => setTab('decklist')}>デッキ一覧</button>
        <button onClick={() => setTab('deck')}>デッキ登録</button>
        <button onClick={() => setTab('match')}>対戦結果登録</button>
        <button onClick={() => setTab('search')}>戦績検索</button>
      </div>
      {tab === 'deck' && <DeckRegister />}
      {tab === 'decklist' && <Decklist />}
      {tab === 'match' && <MatchRecord />}
      {tab === 'search' && <ResultSearch />}
    </div>
  );
}
