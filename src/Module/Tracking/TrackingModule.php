<?php

namespace App\MobileEntry\Module\Tracking;

use App\Cookies\Cookies;
use App\Plugins\ComponentWidget\ComponentModuleInterface;

class TrackingModule implements ComponentModuleInterface
{
    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('views_fetcher'),
            $container->get('request')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($views, $request)
    {
        $this->views = $views;
        $this->request = $request;
    }

    public function init()
    {
        try {
            $cookies = $this->getCookies();
            $affiliates = $this->views->getViewById('affiliates');

            $params = $this->request->getParams();

            foreach ($params as $key => $value) {
                if (isset($affiliates[$key])) {
                    $cookies[$key] = $value;
                }
            }

            if (!empty($cookies)) {
                Cookies::set('affiliates', http_build_query($cookies), [
                    'http' => false,
                    'path' => '/',
                ]);
            }
        } catch (\Exception $e) {
                // do nothing
        }
    }

    /**
     *
     */
    private function getCookies()
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
