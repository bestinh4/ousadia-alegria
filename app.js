// FIREBASE CONFIG
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

// DOM
const loginSection = document.getElementById("loginSection");
const peladasSection = document.getElementById("peladasSection");
const peladaSection = document.getElementById("peladaSection");
const listaPeladas = document.getElementById("listaPeladas");
const listaJogadores = document.getElementById("listaJogadores");
const peladaTitulo = document.getElementById("peladaTitulo");
const timesDiv = document.getElementById("times");

// STATE
let usuarioAtual = null;
let peladaAtualId = null;
let jogadoresConfirmados = [];

// AUTH
auth.onAuthStateChanged(user => {
  if (user) {
    usuarioAtual = user;
    loginSection.classList.add("hidden");
    peladasSection.classList.remove("hidden");
    carregarPeladas();
  } else {
    loginSection.classList.remove("hidden");
    peladasSection.classList.add("hidden");
    peladaSection.classList.add("hidden");
  }
});

// LOGIN
window.login = async () => {
  try {
    await auth.signInWithEmailAndPassword(email.value, senha.value);
  } catch {
    await auth.createUserWithEmailAndPassword(email.value, senha.value);
  }
};

window.logout = () => auth.signOut();

// PELADAS
function carregarPeladas() {
  db.collection("peladas")
    .where("ownerId", "==", usuarioAtual.uid)
    .orderBy("createdAt", "desc")
    .onSnapshot(snapshot => {
      listaPeladas.innerHTML = "";
      snapshot.forEach(doc => {
        const p = doc.data();
        listaPeladas.innerHTML += `
          <div class="card">
            <strong>${p.nome}</strong>
            <button onclick="entrarPelada('${doc.id}','${p.nome}')">Entrar</button>
          </div>`;
      });
    });
}

window.criarPelada = async () => {
  await db.collection("peladas").add({
    nome: novaPelada.value,
    ownerId: usuarioAtual.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  novaPelada.value = "";
};

// ENTRAR
window.entrarPelada = (id, nome) => {
  peladaAtualId = id;
  peladaTitulo.innerText = nome;
  peladasSection.classList.add("hidden");
  peladaSection.classList.remove("hidden");
  timesDiv.innerHTML = "";
  carregarJogadores();
};

window.voltarPeladas = () => {
  peladaSection.classList.add("hidden");
  peladasSection.classList.remove("hidden");
};

// JOGADORES
function carregarJogadores() {
  db.collection("peladas")
    .doc(peladaAtualId)
    .collection("jogadores")
    .orderBy("nome")
    .onSnapshot(snapshot => {
      listaJogadores.innerHTML = "";
      jogadoresConfirmados = [];

      snapshot.forEach(doc => {
        const j = doc.data();
        if (j.confirmado) jogadoresConfirmados.push(j.nome);

        listaJogadores.innerHTML += `
          <div class="card ${j.confirmado ? "presente" : "ausente"}">
            <strong>${j.nome}</strong>
            <button onclick="togglePresenca('${doc.id}', ${j.confirmado})">
              ${j.confirmado ? "Presente" : "Ausente"}
            </button>
          </div>`;
      });
    });
}

window.criarJogador = async () => {
  await db.collection("peladas")
    .doc(peladaAtualId)
    .collection("jogadores")
    .add({
      nome: novoJogador.value,
      confirmado: true,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  novoJogador.value = "";
};

window.togglePresenca = async (id, atual) => {
  await db.collection("peladas")
    .doc(peladaAtualId)
    .collection("jogadores")
    .doc(id)
    .update({ confirmado: !atual });
};

// TIMES
window.gerarTimes = () => {
  if (jogadoresConfirmados.length < 2) {
    alert("Poucos jogadores confirmados");
    return;
  }

  const embaralhado = [...jogadoresConfirmados].sort(() => Math.random() - 0.5);
  const meio = Math.ceil(embaralhado.length / 2);

  const timeA = embaralhado.slice(0, meio);
  const timeB = embaralhado.slice(meio);

  timesDiv.innerHTML = `
    <div class="card time">
      <h3>Time A</h3>
      ${timeA.map(j => `<div>${j}</div>`).join("")}
    </div>
    <div class="card time">
      <h3>Time B</h3>
      ${timeB.map(j => `<div>${j}</div>`).join("")}
    </div>
  `;
};
