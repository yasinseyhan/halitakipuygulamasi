// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // <-- Yeni eklenen satır
import { getFirestore } from "firebase/firestore"; // <-- Yeni eklenen satır
// import { getAnalytics } from "firebase/analytics"; // Analytics kullanmayacaksanız yorum satırı yapın veya silin

// Firebase yapılandırma objeniz
const firebaseConfig = {
  apiKey: "AIzaSyCidTYhsUw-3FUx-NSE9TDLmvkRNXOfEgI",
  authDomain: "hali-takip-uygulamasi.firebaseapp.com",
  projectId: "hali-takip-uygulamasi",
  storageBucket: "hali-takip-uygulamasi.firebasestorage.app",
  messagingSenderId: "435583656029",
  appId: "1:435583656029:web:7d634359138580dc846db4",
  measurementId: "G-NSE82QFD6J", // Analytics kullanmayacaksanız bu satırı silebilirsiniz
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Firebase servislerini al ve dışa aktar
export const auth = getAuth(app); // <-- Yeni eklenen satır
export const firestore = getFirestore(app); // <-- Yeni eklenen satır

// Analytics kullanacaksanız bu satırı aktif bırakın
// const analytics = getAnalytics(app);

// Sadece 'app' objesini değil, 'auth' ve 'firestore' servislerini de dışa aktardığımız için
// bu dosyadan doğrudan kullanabiliriz.
export default app; // app objesini de dışa aktarmak iyi bir pratiktir, ancak zorunlu değil.
