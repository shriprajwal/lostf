# 🚀 Lostfusion (React 18 + Vite + Tailwind CSS)

Welcome to the newly upgraded **Lostfusion** campus lost-and-found single-page application with **Strict Role-Based Access Control** and **Super Admin Authority**.

---

## 🔒 Strict Role-Based Access Control

### 1. Regular Students & Users
* **Student Sign In / Registration:** Students register and log in normally using their campus email and password (or Google One-Click Sign In).
* **Strict Limitations:**
  * Students **CANNOT** access the Admin Console.
  * Students **CANNOT** see any admin controls, edit buttons, or delete buttons on listings posted by other people.
  * If a student tries to access `/admin`, they are immediately blocked with a **403 Forbidden** security screen.
  * Students can **only** edit, resolve, or delete **their own** posted reports.
  * There are **NO public admin buttons** in the navbar or footer for students.

---

### 2. Super Admin (Head Authority)
* **Dedicated Administrator Gateway:**
  * In the **Sign In** modal, select the **"Admin"** tab.
  * Enter your verified Administrator credentials:
    * **Admin Email:** `admin@lostfusion.edu` (or `admin`)
    * **Master Admin Passkey:** `admin` (or `ADMIN@LOSTFUSION#2025` / `LostfusionAdmin@2025`)
* **What Unlocks for the Admin:**
  * 👑 **SUPER ADMIN Crown Badge** in the top navbar.
  * 🛡️ **Admin Console Tab:** Full database table of every report submitted on campus.
  * ✏️ **Edit ANY Report:** Overwrite title, category, description, location, contact number, College ID, and status (`Lost` / `Found` / `Resolved`) for any item across campus.
  * 🗑️ **Delete ANY Report:** Permanently purge spam, fake, or outdated reports from Supabase.
  * 🔄 **Resolve / Reopen:** Toggle resolution status on any student's report.
  * ➕ **Publish Official Desk Notices:** Post official security/affairs reports with verified head authority.
  * 📊 **CSV Export:** Download all campus reports into a `.csv` spreadsheet.

---

## 🎨 Modern UI Highlights
* **Glassmorphism 2.0:** Void theme (`#07090e`) with multi-layered glowing ambient neon meshes.
* **Animated Beacons:** Live pulsating dots on Lost (red), Found (green), and Resolved (cyan) cards.
* **Hero Search:** Direct keyword search right from the home page.
* **View Modes:** Toggle between a **3-Column Card Grid** and a **Compact Detailed List View**.
* **WhatsApp & Call Integration:** One-tap communication with pre-formatted inquiry text.
* **Anti-Fraud Security Tips:** Verification advice to avoid scams during item handoffs.

---

## 🚀 How to Run the App

In your terminal:

```powershell
cd D:\Lostfusion\react-app
npm run dev
```

Open your browser to:
👉 **`http://localhost:5173`**
