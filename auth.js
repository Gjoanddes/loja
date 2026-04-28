import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBrKgBrZbhZu2UlobzZTKzGk4TVUV-s4gI",
  authDomain: "loja-d15ae.firebaseapp.com",
  projectId: "loja-d15ae",
  storageBucket: "loja-d15ae.firebasestorage.app",
  messagingSenderId: "328906035910",
  appId: "1:328906035910:web:7df2c409744e45c021bdc7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export async function cadastrarUsuario(nome, email, senha) {
  const credencial = await createUserWithEmailAndPassword(auth, email, senha);
  const uid = credencial.user.uid;
  await setDoc(doc(db, "usuarios", uid), {
    uid, nome, email, role: "usuario", criadoEm: new Date()
  });
  return credencial.user;
}

export async function login(email, senha) {
  const credencial = await signInWithEmailAndPassword(auth, email, senha);
  return credencial.user;
}

export async function logout() {
  await signOut(auth);
  window.location.href = '/loja/login.html';
}

export async function verificarAdmin(uid) {
  const docSnap = await getDoc(doc(db, "usuarios", uid));
  if (docSnap.exists()) return docSnap.data().role === "admin";
  return false;
}

export function observarLogin(callback) {
  onAuthStateChanged(auth, async (usuario) => {
    if (usuario) {
      const ehAdmin = await verificarAdmin(usuario.uid);
      callback(usuario, ehAdmin);
    } else {
      callback(null, false);
    }
  });
}

export function protegerPaginaAdmin() {
  onAuthStateChanged(auth, async (usuario) => {
    if (!usuario) {
      window.location.href = '/loja/login.html';
      return;
    }
    const ehAdmin = await verificarAdmin(usuario.uid);
    if (!ehAdmin) {
      alert("Acesso negado.");
      window.location.href = '/loja/index.html';
    }
  });
}
