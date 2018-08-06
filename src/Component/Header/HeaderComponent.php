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
     * @var App\Fetcher\Drupal\ViewsFetcher
     */
    private $views;


    private $menu;

    const PRODUCT_MAPPING = [
        'mobile-entrypage' => 0,
        'games' => 'games'
    ];

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('player_session'),
            $container->get('menu_fetcher'),
            $container->get('views_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($configs, $playerSession, $menu, $views)
    {
        $this->configs = $configs;
        $this->playerSession = $playerSession;
        $this->menu = $menu;
        $this->views = $views;
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
        $data['product'] = $this->getProduct('games');

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

    private function getProduct($productParam)
    {
        $result = [];
        $products = $this->views->getViewById('products');

        foreach ($products as $key => $product) {
            if (array_key_exists($product['field_product_instance_id'][0]['value'], $this::PRODUCT_MAPPING)
                 && $this::PRODUCT_MAPPING[$product['field_product_instance_id'][0]['value']] === $productParam) {
                return $product;
            }
        }

        return [];
    }
}
