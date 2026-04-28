// ============================================
// db-structure.js
// Estrutura do banco e funções de produto
// ============================================

import { db, storage } from "./firebase-config.js";
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, getDocs, getDoc, query, where, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// ============================================
// ESTRUTURA DO BANCO (para referência)
// ============================================
//
// 📦 Coleção: produtos
// {
//   id: (gerado pelo Firebase),
//   nome: "Camiseta Tie-Dye",
//   descricao: "Camiseta oversized estampada",
//   preco: 89.90,
//   precoPromocional: 69.90,       // opcional
//   categoria: "roupas" | "acessorios",
//   subcategoria: "camisetas" | "calcas" | "vestidos" | "bones" | "bolsas" | etc,
//   tamanhos: ["P", "M", "G", "GG"],
//   cores: ["preto", "branco", "rosa"],
//   estoque: { "P": 5, "M": 10, "G": 3, "GG": 0 },
//   imagens: ["url1", "url2"],     // URLs do Firebase Storage
//   destaque: true | false,        // aparece na home
//   ativo: true | false,           // visível na loja
//   criadoEm: timestamp,
//   atualizadoEm: timestamp
// }
//
// 👤 Coleção: usuarios
// {
//   uid: (mesmo do Firebase Auth),
//   nome: "João Silva",
//   email: "joao@email.com",
//   role: "admin" | "usuario",
//   endereco: { rua, numero, bairro, cidade, estado, cep },
//   criadoEm: timestamp
// }
//
// 🛒 Coleção: pedidos
// {
//   id: (gerado pelo Firebase),
//   usuarioId: "uid do comprador",
//   itens: [ { produtoId, nome, tamanho, cor, quantidade, preco } ],
//   total: 250.00,
//   status: "pendente" | "pago" | "enviado" | "entregue" | "cancelado",
//   endereco: { rua, numero, bairro, cidade, estado, cep },
//   criadoEm: timestamp
// }

// ============================================
// FUNÇÕES DE PRODUTO
// ============================================

// Busca todos os produtos ativos
export async function getProdutos(filtros = {}) {
  try {
    let q = query(collection(db, "produtos"), where("ativo", "==", true));

    if (filtros.categoria) {
      q = query(q, where("categoria", "==", filtros.categoria));
    }
    if (filtros.subcategoria) {
      q = query(q, where("subcategoria", "==", filtros.subcategoria));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
}

// Busca produtos em destaque (para a home)
export async function getProdutosDestaque() {
  try {
    const q = query(
      collection(db, "produtos"),
      where("ativo", "==", true),
      where("destaque", "==", true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erro ao buscar destaques:", error);
    return [];
  }
}

// Busca um produto pelo ID
export async function getProdutoPorId(id) {
  try {
    const docRef = doc(db, "produtos", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return null;
  }
}

// Adiciona um novo produto (só admin)
export async function adicionarProduto(produto, arquivosImagem) {
  try {
    // Faz upload das imagens primeiro
    const urlsImagens = [];
    for (const arquivo of arquivosImagem) {
      const storageRef = ref(storage, `produtos/${Date.now()}_${arquivo.name}`);
      await uploadBytes(storageRef, arquivo);
      const url = await getDownloadURL(storageRef);
      urlsImagens.push(url);
    }

    // Salva o produto no banco
    const docRef = await addDoc(collection(db, "produtos"), {
      ...produto,
      imagens: urlsImagens,
      ativo: true,
      criadoEm: new Date(),
      atualizadoEm: new Date()
    });

    console.log("Produto adicionado com ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
    throw error;
  }
}

// Atualiza um produto existente (só admin)
export async function atualizarProduto(id, dados) {
  try {
    const docRef = doc(db, "produtos", id);
    await updateDoc(docRef, {
      ...dados,
      atualizadoEm: new Date()
    });
    console.log("Produto atualizado!");
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    throw error;
  }
}

// Remove (desativa) um produto — nunca apaga de verdade
export async function removerProduto(id) {
  try {
    const docRef = doc(db, "produtos", id);
    await updateDoc(docRef, { ativo: false, atualizadoEm: new Date() });
    console.log("Produto desativado!");
  } catch (error) {
    console.error("Erro ao remover produto:", error);
    throw error;
  }
}

// ============================================
// FUNÇÕES DE PEDIDO
// ============================================

export async function criarPedido(usuarioId, itens, enderecoEntrega) {
  try {
    const total = itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    const docRef = await addDoc(collection(db, "pedidos"), {
      usuarioId,
      itens,
      total,
      endereco: enderecoEntrega,
      status: "pendente",
      criadoEm: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    throw error;
  }
}

export async function getPedidosDoUsuario(usuarioId) {
  try {
    const q = query(
      collection(db, "pedidos"),
      where("usuarioId", "==", usuarioId),
      orderBy("criadoEm", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return [];
  }
}
