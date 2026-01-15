import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔥 FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyAK-Mj7fDwCUh9aer3z8swN7hUNIi2FK4E",
  authDomain: "ousadia-alegria-3269f.firebaseapp.com",
  projectId: "ousadia-alegria-3269f",
  storageBucket: "ousadia-alegria-3269f.firebasestorage.app",
  messagingSenderId: "695364420342",
  appId: "1:695364420342:web:aa130dfa6e019a271b22d7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let peladaAtual = null;

/* 🔐 LOGIN */
window.login = async () => {
  const email = email.value;
  const senha = senha.value;

  try {
    await signInWithEmailAndPassword(auth, email, senha);
  } catch {
    await createUserWithEmailAndPassword(auth, email, senha);
  }
};

window.logout = () => signOut(auth);

/* 🔄 AUTH STATE */
onAuthStateChanged(auth, user => {
  if (user) {
    loginSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    listarPeladas();
  } else {
    loginSection.classList.remove("hidden");
    appSection.classList.add("hidden");
  }
});

/* 🏟️ CRIAR PELADA */
window.criarPelada = async () => {
  if (!auth.currentUser) return;

  await addDoc(collection(db, "peladas"), {
    data: dataPelada.value,
    ownerId: auth.currentUser.uid,
    createdAt: serverTimestamp()
  });

  listarPeladas();
};

/* 📋 LISTAR PELADAS */
async function listarPeladas() {
  listaPeladas.innerHTML = "Carregando...";

  const q = query(
    collection(db, "peladas"),
    where("ownerId", "==", auth.currentUser.uid),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  listaPeladas.innerHTML = "";

  snap.forEach(doc => {
    const li = document.createElement("li");
    li.textContent = `Pelada em ${doc.data().data}`;
    li.onclick = () => {
      peladaAtual = doc.id;
      listarJogadores();
    };
    listaPeladas.appendChild(li);
  });
}

/* 👤 ENTRAR NA PELADA */
window.entrarPelada = async () => {
  if (!peladaAtual || !auth.currentUser) return;

  const q = query(
    collection(db, "peladas", peladaAtual, "jogadores"),
    where("userId", "==", auth.currentUser.uid)
  );

  const existe = await getDocs(q);
  if (!existe.empty) {
    alert("Você já está nesta pelada");
    return;
  }

  await addDoc(collection(db, "peladas", peladaAtual, "jogadores"), {
    nome: nomeJogador.value,
    userId: auth.currentUser.uid,
    confirmado: false,
    createdAt: serverTimestamp()
  });

  listarJogadores();
};

/* 👥 LISTAR JOGADORES */
async function listarJogadores() {
  listaJogadores.innerHTML = "Carregando...";

  const q = query(
    collection(db, "peladas", peladaAtual, "jogadores"),
    orderBy("createdAt")
  );

  const snap = await getDocs(q);
  listaJogadores.innerHTML = "";

  snap.forEach(doc => {
    const j = doc.data();
    const li = document.createElement("li");
    li.textContent = j.nome;
    if (j.confirmado) li.classList.add("confirmado");
    listaJogadores.appendChild(li);
  });
}
