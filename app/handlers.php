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

        $c->get('logger')->critical('error_handler', [
            'exception' => (string) $exception,
        ]);

        return $controller->exceptionInternal($request, $response, $exception);
    };
};

/**
 * Handler for 500 requests
 */
$container['phpErrorHandler'] = function ($c) {
    return function ($request, $response, $exception) use ($c) {
        $controller = $c['resolver']['App\MobileEntry\Controller\ExceptionController'];

        $c->get('logger')->critical('php_error_handler', [
            'exception' => (string) $exception,
        ]);

        return $controller->exceptionInternal($request, $response, $exception);
    };
};

$container['event_legacy_login_success'] = function ($c) {
    return function ($request, $response, $token) use ($c) {
        $destination = $c->get('uri')->generateFromRequest($request, $request->getUri()->getPath(), []);

        // remove only token from the query parameters to preserve other
        // queries
        $params = $request->getQueryParams();
        unset($params['token']);

        $query = http_build_query($params);

        if (!empty($query)) {
            $destination = "$destination?$query";
        }

        return $response->withStatus(302)->withHeader('Location', $destination);
    };
};

$container['event_legacy_login_failed'] = function ($c) {
    return function ($request, $response) use ($c) {
        $destination = $c->get('uri')->generateFromRequest($request, $request->getUri()->getPath(), []);

        // remove only token from the query parameters to preserve other
        // queries
        $params = $request->getQueryParams();
        unset($params['token']);

        $query = http_build_query($params);

        if (!empty($query)) {
            $destination = "$destination?$query";
        }

        return $response->withStatus(302)->withHeader('Location', $destination);
    };
};

$container['event_unsupported_currency'] = function ($c) {
    return function ($request, $response) use ($c) {
        $response = $response->withStatus(403);
        return $c['resolver']['App\MobileEntry\Controller\AccessController']
            ->unsupportedCurrency($request, $response);
    };
};
