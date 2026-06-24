# CivicSphere AI 🌐🤖

> **AI-First Hyperlocal Community Portal** – Empowering citizens, streamlining municipal response, and closing the gap between residents and city maintenance using Google Gemini.

CivicSphere AI is a full-stack web application designed to automate the process of reporting, analyzing, dispatching, and resolving hyperlocal civic complaints. By leveraging the power of **Google Gemini 3.5**, CivicSphere AI classifies, scores, and routes submitted community issues (e.g., potholes, dark streets, garbage pileups, sewer leaks) to correct municipal departments in seconds.

---

## 🎨 Visual Preview & Design Philosophy
This application uses a refined **Geometric Balance** dark aesthetic with high-contrast elements, glassmorphism card panels, smooth transitions powered by `motion`, and standard Lucide iconography. It also includes an instant **High Contrast Mode** toggle for optimal accessibility.

---

## 🚀 Key Features

### 1. 📝 Submit a Civic Concern
- Submit issues easily with a custom, polished form specifying the Ward, Title, and Description.
- **Vision AI Support**: Drag-and-drop or select photos of the hazard. Gemini instantly analyzes the image, extracts details, and checks for hazards.
- **Local Pre-Classifier & Duplicate Merging**: Warns users if a similar report exists in their ward and automatically merges coordinates/priority scores to elevate resolution urgency.

### 2. 📊 Public Community Dashboard
- Browse, search, and filter community complaints by Ward, Department, and Status.
- Interactive timeline tracking showing the history of updates from Submitted to In Progress and Resolved.
- Interactive Comments section on each issue to bridge the gap between citizens and officials.

### 3. 🔐 Municipal Command Center (Admin Console)
- Designed for authorized officials to manage backlogs.
- Re-route assigned departments, update status lifecycles, and enter detailed engineering resolution logs.
- Publish administrative announcements and public warnings.

### 4. 🧠 AI Predictive Dashboard (Analytics)
- Dynamic data visualization utilizing **Recharts** charts showing incident categories and department queue workloads.
- **Gemini Forecast Engine**: Run real-time machine intelligence on active issues to generate a predictive weekly growth rate, a comprehensive markdown Trend Report, and smart directives for officials.

### 5. 💬 CivicSphere AI Chat Assistant
- An interactive assistant powered by Gemini.
- Answers citizen queries regarding ongoing repairs, ward boundaries, or submission processes using local database context.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19 (with Vite & TypeScript)
- **Styling**: Tailwind CSS
- **Backend**: Node.js + Express (Full-stack proxy pattern to securely handle Gemini API keys server-side)
- **AI Integration**: `@google/genai` TypeScript SDK
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Motion

---

## ⚙️ Local Development Setup

To run this project locally on your machine, follow these instructions:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18 or higher) installed.

### 2. Extract Project & Install Dependencies
Extract your downloaded ZIP file, open your terminal in the root directory, and run:
```bash
npm install
```

### 3. Configure Environment Variables
Create a file named `.env` in the root directory (using `.env.example` as a template):
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```
> **Security Note**: Never commit your actual API key to Git/GitHub. Keep `.env` added to your `.gitignore`.

### 4. Start the Development Server
Run the local full-stack server (binds on port `3000`):
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build & Start in Production Mode
Compile frontend assets and build the self-contained bundle for Express:
```bash
npm run build
npm start
```

---

## ☁️ Deploying to Production
This app is fully compatible with production environments such as **Google Cloud Run**, Vercel, or Heroku. The build process compiles the server-side TypeScript code using `esbuild` into a single, high-performance CommonJS file (`dist/server.cjs`) to ensure lightning-fast server boot times.
