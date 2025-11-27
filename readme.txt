Absolutely — here is a **clean, user-friendly `README.txt`** written specifically for people who download your GitHub project and need to manually create/install missing files like `.env`, dependencies, etc.

This is **plain text**, compatible with a `.txt` file (no Markdown needed).

---

# README.txt

# Google AI Chatbot (Expo + React Native + Node.js)

Thank you for downloading this project!

This project contains:

* A **React Native (Expo)** mobile app
* A **Node.js backend** that communicates with **Google AI (Gemini)**
* A simple chat interface that sends messages to the backend and returns AI-generated replies

Because `.env` and some environment-specific files are not included in the public repository, you must follow the steps below to set everything up.

========================================================
=================   PRE-REQUISITES   ===================
========================================================

Before running the project, make sure you have:

1. **Node.js 18 or higher**
   Download from [https://nodejs.org](https://nodejs.org)
   (Node 20+ or 25+ works perfectly.)

2. **npm** (comes with Node)

3. **Expo Go app** on your phone

   * Android: Google Play Store
   * iOS: App Store

4. **Google AI Studio API key**

   * Create one here: [https://aistudio.google.com/api-keys](https://aistudio.google.com/api-keys)
   * Copy the key (it begins with "AIza…")
   * This will be placed in a local `.env` file later

5. A device/computer connected to the **same Wi-Fi network**
   (Required for the Expo app to reach your backend server)

========================================================
===============   PROJECT STRUCTURE   ==================
========================================================

After cloning, your folder should look like this:

TestIntegrationAI/
│
├── google-ai-chatbot/       ← Expo React Native App (Frontend)
│     └── app/(tabs)/index.tsx   (Main Chat UI)
│
└── google-ai-backend/       ← Node.js Backend (Server)
├── server.js
├── package.json
└── YOU will create: .env

You will run **both** the frontend and backend separately.

========================================================
===========   STEP 1 — INSTALL DEPENDENCIES   ==========
========================================================

---

## A. Install frontend dependencies

Open a terminal and run:

cd google-ai-chatbot
npm install

---

## B. Install backend dependencies

cd ../google-ai-backend
npm install

========================================================
===========   STEP 2 — CREATE THE .env FILE   ==========
========================================================

Inside the folder:

google-ai-backend/

create a new file named:

```
.env
```

Put the following inside it:

GOOGLE_API_KEY=YOUR_ACTUAL_KEY_HERE
PORT=4000

Important:

* Replace YOUR_ACTUAL_KEY_HERE with the key you created at Google AI Studio
* Do NOT include quotes
* Do NOT add spaces around the equal sign

Example:

GOOGLE_API_KEY=AIzaSyA1B2C3D4E5F6G7H8I9_
PORT=4000

========================================================
===========   STEP 3 — START THE BACKEND   =============
========================================================

In a terminal:

cd google-ai-backend
node server.js

If it works, you should see:

[dotenv] injecting env…
Server running on [http://localhost:4000](http://localhost:4000)

You can test the server by opening:

```
http://localhost:4000/
```

You should see:

```
Google AI backend is running ✅
```

Leave this terminal window running.

========================================================
===========   STEP 4 — START THE EXPO APP   ============
========================================================

Open another terminal (do NOT stop the backend):

cd google-ai-chatbot
npx expo start

Expo will show a QR code and something like:

Metro waiting on exp://YOUR_LOCAL_IP:8081

Now:

1. Open **Expo Go** on your phone
2. Scan the QR code
3. The chatbot app will appear

========================================================
===========   STEP 5 — CONNECT FRONTEND TO BACKEND  ====
========================================================

The app in `index.tsx` sends requests to:

```
http://YOUR_LOCAL_IP:4000/chat
```

If the backend is running on the same machine, Expo will usually auto-detect the correct IP address.

If needed, manually edit the fetch URL in:

google-ai-chatbot/app/(tabs)/index.tsx

Example:

fetch("[http://192.168.1.50:4000/chat](http://192.168.1.50:4000/chat)", { ... })

VERY IMPORTANT:

* You MUST use your **computer’s LAN IP**, NOT `localhost`
* Phone and PC must be on the **same network**

========================================================
====================   DONE!   =========================
========================================================

You can now chat with the Google AI-powered assistant directly from your mobile device.

========================================================
==================   TROUBLESHOOTING   =================
========================================================

1. **App says: “Oops, something went wrong”**
   → Check the backend terminal. Google usually returns a JSON error describing the issue
   (invalid API key, bad model name, missing .env, etc.)

2. **Expo shows the default “Welcome!” screen**
   → You are viewing the Expo Router’s default page.
   Make sure the chatbot code is in:
   google-ai-chatbot/app/(tabs)/index.tsx

3. **Phone cannot reach backend**

   * Make sure PC and phone are on the same Wi-Fi
   * Use LAN IP, NOT localhost
   * Allow Node.js through Windows Firewall when prompted

4. **Google API returns 404**
   → You may be using an old or unsupported model.
   This project uses:
   gemini-2.5-flash
   on the v1 API.

========================================================
===============   NEED MORE HELP?   ====================
========================================================

If anything does not work:

* Verify `.env`
* Check backend logs
* Ensure correct LAN IP
* Ensure API key is valid in Google AI Studio

Enjoy building with React Native + Google AI!

---

If you want, I can also format this as `README.md` (Markdown), generate a PDF version, or add diagrams.
