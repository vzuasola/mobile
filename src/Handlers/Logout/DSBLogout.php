<?php

namespace App\MobileEntry\Handlers\Logout;

use App\Cookies\Cookies;
use App\Utils\Host;

/**
 *
 */
class DSBLogout
{
    /**
     *
     */
    public function __invoke()
    {
        $options = [
            'path' => '/',
            'domain' => Host::getDomain(),
        ];

        Cookies::remove('extToken', $options);
        Cookies::remove('extCurrency', $options);
    }
}
