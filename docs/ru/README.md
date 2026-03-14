# CashFlow — Описание проекта

Краткое описание
- CashFlow — бэкенд игрового сервиса на Laravel (PHP). Предоставляет API для создания игровых комнат, управления игроками, синхронизации состояния игры и интеграции с Janus (видеокомнаты) и NATS (события).

Требования
- PHP 8.x, Composer
- MySQL / PostgreSQL
- Redis (опционально для очередей)
- Janus (опционально для видеокомнат)
- NATS сервер (опционально для Pub/Sub)

Быстрый старт (macOS)
1. Клонировать репозиторий:
   - git clone <repo> /Users/bellissimopizza/Desktop/CashFlow
2. Установить зависимости:
   - cd /Users/bellissimopizza/Desktop/CashFlow
   - composer install
3. Настроить окружение:
   - cp .env.example .env
   - Отредактировать .env (DB_*, JANUS_*, NATS_*)
   - php artisan key:generate
4. Миграции и сиды:
   - php artisan migrate --seed
5. Запустить локально:
   - php artisan serve --host=127.0.0.1 --port=8000

Архитектура (коротко)
- app/Http/Controllers — контроллеры API (включая RoomController).
- app/Models — модели: GameRoom, GameRoomPlayer, RoomParticipant.
- app/Services — внешние интеграции: JanusService, NatsPublisher.
- routes/api.php — публичные эндпоинты API.
- docs/ru — документация.

Основные API-эндпоинты (пример)
- POST /api/rooms — создать комнату (авто-добавление хоста).
- GET /api/rooms/{code} — получить информацию о комнате.
- POST /api/rooms/{code}/join — присоединиться к комнате.
- POST /api/rooms/{code}/leave — покинуть комнату.
- PATCH /api/rooms/{code}/player — обновить свои данные (имя, профессия).
- POST /api/rooms/{code}/ready — переключить ready.
- POST /api/rooms/{code}/start — старт игры (только хост).
- GET /api/rooms/{code}/state?v={version} — поллинг состояния игры.
- POST /api/rooms/{code}/action — отправить действие (обновить state).

Ключевые моменты реализации
- Оптимистичная блокировка состояния через state_version (контроль версий при submitAction).
- При выходе игрока во время игры — синхронизация game_state (nextLogId, перераспределение индексов).
- Интеграция с Janus: создание/удаление видеокомнаты при старте/удалении комнаты.
- Паблиш событий через NATS для реального времени уведомлений.

Конфигурация Janus и NATS
- Настройки находятся в .env (HOST/PORT/SECRET...) и config-провайдерах/файлах.
- Если Janus недоступен — стартер игры продолжает работу, логирует предупреждение.

Тесты
- tests/Feature — интеграционные тесты для API.
- Запуск: ./vendor/bin/phpunit

Отладка и распространённые проблемы
- 409 Version conflict — клиент отправил несовпадающую версию state_version.
- При ошибках Janus — проверьте сеть и конфигурацию JANUS_ в .env.
- Если комната удаляется при выходе хоста — так задумано, если игроков больше нет.

Контакты и дальнейшее
- Файлы сервисов: app/Services/JanusService.php и NatsPublisher.php — смотреть реализацию для деталей интеграции.
- Для изменений в логике игры — править сериализуемый game_state в базе (поле game_state модели GameRoom).

