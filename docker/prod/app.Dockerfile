FROM node:20-alpine AS frontend-builder

ARG VITE_NATS_WS_URL=

WORKDIR /app/frontend

COPY apps/frontend/package.json apps/frontend/package-lock.json ./
RUN npm ci

COPY apps/frontend/ ./

ENV VITE_NATS_WS_URL=${VITE_NATS_WS_URL}

RUN npm run build


FROM composer:2 AS backend-builder

WORKDIR /app/backend

COPY apps/backend/ ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader


FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
        nginx \
        icu-dev \
        libzip-dev \
        oniguruma-dev \
        unzip \
    && docker-php-ext-install \
        bcmath \
        intl \
        mbstring \
        pdo_mysql \
        zip \
    && rm -rf /var/cache/apk/*

WORKDIR /var/www/backend

COPY --from=backend-builder /app/backend /var/www/backend
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
COPY docker/prod/nginx.conf /etc/nginx/nginx.conf
COPY docker/prod/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
    && mkdir -p /run/nginx /var/lib/nginx/tmp /var/log/nginx \
    && mkdir -p /var/www/backend/storage/framework/cache/data \
    && mkdir -p /var/www/backend/storage/framework/sessions \
    && mkdir -p /var/www/backend/storage/framework/views \
    && mkdir -p /var/www/backend/storage/logs \
    && mkdir -p /var/www/backend/bootstrap/cache \
    && ln -sf /var/www/backend/storage/app/public /var/www/backend/public/storage \
    && chown -R www-data:www-data /var/www/backend/storage /var/www/backend/bootstrap/cache

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

