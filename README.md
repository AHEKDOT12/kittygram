# Kittygram

Kittygram is a training full-stack web application for managing a personal catalog of cats. Users can register, log in, add cats, edit their data, upload photos, assign achievements, and delete their own records.

## Technology Stack

### Backend

- Python
- Django
- Django REST Framework
- Djoser
- Token Authentication
- django-cors-headers
- Pillow
- SQLite

### Frontend

- React
- Vite
- CSS
- localStorage for token storage

## Features

- User registration and authentication.
- Token-based login and logout through Djoser.
- Listing cats owned by the current authenticated user.
- Creating, editing, and deleting cats.
- Assigning achievements to cats.
- Reusing achievements by name.
- Uploading cat photos from the frontend as base64 images.
- Serving uploaded media files in development mode.

## Project Structure

```text
kitty-gram/
+-- backend/
|   +-- api/
|   +-- cats/
|   +-- kittygram_backend/
|   +-- manage.py
|   +-- requirements.txt
|   +-- schema.yaml
+-- frontend/
|   +-- public/
|   +-- src/
|   +-- index.html
|   +-- package.json
|   +-- package-lock.json
+-- .gitignore
+-- README.md
```

## Local Development

The backend and frontend must be started in separate terminals.

### Backend

Open a terminal in VS Code and run:

```powershell
cd C:\work-django\kitty-gram\backend
.\venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

The backend API will be available at:

```text
http://127.0.0.1:8000/api/
```

Opening `http://127.0.0.1:8000/` directly returns `404 Page not found` because the backend root URL is not used by the application.

### Frontend

Open a second terminal in VS Code and run:

```powershell
cd C:\work-django\kitty-gram\frontend
npm.cmd run dev
```

The frontend will be available at:

```text
http://127.0.0.1:3000/
```

Use this address to register, log in, and work with the application.

## Backend Setup From Scratch

If the virtual environment does not exist, create and prepare it:

```powershell
cd C:\work-django\kitty-gram\backend
python -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe manage.py migrate
```

Optional seed data:

```powershell
.\venv\Scripts\python.exe manage.py seed
```

Optional superuser:

```powershell
.\venv\Scripts\python.exe manage.py createsuperuser
```

## Frontend Setup From Scratch

If dependencies are not installed:

```powershell
cd C:\work-django\kitty-gram\frontend
npm.cmd install
```

Build production assets:

```powershell
npm.cmd run build
```

## API Endpoints

### Authentication

```text
POST /api/users/
POST /api/token/login/
POST /api/token/logout/
GET  /api/users/me/
```

### Cats

```text
GET    /api/cats/
POST   /api/cats/
GET    /api/cats/{id}/
PATCH  /api/cats/{id}/
DELETE /api/cats/{id}/
```

### Achievements

```text
GET    /api/achievements/
POST   /api/achievements/
GET    /api/achievements/{id}/
PATCH  /api/achievements/{id}/
DELETE /api/achievements/{id}/
```

Protected endpoints require a token:

```text
Authorization: Token <token>
```

## Example Cat Payload

```json
{
  "name": "Barsik",
  "color": "#c8ff3b",
  "birth_year": 2020,
  "achievements": [
    { "name": "Catches mice" },
    { "name": "Sleeps 20 hours" }
  ],
  "image": "data:image/png;base64,..."
}
```

## OpenAPI Schema

Generate the schema:

```powershell
cd C:\work-django\kitty-gram\backend
.\venv\Scripts\python.exe manage.py generateschema > schema.yaml
```

## Troubleshooting

### PowerShell blocks virtual environment activation

If this command fails:

```powershell
.\venv\Scripts\Activate.ps1
```

run Python directly from the virtual environment instead:

```powershell
.\venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

### Frontend shows Network Error

Make sure both servers are running:

- Backend: `http://127.0.0.1:8000/api/`
- Frontend: `http://127.0.0.1:3000/`

The frontend sends API requests to `http://127.0.0.1:8000/api`. If the backend terminal is closed, authentication and API requests will fail with a network error.
