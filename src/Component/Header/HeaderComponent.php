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
            $configs = $this->configs->getConfig('webcomposer_config.header_configuration');

            // Header Configs
            $data['logo_title'] = $configs['logo_title'];
            $data['join_now_text'] = $configs['join_now_text'];
            $data['login_issue_text'] = $configs['login_issue_text'];
            $data['login_issue_link'] = $configs['login_issue_link'];
            $data['mobile_remember'] = $configs['mobile_remember'];
            $data['mobile_login_reg'] = $configs['mobile_login_reg'];
            $data['join_now_link'] = $configs['join_now_link'];
        } catch (\Exception $e) {
            $data['logo_title'] = 'Dafabet';
            $data['join_now_text'] = 'Join Now';
            $data['login_issue_text'] = 'Cant login?';
            $data['login_issue_link'] = [];
            $data['mobile_remember'] = 'Remember Username';
            $data['mobile_login_reg'] = 'login/join';
            $data['join_now_link'] = [];
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
