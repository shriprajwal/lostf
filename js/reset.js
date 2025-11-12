import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { 
  getAuth, 
  sendPasswordResetEmail, 
  fetchSignInMethodsForEmail 
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// 🔹 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDx_N4uA4Va8mS6cpBqkSDld_HH3qqIFxQ",
  authDomain: "lostfusion-b795e.firebaseapp.com",
  projectId: "lostfusion-b795e",
  storageBucket: "lostfusion-b795e.firebasestorage.app",
  messagingSenderId: "378810950057",
  appId: "1:378810950057:web:174ec8f1ee096de3aae4b8"
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔹 Toast Message Function (with simple styling)
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// 🔹 Reset Password Form Handler
const resetForm = document.getElementById("resetForm");

resetForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("resetEmail").value.trim();
  if (!email) return showToast("⚠️ Please enter your email.", "error");

  try {
    // ✅ Step 1: Check if email exists
    const methods = await fetchSignInMethodsForEmail(auth, email);

    if (methods.length === 0) {
      // ❌ Email not registered → redirect to signup
      showToast("❌ This email is not registered. Redirecting to signup...", "error");
      setTimeout(() => {
        window.location.href = "signup.html";
      }, 2000);
      return;
    }

    // ✅ Step 2: Send reset email
    await sendPasswordResetEmail(auth, email);
    showToast(`📩 Password reset link sent to ${email}`, "success");
    resetForm.reset();
  } catch (error) {
    console.error("Error:", error);
    if (error.code === "auth/invalid-email") {
      showToast("⚠️ Invalid email format.", "error");
    } else {
      showToast("⚠️ Something went wrong. Try again later.", "error");
    }
  }
});
