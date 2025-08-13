import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore, query, collection, orderBy, onSnapshot} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
  
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

  function loadItems() {
    const q = query(
      collection(db, "found_reports"),
      orderBy("createdAt", "desc")
    );

    onSnapshot(q, (snapshot) => {
      const itemsList = document.getElementById("itemList");
      itemsList.innerHTML = "";

      snapshot.forEach((doc) => {
        const data = doc.data();
        const card = document.createElement("div");
        card.className = "item-card";

        const img = document.createElement("img");
        img.src = data.imageUrl || "placeholder.jpg";

        const details = document.createElement("div");
        details.className = "item-details";
        details.innerHTML = `
          <div class="label">Item Name</div><div>${data.title}</div>
          <div class="label">Category</div><div>${data.category}</div>
          <div class="label">Description</div><div>${data.description}</div>
          <div class="label">Date & Time</div><div>${data.dateTime}</div>
          <div class="label">Location</div><div>${data.location}</div>
          <div class="label">Status</div>
            <div><span class="status-badge ${data.status === "Found" ? "status-found" : "status-lost"}">${data.status}</span></div>
          <div class="label">Contact Info</div><div>${data.contact}</div>
        `;

        card.appendChild(img);
        card.appendChild(details);
        itemsList.appendChild(card);
      });
    });
  }

  loadItems();