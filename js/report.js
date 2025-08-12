import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
  
const firebaseConfig = {
    apiKey: "AIzaSyDx_N4uA4Va8mS6cpBqkSDld_HH3qqIFxQ",
    authDomain: "lostfusion-b795e.firebaseapp.com",
    projectId: "lostfusion-b795e",
    storageBucket: "lostfusion-b795e.firebasestorage.app",
    messagingSenderId: "378810950057",
    appId: "1:378810950057:web:174ec8f1ee096de3aae4b8"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  document.getElementById("reportBtn").addEventListener("click", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;
    const time = document.getElementById("time").value;
    const location = document.getElementById("location").value;
    const status = document.getElementById("status").value;
    const collegeid = document.getElementById("collegeid").value;

  if (!title || !category || !description || !time || !location || !status || !collegeid) {
    alert("Please fill in all fields.");
    return;
  }

  if (status == "Lost") {
    try {
      await addDoc(collection(db, "lost_reports"), {
        title,
        category,
        description,
        time,
        location,
        status,
        collegeid
      });
      alert("Report submitted successfully!");
      console.log("Report submitted successfully!");
      e.target.reset();
    } catch (error) {
      console.error("Error submitting report: ", error);
    }
  }
    if (status == "Found") {
        try {
        await addDoc(collection(db, "found_reports"), {
            title,
            category,
            description,
            time,
            location,
            status,
            createdAt: serverTimestamp(),
            collegeid
        });
        alert("Report submitted successfully!");
        } catch (error) {
        console.error("Error submitting report: ", error);
        }
    }
});