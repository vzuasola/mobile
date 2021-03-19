<?php

namespace App\MobileEntry\Component\Menu;

use App\MobileEntry\Services\Accounts\Accounts;
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
     * @var $accountService Accounts
     */
    private $accountService;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher_async'),
            $container->get('views_fetcher_async'),
            $container->get('menu_fetcher_async'),
            $container->get('accounts_service')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($config, $views, $menus, $accountService)
    {
        $this->config = $config;
        $this->views = $views;
        $this->menus = $menus;
        $this->accountService = $accountService;
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
            $this->accountService->hasAccount('casino-gold'),
        ];
    }
}
