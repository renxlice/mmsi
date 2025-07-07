<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// ✅ Maintenance Mode Check
if (file_exists(__DIR__.'/../laravel/storage/framework/maintenance.php')) {
    require __DIR__.'/../laravel/storage/framework/maintenance.php';
}

// ✅ Autoloader
require __DIR__.'/../laravel/vendor/autoload.php';

// ✅ Bootstrap Laravel
$app = require_once __DIR__.'/../laravel/bootstrap/app.php';

// ✅ Handle Request
$kernel = $app->make(Kernel::class);
$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
