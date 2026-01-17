console.log("app.js carregado como module");

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
  getDocs,
  serverTimestamp,
  updateDoc,
  doc,
  increment,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* CONFIG */
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

/* ESTADO */
let usuario = null;
let peladaAtual = null;
let jogadoresAtual = [];
let timeA = [];
let timeB = [];

/* AUTH */
window.login = async function () {
  const email = email.value;
  const senha = senha.value;

  try {
    await signInWithEmailAndPassword(auth, email, senha);
  } catch {
    await createUserWithEmailAndPassword(auth, email, senha);
  }
};

window.logout = () => signOut(auth);

onAuthStateChanged(auth, async (user) => {
  if (user) {
    usuario = user;
    loginSection.classList.add("hidden");
    peladasSection.classList.remove("hidden");
    carregarPeladas();
  } else {
    usuario = null;
    loginSection.classList.remove("hidden");
    peladasSection.classList.add("hidden");
  }
});

/* PELADAS */
window.criarPelada = async function () {
  await addDoc(collection(db, "peladas"), {
    nome: nomePelada.value,
    owner: usuario.uid,
    createdAt: serverTimestamp()
  });
  nomePelada.value = "";
  carregarPeladas();
};

async function carregarPeladas() {
  listaPeladas.innerHTML = "";
  const q = query(collection(db, "peladas"), where("owner", "==", usuario.uid));
  const snap = await getDocs(q);

  snap.forEach(docSnap => {
    const div = document.createElement("div");
    div.textContent = docSnap.data().nome;
    div.className = "p-2 border mb-1 cursor-pointer";
    div.onclick = () => abrirPelada(docSnap.id, docSnap.data().nome);
    listaPeladas.appendChild(div);
  });
}

function abrirPelada(id, nome) {
  peladaAtual = id;
  tituloPelada.textContent = nome;
  peladasSection.classList.add("hidden");
  peladaSection.classList.remove("hidden");
  carregarJogadores();
}

/* JOGADORES */
window.adicionarJogador = async function () {
  await addDoc(collection(db, "jogadores"), {
    peladaId: peladaAtual,
    nome: nomeJogador.value,
    partidas: 0,
    vitorias: 0,
    derrotas: 0,
    gols: 0
  });
  nomeJogador.value = "";
  carregarJogadores();
};

async function carregarJogadores() {
  listaJogadores.innerHTML = "";
  jogadoresAtual = [];
  const q = query(collection(db, "jogadores"), where("peladaId", "==", peladaAtual));
  const snap = await getDocs(q);

  snap.forEach(d => {
    jogadoresAtual.push(d);
    const li = document.createElement("li");
    li.textContent = d.data().nome;
    listaJogadores.appendChild(li);
  });
}

/* TIMES */
window.gerarTimes = function () {
  timeA = [];
  timeB = [];
  jogadoresAtual.forEach((j, i) => {
    (i % 2 === 0 ? timeA : timeB).push(j);
  });

  times.innerHTML = `
    <strong>Time A:</strong> ${timeA.map(j => j.data().nome).join(", ")}<br>
    <strong>Time B:</strong> ${timeB.map(j => j.data().nome).join(", ")}
  `;
};

/* PARTIDA + ESTATÍSTICAS */
window.salvarPartida = async function () {
  const pa = Number(placarA.value);
  const pb = Number(placarB.value);

  await addDoc(collection(db, "partidas"), {
    peladaId: peladaAtual,
    timeA: timeA.map(j => j.data().nome),
    timeB: timeB.map(j => j.data().nome),
    placarA: pa,
    placarB: pb,
    data: serverTimestamp()
  });

  for (const j of jogadoresAtual) {
    const ref = doc(db, "jogadores", j.id);
    const venceu =
      (timeA.includes(j) && pa > pb) ||
      (timeB.includes(j) && pb > pa);

    await updateDoc(ref, {
      partidas: increment(1),
      vitorias: increment(venceu ? 1 : 0),
      derrotas: increment(!venceu ? 1 : 0)
    });
  }

  alert("Partida salva com sucesso");
};

/* RANKING */
window.carregarRanking = async function () {
  ranking.innerHTML = "<h3 class='font-bold'>Ranking</h3>";

  const q = query(
    collection(db, "jogadores"),
    where("peladaId", "==", peladaAtual),
    orderBy("vitorias", "desc")
  );

  const snap = await getDocs(q);
  snap.forEach(d => {
    const j = d.data();
    ranking.innerHTML += `
      <div>${j.nome} - ${j.vitorias} vitórias</div>
    `;
  });
};

/* VOLTAR */
window.voltarPeladas = function () {
  peladaSection.classList.add("hidden");
  peladasSection.classList.remove("hidden");
};
