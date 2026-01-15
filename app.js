console.log("app.js carregado");

// LOGIN
window.login = function () {
  console.log("login clicado");

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  auth.signInWithEmailAndPassword(email, senha)
    .catch(() => auth.createUserWithEmailAndPassword(email, senha));
};

// LOGOUT
window.logout = function () {
  auth.signOut();
};

// AUTH STATE
auth.onAuthStateChanged(user => {
  if (user) {
    loginSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    listarPeladas();
  } else {
    loginSection.classList.remove("hidden");
    appSection.classList.add("hidden");
  }
});

// CRIAR PELADA
window.criarPelada = function () {
  if (!auth.currentUser) return;

  const data = document.getElementById("dataPelada").value;

  db.collection("peladas").add({
    data,
    ownerId: auth.currentUser.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(listarPeladas);
};

// LISTAR PELADAS
function listarPeladas() {
  const lista = document.getElementById("listaPeladas");
  lista.innerHTML = "Carregando...";

  db.collection("peladas")
    .where("ownerId", "==", auth.currentUser.uid)
    .orderBy("createdAt", "desc")
    .get()
    .then(snapshot => {
      lista.innerHTML = "";
      snapshot.forEach(doc => {
        const li = document.createElement("li");
        li.textContent = "Pelada em " + doc.data().data;
        lista.appendChild(li);
      });
    });
}
