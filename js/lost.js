import { getFirestore, getDocs, query, collection, orderBy, serverTimestamp, onSnapshot} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
  
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

  async function loadItems() {
    const q = query(collection(db, "lost_reports"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
      const itemsList = document.getElementById("itemList");
      itemsList.innerHTML = ""; // Clear existing items

      snapshot.forEach((doc) => {
        const data = doc.data();
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <h3>${data.title}</h3>
          <p>${data.description}</p>
          <span style="color: ${data.status === 'found' ? 'green' : 'red'}">${data.status}</span>
        `;
        itemsList.appendChild(card);
      });
    });
  }