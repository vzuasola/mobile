<?php

// Site specific dependencies

require APP_ROOT . '/core/app/dependencies.php';

$container['cookie_service'] = function ($c) {
    $baseUrl = $c->get('request')->getUri()->getBaseUrl();
    $hostname = $c->get('parameters')['appsvc.origin.prd'];

    if (preg_match('/https?:\/\/(?<env>[a-z0-9]+)-mobile/', $baseUrl, $matches)) {
        $hostname = $c->get('parameters')['appsvc.origin.' . $matches['env']];
    }

    $client = new \GuzzleHttp\Client([
        'headers' => [
            'Content-Type' => 'application/x-www-form-urlencoded',
        ],
        'base_uri' => "$hostname:50982",
    ]);

    return new \App\MobileEntry\Services\CookieService\CookieService(
        $client,
        $c->get('logger')
    );
};


$container['iddomain_service'] = function ($c) {
    return \App\MobileEntry\Services\IDDomainService\IDDomainService::create($c);
};
