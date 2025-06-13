// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBoONZiTxujDBLV0CJs8fMpAql_Wv8yKCg",
  authDomain: "reactdevops-9aa89.firebaseapp.com",
  projectId: "reactdevops-9aa89",
  storageBucket: "reactdevops-9aa89.appspot.com",
  messagingSenderId: "508458640718",
  appId: "1:508458640718:web:27871504462060526a2a1f",
  measurementId: "G-24TVK340B9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
