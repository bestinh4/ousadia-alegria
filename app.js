// Firebase SDKs (v9 - modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ===============================
// CONFIGURAÇÃO FIREBASE (SUA)
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyAK-Mj7fDwCUh9aer3z8swN7hUNIi2FK4E",
  authDomain: "ousadia-alegria-3269f.firebaseapp.com",
  projectId: "ousadia-alegria-3269f",
  storageBucket: "ousadia-alegria-3269f.firebasestorage.app",
  messagingSenderId: "695364420342",
  appId: "1:695364420342:web:aa130dfa6e019a271b22d7"
};

// ===============================
// INIT
// ===============================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===============================
// UI ELEMENTS
// ===============================
const loginSection = document.getElementById("loginSection");
const appSection = document.getElementById("appSection");

const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const loginBtn = document.getElementById("loginBtn");

const nomePeladaInput = document.getElementById("nomePelada");
const criarPeladaBtn = document.getElementById("criarPeladaBtn");
const listaPeladas = document.getElementById("listaPeladas");

const logoutBtn = document.getElementById("logoutBtn");

// ===============================
// LOGIN / CRIAR CONTA
// ===============================
loginBtn.onclick = async () => {
  console.log("login clicado");

  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();

  if (!email || !senha) {
    alert("Preencha email e senha");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    console.log("Login efetuado");
  } catch (err) {
    console.warn("Usuário não existe, criando conta...");
    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      alert("Conta criada com sucesso");
    } catch (e) {
      alert(e.message);
    }
  }
};

// ===============================
// CONTROLE DE SESSÃO
// ===============================
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.style.display = "none";
    appSection.style.display = "block";
    carregarPeladas(user.uid);
  } else {
    loginSection.style.display = "block";
    appSection.style.display = "none";
  }
});

// ===============================
// CRIAR PELADA
// ===============================
criarPeladaBtn.onclick = async () => {
  const nome = nomePeladaInput.value.trim();
  if (!nome) return;

  try {
    await addDoc(collection(db, "peladas"), {
      nome,
      ownerId: auth.currentUser.uid,
      createdAt: serverTimestamp()
    });
    nomePeladaInput.value = "";
  } catch (e) {
    alert(e.message);
  }
};

// ===============================
// LISTAR PELADAS DO USUÁRIO
// ===============================
function carregarPeladas(uid) {
  const q = query(
    collection(db, "peladas"),
    where("ownerId", "==", uid)
  );

  onSnapshot(q, (snapshot) => {
    listaPeladas.innerHTML = "";

    if (snapshot.empty) {
      listaPeladas.innerHTML = "<li>Nenhuma pelada criada</li>";
      return;
    }

    snapshot.forEach((doc) => {
      const li = document.createElement("li");
      li.textContent = doc.data().nome;
      listaPeladas.appendChild(li);
    });
  });
}

// ===============================
// LOGOUT
// ===============================
logoutBtn.onclick = () => {
  signOut(auth);
};

console.log("app.js carregado");
