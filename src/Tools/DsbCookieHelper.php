<?php

namespace App\MobileEntry\Tools;

use App\Cookies\Cookies;
use App\Drupal\Config;
use App\Utils\Host;

class DsbCookieHelper
{
    private $playerSession;

    private $tokenParser;

    private $alsConfig;

    public function __construct($tokenParser, $playerSession, $alsConfig)
    {
        $this->tokenParser = $tokenParser;
        $this->playerSession = $playerSession;
        $this->alsConfig = $alsConfig;
    }

    public function setDafaUrlCookies()
    {
        try {
            $isLogin = $this->playerSession->isLogin();
        } catch (\Exception $e) {
            $isLogin = false;
        }

        $dafaUrlCookies = $this->alsConfig['als_cookie_url_pre'] ?? '';
        if ($isLogin) {
            $dafaUrlCookies = $dafaUrlCookies . $this->alsConfig['als_cookie_url_post'] ?? '';
        }

        $this->setCookie($dafaUrlCookies, $isLogin);
    }

    private function setCookie($cookies, $isLogin)
    {
        if ($cookies) {
            $cookies = $this->tokenParser->processTokens($cookies);
            $cookies = Config::parse($cookies);

            foreach ($cookies as $key => $value) {
                $this->createCookie('create', "dafaUrl[$key]", $value);
            }
        }

        if (!$isLogin) {
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

    public static function dSBCookiesExist()
    {
        return array_key_exists('dafaUrl', $_COOKIE);
    }
}
