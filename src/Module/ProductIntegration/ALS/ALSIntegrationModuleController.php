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
    private $rest;
    private $parser;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('config_fetcher'),
            $container->get('cookie_service'),
            $container->get('rest'),
            $container->get('token_parser')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $config, $cookieService, $rest, $parser)
    {
        $this->playerSession = $playerSession;
        $this->config = $config;
        $this->cookieService = $cookieService;
        $this->rest = $rest;
        $this->parser = $parser;
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

        $this->setCookie($cookies, $isLogin);

        $data['redirect'] = $this->generateLobby($url, $enableDomain);

        return $this->rest->output($response, $data);
    }

    /**
     * Function to generate ALS domain base on the site domain
     */
    private function generateLobby($url, $enableDomain)
    {
        if ($enableDomain) {
            $domain = Host::getDomainFromUri($url);
            $hostname = Host::getDomain();

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
            $cookies = $this->parser->processTokens($cookies);
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
        $domain = Host::getDomain();

        $options = [
            'path' => '/',
            'domain' => $domain,
            'secure' => true
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
