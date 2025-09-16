import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDx_N4uA4Va8mS6cpBqkSDld_HH3qqIFxQ",
    authDomain: "lostfusion-b795e.firebaseapp.com",
    projectId: "lostfusion-b795e",
    storageBucket: "lostfusion-b795e.firebasestorage.app",
    messagingSenderId: "378810950057",
    appId: "1:378810950057:web:174ec8f1ee096de3aae4b8"
  };

   const app = initializeApp(firebaseConfig);
   
   // Initialize Firebase Auth and Firestore
   
   const auth = getAuth(app);
   auth.languageCode = 'en';
   const db = getFirestore(app);
   const provider = new GoogleAuthProvider();
   let currentUserUID = null;
   let currentUserEmail = null;
   
      document.getElementById("google-signup").addEventListener("click", async(e) => {
      e.preventDefault();
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        currentUserUID = user.uid;
        currentUserEmail = user.email;

        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          // Already registered
          window.location.href = "loggedin.html";
        } else {
          // New user → show extra form
          document.getElementById("create-account").style.display = "block";
          document.getElementById("signup-box").style.display = "none";
        }

      } catch(err) {
        console.error(err);
        alert(err.message);
      }
    });

    document.getElementById("Create").addEventListener("click", async (event) => {
      event.preventDefault();
      const username = document.getElementById("gusername").value.trim();
      const collegeId = document.getElementById("gcollegeId").value.trim();

      if (!username || !collegeId) {
        alert("Please fill in all fields.");
        return;
      }
    try{
    await setDoc(doc(db, "users", currentUserUID), {
        uid: currentUserUID,
        email: currentUserEmail,
        username: username,
        collegeId: collegeId,
        role: "user",
        createdAt: new Date()
      });

      alert("Signup complete!");
      window.location.href = "loggedin.html";
     }
     catch (error) {
      console.error("Error saving user data:", error);
      alert("Error: " + error.message);
    } 
    // Redirect to logged in page after signup
    });
    