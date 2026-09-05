# 🚗 RescuDrive - Roadside Breakdown Assistance Web Application

A full-stack Roadside Breakdown Assistance web platform that connects stranded drivers with nearby repair technicians in real time.

## 🌟 Key Features

- **User Assistance Portal**:
  - Live GPS and manual location detection.
  - Nearby technician discovery with upfront pricing, distance calculation (Haversine formula), and estimated arrival waiting time.
  - Interactive search filters (Vehicle Type, Repair Skill, Max Distance, Max Charges).
  - 1-Click emergency breakdown request dispatching.
  - Live 4-step request status tracker.
- **Technician Portal**:
  - Registration and authentication system.
  - Profile manager for base service fee, rate per km, response time, skills offered, and supported vehicle categories.
  - Online / Offline availability toggle switch.
  - Incoming breakdown call feed with real-time status management.
- **User Registration Portal**:
  - Quick account creation for vehicle owners with vehicle details.
- **Database Integration**:
  - MongoDB models connected via Mongoose (`User`, `Technician`, `AssistanceRequest`).
  - Automated seeder with sample data and fallback in-memory store.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, Mongoose, JWT, BcryptJS, CORS, Dotenv
- **Frontend**: HTML5, CSS3 (Modern Glassmorphism & Emergency Theme), Vanilla JavaScript (ES6+), FontAwesome Icons
- **Database**: MongoDB / Mongoose

## 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd roadside-assistance-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory (or copy `.env.example`):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/roadside_assistance
   JWT_SECRET=super_secret_roadside_assistance_key_2026
   ```

4. **Run the application**:
   ```bash
   npm start
   ```
   Open your browser at `http://localhost:5000`.

## 🔑 Demo Credentials

- **Demo User Account**: `user@example.com` / `user123`
- **Demo Technician Account**: `rajesh@apexrescue.com` / `password123`
