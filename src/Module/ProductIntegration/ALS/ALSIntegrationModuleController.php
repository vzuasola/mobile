<?php

namespace App\MobileEntry\Module\ProductIntegration\ALS;

use App\Drupal\Config;
use App\Cookies\Cookies;
use App\Utils\Host;

class ALSIntegrationModuleController
{
    private $playerSession;
    private $config;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $config)
    {
        $this->playerSession = $playerSession;
        $this->config = $config;
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
            $this->setCookie($alsCookies);
        } catch (\Exception $e) {
            $data['lobby_url'] = '';
        }
        return $response->withStatus(200)->withHeader('Location', $this->generateLobby($alsUrl, $alsEnableDomain));
    }


    private function setCookie($cookies)
    {
        if ($cookies) {
            $cookies = Config::Parse($cookies);
            foreach ($cookies as $key => $value) {
                $this->createCookie('create', 'dafaUrl[' . $key . ']', $value);
            }
        }
    }

    /**
     * Helper function for creating or destroying a cookie.
     */
    private function createCookie($action, $name, $value = '')
    {
        $domain = Host::getHostname();
        switch ($action) {
            case 'create':
                Cookies::set($name, $value, [
                    'expire' => 0,
                    'path' => '/',
                    'domain' => $domain,
                    'secure' => false,
                    'http' => false,
                ]);
                break;

            case 'destroy':
                Cookies::set($name, $value, [
                    'expire' => time() - 3600,
                    'path' => '/',
                    'domain' => $domain,
                    'secure' => false,
                    'http' => false,
                ]);
                break;
        }
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
}
