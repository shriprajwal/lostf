import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabaseUrl = "https://padcweydrcsrzaazroan.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZGN3ZXlkcmNzcnphYXpyb2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzA4NzgsImV4cCI6MjA3MzAwNjg3OH0.8T6tSA5noZerWgDd4020EG9sCD5HJjWZbRRLeQSwDoM"; // Replace with anon key
const supabase = createClient(supabaseUrl, supabaseKey);

  document.getElementById("reportBtn").addEventListener("click", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;
    const time = document.getElementById("time").value;
    const location = document.getElementById("location").value;
    const status = document.getElementById("status").value;
    const collegeid = document.getElementById("collegeid").value;
    const contact = document.getElementById("contact").value;
    const errorMsg = document.getElementById("error-msg");
    const fileInput = document.getElementById("imageFile");

    // ✅ Validation
    if (!title || !category || !description || !time || !location || !status || !collegeid || !contact) {
      alert("Please fill in all fields.");
      return;
    }
    if (errorMsg.style.display === "block") {
      alert("❌ Must be 10 digits & start with 6, 7, 8, or 9");
      return;
    }
    if (collegeid.match(/^\d{2}[A-Za-z]{2}\d{3}$/) === null) {
      alert("❌ Invalid College ID format");
      return;
    }
    // ✅ Upload image
  let imageUrl = null;
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const fileName = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, file);

    if (uploadError) {
      alert("Image upload failed: " + uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("images").getPublicUrl(fileName);
    imageUrl = data.publicUrl;
  }

    const reportData = {
      title,
      category,
      description,
      time,
      location,
      status,
      collegeid,
      contact,
      image_url: imageUrl,
      createdAt: new Date().toISOString()
    };

    try {
    if (status === "Lost") {
      const { error } = await supabase.from("lost_reports").insert([reportData]);
      if (error) throw error;
    } else if (status === "Found") {
      const { error } = await supabase.from("found_reports").insert([reportData]);
      if (error) throw error;
    }

    alert("✅ Report submitted successfully!");
    console.log("✅ Report submitted:", reportData);
    document.getElementById("reportForm").reset();
  } catch (error) {
    console.error("❌ Error submitting report:", error);
    alert("Error: " + error.message);
  }
});