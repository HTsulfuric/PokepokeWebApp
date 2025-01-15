import { Timestamp } from '@firebase/firestore-types';

export interface Deck {
  id: string;
  generation: string;
  deckName: string;
  comment: string;
  userId: string;
}

export interface Record {
  id: string;
  generation: string;
  myDeck: string;
  opDeck: string;
  order: 'first' | 'second';
  result: 'win' | 'lose';
  comment: string;
  userId: string;
  timestamp: Timestamp;
}
