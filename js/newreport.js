/********** Config **********/
const GOOGLE_API_KEY = "AIzaSyCwNNauuIWphPAyaIXOeFbfqdxtSGRnmsQ"; // Google Cloud → APIs & Services → Credentials
const GOOGLE_CLIENT_ID = "488297945553-01b2lr2nif54852fhqj537c3lj97dct6.apps.googleusercontent.com"; // OAuth 2.0 Client ID (Web)
const DRIVE_FOLDER_ID = "1ogd8tXZSNAvgZBYn20Ogineei51dGWGS"; // The shared folder where images go

// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

/********** Google OAuth Setup **********/
let tokenClient;
let accessToken = null;
let gapiInited = false;
let gisInited = false;

// These must be global for Google scripts to call
window.onGapiLoad = function () {
  gapi.load("client", initGapiClient);
};

async function initGapiClient() {
  await gapi.client.init({
    apiKey: GOOGLE_API_KEY,
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
  });
  gapiInited = true;
}

window.onGisLoad = function () {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: "https://www.googleapis.com/auth/drive.file",
    callback: (tokenResponse) => {
      accessToken = tokenResponse.access_token;
      console.log("✅ Google Drive connected");
    },
  });
  gisInited = true;

  // Enable the button once ready
  const btn = document.getElementById("connectDriveBtn");
  if (btn) btn.disabled = false;
};

/********** Helper **********/
async function ensureAccessToken() {
  return new Promise((resolve) => {
    if (accessToken) return resolve(accessToken);
    tokenClient.requestAccessToken({ prompt: "consent" });
    const interval = setInterval(() => {
      if (accessToken) {
        clearInterval(interval);
        resolve(accessToken);
      }
    }, 200);
  });
}

/********** Upload Image to Drive **********/
async function uploadImageToDrive(file) {
  await ensureAccessToken();

  const metadata = {
    name: `${Date.now()}_${file.name}`,
    parents: [DRIVE_FOLDER_ID],
    mimeType: file.type,
  };

  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", file);

  const uploadRes = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });

  if (!uploadRes.ok) throw new Error("❌ Image upload failed");

  const fileData = await uploadRes.json();
  const fileId = fileData.id;

  // Make file public
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role: "reader", type: "anyone" }),
  });

  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

/********** DOM Ready **********/
document.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectDriveBtn");
  if (connectBtn) {
    connectBtn.disabled = true; // Start disabled until onGisLoad runs
    connectBtn.addEventListener("click", () => {
      if (!tokenClient) {
        console.error("Google token client not initialized yet.");
        return;
      }
      tokenClient.requestAccessToken({ prompt: "consent" });
    });
  }


/********** Form Submission **********/
document.getElementById("reportForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value;
  const dateTime = document.getElementById("dateTime").value;
  const location = document.getElementById("location").value;
  const status = document.getElementById("status").value;
  const contact = document.getElementById("contact").value;
  const collegeid = document.getElementById("collegeid") ? document.getElementById("collegeid").value : "";
  const file = document.getElementById("imageFile").files[0];

  if (!title || !category || !description || !dateTime || !location || !status || !contact || !collegeid) {
    alert("Please fill in all fields.");
    return;
  }

  if (!file) {
    alert("Please select an image");
    return;
  }

  if (status == "Lost") {
    try {
      console.log("📤 Uploading image to Google Drive...");
      const imageUrl = await uploadImageToDrive(file);

      await addDoc(collection(db, "lost_reports"), {
        title,
        category,
        description,
        time: dateTime,
        location,
        status,
        collegeid,
        contact,
        imageUrl,
        createdAt: serverTimestamp()
      });

      alert("✅ Report submitted successfully!");
      document.getElementById("reportForm").reset();
    } catch (error) {
        console.error("Error submitting report: ", error);
    }
  } 
    if (status == "Found") {
    try {
      console.log("📤 Uploading image to Google Drive...");
      const imageUrl = await uploadImageToDrive(file);

      await addDoc(collection(db, "found_reports"), {
        title,
        category,
        description,
        dateTime,
        location,
        status,
        contact,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      alert("✅ Report submitted successfully!");
      document.getElementById("reportForm").reset();
    } catch (error) {
        console.error("Error submitting report: ", error);
    }
  }
}); // Close reportForm submit event listener

}); // Close DOMContentLoaded event listener