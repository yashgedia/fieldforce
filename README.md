# 🛡️ Field Force Management System

[![Developed by Yash Gedia](https://img.shields.io/badge/Developer-Yash%20Gedia-blue?style=for-the-badge&logo=github)](https://github.com/yashgedia)
[![CEO Webnova Tech](https://img.shields.io/badge/CEO-Webnova%20Tech-indigo?style=for-the-badge&logo=google-chrome)](https://webnovatech.co.in)
[![Live Site](https://img.shields.io/badge/Live-Demo-emerald?style=for-the-badge&logo=vercel)](https://fieldforce-sigma.vercel.app/)

An enterprise-grade, full-stack **Field Force Management & Analytics Suite** built with a highly performant **Django REST Framework** backend and a premium, responsive **Vite + React** frontend. 

The system features **Role-Based Access Control (RBAC)**, real-time message routing, task & visit tracking, geolocated check-ins, attendance logs, expense reporting, and an embedded Mock AI analysis service that automatically evaluates field notes to identify operational risks and recommend immediate actions.

---

## ⚡ Deployed Production Environment

*   **Live Application URL:** [https://fieldforce-sigma.vercel.app/](https://fieldforce-sigma.vercel.app/)
*   **Production Backend API Endpoint:** `https://fieldforce-euno.onrender.com/api/`

### 🧪 User Testing & Authentication Keys

You can register an account directly on the website for user testing, or log in with our pre-configured evaluation accounts to inspect different permissions and views:

| Role | Username | Password | Access Designation |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin` | `admin123` | Full access, reporting, system keys, and RBAC control |
| **Regional Manager** | `rm_north` | `password123` | Control over tasks, agents, and logs in the North Zone |
| **Team Lead** | `tl_north` | `password123` | Manages assignments and team operations within region |
| **Field Agent** | `agent1` | `password123` | Captures location check-ins, inputs visit notes, updates tasks |
| **Auditor** | `auditor` | `password123` | Read-only view of operational logs, reports, and aggregates |

---

## ⚙️ Tech Stack & Production Architecture

### **Backend (Core API Service)**
*   **Framework:** Django & Django REST Framework (DRF)
*   **Authentication:** JWT (JSON Web Tokens) via `djangorestframework-simplejwt`
*   **Database:** SQLite (Local Dev) / PostgreSQL (Production, hosted on Render)
*   **Static Asset Delivery:** WhiteNoise (configured for fast, cached production serving)
*   **WSGI Server:** Gunicorn (Green Unicorn WSGI for UNIX)
*   **Database Config:** Environment-driven via `dj-database-url`

### **Frontend (Single Page Application)**
*   **Bundler & Runtime:** Vite + React (TypeScript-compatible ES module imports)
*   **Styling System:** Tailwind CSS v4 (Modern CSS-variables engine)
*   **Visual Assets:** Lucide React Icon Pack, curated harmony palettes, glassmorphism overlays
*   **Routing System:** React Router DOM v6
*   **HTTP Client:** Axios (configured with interceptors to automatically pass and refresh JWT keys)

---

## 💻 Local Setup Instructions

Follow these instructions to run the entire suite locally:

### **1. Backend (Django REST API)**

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Set up and activate a python virtual environment:
   ```bash
   python -m venv venv
   
   # On Windows:
   .\venv\Scripts\activate
   
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations and seed data:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py seed_data
   ```
5. Spin up the development server:
   ```bash
   python manage.py runserver
   ```
   *The API will be available at `http://127.0.0.1:8000/api/`*

---

### **2. Frontend (Vite + React SPA)**

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Copy/configure your environment variables. Create a `.env` file in the `frontend` folder:
   ```env
   VITE_API_URL=http://127.0.0.1:8000/api/
   ```
4. Fire up the development environment:
   ```bash
   npm run dev
   ```
   *Open your browser and navigate to `http://localhost:5173`*

---

## ☁️ Production Hosting & Deployment Guide

This repository has been fully optimized for seamless cloud deployment:

### **Backend Deployment on Render (with PostgreSQL)**

1. **Database Setup:**
   * Create a **PostgreSQL Database** instance inside your Render account.
   * Copy the **External Connection String**.

2. **Web Service Setup:**
   * Create a new **Web Service** on Render and connect this GitHub repository.
   * Set **Root Directory** to `backend`.
   * Configure the following Environment Variables in the Render settings panel:
     * `DATABASE_URL`: *Your PostgreSQL Connection String*
     * `SECRET_KEY`: *A secure random string*
     * `DEBUG`: `False`
     * `ALLOWED_HOSTS`: `*` (or your specific Render web app URL)

3. **Build & Start Commands:**
   * **Build Command:**
     ```bash
     pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
     ```
   * **Start Command:**
     ```bash
     gunicorn core.wsgi:application
     ```

---

### **Frontend Deployment on Vercel**

1. Create a new project on Vercel and connect your GitHub repository.
2. Select **Root Directory** as `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Configure the **Environment Variables**:
   * Add `VITE_API_URL` set to your live Render API URL: `https://your-backend.onrender.com/api/`
5. **Rewrites Handling (Avoids 404 on page refresh):**
   We have integrated a `vercel.json` file inside the `frontend` folder. It intercepts all incoming route queries and redirects them to the React app main routing entry point (`index.html`) so React Router can process pages smoothly:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
6. Click **Deploy**. Vercel will build and host your frontend seamlessly.

---

## 📊 SQL Query Reporting Specs

The app contains robust analytics charts that execute these optimized backend SQL reporting queries:

### 1. Count Pending Tasks by Region
```sql
SELECT r.name AS region_name, COUNT(t.id) AS pending_count 
FROM field_force_task t
JOIN field_force_region r ON t.region_id = r.id
WHERE t.status = 'PENDING'
GROUP BY r.name;
```

### 2. Task Status Distribution
```sql
SELECT status, COUNT(id) AS status_count 
FROM field_force_task 
GROUP BY status;
```

### 3. Recent Completed Visits (Last 7 Days)
```sql
SELECT COUNT(id) AS recent_completed_visits 
FROM field_force_visit 
WHERE completed = true AND end_time >= NOW() - INTERVAL '7 days';
```

---

## 👨‍💻 Developed by Webnova Tech

This software is developed and maintained by:
*   **Lead Engineer:** **Yash Gedia**
*   **Designation:** Chief Executive Officer (CEO)
*   **Organization:** **Webnova Tech**
*   **Website:** [https://webnovatech.co.in](https://webnovatech.co.in)
*   **Organization Focus:** High-scale enterprise web applications, DevOps automations, and custom tailored CRM/ERP workflows.
