#!/bin/sh
set -eu

cd /var/www/backend

if [ -z "${APP_KEY:-}" ]; then
  echo "APP_KEY is required" >&2
  exit 1
fi

mkdir -p storage/framework/cache/data
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/logs
mkdir -p bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache

if [ ! -L public/storage ]; then
  php artisan storage:link --no-interaction || true
fi

php artisan migrate --force --no-interaction
php artisan config:cache --no-interaction
php artisan route:cache --no-interaction
php artisan view:cache --no-interaction

php-fpm -D
exec nginx -g 'daemon off;'

