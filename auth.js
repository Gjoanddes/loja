import { db, auth } from "./firebase-config.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

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
  window.location.href = "/login.html";
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
    if (!usuario) { window.location.href = "/login.html"; return; }
    const ehAdmin = await verificarAdmin(usuario.uid);
    if (!ehAdmin) { alert("Acesso negado."); window.location.href = "/index.html"; }
  });
}
