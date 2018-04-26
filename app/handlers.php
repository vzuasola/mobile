<?php
use App\MobileEntry\Controller\ExceptionController;

require APP_ROOT . '/core/app/handlers.php';

$container['notFoundHandler'] = function ($c) {
    return function ($request, $response) use ($c) {
        return $c['resolver'][ExceptionController::class]->exceptionNotFound($request, $response);
    };
};

/**
 * Handler for 500 requests
 */
$container['errorHandler'] = function ($c) {
    return function ($request, $response, $exception) use ($c) {
        return $c['resolver'][ExceptionController::class]
                ->exceptionInternal($request, $response, $exception);
    };
};

/**
 * Handler for 500 requests
 */
$container['phpErrorHandler'] = function ($c) {
    return function ($request, $response, $exception) use ($c) {
        return $c['resolver'][ExceptionController::class]
               ->exceptionInternal($request, $response, $exception);
    };
};
