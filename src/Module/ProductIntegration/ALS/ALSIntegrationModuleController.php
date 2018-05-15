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

    public function integrate($request, $response)
    {
        $data = [];
        $alsUrl = '';

        try {
            $isLogin = $this->playerSession->isLogin();
        } catch (\Exception $e) {
            $isLogin = false;
        }

        try {
            $alsConfig = $this->config
                    ->getConfig('mobile_als.als_configuration');

            $alsEnableDomain = $alsConfig['als_enable_domain'] ?? false;
            $alsUrl = $alsConfig['als_url'] ?? '';
            $alsCookiesPre = $alsConfig['als_cookie_url_pre'] ?? '';
            $alsCookiesPost = '';
            if ($isLogin) {
                $alsCookiesPost = $alsConfig['als_cookie_url_post'] ?? '';
            }
            $alsCookies = $alsCookiesPre . $alsCookiesPost;
            $this->setCookie($alsCookies, $isLogin);
        } catch (\Exception $e) {
            $data['lobby_url'] = '';
        }

        return $response->withStatus(200)->withHeader('Location', $this->generateLobby($alsUrl, $alsEnableDomain));
    }


    private function setCookie($cookies, $isLogin)
    {
        if ($cookies) {
            $cookies = Config::Parse($cookies);
            foreach ($cookies as $key => $value) {
                $this->createCookie('create', 'dafaUrl[' . $key . ']', $value);
            }
        }

        if (!$isLogin) {
            $this->createCookie('destroy', 'extToken');
            $this->createCookie('destroy', 'extCurrency');
        }

        if ($isLogin) {
            $this->dsbLogin();
        }
    }

    /**
     * Helper function for creating or destroying a cookie.
     */
    private function createCookie($action, $name, $value = '')
    {
        $domain = Host::getHostname();
        $options = [
            'path' => '/',
            'domain' => $domain,
            'secure' => false,
            'http' => false,
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
     * Function to generate ALS domain base on the site domain
     */
    private function generateLobby($alsUrl, $alsEnableDomain)
    {
        if ($alsEnableDomain) {
            $alsDomain = Host::getDomainFromUri($alsUrl);
            $websiteDomain = Host::getHostname();
            if ($alsDomain == $websiteDomain) {
                return $alsUrl;
            }
            return str_replace($alsDomain, $websiteDomain, $alsUrl);
        }
        return $alsUrl;
    }

    /**
     * Share session JWT via cookie
     */
    private function dsbLogin()
    {
        try {
            $playerDetails = $this->playerSession->getDetails();

            $result = $this->cookieService->cut([
                'username' => $playerDetails['username'],
                'playerId' => $playerDetails['playerId'],
                'sessionToken' => $this->playerSession->getToken(),
            ]);

            $options = [
                'expire' => 0,
                'path' => '/',
                'domain' => Host::getDomain(),
                'secure' => false,
                'http' => false, // They need to read the cookie via javascript.
            ];

            Cookies::set('extToken', $result['jwt'], $options);
            Cookies::set('extCurrency', $playerDetails['currency'], $options);
        } catch (\Exception $e) {
            // Do nothing
        }
    }
}
