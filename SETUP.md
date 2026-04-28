# 🚀 Guia de Configuração — Firebase

Siga esses passos **na ordem** antes de testar o projeto.

---

## Passo 1 — Criar o projeto no Firebase

1. Acesse https://console.firebase.google.com
2. Clique em **"Adicionar projeto"**
3. Dê um nome (ex: `minha-loja`)
4. Pode desativar o Google Analytics (não precisa por enquanto)
5. Clique em **"Criar projeto"**

---

## Passo 2 — Ativar o Firestore (banco de dados)

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Iniciar no modo de teste"** (por enquanto)
4. Escolha a região mais próxima (ex: `southamerica-east1` = São Paulo)
5. Clique em **"Ativar"**

---

## Passo 3 — Ativar o Authentication (login)

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Começar"**
3. Na aba **"Sign-in method"**, ative **"E-mail/senha"**
4. Clique em **"Salvar"**

---

## Passo 4 — Ativar o Storage (imagens)

1. No menu lateral, clique em **"Storage"**
2. Clique em **"Começar"**
3. Escolha **"Iniciar no modo de teste"**
4. Confirme a região e clique em **"Concluído"**

---

## Passo 5 — Pegar as credenciais do projeto

1. Clique na engrenagem ⚙️ → **"Configurações do projeto"**
2. Role até **"Seus apps"** e clique no ícone `</>`  (Web)
3. Dê um apelido pro app (ex: `loja-web`) e clique em **"Registrar app"**
4. Copie o objeto `firebaseConfig` que aparece
5. Cole no arquivo `firebase-config.js` substituindo os valores `"SUA_..."`:

```js
const firebaseConfig = {
  apiKey: "COLE_AQUI",
  authDomain: "COLE_AQUI",
  projectId: "COLE_AQUI",
  storageBucket: "COLE_AQUI",
  messagingSenderId: "COLE_AQUI",
  appId: "COLE_AQUI"
};
```

---

## Passo 6 — Criar o primeiro usuário admin

Depois de configurar, abra o console do navegador em qualquer página do projeto e rode:

```js
// Crie a conta admin manualmente uma vez só
import { cadastrarUsuario } from "./auth.js";
await cadastrarUsuario("Admin", "admin@sualoja.com", "suasenha123");
```

Depois vá no Firestore Console → `usuarios` → encontre o documento do admin →
mude o campo `role` de `"usuario"` para `"admin"`.

A partir daí, essa conta terá acesso ao painel `/admin.html`.

---

## Estrutura de arquivos

```
loja/
├── firebase-config.js   ← credenciais e inicialização
├── auth.js              ← login, cadastro, controle de acesso
├── db-structure.js      ← banco de dados e funções de produto
├── admin.html           ← painel do administrador
├── index.html           ← home (a criar)
├── login.html           ← página de login (a criar)
└── produto.html         ← página de produto individual (a criar)
```

---

## Próximos passos

- [ ] Criar `login.html`
- [ ] Criar `index.html` (vitrine com produtos)
- [ ] Criar `produto.html` (página de produto individual)
- [ ] Adicionar carrinho de compras
- [ ] Integrar pagamento (ex: Mercado Pago)
```
