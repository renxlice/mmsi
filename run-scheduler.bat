@echo off
cd /d C:\laragon\www\mmsi
php artisan schedule:run >> NUL 2>&1