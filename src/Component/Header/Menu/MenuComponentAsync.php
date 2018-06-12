<?php

namespace App\MobileEntry\Component\Header\Menu;

use App\Plugins\ComponentWidget\AsyncComponentInterface;

class MenuComponentAsync implements AsyncComponentInterface
{
    /**
     * @var App\Fetcher\AsyncDrupal\ConfigFetcher
     */
    private $config;

    /**
     * @var App\Fetcher\AsyncDrupal\ViewsFetcher
     */
    private $views;

    /**
     * @var App\Fetcher\AsyncDrupal\MenuFetcher
     */
    private $menus;

    /**
     * @var App\Fetcher\AsyncIntegration\PaymentAccountFetcher
     */
    private $accounts;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher_async'),
            $container->get('views_fetcher_async'),
            $container->get('menu_fetcher_async'),
            $container->get('payment_account_fetcher_async')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($config, $views, $menus, $accounts)
    {
        $this->config = $config;
        $this->views = $views;
        $this->menus = $menus;
        $this->accounts = $accounts;
    }

    /**
     * {@inheritdoc}
     */
    public function getDefinitions()
    {
        return [
            $this->config->getConfig('webcomposer_config.header_configuration'),
            $this->views->getViewById('mobile_product_menu'),
            $this->menus->getMultilingualMenu('quicklinks'),
            $this->menus->getMultilingualMenu('secondary-menu'),
            $this->menus->getMultilingualMenu('mobile-pre-login'),
            $this->menus->getMultilingualMenu('mobile-post-login'),
            $this->accounts->hasAccount('casino-gold'),
        ];
    }
}
