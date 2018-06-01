<?php

namespace App\MobileEntry\Module\Tracking;

use App\Slim\Response;
use App\Cookies\Cookies;

class TrackingModuleCache
{
    /**
     *
     */
    public static function processResponseCache($request, $response)
    {
        $cookies = static::getCookies();

        $attributes = $response->getAttribute(TrackingModule::class);
        $affiliates = $attributes['views.affiliates'] ?? [];

        $time = $config['affiliate_expiration'] ?? 60;
        $config = $attributes['webcomposer_config.affiliate_configuration'] ?? [];

        $params = $request->getParams();

        foreach ($params as $key => $value) {
            if (isset($affiliates[$key])) {
                $cookies[$key] = $value;
            }
        }

        if (!empty($cookies)) {
            Cookies::set('affiliates', http_build_query($cookies), [
                'expire' => time() + ($time * 60),
                'http' => false,
                'path' => '/',
            ]);
        }
    }

    /**
     *
     */
    private static function getCookies()
    {
        $cookies = [];
        $store = Cookies::get('affiliates');

        if (!empty($store)) {
            try {
                // Check the affiliates cookie if it's an array
                // This will prevent any PHP warning
                $store = is_array($store) ? $store[0] : $store;

                parse_str($store, $output);
                $cookies = $output;
            } catch (\Exception $e) {
                // do nothing
            }
        }

        return $cookies;
    }
}
