import { useState } from 'react';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

export function UsernamePage() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  const handleSubmit = async () => {
    if (!username) {
      alert('Username cannot be empty');
      return;
    }

    if (!auth.currentUser) {
      alert('User not logged in');
      return;
    }

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, { username }, { merge: true });
      navigate('/main');
    } catch (error) {
      console.error('Error setting username:', error);
      alert('Failed to set username. Please try again');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>ユーザーネームを設定</h2>
      <input
        type="text"
        placeholder="ユーザーネーム"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <button onClick={handleSubmit} style={{ marginTop: '20px' }}>
        設定
      </button>
    </div>
  );
}
