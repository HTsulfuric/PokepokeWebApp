import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import { DeckRegister } from '../components/DeckRegister';
import { MatchRecord } from '../components/MatchRecord';
import { ResultSearch } from '../components/ResultSearch';
import { Decklist } from '../components/Decklist';

import './MainPage.css';



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

  useEffect(() => {
    document.title = `ポケポケ戦績管理α - ${username}さん`;
  }, [username]);

  return (
    <div className="main-page">
      <h1 className="title">ポケポケ戦績管理α - <span className="username">{username}さん</span></h1>
      <button className="logout-button" onClick={() => handleSignOut()}>ログアウト</button>
      <br />
      <div className="tab-buttons">
        <button onClick={() => setTab('decklist')}>デッキ一覧</button>
        <button onClick={() => setTab('deck')}>デッキ登録</button>
        <button onClick={() => setTab('match')}>対戦結果登録</button>
        <button onClick={() => setTab('search')}>戦績検索</button>
      </div>
      <br />
      {tab === 'deck' && <DeckRegister />}
      {tab === 'decklist' && <Decklist />}
      {tab === 'match' && <MatchRecord />}
      {tab === 'search' && <ResultSearch />}
    </div>
  );
}
