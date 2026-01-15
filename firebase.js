// Inicialização Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAK-Mj7fDwCUh9aer3z8swN7hUNIi2FK4E",
  authDomain: "ousadia-alegria-3269f.firebaseapp.com",
  projectId: "ousadia-alegria-3269f"
};

firebase.initializeApp(firebaseConfig);

// Serviços globais
window.auth = firebase.auth();
window.db = firebase.firestore();
