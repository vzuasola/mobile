<?php

namespace App\MobileEntry\Component\Header;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class HeaderComponent implements ComponentWidgetInterface
{
    private $request;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    private $menu;

    private const HOME = [
        '/',
        '/games'
    ];

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('router_request'),
            $container->get('config_fetcher'),
            $container->get('player_session'),
            $container->get('menu_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($request, $configs, $playerSession, $menu)
    {
        $this->request = $request;
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
        $data['is_front'] = false;
        try {
            if (in_array($this->request->getUri()->getPath(), $this::HOME)) {
                $data['is_front'] = true;
            }
        } catch (\Exception $e) {
            // Do nothing
        }

        try {
            $headerConfigs = $this->configs->getConfig('webcomposer_config.header_configuration');
            $cashierMenu = $this->menu->getMultilingualMenu('cashier-menu');
        } catch (\Exception $e) {
            $headerConfigs = [];
            $cashierMenu = [];
        }

        $data['logo_title'] = $headerConfigs['logo_title'] ?? 'Dafabet';
        $data['join_now_text'] = $headerConfigs['join_now_text'] ?? 'Join Now';
        $data['login_issue_text'] = $headerConfigs['login_issue_text'] ?? 'Cant Login ?';
        $data['login_issue_link'] = $headerConfigs['login_issue_link'] ?? [];
        $data['mobile_remember'] = $headerConfigs['mobile_remember'] ?? 'Remember Username';
        $data['mobile_login_reg'] = $headerConfigs['mobile_login_reg'] ?? 'Login/Join';
        $data['join_now_link'] = $headerConfigs['join_now_link'] ?? [];

        try {
            $isLogin = $this->playerSession->isLogin();
            $username = $this->playerSession->getUsername();
        } catch (\Exception $e) {
            $isLogin = false;
            $username = false;
        }

        $data['is_login'] = $isLogin;

        if ($isLogin && $username) {
            $data['username'] = $username;
            $data['cashier_link'] = $cashierMenu[0] ?? [];
        }

        return $data;
    }
}
