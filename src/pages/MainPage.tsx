import { useState } from 'react';
import { DeckRegister } from '../components/DeckRegister';
import { MatchRecord } from '../components/MatchRecord';
import { ResultSearch } from '../components/ResultSearch';

export function MainPage() {
  const [tab, setTab] = useState<'deck' | 'match' | 'search'>('deck');

  return (
    <div>
      <h1>戦績管理</h1>
      <div>
        <button onClick={() => setTab('deck')}>デッキ登録</button>
        <button onClick={() => setTab('match')}>対戦結果登録</button>
        <button onClick={() => setTab('search')}>戦績検索</button>
      </div>
      {tab === 'deck' && <DeckRegister />}
      {tab === 'match' && <MatchRecord />}
      {tab === 'search' && <ResultSearch />}
    </div>
  );
}