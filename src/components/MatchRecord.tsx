import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, startAfter, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Deck, Record } from '../types/index.ts';
import { fetchDecks } from '../services/firebase.ts';

export function MatchRecord() {
  const [, setDecks] = useState<Deck[]>([]);
  const [generation, setGeneration] = useState('');
  const [myDeck, setMyDeck] = useState('');
  const [opDeck, setOpDeck] = useState('');
  const [order, setOrder] = useState<'first' | 'second'>('first');
  const [result, setResult] = useState<'win' | 'lose'>('win');
  const [comment, setComment] = useState('');
  const [decks,] = useState<Deck[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [editGeneration, setEditGeneration] = useState('');
  const [editMyDeck, setEditMyDeck] = useState('');
  const [editOpDeck, setEditOpDeck] = useState('');
  const [editOrder, setEditOrder] = useState<'first' | 'second'>('first');
  const [editResult, setEditResult] = useState<'win' | 'lose'>('win');
  const [editComment, setEditComment] = useState('');
  const db = getFirestore();
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const decksData = await fetchDecks();
      setDecks(decksData || []);
    }

    fetchData();
  }, [auth, db, navigate]);

  useEffect(() => {
    fetchMatchRecords();
  }, [auth, db]);

  const fetchMatchRecords = async () => {
    if (!auth.currentUser) {
      alert('No user is currently logged in');
      navigate('/');
      return;
    }

    try {
      console.log('Fetching records...');
      const q = query(
        collection(db, 'records'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc'),
        limit(20)
      );
      const querySnapshot = await getDocs(q);
      const recordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Record));
      console.log('recordsData: ', recordsData);
      setRecords(recordsData);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.error('Error fetching records: ', error);
    }
  };

  const fetchMoreMatchRecords = async () => {
    if (!auth.currentUser || !lastVisible) {
      return;
    }

    try {
      const q = query(
        collection(db, 'records'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc'),
        startAfter(lastVisible),
        limit(20)
      );
      const querySnapshot = await getDocs(q);
      const recordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Record));
      setRecords(prevRecords => [...prevRecords, ...recordsData]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.error('Error fetching more records: ', error);
    }
  };

  const handleRecord = async () => {
    if (!auth.currentUser) {
      alert('No user is currently logged in');
      navigate('/');
      return;
    }

    const requiredFields = [generation, myDeck, opDeck, order, result];
    if (requiredFields.some(field => field === '')) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await addDoc(collection(db, 'records'), {
        generation: generation,
        myDeck: myDeck,
        opDeck: opDeck,
        order: order,
        result: result,
        comment: comment,
        userId: auth.currentUser.uid,
        timestamp: new Date(),
      });
      alert('対戦結果を登録しました');
      fetchMatchRecords(); // Refresh the record list after adding
    } catch (error) {
      console.error('Error adding record: ', error);
      alert('Failed to register record. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this record?');
    if (!confirmDelete) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'records', id));
      alert('対戦結果を削除しました');
      fetchMatchRecords(); // Refresh the record list after deletion
    } catch (error) {
      console.error('Error deleting record: ', error);
    }
  };

  const handleEdit = (record: Record) => {
    setEditingRecord(record);
    setEditGeneration(record.generation);
    setEditMyDeck(record.myDeck);
    setEditOpDeck(record.opDeck);
    setEditOrder(record.order);
    setEditResult(record.result);
    setEditComment(record.comment);
  };

  const handleUpdate = async () => {
    if (!editingRecord) {
      return;
    }

    try {
      await updateDoc(doc(db, 'records', editingRecord.id), {
        generation: editGeneration,
        myDeck: editMyDeck,
        opDeck: editOpDeck,
        order: editOrder,
        result: editResult,
        comment: editComment,
      });
      alert('対戦結果を更新しました');
      setEditingRecord(null);
      fetchMatchRecords(); // Refresh the record list after updating
    } catch (error) {
      console.error('Error updating record: ', error);
    }
  };

  const filteredDecks = decks.filter(deck => deck.generation === generation);
  const filteredEditDecks = decks.filter(deck => deck.generation === editGeneration);

  return (
    <div>
      <h3>対戦結果登録</h3>
      <div>
        <label>世代:</label>
        <select value={generation} onChange={(e) => setGeneration(e.target.value)}>
          <option value="">選択してください</option>
          {[...Array(9).keys()].map(i => (
            <option key={i + 1} value={i + 1}>{i + 1}期</option>
          ))}
        </select>
      </div>
      <div>
        <label>自デッキ:</label>
        <select value={myDeck} onChange={(e) => setMyDeck(e.target.value)}
          disabled={generation === ''}>
          <option value="">選択してください</option>
          {filteredDecks.map(deck => (
            <option key={deck.id} value={deck.deckName}>{deck.deckName}</option>
          ))}
        </select>
      </div>
      <div>
        <label>相手デッキ</label>
        <select value={opDeck} onChange={(e) => setOpDeck(e.target.value)}
          disabled={generation === ''}>
          <option value="">選択してください</option>
          {filteredDecks.map(deck => (
            <option key={deck.id} value={deck.deckName}>{deck.deckName}</option>
          ))}
        </select>
      </div>
      <div>
        <label>先行/後攻:</label>
        <select value={order} onChange={(e) => setOrder(e.target.value as 'first' | 'second')}>
          <option value="first">先行</option>
          <option value="second">後攻</option>
        </select>
      </div>
      <div>
        <label>勝敗:</label>
        <select value={result} onChange={(e) => setResult(e.target.value as 'win' | 'lose')}>
          <option value="win">勝ち</option>
          <option value="lose">負け</option>
        </select>
      </div>
      <div>
        <label>コメント:</label>
        <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} />
      </div>
      <button onClick={handleRecord}>登録</button>

      <h3>対戦記録</h3>
      {records.map(record => (
        <div key={record.id}>
          <p>
            {record.timestamp.toDate().toLocaleString()} -
            {record.generation}期: {record.myDeck} vs. {record.opDeck} {record.order === 'first' ? '先行' : '後攻'} {record.result === 'win' ? '勝ち' : '負け'}
            {record.comment === '' ? '' : ' (コメント: ' + record.comment + ' )'} </p>
          <button onClick={() => handleEdit(record)}>編集</button>
          <button onClick={() => handleDelete(record.id)}>削除</button>
          {editingRecord && editingRecord.id === record.id && (
            <div>
              <h3>編集</h3>
              <div>
                <label>世代:</label>
                <select value={editGeneration} onChange={(e) => setEditGeneration(e.target.value)}>
                  <option value={editingRecord.generation}> {editingRecord.generation}期 </option>
                  {[...Array(9).keys()].map(i => (
                    <option key={i + 1} value={i + 1}>{i + 1}期</option>
                  ))}
                </select>
              </div>
              <div>
                <label>自デッキ:</label>
                <select value={editMyDeck} onChange={(e) => setEditMyDeck(e.target.value)}
                  disabled={editGeneration === ''}>
                  <option value={editingRecord.myDeck}> {editingRecord.myDeck} </option>
                  {filteredEditDecks.map(deck => (
                    <option key={deck.id} value={deck.deckName}>{deck.deckName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>相手デッキ:</label>
                <select value={editOpDeck} onChange={(e) => setEditOpDeck(e.target.value)}
                  disabled={editGeneration === ''}>
                  <option value={editingRecord.opDeck}> {editingRecord.opDeck} </option>
                  {filteredEditDecks.map(deck => (
                    <option key={deck.id} value={deck.deckName}>{deck.deckName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>先行/後攻:</label>
                <select value={editOrder} onChange={(e) => setEditOrder(e.target.value as 'first' | 'second')}>
                  <option value={editingRecord.order}> {editingRecord.order} </option>
                  <option value="first">先行</option>
                  <option value="second">後攻</option>
                </select>
              </div>
              <div>
                <label>勝敗:</label>
                <select value={editResult} onChange={(e) => setEditResult(e.target.value as 'win' | 'lose')}>
                  <option value={editingRecord.result}> {editingRecord.result} </option>
                  <option value="win">勝ち</option>
                  <option value="lose">負け</option>
                </select>
              </div>
              <textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} />
              <button onClick={handleUpdate}>更新</button>
              <button onClick={() => setEditingRecord(null)}>キャンセル</button>
            </div>
          )}
        </div>
      ))}
      {lastVisible && <button onClick={fetchMoreMatchRecords}>もっと見る</button>}

    </div>
  );
}
