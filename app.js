// ===== FIREBASE CONFIG =====
const firebaseConfig = {
  apiKey: "AIzaSyAK-Mj7fDwCUh9aer3z8swN7hUNIi2FK4E",
  authDomain: "ousadia-alegria-3269f.firebaseapp.com",
  projectId: "ousadia-alegria-3269f",
  storageBucket: "ousadia-alegria-3269f.firebasestorage.app",
  messagingSenderId: "695364420342",
  appId: "1:695364420342:web:aa130dfa6e019a271b22d7"
};

// ===== INIT =====
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
    usuarioAtual = null;
    loginSection.classList.remove("hidden");
    peladasSection.classList.add("hidden");
    peladaSection.classList.add("hidden");
  }
});

// ===== LOGIN =====
window.login = async function () {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  if (!email || !senha) {
    alert("Preencha email e senha");
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(email, senha);
  } catch {
    await auth.createUserWithEmailAndPassword(email, senha);
  }
};

// ===== LOGOUT =====
window.logout = function () {
  auth.signOut();
};

// ===== PELADAS =====
function carregarPeladas() {
  db.collection("peladas")
    .where("ownerId", "==", usuarioAtual.uid)
    .orderBy("createdAt", "desc")
    .onSnapshot(snapshot => {
      listaPeladas.innerHTML = "";

      snapshot.forEach(doc => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
          <strong>${doc.data().nome}</strong>
          <button onclick="entrarPelada('${doc.id}', '${doc.data().nome}')">
            Entrar
          </button>
        `;
        listaPeladas.appendChild(div);
      });
    });
}

window.criarPelada = async function () {
  const nome = document.getElementById("novaPelada").value;

  if (!nome) return alert("Informe o nome");

  await db.collection("peladas").add({
    nome,
    ownerId: usuarioAtual.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById("novaPelada").value = "";
};

// ===== ENTRAR NA PELADA =====
window.entrarPelada = function (id, nome) {
  peladaAtualId = id;
  peladaTitulo.innerText = nome;

  peladasSection.classList.add("hidden");
  peladaSection.classList.remove("hidden");

  carregarJogadores();
};

window.voltarPeladas = function () {
  peladaAtualId = null;
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
        const jogador = doc.data();
        const div = document.createElement("div");
        div.className = "card";
        div.innerText = jogador.nome;
        listaJogadores.appendChild(div);
      });
    });
}

window.criarJogador = async function () {
  const nome = document.getElementById("novoJogador").value;

  if (!nome) return alert("Informe o nome do jogador");

  await db.collection("peladas")
    .doc(peladaAtualId)
    .collection("jogadores")
    .add({
      nome,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

  document.getElementById("novoJogador").value = "";
};
