import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Deck } from '../types/index.ts';
import { fetchDecks } from '../services/firebase.ts';
import { useAuth } from '../hooks/useAuth.ts';

export function Decklist() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [collapsedGenerations, setCollapsedGenerations] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchGeneration, setSearchGeneration] = useState('');
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [editDeckName, setEditDeckName] = useState('');
  const [editComment, setEditComment] = useState('');
  const db = getFirestore();
  const navigate = useNavigate();
  const currentUser = useAuth();

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this deck?');
    if (!confirmDelete) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'decks', id));
      const decksData = await fetchDecks(); // Refresh the deck list after deleting
      setDecks(decksData || []);
    } catch (error) {
      console.error('Error deleting deck: ', error);
    }
  };

  const handleEdit = (deck: Deck) => {
    setEditingDeck(deck);
    setEditDeckName(deck.deckName);
    setEditComment(deck.comment);
  };

  const handleUpdate = async () => {
    if (!editingDeck) {
      return;
    }

    try {
      await updateDoc(doc(db, 'decks', editingDeck.id), {
        deckName: editDeckName,
        comment: editComment,
      });
      setEditingDeck(null);

      // Refresh the deck list after updating
      const decksData = await fetchDecks();
      setDecks(decksData || []);

      // Reset the form fields
    } catch (error) {
      console.error('Error updating deck: ', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const decksData = await fetchDecks();
      setDecks(decksData || []);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      alert('ログインしてください');
      navigate('/');
    }
  }, [navigate]);

  const toggleGeneration = (generation: string) => {
    setCollapsedGenerations(prevState => ({
      ...prevState,
      [generation]: !prevState[generation]
    }));
  };

  const filteredDecks = decks.filter(deck => {
    const matchesGeneration = searchGeneration ? deck.generation === searchGeneration : true;
    const matchesSearchTerm = deck.deckName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGeneration && matchesSearchTerm;
  });

  const groupedDecks = filteredDecks.reduce((acc, deck) => {
    if (!acc[deck.generation]) {
      acc[deck.generation] = [];
    }
    acc[deck.generation].push(deck);
    return acc;
  }, {} as { [key: string]: Deck[] });

  return (
    <div>
      <h3>デッキリスト</h3>
      <input
        type="text"
        placeholder="デッキ名で検索"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <br />
      <select
        value={searchGeneration}
        onChange={(e) => setSearchGeneration(e.target.value)}
      >
        <option value="">全ての世代</option>
        {[...Array(9).keys()].map(i => (
          <option key={i + 1} value={String(i + 1)}>{i + 1}期</option>
        ))}
      </select>
      <br />
      {Object.keys(groupedDecks).length === 0 ? (
        <p>一致がありません</p>
      ) : (
        Object.keys(groupedDecks).map(generation => (
          <div key={generation}>
            <h4 onClick={() => toggleGeneration(generation)}>
              {collapsedGenerations[generation] ? '▶' : '▼'}
              世代 {generation}
            </h4>
            {!collapsedGenerations[generation] && (
              <ul>
                {groupedDecks[generation].map((deck, index) => (
                  <li key={index}>
                    {deck.deckName} - {deck.comment}
                    <button
                      onClick={() => handleEdit(deck)}>
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(deck.id)}>
                      削除
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))
      )}

      {editingDeck && (
        <div>
          <h3>デッキ編集</h3>
          <input
            type="text"
            placeholder="デッキ名"
            value={editDeckName}
            onChange={(e) => setEditDeckName(e.target.value)}
          />
          <br />
          <textarea
            placeholder="コメント(任意)"
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
          />
          <br />
          <button onClick={handleUpdate}>更新</button>
        </div>
      )}
    </div>
  );
}
