# Audio Curify Web App

A modern web application for **securely hiding files inside WAV audio files** using steganography and AES encryption. Includes **QR code-based verification** to ensure authenticity, and all processes are handled **fully in-memory** for enhanced performance and privacy.

## 🌟 Features

-   ✅ Hide any file (image, document, zip, etc.) inside a `.wav` audio file.
-   🔐 AES-256 encryption with user-provided key (key will be hashed using SHA-256).
-   📥 Extract embedded files securely with a key.
-   🧾 QR Code generation containing hash of embedded audio for verification.
-   🔎 Verification system to check integrity using QR + embedded audio.
-   🚫 Fully in-memory processing – no file stored on server.
-   🌐 FastAPI backend + Next.js frontend.
-   ✨ Beautiful UI with drag & drop support and smooth animations.

---

## 🛠️ Tech Stack

**Frontend:**

-   [Next.js](https://nextjs.org/)
-   [React](https://reactjs.org/)
-   [Tailwind CSS](https://tailwindcss.com/)
-   [Framer Motion](https://www.framer.com/motion/)
-   [Axios](https://axios-http.com/)

**Backend:**

-   [FastAPI](https://fastapi.tiangolo.com/)
-   `numpy`, `Pillow`, `qrcode` for audio & image processing
-   Implements of:
    -   **LSB (Least Significant Bit)** steganography
    -   **AES encryption**
    -   **QR code verification**

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/IrfanMusthofa/II4021-audio-curify.git
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
"source venv/bin/activate" on Mac Terminal or "venv\Scripts\activate" on Windows Terminal
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

### 4. Env

```bash
- Don't forget to change the CORSMiddleware origins on "/backend/main.py" into "*" so any frontend could access
```

### 5. Access the App

Open [http://localhost:3000](http://localhost:3000) or any configured URL in your browser.

---

## 🧪 Project Structure

```
backend/
├── main.py             # FastAPI entrypoint
├── stego.py            # LSB steganography logic
├── crypto.py           # AES/Vigenère encryption
├── qr_utils.py         # QR code & hash generation
└── utils.py            # Byte & stream helpers

frontend/
├── app/
│   ├── embed/          # Page for embedding file into audio
│   ├── verify/         # Page for verifying audio + QR
│   └── extract/        # Page for extracting hidden file
├── components/         # UI components (Button, Card etc.)
└── public/             # Static assets
```

---

## 🔐 Security Notes

-   All file processing is done in-memory using `BytesIO`.
-   No file is saved to disk at any stage of the backend.
-   The password is required to extract the file, and is not stored.

---

## ✍️ Credits

Made with 💝 by Irfan Musthofa!

---
