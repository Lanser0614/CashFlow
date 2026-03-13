# Cash Flow 101

Браузерная настольная игра Cash Flow 101 (Роберт Кийосаки). Русский интерфейс, локальный и онлайн мультиплеер на 1–6 игроков.

## Структура проекта

```
├── apps/
│   ├── frontend/        # React + Vite + TypeScript + Tailwind CSS
│   └── backend/         # Laravel 10 (PHP 8.2) + MySQL
├── docker/
│   ├── frontend/Dockerfile
│   └── backend/Dockerfile
└── docker-compose.yml
```

## Быстрый старт (Docker)

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- MySQL: localhost:3306

## Локальная разработка

### Frontend

```bash
cd apps/frontend
npm install
npm run dev
```

### Backend

```bash
cd apps/backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

## Стек

**Frontend:** Vite 7, React 19, TypeScript, Tailwind CSS 3, Zustand 5, Framer Motion

**Backend:** Laravel 10, PHP 8.2, MySQL 8.4, Sanctum
