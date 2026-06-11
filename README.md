# APK Sentinel 🛡️

**Hybrid Static-Dynamic APK Security Console**

APK Sentinel is an advanced, automated mobile malware analysis platform designed to reverse-engineer, scan, and score Android APK files. Built for the IIT-H Hackathon, it combines static binary extraction, simulated dynamic behavioral tracing, external threat intelligence, and generative AI to provide comprehensive security audits of any Android application.

---

## 🌟 Key Features

### 1. Deep Static Analysis
- **Manifest Parsing:** Extracts `AndroidManifest.xml` to analyze exported components, backup rules, and debuggable flags.
- **Permission Profiling:** Identifies and flags dangerous permissions (e.g., `SYSTEM_ALERT_WINDOW`, `RECEIVE_SMS`) and dangerous combinations (e.g., Overlay + Internet).
- **Certificate Integrity:** Validates APK signatures, identifying debug keys and self-signed, untrusted certificates.
- **DEX String Extraction:** Scans Dalvik Executable strings for hardcoded Network Indicators (URLs, IPs) and known malicious SDK footprints (e.g., `DexClassLoader`, `AccessibilityService`).

### 2. Simulated Dynamic Tracing (`aparoid` integration)
- Simulates runtime behavioral monitoring.
- Tracks file system reads/writes, network sockets, crypto operations, and dynamic code loading.

### 3. AI-Powered Threat Narratives (NVIDIA NIM)
- Integrates with the **NVIDIA NIM API** (powered by `meta/llama-3.1-8b-instruct`).
- Automatically feeds static analysis metrics into the LLM to generate a human-readable, executive threat narrative summarizing the exact risks posed by the application.

### 4. Global Threat Intelligence (VirusTotal)
- Hashes the uploaded APK and queries the **VirusTotal v3 API**.
- Retrieves community consensus and detection ratios from 60+ security vendors to validate findings and eliminate false positives for commercial apps (like WhatsApp or PhonePe).

### 5. Automated PDF Reporting
- Generates official, paginated PDF cybersecurity reports using `jsPDF`.
- Includes executive summaries, permission lists, network indicators, and the complete AI threat narrative.

---

## 🛠️ Technology Stack

- **Frontend Framework:** Next.js 14/15 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript
- **Styling:** Custom CSS with Glassmorphism and responsive layouts
- **Deployment & Analytics:** Vercel & Vercel Analytics
- **PDF Generation:** `jspdf` & `html2canvas`
- **APIs:** 
  - VirusTotal API v3 (Threat Intel)
  - NVIDIA NIM API (Generative AI Narratives)

---

## ⚙️ Architecture & Scoring Engine

The Risk Scoring Engine utilizes a deterministic heuristic model, capping scores between 0 and 100, which translates into four threat tiers:
- **BENIGN (0-19):** Safe, commercial, or clean applications.
- **SUSPICIOUS (20-49):** Apps with questionable permissions or debug signatures.
- **FRAUDULENT (50-79):** Apps exhibiting adware or financial risk indicators.
- **MALICIOUS (80-100):** Severe threats (Trojans, Spyware, Droppers) with critical permission combinations.

**Commercial App Safety Net:** 
If an app requests dozens of dangerous permissions (e.g., a banking app) but returns **0 malicious detections on VirusTotal**, the heuristic score is mathematically crushed to 10 (BENIGN) to prevent false positives.

---

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm, yarn, or pnpm
- NVIDIA NIM API Key
- VirusTotal API Key

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/apk-sentinel_nfsu.git
   cd apk-sentinel_nfsu/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the `frontend` directory and add the following keys:
   ```env
   NVIDIA_BASE_URL="https://integrate.api.nvidia.com/v1"
   NVIDIA_MODEL="meta/llama-3.1-8b-instruct"
   NVIDIA_API_KEY="your_nvidia_api_key_here"
   VIRUSTOTAL_API_KEY="your_virustotal_api_key_here"
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment (Vercel)

This application is optimized for Vercel. When deploying:
1. Set the **Root Directory** to `frontend`.
2. Disable the **Include files outside the root directory in the Build Step** setting.
3. Set the **Framework Preset** to `Next.js`.
4. Add all environment variables from `.env.local` directly into the Vercel Project Settings.

---

## ⚖️ Legal Disclaimer

*APK Sentinel is developed for educational and cybersecurity auditing purposes. The findings derived from static analysis patterns and AI-driven interpretation may occasionally produce false positives or false negatives. This report does not constitute legally binding forensic evidence. Users must perform independent verification before blacklisting or authorizing applications in enterprise environments.*
