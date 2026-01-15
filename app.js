console.log("app.js carregado");

// 🔥 Firebase config (SUAS CHAVES)
const firebaseConfig = {
  apiKey: "AIzaSyAK-Mj7fDwCUh9aer3z8swN7hUNIi2FK4E",
  authDomain: "ousadia-alegria-3269f.firebaseapp.com",
  projectId: "ousadia-alegria-3269f",
  storageBucket: "ousadia-alegria-3269f.firebasestorage.app",
  messagingSenderId: "695364420342",
  appId: "1:695364420342:web:aa130dfa6e019a271b22d7"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// UI
const loginSection = document.getElementById("loginSection");
const appSection = document.getElementById("appSection");
const peladaSection = document.getElementById("peladaSection");

let usuario;
let peladaAtualId;
let ultimoTimeA = [];
let ultimoTimeB = [];

// 🔐 AUTH
auth.onAuthStateChanged(user => {
  if (user) {
    usuario = user;
    loginSection.style.display = "none";
    appSection.style.display = "block";
    carregarPeladas();
  }
});

window.login = async () => {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    await auth.signInWithEmailAndPassword(email, senha);
  } catch {
    await auth.createUserWithEmailAndPassword(email, senha);
  }
};

window.logout = () => auth.signOut();

// 🏟️ PELADAS
async function carregarPeladas() {
  const lista = document.getElementById("listaPeladas");
  lista.innerHTML = "";

  const snap = await db.collection("peladas")
    .where("ownerId", "==", usuario.uid)
    .get();

  snap.forEach(doc => {
    lista.innerHTML += `
      <div class="card">
        ${doc.data().nome}
        <button onclick="abrirPelada('${doc.id}', '${doc.data().nome}')">Abrir</button>
      </div>
    `;
  });
}

window.criarPelada = async () => {
  const nome = document.getElementById("nomePelada").value;
  if (!nome) return;

  await db.collection("peladas").add({
    nome,
    ownerId: usuario.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById("nomePelada").value = "";
  carregarPeladas();
};

window.abrirPelada = async (id, nome) => {
  peladaAtualId = id;
  appSection.style.display = "none";
  peladaSection.style.display = "block";
  document.getElementById("tituloPelada").innerText = nome;
  carregarJogadores();
  carregarHistorico();
};

window.voltarPeladas = () => {
  peladaSection.style.display = "none";
  appSection.style.display = "block";
};

// 👥 JOGADORES
async function carregarJogadores() {
  const lista = document.getElementById("listaJogadores");
  lista.innerHTML = "";

  const snap = await db.collection("peladas")
    .doc(peladaAtualId)
    .collection("jogadores")
    .get();

  snap.forEach(doc => {
    lista.innerHTML += `<div>${doc.data().nome}</div>`;
  });
}

window.adicionarJogador = async () => {
  const nome = document.getElementById("nomeJogador").value;
  if (!nome) return;

  await db.collection("peladas")
    .doc(peladaAtualId)
    .collection("jogadores")
    .add({ nome });

  document.getElementById("nomeJogador").value = "";
  carregarJogadores();
};

// ⚽ TIMES
window.gerarTimes = async () => {
  const snap = await db.collection("peladas")
    .doc(peladaAtualId)
    .collection("jogadores")
    .get();

  let jogadores = snap.docs.map(d => d.data().nome);
  jogadores.sort(() => Math.random() - 0.5);

  const meio = Math.ceil(jogadores.length / 2);
  ultimoTimeA = jogadores.slice(0, meio);
  ultimoTimeB = jogadores.slice(meio);

  document.getElementById("timesSection").innerHTML = `
    <div class="card"><strong>Time A:</strong><br>${ultimoTimeA.join(", ")}</div>
    <div class="card"><strong>Time B:</strong><br>${ultimoTimeB.join(", ")}</div>
  `;

  document.getElementById("placarSection").style.display = "block";
};

// 🧾 PARTIDAS
window.salvarPartida = async () => {
  const golsA = Number(document.getElementById("golsA").value);
  const golsB = Number(document.getElementById("golsB").value);

  if (isNaN(golsA) || isNaN(golsB)) return;

  await db.collection("peladas")
    .doc(peladaAtualId)
    .collection("partidas")
    .add({
      timeA: ultimoTimeA,
      timeB: ultimoTimeB,
      golsA,
      golsB,
      data: firebase.firestore.FieldValue.serverTimestamp()
    });

  document.getElementById("golsA").value = "";
  document.getElementById("golsB").value = "";

  carregarHistorico();
};

async function carregarHistorico() {
  const lista = document.getElementById("listaPartidas");
  lista.innerHTML = "";

  const snap = await db.collection("peladas")
    .doc(peladaAtualId)
    .collection("partidas")
    .orderBy("data", "desc")
    .get();

  snap.forEach(doc => {
    const p = doc.data();
    lista.innerHTML += `
      <div class="card">
        <strong>${p.golsA} x ${p.golsB}</strong><br>
        ${p.timeA.join(", ")} vs ${p.timeB.join(", ")}
      </div>
    `;
  });
}
