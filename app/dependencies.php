<?php

use App\MobileEntry\Dependencies\Manifest;

use App\MobileEntry\Services\CookieService\CookieService;
use App\MobileEntry\Services\Domains\IDDomain;
use App\MobileEntry\Services\Accounts\Accounts;

require APP_ROOT . '/core/app/dependencies.php';

$container['asset_manifest'] = function ($c) {
    return Manifest::create($c);
};

$container['cookie_service'] = function ($c) {
    return CookieService::create($c);
};

$container['id_domain'] = function ($c) {
    return IDDomain::create($c);
};

$container['accounts_service'] = function ($c) {
    return Accounts::create($c);
};

