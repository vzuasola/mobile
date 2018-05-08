<?php

namespace App\MobileEntry\Component\Header;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class HeaderComponent implements ComponentWidgetInterface
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
        return '@component/Header/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $data = [];

        $headerConfigs = $this->configs->getConfig('webcomposer_config.header_configuration');
        $loginConfigs = $this->configs->getConfig('webcomposer_config.login_configuration');

        $data['is_front'] = true;

        // Header Configs
        $data['logo_title'] = $headerConfigs['logo_title'] ?? 'Dafabet';
        $data['join_now_text'] = $headerConfigs['join_now_text'] ?? 'Join Now';
        $data['login_issue_text'] = $headerConfigs['login_issue_text'] ?? 'Cant login?';
        $data['login_issue_link'] = $headerConfigs['login_issue_link'] ?? '';
        $data['mobile_remember'] = $headerConfigs['mobile_remember'] ?? 'Remember Username';

        // Login Configs
        $data['login_bottom_label'] = $loginConfigs['login_bottom_label'] ?? 'Login';
        $data['username_placeholder'] = $loginConfigs['username_placeholder'] ?? 'Username';
        $data['password_placeholder'] = $loginConfigs['password_placeholder'] ?? 'Password';
        $data['lightbox_blurb'] = $loginConfigs['lightbox_blurb'] ?? 'Not yet a Dafabet member?';

        // post login specific data

        $isLogin = $this->playerSession->isLogin();

        $data['is_login'] = $isLogin;

        if ($isLogin) {
            $data['username'] = $this->playerSession->getUsername();
        }
        return $data;
    }
}
