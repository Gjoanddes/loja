import { db } from "./firebase-config.js";
import {
  collection, addDoc, updateDoc, increment,
  doc, getDocs, getDoc, query, where, orderBy
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// ── Tracking ──────────────────────────────────────────────────────────────────
export async function registrarVisualizacao(produtoId) {
  try {
    await updateDoc(doc(db, "produtos", produtoId), {
      views: increment(1)
    });
  } catch (e) { console.warn("tracking view:", e); }
}

export async function registrarIntencaoCompra(produtoId) {
  try {
    await updateDoc(doc(db, "produtos", produtoId), {
      addToCart: increment(1)
    });
  } catch (e) { console.warn("tracking cart:", e); }
}

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

export async function adicionarProduto(produto, arquivosImagem) {
  try {
    const docRef = await addDoc(collection(db, "produtos"), {
      ...produto, ativo: true,
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

export async function atualizarEstoque(produtoId, tamanho, delta) {
  // delta: -1 para diminuir, +1 para aumentar
  try {
    const campo = `estoque.${tamanho}`;
    await updateDoc(doc(db, "produtos", produtoId), {
      [campo]: increment(delta),
      atualizadoEm: new Date()
    });
  } catch (e) { console.error(e); throw e; }
}

export async function verificarEstoque(produtoId, tamanho, quantidade) {
  try {
    const snap = await getDoc(doc(db, "produtos", produtoId));
    if (!snap.exists()) return false;
    const estoque = snap.data().estoque || {};
    // Se não tem estoque configurado, considera disponível (retrocompatibilidade)
    if (Object.keys(estoque).length === 0) return true;
    return (estoque[tamanho] || 0) >= quantidade;
  } catch (e) { return true; }
}
  try {
    await updateDoc(doc(db, "produtos", id), { ativo: false, atualizadoEm: new Date() });
  } catch (e) { console.error(e); throw e; }
}

export async function criarPedido(usuarioId, itens, enderecoEntrega, totalFinal, cupom) {
  try {
    const subtotal = itens.reduce((a, i) => a + (i.preco * i.quantidade), 0);
    const total = totalFinal !== undefined ? totalFinal : subtotal;
    const docRef = await addDoc(collection(db, "pedidos"), {
      usuarioId, itens, total, subtotal,
      cupom: cupom || null,
      endereco: enderecoEntrega,
      status: "pendente", criadoEm: new Date()
    });
    // Dá baixa no estoque de cada item
    for (const item of itens) {
      if (item.produtoId && item.tamanho) {
        const campo = `estoque.${item.tamanho}`;
        try {
          await updateDoc(doc(db, "produtos", item.produtoId), {
            [campo]: increment(-item.quantidade)
          });
        } catch(e) { console.warn('estoque:', e); }
      }
    }
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

export async function getCupons() {
  try {
    const snapshot = await getDocs(collection(db, "cupons"));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) { console.error(e); return []; }
}

export async function validarCupom(codigo) {
  try {
    const q = query(collection(db, "cupons"), where("codigo", "==", codigo.toUpperCase()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return { valido: false, erro: "Cupom não encontrado." };
    const cupom = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    if (!cupom.ativo) return { valido: false, erro: "Cupom inativo." };
    if (cupom.usos >= cupom.limite) return { valido: false, erro: "Cupom esgotado." };
    const agora = new Date();
    if (cupom.validade && cupom.validade.toDate && cupom.validade.toDate() < agora)
      return { valido: false, erro: "Cupom expirado." };
    return { valido: true, cupom };
  } catch (e) { return { valido: false, erro: "Erro ao validar cupom." }; }
}

export async function usarCupom(cupomId) {
  try {
    await updateDoc(doc(db, "cupons", cupomId), { usos: increment(1) });
  } catch (e) { console.error(e); }
}

export async function criarCupom(dados) {
  try {
    const docRef = await addDoc(collection(db, "cupons"), {
      ...dados,
      codigo: dados.codigo.toUpperCase(),
      usos: 0, ativo: true, criadoEm: new Date()
    });
    return docRef.id;
  } catch (e) { console.error(e); throw e; }
}

export async function atualizarCupom(id, dados) {
  try {
    await updateDoc(doc(db, "cupons", id), dados);
  } catch (e) { console.error(e); throw e; }
}
