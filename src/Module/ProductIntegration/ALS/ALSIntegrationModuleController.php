<?php

namespace App\MobileEntry\Module\ProductIntegration\ALS;

use App\Drupal\Config;
use App\Cookies\Cookies;
use App\Utils\Host;

class ALSIntegrationModuleController
{
    private $playerSession;
    private $config;
    private $cookieService;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('config_fetcher'),
            $container->get('cookie_service')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $config, $cookieService)
    {
        $this->playerSession = $playerSession;
        $this->config = $config;
        $this->cookieService = $cookieService;
    }

    /**
     *
     */
    public function integrate($request, $response)
    {
        try {
            $isLogin = $this->playerSession->isLogin();
        } catch (\Exception $e) {
            $isLogin = false;
        }

        try {
            $alsConfig = $this->config->getConfig('mobile_als.als_configuration');
        } catch (\Exception $e) {
            $alsConfig = [];
        }

        $enableDomain = $alsConfig['als_enable_domain'] ?? false;
        $url = $alsConfig['als_url'] ?? '';
        $cookies = $alsConfig['als_cookie_url_pre'] ?? '';

        if ($isLogin) {
            $cookies = $cookies . $alsConfig['als_cookie_url_post'] ?? '';
        }

        $this->setCookie($alsCookies, $isLogin);

        $lobby = $this->generateLobby($url, $enableDomain);

        return $response->withStatus(200)->withHeader('Location', $lobby);
    }

    /**
     * Function to generate ALS domain base on the site domain
     */
    private function generateLobby($url, $enableDomain)
    {
        if ($enableDomain) {
            $domain = Host::getDomainFromUri($url);
            $hostname = Host::getHostname();

            if ($domain !== $hostname) {
                $url = str_replace($domain, $hostname, $url);
            }
        }

        return $url;
    }

    /**
     *
     */
    private function setCookie($cookies, $isLogin)
    {
        if ($cookies) {
            $cookies = Config::parse($cookies);

            foreach ($cookies as $key => $value) {
                $this->createCookie('create', "dafaUrl[$key]", $value);
            }
        }

        if ($isLogin) {
            $this->dsbLogin();
        } else {
            $this->createCookie('destroy', 'extToken');
            $this->createCookie('destroy', 'extCurrency');
        }
    }

    /**
     * Helper function for creating or destroying a cookie
     */
    private function createCookie($action, $name, $value = '')
    {
        $domain = Host::getHostname();

        $options = [
            'path' => '/',
            'domain' => $domain,
        ];

        if ($action == 'create') {
            $options['expire'] = 0;
        }

        if ($action == 'destroy') {
            $options['expire'] = time() - 3600;
        }

        Cookies::set($name, $value, $options);
    }

    /**
     * Share session JWT via cookie
     */
    private function dsbLogin()
    {
        try {
            $playerDetails = $this->playerSession->getDetails();
            $token = $this->playerSession->getToken();
        } catch (\Exception $e) {
            $playerDetails = [];
            $token = false;
        }

        if ($playerDetails && $token) {
            $result = $this->cookieService->cut([
                'username' => $playerDetails['username'],
                'playerId' => $playerDetails['playerId'],
                'sessionToken' => $token,
            ]);

            $options = [
                'path' => '/',
                'domain' => Host::getDomain(),
            ];

            Cookies::set('extToken', $result['jwt'], $options);
            Cookies::set('extCurrency', $playerDetails['currency'], $options);
        }
    }
}
