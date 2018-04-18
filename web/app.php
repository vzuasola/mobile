<?php

// This index file is only used for Development
// Please point to index.php for production environments

require __DIR__ . '/../vendor/autoload.php';
// require '/var/www/Profiler/external/header.php';

$kernel = new \App\Kernel('dev');

$kernel->setConfigRoot(__DIR__ . '/../app/config');
$kernel->setRoutes(__DIR__ . '/../app/routes.php');
$kernel->setSettings(__DIR__ . '/../app/settings.php');
$kernel->setParameters(__DIR__ . '/../app/parameters.php');
$kernel->setDependencies(__DIR__ . '/../app/dependencies.php');
$kernel->setHandlers(__DIR__ . '/../app/handlers.php');
$kernel->setMiddleware(__DIR__ . '/../app/middleware.php');

$kernel->run();
