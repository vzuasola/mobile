<?php

namespace App\MobileEntry\Component\HeaderGameIFrame;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Services\Product\Products;

class HeaderGameIFrameComponent implements ComponentWidgetInterface
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
        return '@component/HeaderGameIFrame/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $data = [];
        $params = $this->request->getQueryParams();
        $data['logo_link'] =   '/{lang}';
        if (isset($params['id']) && $params['id'] !== "mobile-entrypage") {
            $data['logo_link'] = '/' + $params['id'];
        }

        try {
            $headerConfigs = $this->configs->getConfig('webcomposer_config.header_configuration');
            $cashierMenu = $this->menu->getMultilingualMenu('cashier-menu');
        } catch (\Exception $e) {
            $headerConfigs = [];
            $cashierMenu = [];
        }

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
