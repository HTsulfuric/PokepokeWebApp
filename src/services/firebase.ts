import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Deck } from '../types/index.ts';
import { useState } from 'react';


export const fetchDecks = async () => {
  const [, setDecks] = useState<Deck[]>([]);
  const db = getFirestore();
  const auth = getAuth();

  if (!auth.currentUser) {
    alert('No user is currently logged in');
    return;
  }

  try {
    const q = query(collection(db, 'decks'), where('userId', '==', auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    const decksData = querySnapshot.docs.map(doc => doc.data() as Deck);
    setDecks(decksData);
  } catch (error) {
    console.error('Error fetching decks: ', error);
  }
};