```// filepath: /Users/bellissimopizza/Desktop/CashFlow/docs/ru/README.md

# CashFlow — Описание проекта

Краткое описание
- CashFlow — бэкенд игрового сервиса на Laravel (PHP). Предоставляет API для создания игровых комнат, управления игроками, синхронизации состояния игры и интеграции с Janus (видеокомнаты) и NATS (события).

Требования
- PHP 8.x, Composer
- MySQL / PostgreSQL
- Redis (опционально для очередей)
- Janus (опционально для видеокомнат)
- NATS сервер (опционально для Pub/Sub)

Быстрый старт (macOS)
1. Клонировать репозиторий:
   - git clone <repo> /Users/bellissimopizza/Desktop/CashFlow
2. Установить зависимости:
   - cd /Users/bellissimopizza/Desktop/CashFlow
   - composer install
3. Настроить окружение:
   - cp .env.example .env
   - Отредактировать .env (DB_*, JANUS_*, NATS_*)
   - php artisan key:generate
4. Миграции и сиды:
   - php artisan migrate --seed
5. Запустить локально:
   - php artisan serve --host=127.0.0.1 --port=8000

Архитектура (коротко)
- app/Http/Controllers — контроллеры API (включая RoomController).
- app/Models — модели: GameRoom, GameRoomPlayer, RoomParticipant.
- app/Services — внешние интеграции: JanusService, NatsPublisher.
- routes/api.php — публичные эндпоинты API.
- docs/ru — документация.

Основные API-эндпоинты (пример)
- POST /api/rooms — создать комнату (авто-добавление хоста).
- GET /api/rooms/{code} — получить информацию о комнате.
- POST /api/rooms/{code}/join — присоединиться к комнате.
- POST /api/rooms/{code}/leave — покинуть комнату.
- PATCH /api/rooms/{code}/player — обновить свои данные (имя, профессия).
- POST /api/rooms/{code}/ready — переключить ready.
- POST /api/rooms/{code}/start — старт игры (только хост).
- GET /api/rooms/{code}/state?v={version} — поллинг состояния игры.
- POST /api/rooms/{code}/action — отправить действие (обновить state).

Ключевые моменты реализации
- Оптимистичная блокировка состояния через state_version (контроль версий при submitAction).
- При выходе игрока во время игры — синхронизация game_state (nextLogId, перераспределение индексов).
- Интеграция с Janus: создание/удаление видеокомнаты при старте/удалении комнаты.
- Паблиш событий через NATS для реального времени уведомлений.

Конфигурация Janus и NATS
- Настройки находятся в .env (HOST/PORT/SECRET...) и config-провайдерах/файлах.
- Если Janus недоступен — стартер игры продолжает работу, логирует предупреждение.

Тесты
- tests/Feature — интеграционные тесты для API.
- Запуск: ./vendor/bin/phpunit

Отладка и распространённые проблемы
- 409 Version conflict — клиент отправил несовпадающую версию state_version.
- При ошибках Janus — проверьте сеть и конфигурацию JANUS_ в .env.
- Если комната удаляется при выходе хоста — так задумано, если игроков больше нет.

Контакты и дальнейшее
- Файлы сервисов: app/Services/JanusService.php и NatsPublisher.php — смотреть реализацию для деталей интеграции.
- Для изменений в логике игры — править сериализуемый game_state в базе

LiveKit (аудио/видео)
- Что это: LiveKit — современный сервер и набор SDK для WebRTC (SFU), который позволяет организовать аудио/видео-соединения для участников комнаты (веб/мобайл).
- Зачем в проекте: можно использовать вместо/параллельно Janus для упрощённой работы с токенами, записью, масштабируемостью и нативными клиентскими SDK.

Конфигурация
- Переменные окружения (.env):
  - LIVEKIT_URL — адрес сервера LiveKit (например https://livekit.example.com).
  - LIVEKIT_API_KEY — серверный ключ.
  - LIVEKIT_API_SECRET — секрет для подписи токенов.
  - (опционально) LIVEKIT_ROOM_PREFIX — префикс для имен комнат (например cashflow-).

Как интегрируется (общий поток)
1. На старте игры (RoomController::startGame) бэкенд:
   - формирует имя комнаты LiveKit (например cashflow-{code} или по janus_room_id),
   - при необходимости создаёт комнату через REST/SDK LiveKit (необязательно: LiveKit может создать комнату при первом подключении клиента),
   - генерирует краткоживущий join-token для каждого участника (серверная генерация токена обязана выполняться безопасно с API_KEY/API_SECRET).
2. Токен передаётся клиенту:
   - напрямую в ответе API (например в payload game_started) или
   - через NATS-сообщение (roomEvent) — клиент подписан и получает токен.
3. Клиенты (Web/Android/iOS) используют LiveKit SDK и полученный токен для подключения к комнате LiveKit_URL.
4. События подключений/отключений/публикации медиапотоков:
   - можно обрабатывать через LiveKit webhooks или через SDK/админ-API,
   - при поступлении webhook обновлять RoomParticipant в базе и публично пушить события через NATS (чтобы синхронизировать состояние в клиентских приложениях).

Рекомендации по безопасности
- Токены генерировать только на сервере, делать короткий TTL (несколько минут).
- В payload токена включать метаданные: user_id, player_index, displayName и права (publish/subscribe).
- Не раскрывать LIVEKIT_API_SECRET в клиентском коде.

Примерная схема действий для разработчика (коротко)
- Добавить переменные в .env и config/livekit.php (опционально).
- Реализовать endpoint /api/rooms/{code}/livekit-token, который:
  - проверяет, что запрашивающий пользователь — участник комнаты,
  - генерирует token через SDK или JWT-библиотеку и возвращает его.
- Подписать NATS-события/вебхуки LiveKit для синхронизации RoomParticipant -> is_streaming.
- Обновить RoomController::startGame, чтобы вместе с janus_room_id отправлять (или по запросу выдавать) livekit_room и/или токены.

Переход с Janus на LiveKit (заметки)
- JanusService можно оставить для совместимости, но при переходе заменить вызовы создания/удаления комнат на LiveKit API.
- Логика сопоставления комнат (код игры -> имя комнаты) должна быть единой, чтобы клиенты знали, куда подключаться.

Где смотреть дальше
- Официальная документация LiveKit: https://docs.livekit.io
- Примеры серверной генерации токенов — в SDK LiveKit (рекомендуется использовать официальный SDK на сервере или надёжную JWT-библиотеку для выбранного языка).