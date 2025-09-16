
  import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
  import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
  import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyDx_N4uA4Va8mS6cpBqkSDld_HH3qqIFxQ",
    authDomain: "lostfusion-b795e.firebaseapp.com",
    projectId: "lostfusion-b795e",
    storageBucket: "lostfusion-b795e.appspot.com", // ✅ fixed
    messagingSenderId: "378810950057",
    appId: "1:378810950057:web:174ec8f1ee096de3aae4b8"
  };

  // ✅ Prevent duplicate app initialization
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

  const auth = getAuth(app);
  const db = getFirestore(app);
  const provider = new GoogleAuthProvider();

  document.getElementById("google-login").addEventListener("click", async (e) => {
    e.preventDefault();
    console.log("Login button clicked ✅");

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Google sign-in success ✅:", user.email, user.uid);

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        console.log("Firestore doc found ✅ redirecting...");
        window.location.href = "loggedin.html";
      } else {
        console.log("Firestore doc not found ❌ redirecting to signup...");
        alert("Please complete signup!");
        window.location.href = "signup.html";
      }
    } catch (err) {
      console.error("Login error ❌:", err);
      alert("Error: " + err.message);
    }
  });

