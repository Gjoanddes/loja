// ══════════════════════════════════════════════════════
// app.js — BeYou Loja
// firebase-config + auth + db-structure em um único arquivo
// ══════════════════════════════════════════════════════

import { initializeApp }  from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, updateDoc, setDoc,
  doc, getDocs, getDoc, query, where, orderBy
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";

// ── Firebase init ─────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyA-SNfY_hU9uRzApJTjI3RzNnr_ZDLoBfM",
  authDomain: "beyou-loja.firebaseapp.com",
  projectId: "beyou-loja",
  storageBucket: "beyou-loja.firebasestorage.app",
  messagingSenderId: "597162179913",
  appId: "1:597162179913:web:33e52f9271b49bdd1eee98"
};
const app = initializeApp(firebaseConfig);

export const db      = getFirestore(app);
export const auth    = getAuth(app);
export const storage = getStorage(app);

// ── Auth ──────────────────────────────────────────────
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

// ── Produtos ──────────────────────────────────────────
export async function getProdutos(filtros = {}) {
  try {
    let q = query(collection(db, "produtos"), where("ativo", "==", true));
    if (filtros.categoria)    q = query(q, where("categoria",    "==", filtros.categoria));
    if (filtros.subcategoria) q = query(q, where("subcategoria", "==", filtros.subcategoria));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) { console.error(e); return []; }
}

export async function getProdutosDestaque() {
  try {
    const q = query(collection(db, "produtos"),
      where("ativo", "==", true), where("destaque", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) { console.error(e); return []; }
}

export async function getProdutoPorId(id) {
  try {
    const docSnap = await getDoc(doc(db, "produtos", id));
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
    return null;
  } catch (e) { console.error(e); return null; }
}

export async function adicionarProduto(produto) {
  try {
    const docRef = await addDoc(collection(db, "produtos"), {
      ...produto, imagens: [], ativo: true,
      criadoEm: new Date(), atualizadoEm: new Date()
    });
    return docRef.id;
  } catch (e) { console.error(e); throw e; }
}

export async function atualizarProduto(id, dados) {
  try {
    await updateDoc(doc(db, "produtos", id), { ...dados, atualizadoEm: new Date() });
  } catch (e) { console.error(e); throw e; }
}

export async function removerProduto(id) {
  try {
    await updateDoc(doc(db, "produtos", id), { ativo: false, atualizadoEm: new Date() });
  } catch (e) { console.error(e); throw e; }
}

// ── Pedidos ───────────────────────────────────────────
export async function criarPedido(usuarioId, itens, enderecoEntrega) {
  try {
    const total = itens.reduce((a, i) => a + (i.preco * i.quantidade), 0);
    const docRef = await addDoc(collection(db, "pedidos"), {
      usuarioId, itens, total, endereco: enderecoEntrega,
      status: "pendente", criadoEm: new Date()
    });
    return docRef.id;
  } catch (e) { console.error(e); throw e; }
}

export async function getPedidosDoUsuario(usuarioId) {
  try {
    const q = query(collection(db, "pedidos"),
      where("usuarioId", "==", usuarioId), orderBy("criadoEm", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) { console.error(e); return []; }
}

export async function getPedidos() {
  try {
    const q = query(collection(db, "pedidos"), orderBy("criadoEm", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) { console.error(e); return []; }
}

export async function atualizarPedido(id, dados) {
  try {
    await updateDoc(doc(db, "pedidos", id), dados);
  } catch (e) { console.error(e); throw e; }
}
