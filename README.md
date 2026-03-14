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

## Production (Docker)

В репозитории есть отдельный production stack без `vite dev` и без `php artisan serve`.

1. Подготовьте env-файл:

```bash
cp .env.production.example .env.production
```

2. Сгенерируйте `APP_KEY` для Laravel и вставьте в `.env.production`:

```bash
php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
```

3. Укажите адрес сервера и секреты:
- `APP_URL=http://167.172.164.73`
- `LIVEKIT_WS_URL=ws://167.172.164.73/livekit`
- `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD`
- `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`

4. Поднимите стек:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Что поднимется:
- `app` — production image с `nginx + php-fpm`, отдает React SPA и Laravel API
- `db` — MySQL
- `nats` — внутренний NATS с websocket proxy через `/nats`
- `redis` + `livekit` — видео-стек

Открытые порты:
- `80 -> app:8080`
- `7881/tcp` и `7882/udp` для LiveKit media transport

Замечания:
- Для HTTPS заверните `app` в внешний reverse proxy или повесьте TLS на ingress/LB.
- Для текущего IP без TLS используйте `http://167.172.164.73` и `ws://167.172.164.73/livekit`.
- Если позже включите HTTPS и домен, переключите это на `https://...` и `wss://...`.
- NATS websocket в production идет через тот же домен по пути `/nats`, отдельный порт наружу не нужен.

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
