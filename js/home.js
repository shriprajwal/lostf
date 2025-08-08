import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
  
const firebaseConfig = {
    apiKey: "AIzaSyDx_N4uA4Va8mS6cpBqkSDld_HH3qqIFxQ",
    authDomain: "lostfusion-b795e.firebaseapp.com",
    projectId: "lostfusion-b795e",
    storageBucket: "lostfusion-b795e.firebasestorage.app",
    messagingSenderId: "378810950057",
    appId: "1:378810950057:web:174ec8f1ee096de3aae4b8"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const user = auth.currentUser;

  onAuthStateChanged(auth, (user) => {
  if (user) {
    const name = user.displayName || user.email || "User";
    document.getElementById("userName").textContent = name.split('@')[0];
  } else {
    document.getElementById("userName").textContent = "Guest";
  }
});

const Logoutbutton=document.getElementById("logout");
Logoutbutton.addEventListener("click", function() {
  auth.signOut().then(() => {
    window.location.href = "index.html"; // Redirect to home page after logout
  }).catch((error) => {
    console.error("Error signing out: ", error);
  });
});