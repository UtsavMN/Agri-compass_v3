# 🌱 Agri-Compass 

Agri-Compass is a comprehensive platform built to empower farmers with real-time market prices, weather forecasts, government scheme information, and AI-driven agricultural advisory. It leverages modern web technologies to provide an accessible, responsive, and data-rich experience.

## 🚀 Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Radix UI components
- **State Management:** Zustand + React Query
- **Routing:** React Router v7
- **Authentication:** Clerk React
- **Hosting:** Vercel (Target)

### Backend
- **Framework:** Spring Boot 3 (Java 17)
- **Build Tool:** Maven
- **Database:** PostgreSQL (production / Neon)
- **Authentication:** Clerk (OAuth2 Resource Server)
- **Real-Time Communication:** Spring WebSockets + STOMP
- **External Services:** Gmail SMTP (email notifications)

## ✨ Features
- **Dvani Voice Command:** Fully hands-free app navigation and agricultural querying.
- **AI Krishi Mitra Chatbot:** Powered by Gemini AI for contextual farming advice.
- **Smart Fertilizer Recommendation:** Analyze soil NPK values for precise nutrient remediation.
- **Crop Recommendation Engine:** AI-scored suitability based on local climate and soil health.
- **Community & Messaging:** Real-time peer-to-peer chat via WebSockets and an interactive social feed.
- **Market & Mandi Prices:** Live integrations with Data.gov.in.
- **Real-Time Weather:** Hyper-local forecasts powered by OpenWeather.
- **Auth & Security:** Secure JWT-based authentication via Clerk.
- **Responsive Design:** Mobile-first, fully responsive UI.

## 📁 Folder Structure

```text
Agri-compass_v3/
├── agri-compass-api/      # Spring Boot Backend Code
│   ├── src/main/java/     # Controllers, Services, Entities, Repositories
│   ├── src/main/resources/# application.properties, database configs
│   ├── mvnw / mvnw.cmd    # Maven Wrapper Scripts
│   └── pom.xml            # Maven Dependencies
├── public/                # Static assets for Frontend
├── src/                   # React Frontend Code
│   ├── components/        # Reusable UI components
│   ├── pages/             # Route-level components
│   ├── lib/               # Utilities and API clients
│   └── store/             # Zustand state stores
├── .env.example           # Example environment variables
├── setup.sh               # Quick setup script for Mac/Linux
├── setup.bat              # Quick setup script for Windows
├── README.md              # Project Overview
└── SETUP.md               # Detailed Setup Guide
```

## 🔐 Secrets Handling
**Never commit your API keys.** The repository uses `.env` files to manage secrets securely. 
1. Copy `.env.example` to `.env`.
2. Fill in the values. The `.env` file is ignored by git (`.gitignore`).
3. For the backend, `application.properties` reads variables dynamically (e.g., `${GEMINI_API_KEY}`).

## 🛠️ Setup Instructions (Quick Start)
For a highly detailed, step-by-step guide on generating keys and troubleshooting, please see the **[SETUP.md](SETUP.md)**.

### Prerequisites
- **Java 17** installed and added to PATH.
- **Node.js** (v18+) installed.

### Automated Setup
We provide automated scripts to install dependencies and run both the frontend and backend simultaneously.

**Windows:**
```cmd
setup.bat
```

**Linux / Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

## 📡 API Endpoints Overview

The application relies on several external APIs to provide core functionality:
- **Gemini API:** Used for the AI Chatbot and summarizing agricultural news.
- **OpenWeather API:** Used to fetch current weather conditions and forecasts based on user coordinates.
- **Data.gov.in API:** Used to fetch mandi prices and government agricultural schemes.
- **Gmail SMTP:** Used by the backend to send transactional emails (e.g., password reset, welcome emails).

## ⚠️ Error Prevention & Troubleshooting

- **`Failed to fetch` or `Network Error` in Frontend:** Ensure the Spring Boot backend is running on port 8080.
- **`Web server failed to start. Port 8080 was already in use.`:** Kill the existing process on port 8080 (`npx kill-port 8080` or via Task Manager).
- **Maven/Java Errors:** Ensure you are using specifically **Java 17**. You can check via `java -version`.
- **Missing Data (Weather/Market):** Check your `.env` file to ensure `OPENWEATHER_API_KEY` and `DATA_GOV_API_KEY` are populated correctly.

## 🚀 Production Deployment Checklist

When hosting the application on platforms like Vercel (Frontend) and Render/Railway (Backend), you **must** configure the following Environment Variables in your hosting dashboard, otherwise the app will crash or fail to connect.

### Frontend (Vercel)
- `VITE_API_BASE_URL`: Must be set to your deployed backend URL (e.g., `https://agri-compass-api.onrender.com`). If missing, the frontend will try to query itself and fail with HTML errors.
- `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk frontend key.

### Backend (Render / Railway)
- **Database (PostgreSQL required for prod):**
  - `DB_URL` (or `SPRING_DATASOURCE_URL`): `jdbc:postgresql://<host>:<port>/<db>` (Do NOT use SQLite in production as it locks in serverless/ephemeral environments).
  - `SPRING_JPA_DATABASE_PLATFORM`: `org.hibernate.dialect.PostgreSQLDialect`
  - `SPRING_DATASOURCE_DRIVER_CLASS_NAME`: `org.postgresql.Driver`
  - `SPRING_DATASOURCE_USERNAME` & `SPRING_DATASOURCE_PASSWORD`
- **CORS:**
  - `CORS_ORIGINS`: Must include your Vercel frontend URL (e.g., `https://agri-compass.vercel.app`).
- **Keys:**
  - `GEMINI_API_KEY`, `OPENWEATHER_API_KEY`, `DATA_GOV_API_KEY`

---
*Built by Utsav & Aniruddh.*
