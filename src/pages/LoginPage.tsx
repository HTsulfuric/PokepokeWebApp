import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');

  const handleLogin = () => {
    // Firebase Auth等でログイン処理を行う想定
    console.log('Login:', username, code);
    navigate('/main');
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>ユーザー登録 / ログイン</h2>
      <input
        type="text"
        placeholder="ユーザー名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder="4桁の数字"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <br />
      <button onClick={handleLogin}>ログイン</button>
    </div>
  );
}