import { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Define an interface for the deck objects
interface Deck {
  generation: string;
  deckName: string;
  comment: string;
  userId: string;
}

export function DeckRegister() {
  const [generation, setGeneration] = useState('');
  const [deckName, setDeckName] = useState('');
  const [comment, setComment] = useState('');
  const [decks, setDecks] = useState<Deck[]>([]); // Use the Deck interface for the state
  const db = getFirestore();
  const auth = getAuth();


  const handleRegister = async () => {
    if (!auth.currentUser) {
      alert('No user is currently logged in');
      return;
    }

    try {
      console.log('Adding deck...');
      console.log('generation: ', generation);
      console.log('deckName: ', deckName);
      console.log('comment: ', comment);
      console.log('userId: ', auth.currentUser.uid);

      await addDoc(collection(db, 'decks'), {
        generation: generation,
        deckName: deckName,
        comment: comment,
        userId: auth.currentUser.uid,
      });
      console.log("デバッグ: ", {
        generation: generation,
        deckName: deckName,
        comment: comment,
        userId: auth.currentUser.uid,
      });
      fetchDecks(); // Fetch decks after adding a new one
    } catch (error) {
      console.error('Error adding document: ', error);
      alert('Failed to register deck. Please try again.');
    }
  };

  const fetchDecks = async () => {
    if (!auth.currentUser) {
      alert('No user is currently logged in');
      return;
    }

    try {
      console.log('Fetching decks...');

      const q = query(collection(db, 'decks'), where('userId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      console.log('querySnapshot: ', querySnapshot);
      const decksData = querySnapshot.docs.map(doc => doc.data() as Deck); // Ensure the data is typed as Deck
      console.log('decksData: ', decksData);
      setDecks(decksData);
    } catch (error) {
      console.error('Error fetching decks: ', error);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  return (
    <div>
      <h3>デッキ登録</h3>
      <input
        type="text"
        placeholder="世代"
        value={generation}
        onChange={(e) => setGeneration(e.target.value)}
      />
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
      <ul>
        {decks.map((deck, index) => (
          <li key={index}>
            {deck.generation} - {deck.deckName} - {deck.comment}
          </li>
        ))}
      </ul>
    </div>
  );
}
