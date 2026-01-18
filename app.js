console.log("app.js carregado");

// 🔥 Firebase
firebase.initializeApp({
  apiKey: "AIzaSyAK-Mj7fDwCUh9aer3z8swN7hUNIi2FK4E",
  authDomain: "ousadia-alegria-3269f.firebaseapp.com",
  projectId: "ousadia-alegria-3269f"
});

const auth = firebase.auth();
const db = firebase.firestore();

// 🔐 AUTH
auth.onAuthStateChanged(user => {
  loginSection.classList.toggle("hidden", !!user);
  appSection.classList.toggle("hidden", !user);
  if (user) carregarPeladas();
});

function login() {
  const email = email.value;
  const senha = senha.value;

  auth.signInWithEmailAndPassword(email, senha)
    .catch(() => auth.createUserWithEmailAndPassword(email, senha));
}

function logout() {
  auth.signOut();
}

// 📦 VARIÁVEIS
let peladaAtualId = null;
let jogadores = [];
let times = { A: [], B: [] };

// ⚽ PELADAS
function criarPelada() {
  db.collection("peladas").add({
    nome: nomePelada.value,
    owner: auth.currentUser.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(carregarPeladas);
}

function carregarPeladas() {
  listaPeladas.innerHTML = "";
  db.collection("peladas")
    .where("owner", "==", auth.currentUser.uid)
    .orderBy("createdAt", "desc")
    .get()
    .then(snap => {
      snap.forEach(doc => {
        const li = document.createElement("li");
        li.innerHTML = `<button class="underline">${doc.data().nome}</button>`;
        li.onclick = () => abrirPelada(doc.id, doc.data().nome);
        listaPeladas.appendChild(li);
      });
    });
}

function abrirPelada(id, nome) {
  peladaAtualId = id;
  jogadores = [];
  peladaSection.classList.remove("hidden");
  tituloPelada.innerText = nome;
  carregarJogadores();
}

// 👤 JOGADORES
function adicionarJogador() {
  db.collection("peladas").doc(peladaAtualId)
    .collection("jogadores")
    .add({ nome: nomeJogador.value })
    .then(carregarJogadores);
}

function carregarJogadores() {
  listaJogadores.innerHTML = "";
  jogadores = [];

  db.collection("peladas").doc(peladaAtualId)
    .collection("jogadores")
    .get()
    .then(snap => {
      snap.forEach(doc => {
        jogadores.push(doc.data().nome);
        const li = document.createElement("li");
        li.innerText = doc.data().nome;
        listaJogadores.appendChild(li);
      });
    });
}

// 🔀 TIMES
function gerarTimes() {
  times = { A: [], B: [] };
  jogadores.forEach((j, i) => {
    times[i % 2 === 0 ? "A" : "B"].push(j);
  });

  timesGerados.innerHTML = `
    <strong>Time A:</strong> ${times.A.join(", ")}<br>
    <strong>Time B:</strong> ${times.B.join(", ")}<br>
    <input id="placarA" class="border p-1 w-16" placeholder="A">
    <input id="placarB" class="border p-1 w-16" placeholder="B">
  `;
}

// 💾 PARTIDA
function salvarPartida() {
  db.collection("peladas").doc(peladaAtualId)
    .collection("partidas")
    .add({
      timeA: times.A,
      timeB: times.B,
      placarA: Number(placarA.value),
      placarB: Number(placarB.value),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// 📊 ESTATÍSTICAS
function carregarEstatisticas() {
  const stats = {};

  function init(nome) {
    if (!stats[nome]) {
      stats[nome] = {
        partidas: 0,
        vitorias: 0,
        derrotas: 0,
        empates: 0,
        golsPro: 0,
        golsContra: 0
      };
    }
  }

  db.collection("peladas").doc(peladaAtualId)
    .collection("partidas")
    .get()
    .then(snap => {
      snap.forEach(doc => {
        const p = doc.data();
        p.timeA.forEach(j => init(j));
        p.timeB.forEach(j => init(j));

        p.timeA.forEach(j => {
          stats[j].partidas++;
          stats[j].golsPro += p.placarA;
          stats[j].golsContra += p.placarB;
          p.placarA > p.placarB ? stats[j].vitorias++ :
          p.placarA < p.placarB ? stats[j].derrotas++ :
          stats[j].empates++;
        });

        p.timeB.forEach(j => {
          stats[j].partidas++;
          stats[j].golsPro += p.placarB;
          stats[j].golsContra += p.placarA;
          p.placarB > p.placarA ? stats[j].vitorias++ :
          p.placarB < p.placarA ? stats[j].derrotas++ :
          stats[j].empates++;
        });
      });

      estatisticas.innerHTML = "";
      Object.entries(stats).forEach(([nome, s]) => {
        const aproveitamento = s.partidas
          ? Math.round((s.vitorias / s.partidas) * 100)
          : 0;

        estatisticas.innerHTML += `
          <div class="border p-2 mb-2">
            <strong>${nome}</strong><br>
            Partidas: ${s.partidas} |
            Vitórias: ${s.vitorias} |
            Empates: ${s.empates} |
            Derrotas: ${s.derrotas}<br>
            Gols Pró: ${s.golsPro} |
            Gols Contra: ${s.golsContra}<br>
            Aproveitamento: ${aproveitamento}%
          </div>
        `;
      });
    });
}

function voltarPeladas() {
  peladaSection.classList.add("hidden");
}
