/* ================== IMPORTS ================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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

/* ================== FIREBASE ================== */
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

/* ================== STATE ================== */
let usuario = null;
let peladaAtual = null;
let jogadores = [];

/* ================== AUTH ================== */
function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  signInWithEmailAndPassword(auth, email, senha)
    .catch(() => createUserWithEmailAndPassword(auth, email, senha));
}

function logout() {
  signOut(auth);
}

onAuthStateChanged(auth, user => {
  if (user) {
    usuario = user;
    document.getElementById("loginSection").classList.add("hidden");
    document.getElementById("peladasSection").classList.remove("hidden");
    carregarPeladas();
  } else {
    usuario = null;
    document.getElementById("loginSection").classList.remove("hidden");
    document.getElementById("peladasSection").classList.add("hidden");
    document.getElementById("peladaSection").classList.add("hidden");
  }
});

/* ================== PELADAS ================== */
async function criarPelada() {
  const nome = document.getElementById("nomePelada").value;
  if (!nome) return;

  await addDoc(collection(db, "peladas"), {
    nome,
    ownerId: usuario.uid,
    criadoEm: serverTimestamp()
  });

  document.getElementById("nomePelada").value = "";
  carregarPeladas();
}

async function carregarPeladas() {
  const q = query(
    collection(db, "peladas"),
    where("ownerId", "==", usuario.uid),
    orderBy("criadoEm", "desc")
  );

  const snapshot = await getDocs(q);
  const lista = document.getElementById("listaPeladas");
  lista.innerHTML = "";

  snapshot.forEach(doc => {
    const p = doc.data();
    lista.innerHTML += `
      <li class="border p-2 cursor-pointer" onclick="abrirPelada('${doc.id}', '${p.nome}')">
        ${p.nome}
      </li>
    `;
  });
}

function abrirPelada(id, nome) {
  peladaAtual = id;
  jogadores = [];

  document.getElementById("tituloPelada").innerText = nome;
  document.getElementById("peladasSection").classList.add("hidden");
  document.getElementById("peladaSection").classList.remove("hidden");

  document.getElementById("listaJogadores").innerHTML = "";
  document.getElementById("times").innerHTML = "";
}

/* ================== JOGADORES ================== */
function adicionarJogador() {
  const nome = document.getElementById("nomeJogador").value;
  if (!nome) return;

  jogadores.push(nome);
  document.getElementById("nomeJogador").value = "";
  renderJogadores();
}

function renderJogadores() {
  const ul = document.getElementById("listaJogadores");
  ul.innerHTML = "";
  jogadores.forEach(j => ul.innerHTML += `<li>${j}</li>`);
}

/* ================== TIMES ================== */
function gerarTimes() {
  const embaralhado = [...jogadores].sort(() => Math.random() - 0.5);
  const meio = Math.ceil(embaralhado.length / 2);

  const timeA = embaralhado.slice(0, meio);
  const timeB = embaralhado.slice(meio);

  window.timeA = timeA;
  window.timeB = timeB;

  document.getElementById("times").innerHTML = `
    <p><strong>Time A:</strong> ${timeA.join(", ")}</p>
    <p><strong>Time B:</strong> ${timeB.join(", ")}</p>
  `;
}

/* ================== PARTIDA ================== */
async function salvarPartida() {
  const golsA = Number(document.getElementById("golsA").value);
  const golsB = Number(document.getElementById("golsB").value);

  await addDoc(
    collection(db, "peladas", peladaAtual, "partidas"),
    {
      timeA: window.timeA,
      timeB: window.timeB,
      golsA,
      golsB,
      criadoEm: serverTimestamp()
    }
  );

  alert("Partida salva com sucesso");
}

/* ================== NAV ================== */
function voltarPeladas() {
  document.getElementById("peladaSection").classList.add("hidden");
  document.getElementById("peladasSection").classList.remove("hidden");
}

/* ================== EXPORT GLOBAL ================== */
window.login = login;
window.logout = logout;
window.criarPelada = criarPelada;
window.abrirPelada = abrirPelada;
window.adicionarJogador = adicionarJogador;
window.gerarTimes = gerarTimes;
window.salvarPartida = salvarPartida;
window.voltarPeladas = voltarPeladas;
