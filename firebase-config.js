import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";

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
