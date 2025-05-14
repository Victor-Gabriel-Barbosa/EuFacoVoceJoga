import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdBAIQtvoVBAn7vyCSrBnQsyz93w09GRY",
  authDomain: "eufacovcjoga.firebaseapp.com",
  projectId: "eufacovcjoga",
  storageBucket: "eufacovcjoga.appspot.com",
  messagingSenderId: "275681503197",
  appId: "1:275681503197:web:e3d4dbe26803b45d0ff834",
  measurementId: "G-WPLF4G1GFB"
};

// Inicializa o app do Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };