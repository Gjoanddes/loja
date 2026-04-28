import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyB3MpR1Sds97eGuleLU5C7qHCUWjpPuva8",
  authDomain: "loja-d15ae.firebaseapp.com",
  projectId: "loja-d15ae",
  storageBucket: "loja-d15ae.firebasestorage.app",
  messagingSenderId: "328906035910",
  appId: "1:328906035910:web:7df2c409744e45c021bdc7"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);