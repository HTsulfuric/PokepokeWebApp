import { useState } from 'react';

export function MatchRecord() {
  const [generation, setGeneration] = useState('');
  const [myDeck, setMyDeck] = useState('');
  const [opDeck, setOpDeck] = useState('');
  const [order, setOrder] = useState<'先行' | '後攻'>('先行');
  const [result, setResult] = useState<'勝ち' | '負け'>('勝ち');

  const handleRecord = () => {
    // Firebaseへ対戦結果を登録
    console.log('対戦結果登録:', { generation, myDeck, opDeck, order, result });
  };

  return (
    <div>
      <h3>対戦結果登録</h3>
      <div>
        <input
          placeholder="世代"
          value={generation}
          onChange={(e) => setGeneration(e.target.value)}
        />
      </div>
      <div>
        <input
          placeholder="自分のデッキ"
          value={myDeck}
          onChange={(e) => setMyDeck(e.target.value)}
        />
      </div>
      <div>
        <input
          placeholder="相手デッキ"
          value={opDeck}
          onChange={(e) => setOpDeck(e.target.value)}
        />
      </div>
      <div>
        <label>先行/後攻:</label>
        <select value={order} onChange={(e) => setOrder(e.target.value as never)}>
          <option value="先行">先行</option>
          <option value="後攻">後攻</option>
        </select>
      </div>
      <div>
        <label>勝敗:</label>
        <select value={result} onChange={(e) => setResult(e.target.value as never)}>
          <option value="勝ち">勝ち</option>
          <option value="負け">負け</option>
        </select>
      </div>
      <button onClick={handleRecord}>登録</button>
    </div>
  );
}