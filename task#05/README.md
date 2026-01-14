📱 QRFriends – QR-Based Friend Connection App
🌐 Live Demo : https://qr-bf.vercel.app
QRFriends is a modern QR-based friend connection platform that allows users to instantly connect by scanning QR codes, without searching usernames, phone numbers, or emails.

The app is fast, privacy-focused, and works directly in the browser using the device camera.

🚀 Features

🔐 Automatic user identity generation

📷 QR code scanning using device camera

🔗 Instant friend connection via QR

🧾 Secure encoded QR identity tokens

👥 Friend list management (add / remove)

📱 Mobile-first responsive UI

💾 LocalStorage-based mock backend (for demo)

🎉 Visual confirmation on successful connection

🛠 Tech Stack

Frontend

React (TypeScript)

Vite

Tailwind CSS

Lucide Icons

QR & Camera

html5-qrcode

Browser Camera API

Storage (Demo Backend)

LocalStorage (Mock backend)

📂 Project Structure
src/
├── components/
│   ├── QRScanner.tsx
│   ├── Navigation.tsx
│
├── services/
│   └── mockBackend.ts
│
├── types/
│   └── index.ts
│
├── App.tsx
├── main.tsx
└── index.css

🔍 How It Works

App auto-creates a user on first visit

Each user gets a unique QR code

QR code contains a secure encoded identity payload

Another user scans the QR code

App decodes the payload

Both users are instantly connected

Friend appears in the connection list

📷 QR Token Format
qrf_v1_<base64_encoded_profile>


Encoded data includes:

User ID

Name

Avatar

Bio

Version number

This ensures:

No sensitive data exposure

Easy future upgrades

📱 Camera & Scanning Notes

App requires HTTPS (camera access)

Best experience on mobile devices

Scanner automatically stops after successful scan

Multiple scans are prevented using a scan-lock

▶️ Running the Project Locally
1️⃣ Install dependencies
npm install

2️⃣ Start development server
npm run dev

3️⃣ Open in browser
http://localhost:5173

⚠️ Important Limitations (Demo Mode)

This project uses LocalStorage as a mock backend.

Connections are saved locally per device

No real cloud sync

Refreshing or clearing storage removes data

Suitable for:

Demo

Learning

University projects

UI/UX validation




(HTTPS required for camera access)

🔮 Future Improvements

Firebase / Supabase backend

Real authentication

Cloud-synced connections

One-time QR codes

QR expiration & security layers

Push notifications

Android & iOS builds


📜 License

This project is for educational and demonstration purposes.
Free to use, modify, and extend
