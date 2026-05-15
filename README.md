# Field Force Management System

A full-stack Field Force Management application built with Django (Backend) and React (Frontend).
The system features Role-Based Access Control, Task & Visit tracking, Activity Logging, and a Mock AI service that automatically analyzes visit notes to determine risk level and suggest actions.

## 🚀 Tech Stack
- **Backend:** Django, Django REST Framework, Simple JWT, SQLite (Local) / PostgreSQL (Production)
- **Frontend:** React, Vite, Tailwind CSS v4, React Router DOM, Axios

## 🔐 Roles & Sample Accounts
You can log in to the system using the following seed accounts (Password for all: `password123`):
- **admin** (Admin) - Has full access to everything.
- **rm_north** (Regional Manager) - Can view and manage tasks/visits in their region (North Zone).
- **tl_north** (Team Lead) - Can view and manage tasks/visits in their region.
- **agent1** (Field Agent) - Can only view their own tasks, start visits, and complete visits with notes.
- **auditor** (Auditor) - Read-only access to all data and reports.

---

## 💻 Local Setup Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers dj-database-url psycopg2-binary
   ```
4. Run migrations and seed data:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py seed_data
   ```
5. Start the backend server:
   ```bash
   python manage.py runserver 8000
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the browser to `http://localhost:5173`.

---

## ☁️ Deployment Guide (Vercel & Render)

### Backend Deployment (Render)
1. Push your code to a GitHub repository.
2. Go to [Render](https://render.com/) and create a new **Web Service**.
3. Connect your GitHub repository and select the `backend` folder as the root directory (or set the Build Command context appropriately).
4. **Environment Settings:**
   - **Build Command:** `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate` *(Note: you will need to create a `requirements.txt` using `pip freeze > requirements.txt` before pushing)*.
   - **Start Command:** `gunicorn core.wsgi:application` *(Note: you need to install gunicorn `pip install gunicorn` and add it to requirements)*.
5. **Database:** Render provides a free PostgreSQL database. Create one in Render, copy the Internal Database URL, and add it as an Environment Variable named `DATABASE_URL` in your Web Service settings. `dj_database_url` will automatically pick it up.

### Frontend Deployment (Vercel)
1. Go to [Vercel](https://vercel.com/) and create a new project.
2. Connect your GitHub repository.
3. Set the **Framework Preset** to `Vite`.
4. Set the **Root Directory** to `frontend`.
5. **Environment Variables:**
   - Add `VITE_API_URL` and set it to your deployed Render backend URL (e.g., `https://your-backend.onrender.com/api/`).
6. Click **Deploy**.

---

## 📊 SQL / Reporting Use Cases

The application includes endpoints that perform aggregation to answer these business questions, which can also be executed via raw SQL.

### 1. Pending tasks by region
**ORM:** `Task.objects.filter(status='PENDING').values('region__name').annotate(count=Count('id'))`
**Raw SQL:**
```sql
SELECT r.name as region_name, COUNT(t.id) as pending_count 
FROM field_force_task t
JOIN field_force_region r ON t.region_id = r.id
WHERE t.status = 'PENDING'
GROUP BY r.name;
```

### 2. Task status distribution
**ORM:** `Task.objects.values('status').annotate(count=Count('id'))`
**Raw SQL:**
```sql
SELECT status, COUNT(id) as status_count 
FROM field_force_task 
GROUP BY status;
```

### 3. Recent completed visits (Last 7 days)
**ORM:** `Visit.objects.filter(completed=True, end_time__gte=seven_days_ago).count()`
**Raw SQL:**
```sql
SELECT COUNT(id) as recent_completed_visits 
FROM field_force_visit 
WHERE completed = 1 AND end_time >= datetime('now', '-7 days');
```
