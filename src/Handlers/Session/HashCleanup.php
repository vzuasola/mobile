<?php

namespace App\MobileEntry\Handlers\Session;

use App\Cookies\Cookies;

/**
 *
 */
class HashCleanup
{
    /**
     *
     */
    public function __invoke()
    {
        Cookies::remove('routerhash', [
            'path' => '/'
        ]);
    }
}
