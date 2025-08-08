import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
  
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
    const provider = new GoogleAuthProvider();
  
    const googleSignupButton = document.getElementById("google-signup");
      googleSignupButton.addEventListener("click", function() {
        signInWithPopup(auth, provider)
         .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);   
        const user = result.user;
        console.log(user);
        window.location.href = "loggedin.html"; // Redirect to logged in page after login
    
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(`Error: ${errorMessage}`);
      });
    
      });
    