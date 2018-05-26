<?php

use App\MobileEntry\Services\CookieService\CookieService;
use App\MobileEntry\Services\Domains\IDDomain;

require APP_ROOT . '/core/app/dependencies.php';

$container['cookie_service'] = function ($c) {
    return CookieService::create($c);
};

$container['id_domain'] = function ($c) {
    return IDDomain::create($c);
};
