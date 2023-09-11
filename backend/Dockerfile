# syntax = docker/dockerfile:1.2

FROM php:8.2.9

WORKDIR /app

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN docker-php-ext-install pdo pdo_mysql

RUN --mount=type=secret,id=_env,dst=/etc/secrets/.env

COPY . .

RUN apt-get update && apt-get install -y git zip unzip php-zip

RUN composer install

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host", "0.0.0.0", "--port", "8000"]