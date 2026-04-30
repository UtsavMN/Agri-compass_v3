# 🛠️ Agri-Compass Developer Setup Guide

Follow this step-by-step guide to get the Agri-Compass project running on your local machine.

---

## 📌 Step 1: Install Prerequisites

Before starting, ensure you have the following installed:
1. **Java 17 (JDK)**: Spring Boot requires Java 17. 
   - [Download Java 17 here](https://adoptium.net/temurin/releases/?version=17)
   - Verify installation: `java -version`
2. **Node.js (v18+)**: Required for the Vite React frontend.
   - [Download Node.js here](https://nodejs.org/)
   - Verify installation: `node -v`
3. **Git**: To clone the repository.

---

## 📌 Step 2: Clone the Repository

Clone the project to your local machine and navigate into the folder:
```bash
git clone https://github.com/your-username/Agri-compass_v3.git
cd Agri-compass_v3
```

---

## 📌 Step 3: Configure Secrets (`.env` file)

To keep API keys secure, they are read from a `.env` file which is completely ignored by Git.

1. **Create the file**: Duplicate `.env.example` and rename the copy to `.env`.
   ```bash
   # Linux / Mac
   cp .env.example .env
   
   # Windows (Command Prompt)
   copy .env.example .env
   ```
2. **Generate API Keys**: Open `.env` in a text editor and fill in the values:
   - **Gemini API Key**: Get it from [Google AI Studio](https://aistudio.google.com/).
   - **OpenWeather API Key**: Get it from [OpenWeatherMap](https://openweathermap.org/api).
   - **Data.gov API Key**: Register at [Data.gov.in](https://www.data.gov.in/) and generate a key.
3. **Generate Gmail App Password**:
   - Go to your Google Account Settings -> Security.
   - Enable **2-Step Verification**.
   - Search for **App Passwords** and create a new one (select "Other" and name it "Agri-Compass").
   - Paste the 16-character code into `MAIL_PASSWORD` in `.env`.

---

## 📌 Step 4: Run the Application (Automated)

We have provided scripts to install all dependencies and run both the frontend and backend automatically.

### For Windows:
Double click the `setup.bat` file in your file explorer, OR run it from the command line:
```cmd
setup.bat
```

### For Mac/Linux:
Make the script executable (only needed the first time) and run it:
```bash
chmod +x setup.sh
./setup.sh
```

---

## 📌 Step 5: Run the Application (Manual Method)

If the automated script fails, follow these manual steps.

### Terminal 1 (Backend - Spring Boot)
```bash
cd agri-compass-api

# Windows
mvnw.cmd spring-boot:run

# Mac/Linux
./mvnw spring-boot:run
```
*Wait for it to say `Started AgriCompassApplication` on port 8080.*

### Terminal 2 (Frontend - React)
```bash
# Return to the root folder if you are in the api folder
cd .. 

# Install dependencies (only needed once)
npm install

# Start the frontend
npm run dev
```
*Navigate to `http://localhost:5173` in your browser.*

---

## ⚠️ Troubleshooting & Common Issues

### 1. `Port 8080 was already in use`
Something else is running on port 8080 (often a previous instance of the backend).
- **Fix (Windows):** `npx kill-port 8080`
- **Fix (Mac/Linux):** `kill -9 $(lsof -t -i:8080)`

### 2. Maven (`mvnw`) not found or permission denied
- **Fix:** If `./mvnw` gives "Permission Denied" on Mac/Linux, run `chmod +x mvnw`. 
- **Alternative:** Install maven globally via `brew install maven` or `apt install maven` and just run `mvn spring-boot:run`.

### 3. Database Connection Failure
By default, the backend uses a local SQLite database (`agri.db`). This file will be auto-generated in the `agri-compass-api` folder. 
- **Fix:** If using Turso, make sure `DB_URL` and `TURSO_AUTH_TOKEN` are set correctly in `.env`.

### 4. Emails Not Sending
- **Fix:** Ensure you used a **Google App Password** (16 characters, no spaces) and NOT your regular Google account password in the `MAIL_PASSWORD` field.

### 5. AI Chatbot or Market Prices not loading
- **Fix:** Double check that your `GEMINI_API_KEY` and `DATA_GOV_API_KEY` are correct and do not contain extra quotes or whitespace in the `.env` file.
