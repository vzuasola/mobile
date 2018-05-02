<?php

namespace App\MobileEntry\Component\Main\Home\Products;

use App\Plugins\ComponentWidget\AsyncComponentInterface;

class ProductsComponentAsync implements AsyncComponentInterface
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
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('views_fetcher_async'),
            $container->get('config_fetcher_async')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($views, $config)
    {
        $this->views = $views;
        $this->config = $config;
    }

    /**
     * {@inheritdoc}
     */
    public function getDefinitions()
    {
        return [
            $this->views->getViewById('product_lobby_tiles_entity'),
            $this->config->getConfig('webcomposer_config.header_configuration'),
        ];
    }
}
