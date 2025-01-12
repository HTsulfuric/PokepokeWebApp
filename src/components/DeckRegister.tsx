import { useState } from 'react';

export function DeckRegister() {
  const [deckName, setDeckName] = useState('');
  const [deckList, setDeckList] = useState('');

  const handleRegister = () => {
    // Firebaseへデッキ登録を行う想定
    console.log('登録するデッキ:', deckName, deckList);
  };

  return (
    <div>
      <h3>デッキ登録</h3>
      <input
        type="text"
        placeholder="デッキ名"
        value={deckName}
        onChange={(e) => setDeckName(e.target.value)}
      />
      <br />
      <textarea
        placeholder="デッキリスト(任意)"
        value={deckList}
        onChange={(e) => setDeckList(e.target.value)}
      />
      <br />
      <button onClick={handleRegister}>登録</button>
    </div>
  );
}