# APK Sentinel 🛡️

**Hybrid Static-Dynamic APK Security Console**

APK Sentinel is an advanced, automated mobile malware analysis platform designed to reverse-engineer, scan, and score Android APK files. Built for the IIT-H Hackathon, its core intent is to democratize mobile cybersecurity by combining static binary extraction, simulated dynamic behavioral tracing, external threat intelligence, and generative AI to provide comprehensive, accessible security audits of any Android application.

Our mission is to help researchers, analysts, and everyday users understand the true intent and potential risks hidden inside Android applications before they install them.

---

## 🌟 Available Documentation & Features

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
- Generates official, paginated PDF cybersecurity reports.
- Includes executive summaries, permission lists, network indicators, and the complete AI threat narrative.

---

## ⚖️ Legal Disclaimer

*APK Sentinel is developed for educational and cybersecurity auditing purposes. The findings derived from static analysis patterns and AI-driven interpretation may occasionally produce false positives or false negatives. This report does not constitute legally binding forensic evidence. Users must perform independent verification before blacklisting or authorizing applications in enterprise environments.*
