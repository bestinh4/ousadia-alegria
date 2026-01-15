console.log("app.js carregado");

let userAtual = null;
let peladaAtualId = null;

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    userAtual = user;
    console.log("Usuário logado:", user.uid);
  }
});

// LOGIN
window.login = async function () {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    await firebase.auth().signInWithEmailAndPassword(email, senha);
  } catch {
    await firebase.auth().createUserWithEmailAndPassword(email, senha);
  }
};

// CRIAR PELADA
window.criarPelada = async function () {
  if (!userAtual) {
    alert("Usuário não logado");
    return;
  }

  const nome = prompt("Nome da pelada:");

  if (!nome) return;

  const docRef = await firebase.firestore().collection("peladas").add({
    nome,
    ownerId: userAtual.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  peladaAtualId = docRef.id;

  alert("Pelada criada com sucesso");
  console.log("Pelada ID:", peladaAtualId);
};

// CRIAR JOGADOR
window.criarJogador = async function () {
  if (!peladaAtualId) {
    alert("Crie ou selecione uma pelada primeiro");
    return;
  }

  const nome = document.getElementById("jogadorNome").value;

  if (!nome) {
    alert("Informe o nome do jogador");
    return;
  }

  await firebase
    .firestore()
    .collection("peladas")
    .doc(peladaAtualId)
    .collection("jogadores")
    .add({
      nome,
      confirmado: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

  document.getElementById("jogadorNome").value = "";
  listarJogadores();
};

// LISTAR JOGADORES
async function listarJogadores() {
  const lista = document.getElementById("listaJogadores");
  lista.innerHTML = "";

  const snapshot = await firebase
    .firestore()
    .collection("peladas")
    .doc(peladaAtualId)
    .collection("jogadores")
    .orderBy("createdAt")
    .get();

  snapshot.forEach((doc) => {
    const li = document.createElement("li");
    li.textContent = doc.data().nome;
    lista.appendChild(li);
  });
}
