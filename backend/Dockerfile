# syntax = docker/dockerfile:1.2
FROM php:8.2.9
WORKDIR /app
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN docker-php-ext-install pdo pdo_mysql
RUN --mount=type=secret,id=_env,dst=/etc/secrets/.env
COPY . .
RUN apt-get update && apt-get install -y git zip unzip cron supervisor
RUN composer install
EXPOSE 8000

RUN touch /etc/cron.d/laravelschedule
RUN echo "* * * * * root php /app/artisan schedule:run >> /var/log/cron.log 2>&1" > /etc/cron.d/laravelschedule

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

CMD ["/usr/bin/supervisord", "-n"]