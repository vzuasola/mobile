<?php

use App\MobileEntry\Dependencies\Manifest;

use App\MobileEntry\Services\CookieService\CookieService;
use App\MobileEntry\Services\Domains\IDDomain;
use App\MobileEntry\Services\Accounts\Accounts;
use App\MobileEntry\Services\Tournament\TournamentService;
use App\MobileEntry\Services\Currency\CurrencyTranslation;
use App\MobileEntry\Services\Product\ProductResolver;
use App\MobileEntry\Component\Main\CantLogin\RateLimit;

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

$container['product_resolver'] = function ($c) {
    return ProductResolver::create($c);
};

$container['currency_translation'] = function ($c) {
    return CurrencyTranslation::create($c);
};

$container['rate_limit'] = function ($c) {
    return RateLimit::create($c);
};
