import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, getDocs, query, where, Firestore } from 'firebase/firestore';
import { Auth, getAuth } from 'firebase/auth';
import { Deck, Record } from '../types/index.ts';
import { fetchDecks } from '../services/firebase.ts';

const useFetchData = (db: Firestore, auth: Auth) => {
  const [decks,] = useState<Deck[]>([]);
  const [records, setRecords] = useState<Record[]>([]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const q = query(collection(db, 'records'), where('userId', '==', auth.currentUser?.uid));
        const querySnapshot = await getDocs(q);
        const recordsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Record);
        setRecords(recordsData);
      } catch (error) {
        console.error('Error getting documents: ', error);
      }
    };

    fetchDecks();
    fetchRecords();
  }, [db, auth]);

  return { decks, records };
};

const calculateRates = (records: Record[]) => {
  const first = records.filter((record) => record.order === 'first').length;
  const second = records.filter((record) => record.order === 'second').length;
  const win_first = records.filter((record) => record.result === 'win' && record.order === 'first').length;
  const win_second = records.filter((record) => record.result === 'win' && record.order === 'second').length;

  const rate_first = first === 0 ? 0 : (win_first / first) * 100;
  const rate_second = second === 0 ? 0 : (win_second / second) * 100;

  return {
    first: first,
    second: second,
    first_rate: rate_first,
    second_rate: rate_second,
  };
};

export function ResultSearch() {
  const [generation, setGeneration] = useState('');
  const [myDeck, setMyDeck] = useState('');
  const [opDeck, setOpDeck] = useState('');
  const [result, setResult] = useState<{ [key: string]: { first: number, second: number, first_rate: number, second_rate: number } } | null>(null);
  const db = getFirestore();
  const auth = getAuth();
  const navigate = useNavigate();

  const { decks, records } = useFetchData(db, auth);

  useEffect(() => {
    if (!auth.currentUser) {
      alert('ログインしてください');
      navigate('/'); // ログインページに遷移
    }
  }, [auth, navigate]);

  useEffect(() => {
    handleSearch();
  }, [generation, myDeck, opDeck]);

  const handleSearch = () => {
    let filteredRecords = records.filter((record) => record.generation === generation);

    if (myDeck) {
      filteredRecords = filteredRecords.filter((record) => record.myDeck === myDeck);
    }

    if (opDeck) {
      filteredRecords = filteredRecords.filter((record) => record.opDeck === opDeck);
    }

    const results: {
      [key: string]: {
        first: number;
        second: number,
        first_rate: number,
        second_rate: number
      }
    } = {};


    if (myDeck && !opDeck) {
      const opDecks = [...new Set(filteredRecords.map((record) => record.opDeck))];
      opDecks.forEach((deck) => {
        const deckRecords = filteredRecords.filter((record) => record.opDeck === deck);

        results[deck] = calculateRates(deckRecords);
      });

      const totalFirst = filteredRecords.filter((record) => record.order === 'first').length;
      const totalSecond = filteredRecords.filter((record) => record.order === 'second').length;
      const totalWinFirst = filteredRecords.filter((record) => record.result === 'win' && record.order === 'first').length;
      const totalWinSecond = filteredRecords.filter((record) => record.result === 'win' && record.order === 'second').length;

      const totalRateFirst = totalFirst === 0 ? 0 : (totalWinFirst / totalFirst) * 100;
      const totalRateSecond = totalSecond === 0 ? 0 : (totalWinSecond / totalSecond) * 100;

      results['累計'] = {
        first: totalFirst,
        second: totalSecond,
        first_rate: totalRateFirst,
        second_rate: totalRateSecond,
      };

    } else if (!myDeck && opDeck) {
      const myDecks = [...new Set(filteredRecords.map((record) => record.myDeck))];
      myDecks.forEach((deck) => {
        const deckRecords = filteredRecords.filter((record) => record.myDeck === deck);

        results[deck] = calculateRates(deckRecords);
      });

      const totalFirst = filteredRecords.filter((record) => record.order === 'first').length;
      const totalSecond = filteredRecords.filter((record) => record.order === 'second').length;
      const totalWinFirst = filteredRecords.filter((record) => record.result === 'win' && record.order === 'first').length;
      const totalWinSecond = filteredRecords.filter((record) => record.result === 'win' && record.order === 'second').length;

      const totalRateFirst = totalFirst === 0 ? 0 : (totalWinFirst / totalFirst) * 100;
      const totalRateSecond = totalSecond === 0 ? 0 : (totalWinSecond / totalSecond) * 100;

      results['累計'] = {
        first: totalFirst,
        second: totalSecond,
        first_rate: totalRateFirst,
        second_rate: totalRateSecond,
      };

    } else if (myDeck && opDeck) {
      const first = filteredRecords.filter((record) => record.order === 'first').length;
      const second = filteredRecords.filter((record) => record.order === 'second').length;
      const win_first = filteredRecords.filter((record) => record.result === 'win' && record.order === 'first').length;
      const win_second = filteredRecords.filter((record) => record.result === 'win' && record.order === 'second').length;

      const rate_first = first === 0 ? 0 : (win_first / first) * 100;
      const rate_second = second === 0 ? 0 : (win_second / second) * 100;

      results['このデッキでの対戦'] = {
        first: first,
        second: second,
        first_rate: rate_first,
        second_rate: rate_second,
      };

    } else if (generation) {
      const first = filteredRecords.filter((record) => record.order === 'first').length;
      const second = filteredRecords.filter((record) => record.order === 'second').length;
      const win_first = filteredRecords.filter((record) => record.result === 'win' && record.order === 'first').length;
      const win_second = filteredRecords.filter((record) => record.result === 'win' && record.order === 'second').length;

      const rate_first = first === 0 ? 0 : (win_first / first) * 100;
      const rate_second = second === 0 ? 0 : (win_second / second) * 100;

      results['世代全体'] = {
        first: first,
        second: second,
        first_rate: rate_first,
        second_rate: rate_second,
      };
    }
    const sortedResults = { '総合成績': results['累計'] || results['世代全体'] || results['このデッキでの対戦'], ...results }
    setResult(sortedResults);
  }

  const filteredDecks = decks.filter((deck) => deck.generation === generation);

  return (
    <div>
      <h3>戦績検索</h3>
      <div>
        <select value={generation} onChange={(e) => setGeneration(e.target.value)}>
          <option value="">世代を選択</option>
          {[...Array(9).keys()].map(i => (
            <option key={i + 1} value={i + 1}>{i + 1}期</option>
          ))}
        </select>
      </div>
      <div>
        <select
          value={myDeck}
          onChange={(e) => setMyDeck(e.target.value)}
          disabled={!generation}
        >
          <option value="">自分のデッキ</option>
          {filteredDecks.map((deck) => (
            <option key={deck.id} value={deck.deckName}>{deck.deckName}</option>
          ))}
        </select>
      </div>
      <div>
        <select
          value={opDeck}
          onChange={(e) => setOpDeck(e.target.value)}
          disabled={!generation}
        >
          <option value="">相手のデッキ</option>
          {filteredDecks.map((deck) => (
            <option key={deck.id} value={deck.deckName}>{deck.deckName}</option>
          ))}
        </select>
      </div>

      {result && (
        <div>
          <h4>検索結果</h4>
          {Object.keys(result).map((deck) => (
            <div key={deck}>
              <h5>{deck}</h5>
              先行試合数: {result[deck].first}  後攻試合数: {result[deck].second} 先行勝率: {result[deck].first_rate.toFixed(2)}% 後攻勝率: {result[deck].second_rate.toFixed(2)}%
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
