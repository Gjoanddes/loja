import { db } from "./firebase-config.js";
import {
  collection, addDoc, updateDoc,
  doc, getDocs, getDoc, query, where, orderBy
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

export async function getProdutos(filtros = {}) {
  try {
    let q = query(collection(db, "produtos"), where("ativo", "==", true));
    if (filtros.categoria) q = query(q, where("categoria", "==", filtros.categoria));
    if (filtros.subcategoria) q = query(q, where("subcategoria", "==", filtros.subcategoria));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) { console.error(e); return []; }
}

export async function getProdutosDestaque() {
  try {
    const q = query(collection(db, "produtos"), where("ativo", "==", true), where("destaque", "==", true));
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

export async function adicionarProduto(produto, arquivosImagem) {
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
    const q = query(collection(db, "pedidos"), where("usuarioId", "==", usuarioId), orderBy("criadoEm", "desc"));
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
