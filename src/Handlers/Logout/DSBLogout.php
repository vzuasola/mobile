<?php

namespace App\MobileEntry\Handlers\Logout;

use App\Cookies\Cookies;
use App\Utils\Host;

/**
 * Handles setting of legacy credentials into the session
 */
class DSBLogout
{
    /**
     * Destroy JWT cookie session
     */
    public function __invoke()
    {
        try {
            $options = [
                'path' => '/',
                'domain' => Host::getDomain(),
            ];

            Cookies::remove('extToken', $options);
            Cookies::remove('extCurrency', $options);
        } catch (\Exception $e) {

        }
    }
}
