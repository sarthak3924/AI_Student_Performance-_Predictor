# AI_Student_Performance_Predictor_System

A production-level, multi-container futuristic academic analytics platform featuring an ML predictive engine, counselor chatbot, and role-based student/teacher/admin dashboards.

## System Architecture

```
                               +-----------------------------+
                               |     User Browser Client     |
                               +--------------+--------------+
                                              |
                                              v (Port 80)
                               +--------------+--------------+
                               |  Nginx Reverse Proxy Server |
                               +-----+-----------------+-----+
                                     |                 |
                   (SPA Routing)     |                 |  (/api/v1/*)
                                     v                 v
                       +-------------+--+      +-------+--------+
                       | React Frontend |      | FastAPI Api    |
                       | (Static Site)  |      | Backend Server |
                       +----------------+      +-------+---+----+
                                                       |   |
                                        (DB Postgres)  |   | (HTTP REST)
                                                       v   v
                                         +-------------+-+ +-+--------------+
                                         | PostgreSQL Db | | FastAPI ML     |
                                         | Database      | | Inference API  |
                                         +---------------+ +----------------+
```

### Microservices Containers
1. **Frontend Container (`student-frontend`)**: Serves compiled React + Vite + Tailwind CSS assets inside a lightweight Alpine Nginx server, using custom configurations to support SPA path refreshing.
2. **Backend API Container (`student-backend`)**: Python FastAPI app managing portal CRUDs, JWT authentication, assignment grading boards, reports export, and advisor counselor chatbot scripts.
3. **Machine Learning Service Container (`student-ml-service`)**: Python FastAPI engine containing data generators and training pipelines to evaluate 6 classifiers and regressors (XGBoost, Random Forest, SVM, KNN, Decision Tree, Logistic Regression).
4. **PostgreSQL Database Container (`student-db`)**: Persists schemas and tables for users, predictions, assignments, attendance charts, and notifications.
5. **Nginx Proxy Container (`student-nginx-proxy`)**: Port-80 ingress reverse proxy mapping requests either to the static website frontend or the backend API endpoints.

---

## Port Configurations

| Service | Port (Host:Guest) | Protocol | Purpose |
| :--- | :--- | :--- | :--- |
| **Nginx Ingress** | `80:80` | HTTP | Main Browser Entrypoint |
| **FastAPI Backend** | `8000:8000` | HTTP | Core JSON REST APIs |
| **ML Inference** | `8001:8001` | HTTP | Model Training & Prediction |
| **PostgreSQL** | `5432:5432` | TCP | Relational Storage |

---

## Demo Credentials (Pre-seeded)

Use the following credentials to access portal interfaces:

### 1. Student Portal
* **Email**: `jane@student.com`
* **Password**: `student123`
* **Features**: Live GPA lines, weekly study hour bars, recent assignments grade listings, AI predictor parameters dial, advisor counseling chatbot.

### 2. Teacher Portal
* **Email**: `charles@academy.com`
* **Password**: `teacher123`
* **Features**: Class average attendance tracking, risk levels distribution charts, student roster, daily attendance log modal, grade marks poster, weak students alarm page.

### 3. Admin Portal
* **Email**: `admin@aiacademy.com`
* **Password**: `admin123`
* **Features**: Full accounts directory database, docker container status checkers, active DB connection logs, ML model accuracy benchmark tables, dataset upload triggers, model retraining.

---

## Docker Compose Quick Start

### 1. Requirements
Ensure you have Docker and Docker Compose installed:
* [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)

### 2. Launch Stack
Navigate to the root workspace directory and spin up the multi-container configuration:
```bash
docker-compose up --build
```
This builds React static assets, initializes PostgreSQL tables, seeds default databases with mock rosters, trains all ML models, and launches the proxy.

### 3. Open Application
Open your browser and navigate to:
* **Web UI**: [http://localhost](http://localhost)
* **Backend API Swagger**: [http://localhost/api/v1/docs](http://localhost/api/v1/docs) or [http://localhost:8000/docs](http://localhost:8000/docs)
* **ML API Swagger**: [http://localhost:8001/docs](http://localhost:8001/docs)

---

## Verifying Services

### Manual Inspection
1. **Login Check**: Log in as `admin@aiacademy.com` (password `admin123`). Navigate to **Model Control**. Verify that the accuracy matrix loads and matches validation scores.
2. **Retrain Models**: Click **Retrain ML Services** on the Model Control page. Inspect the Docker terminal logs for the `student-ml-service` to confirm compilation runs across XGBoost, Random Forest, etc.
3. **What-If Predictions**: Log in as `jane@student.com` (password `student123`). Navigate to **AI Predictor**. Adjust study hours and attendance sliders, and click **Compute Performance Forecast**. Confirm that the predicted grade gauge displays.
4. **PDF Reports**: In the Student Dashboard, click **Export Progress PDF**. Confirm that a compiled report card is generated and downloaded.
