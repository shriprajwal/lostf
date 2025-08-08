import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

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

// Initialize Firebase Auth and Firestore
const auth = getAuth(app);
auth.languageCode = 'en';


const submit = document.getElementById("submit");
submit.addEventListener("click", function (e) {
  e.preventDefault()

  //inputs
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      // Redirect to logged in page after login
      console.log("User logged in:", user);
      window.location.href = "loggedin.html"; // Redirect to logged in page after login
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(`Error: ${errorMessage}`);
    });

 
});

