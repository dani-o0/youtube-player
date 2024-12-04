import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCbFyRcRx8jypzbkfY0xgWvr01RfQ4o39c",
  authDomain: "player-24048.firebaseapp.com",
  projectId: "player-24048",
  storageBucket: "player-24048.firebasestorage.app",
  messagingSenderId: "317528782186",
  appId: "1:317528782186:web:5a16bf87fe60de8a36a113"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
