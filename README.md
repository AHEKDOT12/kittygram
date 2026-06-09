# Kittygram

Kittygram — учебное full-stack веб-приложение для ведения личного каталога котиков. Пользователь может зарегистрироваться, войти в аккаунт, добавить котиков, редактировать их данные, загружать фотографии, назначать достижения и удалять собственные записи.

## Стек технологий

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
- localStorage для хранения токена

## Возможности

- Регистрация и аутентификация пользователей.
- Вход и выход по токену через Djoser.
- Получение списка котиков текущего пользователя.
- Создание, редактирование и удаление котиков.
- Назначение достижений котикам.
- Повторное использование достижений по названию.
- Загрузка фотографий с frontend в формате base64.
- Раздача загруженных media-файлов в режиме разработки.

## Структура проекта

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

## Локальный запуск

Backend и frontend запускаются в двух отдельных терминалах.

### Backend

Откройте терминал в VS Code и выполните:

```powershell
cd C:\work-django\kitty-gram\backend
.\venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

Backend API будет доступен по адресу:

```text
http://127.0.0.1:8000/api/
```

Адрес `http://127.0.0.1:8000/` возвращает `404 Page not found`, потому что корневой URL backend не используется приложением.

### Frontend

Откройте второй терминал в VS Code и выполните:

```powershell
cd C:\work-django\kitty-gram\frontend
npm.cmd run dev
```

Frontend будет доступен по адресу:

```text
http://127.0.0.1:3000/
```

Именно этот адрес нужно открыть в браузере для регистрации, входа и работы с приложением.

## Настройка backend с нуля

Если виртуальное окружение отсутствует, создайте и подготовьте его:

```powershell
cd C:\work-django\kitty-gram\backend
python -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe manage.py migrate
```

Дополнительно можно загрузить тестовые данные:

```powershell
.\venv\Scripts\python.exe manage.py seed
```

Дополнительно можно создать администратора:

```powershell
.\venv\Scripts\python.exe manage.py createsuperuser
```

## Настройка frontend с нуля

Если зависимости не установлены:

```powershell
cd C:\work-django\kitty-gram\frontend
npm.cmd install
```

Сборка production-версии:

```powershell
npm.cmd run build
```

## API endpoints

### Аутентификация

```text
POST /api/users/
POST /api/token/login/
POST /api/token/logout/
GET  /api/users/me/
```

### Котики

```text
GET    /api/cats/
POST   /api/cats/
GET    /api/cats/{id}/
PATCH  /api/cats/{id}/
DELETE /api/cats/{id}/
```

### Достижения

```text
GET    /api/achievements/
POST   /api/achievements/
GET    /api/achievements/{id}/
PATCH  /api/achievements/{id}/
DELETE /api/achievements/{id}/
```

Для защищённых endpoints требуется токен:

```text
Authorization: Token <token>
```

## Пример payload для создания котика

```json
{
  "name": "Barsik",
  "color": "#c8ff3b",
  "birth_year": 2020,
  "achievements": [
    { "name": "Ловит мышей" },
    { "name": "Спит 20 часов" }
  ],
  "image": "data:image/png;base64,..."
}
```

## OpenAPI schema

Генерация схемы:

```powershell
cd C:\work-django\kitty-gram\backend
.\venv\Scripts\python.exe manage.py generateschema > schema.yaml
```

## Решение частых проблем

### PowerShell блокирует активацию виртуального окружения

Если команда завершается ошибкой:

```powershell
.\venv\Scripts\Activate.ps1
```

запускайте Python напрямую из виртуального окружения:

```powershell
.\venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

### Frontend показывает Network Error

Убедитесь, что оба сервера запущены:

- Backend: `http://127.0.0.1:8000/api/`
- Frontend: `http://127.0.0.1:3000/`

Frontend отправляет API-запросы на `http://127.0.0.1:8000/api`. Если терминал backend закрыт, регистрация, вход и остальные API-запросы завершатся сетевой ошибкой.
