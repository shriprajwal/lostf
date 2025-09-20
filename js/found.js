import { createClient } from "https://esm.sh/@supabase/supabase-js";

// 🔑 Supabase credentials
const supabaseUrl = "https://padcweydrcsrzaazroan.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZGN3ZXlkcmNzcnphYXpyb2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzA4NzgsImV4cCI6MjA3MzAwNjg3OH0.8T6tSA5noZerWgDd4020EG9sCD5HJjWZbRRLeQSwDoM";
const supabase = createClient(supabaseUrl, supabaseKey);

const itemsList = document.getElementById("itemList");

// Function to render items
function renderItems(data) {
  itemsList.innerHTML = "";

  data.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";

    const img = document.createElement("img");
    img.src = item.image_url || "assets/placeholder.jpg";

    const details = document.createElement("div");
    details.className = "item-details";

    const reportedOn = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString()
      : "N/A";

    details.innerHTML = `
      <div class="label">Item Name</div><div>${item.title || ""}</div>
      <div class="label">Category</div><div>${item.category || ""}</div>
      <div class="label">Description</div><div>${item.description || ""}</div>
      <div class="label">Reported On</div><div>${reportedOn}</div>
      <div class="label">Location</div><div>${item.location || ""}</div>
      <div class="label">Status</div>
        <div><span class="status-badge ${
          item.status === "Found" ? "status-found" : "status-lost"
        }">${item.status || "Lost"}</span></div>
      <div class="label">Contact Info</div><div>${item.contact || ""}</div>
    `;

    card.appendChild(img);
    card.appendChild(details);
    itemsList.appendChild(card);
  });
}

// Initial load
async function loadItems() {
  const { data, error } = await supabase
    .from("found_reports")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("❌ Error fetching items:", error);
    return;
  }

  renderItems(data);
}

// Realtime subscription
function subscribeToRealtime() {
  supabase
    .channel("public:lost_reports") // channel name can be anything
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "lost_reports" },
      (payload) => {
        console.log("Change received!", payload);
        loadItems(); // Reload items on any change
      }
    )
    .subscribe();
}

// Run
loadItems();
subscribeToRealtime();