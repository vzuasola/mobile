<?php

namespace App\MobileEntry\Component\Header;

use App\Plugins\ComponentWidget\AsyncComponentInterface;

class HeaderComponentAsync implements AsyncComponentInterface
{
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    /**
     * @var App\Fetcher\AsyncDrupal\MenuFetcher
     */
    private $menus;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher_async'),
            $container->get('menu_fetcher_async')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($configs, $menus)
    {
        $this->configs = $configs;
        $this->menus = $menus;
    }

    /**
     *
     */
    public function getDefinitions()
    {
        return [
            $this->configs->getConfig('webcomposer_config.header_configuration'),
            $this->configs->getConfig('webcomposer_config.login_configuration'),
            $this->menus->getMultilingualMenu('cashier-menu'),
        ];
    }
}
