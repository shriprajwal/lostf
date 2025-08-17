import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
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

  // Initialize Firebase Auth and Firestore
  const auth = getAuth(app);
  const db = getFirestore(app);


  const submit = document.getElementById("submit");
  submit.addEventListener("click", (e) => {
    e.preventDefault();

    //inputs
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value;
  const collegeId = document.getElementById("id").value;
  const confirmPassword = document.getElementById("confirmpassword").value;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Create user with email and password
    if (!email || !password || !username || !id) {
      alert("Please fill in all fields.");
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        alert("User signed up successfully!");
        console.log("User signed up:", user);
        // Set additional user data
        
        // Save user data to Firestore
        const db = getFirestore();
        setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email,
          username,
          collegeId,
          role: "user",
          createdAt: new Date()

        })
          .then(() => {
            console.log("User data saved to Firestore");
            alert("User data saved successfully!");
            window.location.href = "loggedin.html"; // Redirect to logged in page after signup
          })
          .catch((error) => {
            console.error("Error saving user data:", error);
            alert("Error saving user data: " + error.message);
          });
      })
      .catch((error) => {
        console.error("Error signing up:", error);
        alert("Error signing up: " + error.message);
      });
  });
