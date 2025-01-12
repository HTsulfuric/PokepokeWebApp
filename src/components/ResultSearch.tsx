import { useState } from 'react';

export function ResultSearch() {
  const [generation, setGeneration] = useState('');
  const [myDeck, setMyDeck] = useState('');
  const [opDeck, setOpDeck] = useState('');

  const handleSearch = () => {
    // Firestoreから先行/後攻別の勝率を取得・表示する想定
    console.log('検索条件:', { generation, myDeck, opDeck });
  };

  return (
    <div>
      <h3>戦績検索</h3>
      <div>
        <input
          placeholder="世代"
          value={generation}
          onChange={(e) => setGeneration(e.target.value)}
        />
      </div>
      <div>
        <input
          placeholder="使用デッキ"
          value={myDeck}
          onChange={(e) => setMyDeck(e.target.value)}
        />
      </div>
      <div>
        <input
          placeholder="相手のデッキタイプ"
          value={opDeck}
          onChange={(e) => setOpDeck(e.target.value)}
        />
      </div>
      <button onClick={handleSearch}>検索</button>
    </div>
  );
}