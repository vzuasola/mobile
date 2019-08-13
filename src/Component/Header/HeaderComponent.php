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

    private $product;

    const HOME = [
        '/',
        '/games',
        '/casino',
        '/casino-gold',
        '/exchange',
        '/live-dealer',
        '/lottery',
        '/keno',
        '/lotto-numbers',
        '/numbers',
        '/draw',
        '/live-draws'
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
            $container->get('menu_fetcher'),
            $container->get('product_resolver')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($request, $configs, $playerSession, $menu, $product)
    {
        $this->request = $request;
        $this->configs = $configs;
        $this->playerSession = $playerSession;
        $this->menu = $menu;
        $this->product = $product;
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
            if (in_array($this->request->getUri()->getPath(), self::HOME)) {
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

        try {
            $headerConfigsByProduct = $this->configs
                ->withProduct($this->product->getProduct())
                ->getConfig('webcomposer_config.header_configuration');
        } catch (\Exception $e) {
            $headerConfigsByProduct = [];
        }

        $data['logo_title'] = $headerConfigsByProduct['logo_title'] ?? 'Dafabet';
        $data['join_now_text'] = $headerConfigs['join_now_text'] ?? 'Join Now';
        $data['login_issue_text'] = $headerConfigs['login_issue_text'] ?? 'Cant Login ?';
        $data['login_issue_link'] = $headerConfigs['login_issue_link'] ?? [];
        $data['mobile_remember'] = $headerConfigs['mobile_remember'] ?? 'Remember Username';
        $data['mobile_login_reg'] = $headerConfigs['mobile_login_reg'] ?? 'Login/Join';
        $data['join_now_link'] = $headerConfigs['registration_link'] ?? [];

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
