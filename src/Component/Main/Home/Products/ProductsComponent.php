<?php

namespace App\MobileEntry\Component\Main\Home\Products;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class ProductsComponent implements ComponentWidgetInterface
{

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $config;

    /**
     * @var App\Fetcher\Drupal\MenuFetcher
     */
    private $productTiles;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('views_fetcher'),
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($productTiles, $config)
    {
        $this->productTiles = $productTiles;
        $this->config = $config;
    }


    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Main/Home/Products/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $data = [];
        $data['is_logged_in'] = false;

        try {
            $data['product_tiles'] = $this->productTiles
                ->getViewById('product_lobby_tiles_entity');
        } catch (\Exception $e) {
            $data['product_tiles'] = [];
        }

        try {
            $data['config_new_text'] = $this->config
                ->getConfig('webcomposer_config.header_configuration')['product_menu_new_tag'];
        } catch (\Exception $e) {
            $data['config_new_text'] = [];
        }

        return $data;
    }
}
