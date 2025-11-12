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
const auth = getAuth(app);
const db = getFirestore(app);

const submit = document.getElementById("submit");

submit.addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const username = document.getElementById("username").value.trim();
  const collegeId = document.getElementById("id").value.trim();
  const confirmPassword = document.getElementById("confirmpassword").value.trim();

  if (!email || !password || !username || !collegeId) {
    alert("⚠️ Please fill in all fields.");
    return;
  }

  if (password !== confirmPassword) {
    alert("❌ Passwords do not match!");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      username,
      collegeId,
      role: "user",
      createdAt: new Date()
    });

    alert("✅ Account created successfully!");
    window.location.href = "loggedin.html";
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      alert("⚠️ This email is already registered. Please login instead.");
    } else if (error.code === "auth/invalid-email") {
      alert("❌ Invalid email address.");
    } else if (error.code === "auth/weak-password") {
      alert("⚠️ Password must be at least 6 characters long.");
    } else {
      alert("❌ Error: " + error.message);
    }
    console.error("Signup error:", error);
  }
});



// 👁️ Show/Hide Password using Lucide Icons
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmpassword");
const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

togglePassword.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePassword.innerHTML = isHidden
    ? `<i data-lucide="eye-off"></i>`
    : `<i data-lucide="eye"></i>`;
  lucide.createIcons();
});

toggleConfirmPassword.addEventListener("click", () => {
  const isHidden = confirmPasswordInput.type === "password";
  confirmPasswordInput.type = isHidden ? "text" : "password";
  toggleConfirmPassword.innerHTML = isHidden
    ? `<i data-lucide="eye-off"></i>`
    : `<i data-lucide="eye"></i>`;
  lucide.createIcons();
});

// Initialize Lucide icons on load
lucide.createIcons();
