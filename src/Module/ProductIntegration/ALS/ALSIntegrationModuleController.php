<?php

namespace App\MobileEntry\Module\ProductIntegration\ALS;

use App\Drupal\Config;
use App\Cookies\Cookies;
use App\Utils\Host;

class ALSIntegrationModuleController
{
    private $playerSession;
    private $config;
    private $rest;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('config_fetcher'),
            $container->get('rest')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $config, $rest)
    {
        $this->playerSession = $playerSession;
        $this->config = $config;
        $this->rest = $rest;
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
        return $response->withStatus(200)->withHeader('Location', $this->generateLobby($alsUrl));
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
        $domain = $this->alsDomain();
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
     * Function to get domain of the base url
     */
    private function alsDomain($url = '')
    {
        $baseUrl = Host::getDomain();
        $domain = '';
        $path = empty($url) ? $baseUrl : $url;
        $parts = parse_url($path);
        if (isset($parts['host']) && !empty($parts['host'])) {
            $segments = explode('.', $parts['host']);
            if (count($segments) < 2) {
                return $parts['host'];
            }
            // Remove the subdomain
            unset($segments[0]);

            $domain = implode('.', $segments);
        }
        return $domain;
    }

    /**
     * Function to generate ALS domain base on the site domain
     */
    private function generateLobby($alsUrl)
    {
        $dfbtAlsUrl = $alsUrl;

        // if (variable_get('als_integration_domain_mapping', 1)) {
        //     $als_domain = $this->alsDomain($dfbtAlsUrl);
        //     $website_domain = $this->alsDomain();
        //     if ($als_domain == $website_domain) {
        //         return $dfbtAlsUrl;
        //     }
        //     return str_replace($als_domain, $website_domain, $dfbtAlsUrl);
        // }
        return $dfbtAlsUrl;
    }
}
