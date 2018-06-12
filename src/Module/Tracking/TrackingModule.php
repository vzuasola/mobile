<?php

namespace App\MobileEntry\Module\Tracking;

use App\Slim\Response;
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
            $container->get('config_fetcher'),
            $container->get('request')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($views, $configs, $request)
    {
        $this->views = $views;
        $this->configs = $configs;
        $this->request = $request;
    }

    /**
     *
     */
    public function processRequest($request, &$response)
    {
        $cookies = $this->getCookies();

        try {
            $affiliates = $this->views->getViewById('affiliates');
        } catch (\Exception $e) {
            $affiliates = [];
        }

        try {
            $config = $this->configs->getConfig('webcomposer_config.affiliate_configuration');
        } catch (\Exception $e) {
            $config = [];
        }

        $response = $response->withAttribute(__CLASS__, [
            'views.affiliates' => $affiliates,
            'webcomposer_config.affiliate_configuration' => $config,
        ]);

        $params = $this->request->getParams();

        foreach ($params as $key => $value) {
            if (isset($affiliates[$key])) {
                $cookies[$key] = $value;
            }
        }

        $time = $config['affiliate_expiration'] ?? 60;

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
