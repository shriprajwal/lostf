import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDx_N4uA4Va8mS6cpBqkSDld_HH3qqIFxQ",
  authDomain: "lostfusion-b795e.firebaseapp.com",
  projectId: "lostfusion-b795e",
  storageBucket: "lostfusion-b795e.appspot.com",
  messagingSenderId: "378810950057",
  appId: "1:378810950057:web:174ec8f1ee096de3aae4b8",
};

// ✅ Avoid reinitializing Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

document.getElementById("google-login").addEventListener("click", async (e) => {
  e.preventDefault();
  console.log("Google login clicked ✅");

  try {
    // Step 1️⃣ — Open Google popup
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Google sign-in success ✅:", user.email);

    // Step 2️⃣ — Check if this email already has a password account
    const methods = await fetchSignInMethodsForEmail(auth, user.email);

    if (methods.includes("password")) {
      alert("This email is registered with Email/Password. Please log in using your password.");
      await auth.signOut();
      return;
    }

    // Step 3️⃣ — Check if Firestore user document exists
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      console.log("User found in Firestore ✅ Redirecting to dashboard...");
      window.location.href = "loggedin.html";
    } else {
      console.log("User not found ❌ Redirecting to signup...");
      alert("Please complete your signup to continue.");
      window.location.href = "signup.html";
    }
  } catch (error) {
    console.error("Google login error ❌:", error);
    alert("Login failed: " + error.message);
  }
});
