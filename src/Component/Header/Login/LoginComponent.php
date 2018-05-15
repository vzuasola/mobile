<?php

namespace App\MobileEntry\Component\Header\Login;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class LoginComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($configs, $playerSession)
    {
        $this->configs = $configs;
        $this->playerSession = $playerSession;
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Header/Login/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        try {
            $headerConfigs = $this->configs->getConfig('webcomposer_config.header_configuration');
        } catch (\Exception $e) {
            $headerConfigs = [];
        }

        $data['join_now_text'] = $headerConfigs['join_now_text'] ?? 'Join Now';
        $data['mobile_remember'] = $headerConfigs['mobile_remember'] ?? 'Remember Username';
        $data['join_now_link'] = $headerConfigs['join_now_link'] ?? '';
        $data['login_issue_text'] = $headerConfigs['login_issue_text'] ?? 'Cant Login ?';
        $data['login_issue_link'] = $headerConfigs['login_issue_link'] ?? '';

        try {
            $loginConfigs = $this->configs->getConfig('webcomposer_config.login_configuration');
        } catch (\Exception $e) {
            $loginConfigs = [];
        }

        $data['login_bottom_label'] = $loginConfigs['login_bottom_label'] ?? 'Login';
        $data['username_placeholder'] = $loginConfigs['username_placeholder'] ?? 'Username';
        $data['password_placeholder'] = $loginConfigs['password_placeholder'] ?? 'Password';
        $data['lightbox_blurb'] = $loginConfigs['lightbox_blurb'] ?? 'Not yet a Dafabet member ?';

        try {
            $isLogin = $this->playerSession->isLogin();
        } catch (\Exception $e) {
            $isLogin = false;
        }

        $data['is_login'] = $isLogin;

        return $data;
    }
}
