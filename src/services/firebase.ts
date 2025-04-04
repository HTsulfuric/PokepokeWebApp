import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Deck } from '../types/index.ts';


export const fetchDecks = async () => {
  const db = getFirestore();
  const auth = getAuth();

  if (!auth.currentUser) {
    alert('No user is currently logged in');
    return;
  }

  try {
    const q = query(collection(db, 'decks'), where('userId', '==', auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    const decksData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() } as Deck));
    return decksData;
  } catch (error) {
    console.error('Error fetching decks: ', error);
  }
};
