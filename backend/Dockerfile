# syntax = docker/dockerfile:1.2
FROM php:8.2.9
WORKDIR /app

RUN apt-get update && apt-get install -y git unzip supervisor
RUN docker-php-ext-install pdo pdo_mysql
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

COPY . .

RUN composer install

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 8000

CMD ["/usr/bin/supervisord", "-n"]