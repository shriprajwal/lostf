import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDx_N4uA4Va8mS6cpBqkSDld_HH3qqIFxQ",
  authDomain: "lostfusion-b795e.firebaseapp.com",
  projectId: "lostfusion-b795e",
  storageBucket: "lostfusion-b795e.firebasestorage.app",
  messagingSenderId: "378810950057",
  appId: "1:378810950057:web:174ec8f1ee096de3aae4b8",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = "en";

const submit = document.getElementById("submit");

submit.addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);

    if (methods.length === 0) {
      alert("No account found with this email. Please create an account first.");
      window.location.href = "signup.html";
      return;
    }

    if (methods.includes("google.com")) {
      alert("This email is registered using Google. Please use Google Login instead.");
      return;
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in:", userCredential.user);
    window.location.href = "loggedin.html";
  } catch (error) {
    alert("Login failed: " + error.message);
  }
});
