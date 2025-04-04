import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, getDocs, query, where, Firestore } from 'firebase/firestore';
import { Auth, getAuth } from 'firebase/auth';
import { Deck, Record } from '../types/index.ts';
import { fetchDecks } from '../services/firebase.ts';

const useFetchData = (db: Firestore, auth: Auth) => {
  const [decks, setDecks] = useState<Deck[]>([]);
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

    const fetchData = async () => {
      const decksData = await fetchDecks();
      setDecks(decksData || []);
    };

    fetchData();
    fetchRecords();
  }, [db, auth]);

  return { decks, records };
};

interface CalculateRates {
  first: number;
  second: number;
  first_rate: number;
  second_rate: number;
  win: number;
  win_first: number;
  win_second: number;
  total: number;
  total_rate: number;
}

const calculateRates: (records: Record[]) => CalculateRates = (records) => {
  const first = records.filter((record) => record.order === 'first').length;
  const second = records.filter((record) => record.order === 'second').length;
  const win_first = records.filter((record) => record.result === 'win' && record.order === 'first').length;
  const win_second = records.filter((record) => record.result === 'win' && record.order === 'second').length;

  const rate_first = first === 0 ? 0 : (win_first / first) * 100;
  const rate_second = second === 0 ? 0 : (win_second / second) * 100;

  const win = win_first + win_second;

  return {
    first: first,
    second: second,
    first_rate: rate_first,
    second_rate: rate_second,
    win: win,
    win_first: win_first,
    win_second: win_second,
    total: first + second,
    total_rate: ((win_first + win_second) / (first + second)) * 100,
  };
};

export function ResultSearch() {
  const [generation, setGeneration] = useState('');
  const [myDeck, setMyDeck] = useState('');
  const [opDeck, setOpDeck] = useState('');
  const [result, setResult] = useState<{ [key: string]: CalculateRates } | null>(null);
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
  }, [generation, myDeck, opDeck, records]);

  const handleSearch = () => {
    let filteredRecords = records.filter((record) => record.generation === generation);

    if (myDeck) {
      filteredRecords = filteredRecords.filter((record) => record.myDeck === myDeck);
    }

    if (opDeck) {
      filteredRecords = filteredRecords.filter((record) => record.opDeck === opDeck);
    }

    const results: {
      [key: string]: CalculateRates;
    } = {};


    if (myDeck && !opDeck) {
      const opDecks = [...new Set(filteredRecords.map((record) => record.opDeck))];
      opDecks.forEach((deck) => {
        const deckRecords = filteredRecords.filter((record) => record.opDeck === deck);

        results[deck] = calculateRates(deckRecords);
      });

      results['累計'] = calculateRates(filteredRecords);

    } else if (!myDeck && opDeck) {
      const myDecks = [...new Set(filteredRecords.map((record) => record.myDeck))];
      myDecks.forEach((deck) => {
        const deckRecords = filteredRecords.filter((record) => record.myDeck === deck);

        results[deck] = calculateRates(deckRecords);
      });

      results['累計'] = calculateRates(filteredRecords);

    } else if (myDeck && opDeck) {

      results['このデッキでの対戦'] = calculateRates(filteredRecords);

    } else if (generation) {
      results['世代全体'] = calculateRates(filteredRecords);
    }

    const soretedResults = Object.keys(results).sort((a, b) =>
      ((a === '累計' || a === '世代全体' || a === 'このデッキでの対戦') ? -1 : (b === '累計' || b === '世代全体' || b === 'このデッキでの対戦') ? 1 : 0))
      .reduce((obj, key) => {
        obj[key] = results[key];
        return obj;
      }, {} as typeof results);

    setResult(soretedResults);
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
            result[deck] && (
              <div key={deck}>
                <h5>{deck}</h5>
                <p>
                  勝利数: {result[deck].win} ({result[deck].win_first}先行, {result[deck].win_second}後攻)
                </p>
                <p>
                  敗北数: {result[deck].total - result[deck].win} ({result[deck].first - result[deck].win_first}先行, {result[deck].second - result[deck].win_second}後攻)
                </p>
                <p>
                  先行試合数: {result[deck].first}  後攻試合数: {result[deck].second}
                </p>
                <p>
                  先行勝率: {result[deck].first_rate.toFixed(2)}% 後攻勝率: {result[deck].second_rate.toFixed(2)}%
                </p>
                <p>
                  &nbsp;&nbsp;&nbsp;&nbsp;合計試合数: {result[deck].total} 勝率: {result[deck].total_rate.toFixed(2)}%
                </p>
              </div>
            )
          ))}
        </div>
      )
      }
    </div >
  );
}
