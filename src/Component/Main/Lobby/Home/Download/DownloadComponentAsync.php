
<?php

namespace App\MobileEntry\Component\Main\Lobby\Download;

use App\Plugins\ComponentWidget\AsyncComponentInterface;

class DownloadComponentAsync implements AsyncComponentInterface
{
    /**
     * @var App\Fetcher\Drupal\MenuFetcher
     */
    private $menus;

    /**
     * @var App\Fetcher\AsyncDrupal\ConfigFetcher
     */
    private $config;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher_async'),
            $container->get('menus_fetcher_async')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($config, $menus)
    {
        $this->config = $config;
        $this->menus = $menus;
    }

    /**
     * {@inheritdoc}
     */
    public function getDefinitions()
    {
        return [];
    }
}
