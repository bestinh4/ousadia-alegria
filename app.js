import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 CONFIG FIREBASE
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_DOMINIO",
  projectId: "SEU_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// LOGIN
window.login = async () => {
  await signInWithEmailAndPassword(
    auth,
    email.value,
    senha.value
  );
};

window.logout = () => signOut(auth);

// AUTH STATE
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  authDiv.style.display = "none";
  appDiv.style.display = "block";

  const userRef = doc(db, "usuarios", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      role: user.email === "diiogo49@gmail.com" ? "admin" : "player",
      createdAt: new Date()
    });
  }

  const role = (await getDoc(userRef)).data().role;

  userInfo.innerText = `${user.email} (${role})`;
  if (role === "admin") adminPanel.style.display = "block";
});

// SALVAR PELADA
window.salvarPelada = async () => {
  await setDoc(doc(db, "pelada", "atual"), {
    data: dataPelada.value,
    local: localPelada.value,
    updatedAt: new Date()
  });
  alert("Pelada salva");
};

// PRESENÇA
window.confirmarPresenca = async (presente) => {
  const user = auth.currentUser;
  await setDoc(
    doc(db, "pelada", "atual", "jogadores", user.uid),
    { nome: user.email, presente },
    { merge: true }
  );
  alert("Presença atualizada");
};

// PROMOVER ADM
window.promoverAdmin = async () => {
  const emailAlvo = emailNovoAdmin.value;
  const usersRef = doc(db, "usuarios");

  alert("Defina o role manualmente no Firestore pelo email (segurança).");
};
