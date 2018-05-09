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
            $data['logo_title'] = $this->config
                    ->getConfig('webcomposer_config.header_configuration')['logo_title'];
            $data['join_now_text'] = $this->config
                    ->getConfig('webcomposer_config.header_configuration')['join_now_text'];
            $data['login_issue_text'] = $this->config
                    ->getConfig('webcomposer_config.header_configuration')['login_issue_text'];
            $data['login_issue_link'] = $this->config
                    ->getConfig('webcomposer_config.header_configuration')['login_issue_link'];
            $data['mobile_remember'] = $this->config
                    ->getConfig('webcomposer_config.header_configuration')['mobile_remember'];
            $data['mobile_login_reg'] = $this->config
                    ->getConfig('webcomposer_config.header_configuration')['mobile_login_reg'];

        } catch (\Exception $e) {
            $data['logo_title'] = [];
            $data['join_now_text'] = [];
            $data['login_issue_text'] = [];
            $data['login_issue_link'] = [];
            $data['mobile_remember'] = [];
            $data['mobile_login_reg'] = [];

        }

        try {
            $data['login_bottom_label'] = $this->config
                    ->getConfig('webcomposer_config.login_configuration')['login_bottom_label'];
            $data['username_placeholder'] = $this->config
                    ->getConfig('webcomposer_config.login_configuration')['username_placeholder'];
            $data['password_placeholder'] = $this->config
                    ->getConfig('webcomposer_config.login_configuration')['password_placeholder'];
            $data['lightbox_blurb'] = $this->config
                    ->getConfig('webcomposer_config.login_configuration')['lightbox_blurb'];

        } catch (\Exception $e) {
            $data['login_bottom_label'] = [];
            $data['username_placeholder'] = [];
            $data['password_placeholder'] = [];
            $data['lightbox_blurb'] = [];

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
