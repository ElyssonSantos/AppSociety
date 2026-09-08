import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Substitua estes valores com as configurações do seu projeto do Firebase
// Você encontra isso no Console do Firebase > Configurações do Projeto > Geral > Seus aplicativos
const firebaseConfig = {
  apiKey: "AIzaSyBswRx7NkvtP1uLhHR04e8y0a76ZCb_k80",
  authDomain: "appsociety-f905b.firebaseapp.com",
  projectId: "appsociety-f905b",
  storageBucket: "appsociety-f905b.firebasestorage.app",
  messagingSenderId: "592398121471",
  appId: "1:592398121471:web:98c1737d5795708f360fca",
  measurementId: "G-6F1MW504TD"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Firestore (Banco de Dados)
const db = getFirestore(app);

// Exportamos o app e o db para serem usados em outros arquivos (ex: AppContext.tsx)
export { app, db };
