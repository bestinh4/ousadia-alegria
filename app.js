console.log("app.js carregado");

// Firebase (compat)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔑 CONFIG */
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
};

/* INIT */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ELEMENTOS */
const telaLogin = document.getElementById("telaLogin");
const telaHome = document.getElementById("telaHome");
const listaPeladas = document.getElementById("listaPeladas");

/* 🔓 LOGIN */
window.login = async function () {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    await signInWithEmailAndPassword(auth, email, senha);
  } catch (e) {
    alert("Erro ao logar");
    console.error(e);
  }
};

/* 🚪 LOGOUT */
window.logout = async function () {
  await signOut(auth);
};

/* 🔁 AUTH STATE */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    telaLogin.classList.add("hidden");
    telaHome.classList.remove("hidden");
    carregarPeladas();
  } else {
    telaLogin.classList.remove("hidden");
    telaHome.classList.add("hidden");
  }
});

/* ⚽ PELADAS */
window.criarPelada = async function () {
  const nome = prompt("Nome da pelada");
  if (!nome) return;

  await addDoc(collection(db, "peladas"), {
    nome,
    ownerId: auth.currentUser.uid,
    createdAt: serverTimestamp()
  });

  carregarPeladas();
};

async function carregarPeladas() {
  listaPeladas.innerHTML = "";

  const q = query(
    collection(db, "peladas"),
    where("ownerId", "==", auth.currentUser.uid)
  );

  const snap = await getDocs(q);

  snap.forEach(doc => {
    const div = document.createElement("div");
    div.textContent = doc.data().nome;
    div.className = "border p-2 rounded mb-1";
    listaPeladas.appendChild(div);
  });
}
