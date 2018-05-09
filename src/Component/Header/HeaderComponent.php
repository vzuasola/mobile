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


    private $menu;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('player_session'),
            $container->get('menu_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($configs, $playerSession, $menu)
    {
        $this->configs = $configs;
        $this->playerSession = $playerSession;
        $this->menu = $menu;
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

        try {
            $headerConfigs = $this->configs->getConfig('webcomposer_config.header_configuration');

            // Header Configs
            $data['logo_title'] = $headerConfigs['logo_title'];
            $data['join_now_text'] = $headerConfigs['join_now_text'];
            $data['login_issue_text'] = $headerConfigs['login_issue_text'];
            $data['login_issue_link'] = $headerConfigs['login_issue_link'];
            $data['mobile_remember'] = $headerConfigs['mobile_remember'];
            $data['mobile_login_reg'] = $headerConfigs['mobile_login_reg'];
        } catch (\Exception $e) {
            $data['logo_title'] = 'Dafabet';
            $data['join_now_text'] = 'Join Now';
            $data['login_issue_text'] = 'Cant login?';
            $data['login_issue_link'] = [];
            $data['mobile_remember'] = 'Remember Username';
            $data['mobile_login_reg'] = 'login/join';
        }

        try {
            $loginConfigs = $this->configs->getConfig('webcomposer_config.login_configuration');

            // Login Configs
            $data['login_bottom_label'] = $loginConfigs['login_bottom_label'];
            $data['username_placeholder'] = $loginConfigs['username_placeholder'];
            $data['password_placeholder'] = $loginConfigs['password_placeholder'];
            $data['lightbox_blurb'] = $loginConfigs['lightbox_blurb'];
        } catch (\Exception $e) {
            $data['login_bottom_label'] = 'Login';
            $data['username_placeholder'] = 'Username';
            $data['password_placeholder'] = 'Password';
            $data['lightbox_blurb'] = 'Not yet a Dafabet member?';
        }

        $data['is_front'] = true;

        // post login specific data
        $isLogin = $this->playerSession->isLogin();

        $data['is_login'] = $isLogin;

        if ($isLogin) {
            $data['username'] = $this->playerSession->getUsername();
            $data['cashier_link'] = $this->menu->getMultilingualMenu('cashier-menu')[0];
        }
        return $data;
    }
}
