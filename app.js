// ===== FIREBASE CONFIG =====
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

// ===== DOM =====
const loginSection = document.getElementById("loginSection");
const peladasSection = document.getElementById("peladasSection");
const peladaSection = document.getElementById("peladaSection");
const listaPeladas = document.getElementById("listaPeladas");
const listaJogadores = document.getElementById("listaJogadores");
const peladaTitulo = document.getElementById("peladaTitulo");

// ===== STATE =====
let usuarioAtual = null;
let peladaAtualId = null;

// ===== AUTH =====
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

// ===== LOGIN =====
window.login = async function () {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  try {
    await auth.signInWithEmailAndPassword(email, senha);
  } catch {
    await auth.createUserWithEmailAndPassword(email, senha);
  }
};

window.logout = () => auth.signOut();

// ===== PELADAS =====
function carregarPeladas() {
  db.collection("peladas")
    .where("ownerId", "==", usuarioAtual.uid)
    .orderBy("createdAt", "desc")
    .onSnapshot(snapshot => {
      listaPeladas.innerHTML = "";
      snapshot.forEach(doc => {
        const d = doc.data();
        listaPeladas.innerHTML += `
          <div class="card">
            <strong>${d.nome}</strong>
            <button onclick="entrarPelada('${doc.id}','${d.nome}')">Entrar</button>
          </div>`;
      });
    });
}

window.criarPelada = async () => {
  const nome = novaPelada.value;
  await db.collection("peladas").add({
    nome,
    ownerId: usuarioAtual.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  novaPelada.value = "";
};

// ===== ENTRAR =====
window.entrarPelada = (id, nome) => {
  peladaAtualId = id;
  peladaTitulo.innerText = nome;
  peladasSection.classList.add("hidden");
  peladaSection.classList.remove("hidden");
  carregarJogadores();
};

window.voltarPeladas = () => {
  peladaSection.classList.add("hidden");
  peladasSection.classList.remove("hidden");
};

// ===== JOGADORES =====
function carregarJogadores() {
  db.collection("peladas")
    .doc(peladaAtualId)
    .collection("jogadores")
    .orderBy("nome")
    .onSnapshot(snapshot => {
      listaJogadores.innerHTML = "";
      snapshot.forEach(doc => {
        const j = doc.data();
        listaJogadores.innerHTML += `
          <div class="card ${j.confirmado ? "confirmado" : ""}">
            <strong>${j.nome}</strong>
            <button onclick="togglePresenca('${doc.id}', ${j.confirmado})">
              ${j.confirmado ? "Confirmado" : "Confirmar"}
            </button>
          </div>`;
      });
    });
}

window.criarJogador = async () => {
  const nome = novoJogador.value;
  await db.collection("peladas")
    .doc(peladaAtualId)
    .collection("jogadores")
    .add({
      nome,
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
