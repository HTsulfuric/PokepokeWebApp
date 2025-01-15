import { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { Deck } from '../types/index.ts';
import { fetchDecks } from '../services/firebase.ts';
import { useAuth } from '../hooks/useAuth.ts';

export function DeckRegister() {
  const [generation, setGeneration] = useState('1');
  const [deckName, setDeckName] = useState('');
  const [comment, setComment] = useState('');
  const [decks, setDecks] = useState<Deck[]>([]); // Use the Deck interface for the state
  const [collapsedGenerations, setCollapsedGenerations] = useState<{ [key: string]: boolean }>({});
  const db = getFirestore();
  const currentUser = useAuth();

  const handleRegister = async () => {
    if (!currentUser) {
      console.error('No user is currently logged in');
      return;
    }

    if (deckName === '') {
      alert('Please enter a deck name');
      return;
    }

    if (isNaN(Number(generation))) {
      alert('Please enter a number for generation');
      return;
    }

    const duplicateDeck = decks.find(deck => deck.generation === generation && deck.deckName === deckName);
    if (duplicateDeck) {
      alert('The deck already exists');
      return;
    }

    try {
      await addDoc(collection(db, 'decks'), {
        generation: generation,
        deckName: deckName,
        comment: comment,
        userId: currentUser.uid,
      });
      alert('デッキを登録しました');
      const decksData = await fetchDecks();
      setDecks(decksData || []);
    } catch (error) {
      console.error('Error adding document: ', error);
      alert('Failed to register deck. Please try again.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const decksData = await fetchDecks();
      setDecks(decksData || []);
    }

    fetchData();
  }, [db]);

  const groupDecksByGeneration = decks.reduce((acc, deck) => {
    if (!acc[deck.generation]) {
      acc[deck.generation] = [];
    }
    acc[deck.generation].push(deck);
    return acc;
  }, {} as { [key: string]: Deck[] });

  const toggleGeneration = (generation: string) => {
    setCollapsedGenerations(prevState => ({
      ...prevState,
      [generation]: !prevState[generation]
    }));
  };

  return (
    <div>
      <h3>デッキ登録</h3>
      <select value={generation} onChange={(e) => setGeneration(e.target.value)}>
        {[...Array(9).keys()].map((i) => (
          <option key={i + 1} value={i + 1}>{i + 1}期</option>
        ))}
      </select>
      <br />
      <input
        type="text"
        placeholder="デッキ名"
        value={deckName}
        onChange={(e) => setDeckName(e.target.value)}
      />
      <br />
      <textarea
        placeholder="コメント(任意)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <br />
      <button onClick={handleRegister}>登録</button>
      <h3>現在のデッキリスト</h3>
      {Object.keys(groupDecksByGeneration).map((generation) => (
        <div key={generation}>
          <h4 onClick={() => toggleGeneration(generation)} >
            {!collapsedGenerations[generation] ? '▶' : '▼'}
            {generation}期</h4>
          {collapsedGenerations[generation] && (
            <ul>
              {groupDecksByGeneration[generation].map((deck) => (
                <li key={deck.deckName}>
                  {deck.deckName} {deck.comment && `(${deck.comment})`}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
