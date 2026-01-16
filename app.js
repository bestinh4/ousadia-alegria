console.log("app.js carregado como module");

// 🔥 FIREBASE
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

// 🔹 ESTADO
let usuario = null;
let peladaAtualId = null;
let jogadoresConfirmados = [];
let ultimoTimeA = [];
let ultimoTimeB = [];

// 🔹 SEÇÕES
const loginSection = document.getElementById("loginSection");
const appSection = document.getElementById("appSection");
const peladaSection = document.getElementById("peladaSection");

// 🔐 AUTH
onAuthStateChanged(auth, user => {
  if (!loginSection || !appSection || !peladaSection) return;

  if (user) {
    usuario = user;
    loginSection.style.display = "none";
    appSection.style.display = "block";
    peladaSection.style.display = "none";
    carregarPeladas();
  } else {
    loginSection.style.display = "block";
    appSection.style.display = "none";
    peladaSection.style.display = "none";
  }
});

// 🔑 LOGIN
window.login = async () => {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    await signInWithEmailAndPassword(auth, email, senha);
  } catch {
    await createUserWithEmailAndPassword(auth, email, senha);
  }
};

window.logout = () => signOut(auth);

// 🟢 PELADAS
async function carregarPeladas() {
  const lista = document.getElementById("listaPeladas");
  lista.innerHTML = "";

  const q = query(
    collection(db, "peladas"),
    where("ownerId", "==", usuario.uid)
  );

  const snap = await getDocs(q);

  snap.forEach(doc => {
    lista.innerHTML += `
      <div class="p-2 bg-zinc-800 mt-2 cursor-pointer"
           onclick="abrirPelada('${doc.id}','${doc.data().nome}')">
        ${doc.data().nome}
      </div>`;
  });
}

window.criarPelada = async () => {
  const nome = document.getElementById("nomePelada").value;
  if (!nome) return;

  await addDoc(collection(db, "peladas"), {
    nome,
    ownerId: usuario.uid,
    createdAt: serverTimestamp()
  });

  document.getElementById("nomePelada").value = "";
  carregarPeladas();
};

window.abrirPelada = async (id, nome) => {
  peladaAtualId = id;
  document.getElementById("tituloPelada").innerText = nome;

  appSection.style.display = "none";
  peladaSection.style.display = "block";

  jogadoresConfirmados = [];
  document.getElementById("listaJogadores").innerHTML = "";
  document.getElementById("times").innerHTML = "";
  document.getElementById("placarSection").style.display = "none";

  carregarHistorico();
};

window.voltarPeladas = () => {
  peladaSection.style.display = "none";
  appSection.style.display = "block";
};

// 👤 JOGADORES
window.adicionarJogador = () => {
  const nome = document.getElementById("nomeJogador").value;
  if (!nome) return;

  jogadoresConfirmados.push(nome);
  document.getElementById("nomeJogador").value = "";
  renderJogadores();
};

function renderJogadores() {
  const lista = document.getElementById("listaJogadores");
  lista.innerHTML = jogadoresConfirmados.map(j => `<div>${j}</div>`).join("");
}

// ⚽ TIMES
window.gerarTimes = () => {
  if (jogadoresConfirmados.length < 2) return alert("Poucos jogadores");

  const mix = [...jogadoresConfirmados].sort(() => Math.random() - 0.5);
  const meio = Math.ceil(mix.length / 2);

  ultimoTimeA = mix.slice(0, meio);
  ultimoTimeB = mix.slice(meio);

  document.getElementById("times").innerHTML = `
    <div><strong>Time A:</strong> ${ultimoTimeA.join(", ")}</div>
    <div><strong>Time B:</strong> ${ultimoTimeB.join(", ")}</div>
  `;

  document.getElementById("placarSection").style.display = "block";
};

// 🏆 PARTIDAS
window.salvarPartida = async () => {
  const golsA = Number(document.getElementById("golsA").value);
  const golsB = Number(document.getElementById("golsB").value);

  await addDoc(
    collection(db, "peladas", peladaAtualId, "partidas"),
    {
      timeA: ultimoTimeA,
      timeB: ultimoTimeB,
      golsA,
      golsB,
      data: serverTimestamp()
    }
  );

  document.getElementById("golsA").value = "";
  document.getElementById("golsB").value = "";

  carregarHistorico();
};

async function carregarHistorico() {
  const lista = document.getElementById("listaPartidas");
  lista.innerHTML = "";

  const q = query(
    collection(db, "peladas", peladaAtualId, "partidas"),
    orderBy("data", "desc")
  );

  const snap = await getDocs(q);

  snap.forEach(doc => {
    const p = doc.data();
    lista.innerHTML += `
      <div class="p-2 bg-zinc-800 mt-2">
        ${p.golsA} x ${p.golsB}
      </div>`;
  });
}

import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.carregarHistorico = async function () {
  const historicoSection = document.getElementById("historicoSection");
  const lista = document.getElementById("listaHistorico");

  lista.innerHTML = "";
  historicoSection.classList.remove("hidden");

  const partidasRef = collection(db, "peladas", peladaSelecionadaId, "partidas");
  const q = query(partidasRef, orderBy("criadaEm", "desc"));

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    lista.innerHTML = "<li>Nenhuma partida registrada.</li>";
    return;
  }

  snapshot.forEach(doc => {
    const p = doc.data();

    const li = document.createElement("li");
    li.className = "bg-white p-4 rounded shadow";

    li.innerHTML = `
      <div class="font-semibold mb-1">
        ${p.placarA} x ${p.placarB}
      </div>

      <div class="text-sm text-gray-600 mb-2">
        ${new Date(p.criadaEm.seconds * 1000).toLocaleDateString()}
      </div>

      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Time A</strong>
          <ul>${p.timeA.map(j => `<li>${j}</li>`).join("")}</ul>
        </div>
        <div>
          <strong>Time B</strong>
          <ul>${p.timeB.map(j => `<li>${j}</li>`).join("")}</ul>
        </div>
      </div>
    `;

    lista.appendChild(li);
  });
};

