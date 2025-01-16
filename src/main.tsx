import { createRoot } from 'react-dom/client'
import App from './AppRouter.tsx'
import { initializeApp } from 'firebase/app'
import 'bootstrap/dist/css/bootstrap.min.css'

import './index.css'

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

//@ts-expect-error TS6133 (TS6133) 'app' is declared but its value is never read.
const app = initializeApp(firebaseConfig); // eslint-disable-line

createRoot(document.getElementById('root')!).render(
  <App />
);
