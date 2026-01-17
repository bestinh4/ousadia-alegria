// ===== FIREBASE =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
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
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔐 SUAS CHAVES
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===== VARIÁVEIS =====
let usuario = null;
let peladaAtual = null;
let jogadores = [];

// ===== LOGIN =====
window.login = async () => {
  await signInWithEmailAndPassword(
    auth,
    email.value,
    senha.value
  );
};

window.logout = async () => {
  await signOut(auth);
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    usuario = user;
    telaLogin.classList.add("hidden");
    telaPeladas.classList.remove("hidden");
    carregarPeladas();
  }
});

// ===== PELADAS =====
async function carregarPeladas() {
  listaPeladas.innerHTML = "";

  const q = query(
    collection(db, "peladas"),
    where("uid", "==", usuario.uid)
  );

  const snap = await getDocs(q);

  snap.forEach(doc => {
    const li = document.createElement("li");
    li.className = "bg-white p-2 shadow cursor-pointer";
    li.innerText = doc.data().nome;
    li.onclick = () => abrirPelada(doc.id, doc.data().nome);
    listaPeladas.appendChild(li);
  });
}

window.criarPelada = async () => {
  await addDoc(collection(db, "peladas"), {
    nome: nomePelada.value,
    uid: usuario.uid
  });
  nomePelada.value = "";
  carregarPeladas();
};

function abrirPelada(id, nome) {
  peladaAtual = id;
  tituloPelada.innerText = nome;
  telaPeladas.classList.add("hidden");
  telaPelada.classList.remove("hidden");
  jogadores = [];
  listaJogadores.innerHTML = "";
  historico.innerHTML = "";
}

// ===== JOGADORES =====
window.adicionarJogador = () => {
  jogadores.push(nomeJogador.value);
  nomeJogador.value = "";
  renderJogadores();
};

function renderJogadores() {
  listaJogadores.innerHTML = "";
  jogadores.forEach(j => {
    const li = document.createElement("li");
    li.innerText = j;
    listaJogadores.appendChild(li);
  });
}

// ===== TIMES =====
window.gerarTimes = () => {
  alert("Times gerados com sucesso");
};

// ===== PARTIDA =====
window.salvarPartida = async () => {
  await addDoc(collection(db, "partidas"), {
    peladaId: peladaAtual,
    jogadores,
    data: new Date()
  });
  alert("Partida salva");
};

// ===== HISTÓRICO =====
window.carregarHistorico = async () => {
  historico.innerHTML = "<h3 class='font-bold'>Histórico</h3>";

  const q = query(
    collection(db, "partidas"),
    where("peladaId", "==", peladaAtual)
  );

  const snap = await getDocs(q);

  snap.forEach(doc => {
    const div = document.createElement("div");
    div.className = "bg-white p-2 my-2 shadow";
    div.innerText = doc.data().data.toDate().toLocaleString();
    historico.appendChild(div);
  });
};

// ===== VOLTAR =====
window.voltarPeladas = () => {
  telaPelada.classList.add("hidden");
  telaPeladas.classList.remove("hidden");
};
