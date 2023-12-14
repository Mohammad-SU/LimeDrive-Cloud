# syntax = docker/dockerfile:1.2
FROM php:8.2.9
WORKDIR /app

COPY .user.ini /usr/local/etc/php/conf.d/

RUN apt-get update && apt-get install -y git unzip supervisor nginx
RUN docker-php-ext-install pdo pdo_mysql
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

COPY . .

RUN composer install --optimize-autoloader --no-dev

RUN php artisan config:cache
RUN php artisan route:cache
RUN php artisan view:cache

COPY nginx.conf /etc/nginx/sites-available/default
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-n"]