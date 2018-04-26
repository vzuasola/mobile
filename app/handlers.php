<?php

require APP_ROOT . '/core/app/handlers.php';

$container['notFoundHandler'] = function ($c) {
    return function ($request, $response) use ($c) {
        $controller = $c['resolver']['App\MobileEntry\Controller\ExceptionController'];
        return $controller->exceptionNotFound($request, $response);
    };
};

/**
 * Handler for 500 requests
 */
$container['errorHandler'] = function ($c) {
    return function ($request, $response, $exception) use ($c) {
        $controller = $c['resolver']['App\MobileEntry\Controller\ExceptionController'];
        return $controller->exceptionInternal($request, $response, $exception);
    };
};

/**
 * Handler for 500 requests
 */
$container['phpErrorHandler'] = function ($c) {
    return function ($request, $response, $exception) use ($c) {
        $controller = $c['resolver']['App\MobileEntry\Controller\ExceptionController'];
        return $controller->exceptionInternal($request, $response, $exception);
    };
};
