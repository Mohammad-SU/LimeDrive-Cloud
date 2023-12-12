# syntax = docker/dockerfile:1.2
FROM php:8.2.9
WORKDIR /app

RUN apt-get update && apt-get install -y git unzip supervisor nginx
RUN docker-php-ext-install pdo pdo_mysql
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN curl https://rclone.org/install.sh | bash

COPY rclone.conf /root/.config/rclone/rclone.conf

COPY .user.ini /usr/local/etc/php/conf.d/

COPY . .

COPY nginx.conf /etc/nginx/sites-available/default

RUN composer install --optimize-autoloader --no-dev

RUN php artisan config:cache
RUN php artisan route:cache
RUN php artisan view:cache

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 10000

CMD ["/usr/bin/supervisord", "-n"]