<?php

namespace App\MobileEntry\Component\TabNavigation;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class TabNavigationComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $menus;

    private $product;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('menu_fetcher'),
            $container->get('product_resolver')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($menus, $product)
    {
        $this->menus = $menus;
        $this->product = $product;
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/TabNavigation/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        try {
            $data['quick_nav'] = $this->menus->withProduct($this->product->getProduct())
                                ->getMultilingualMenu('quick-nav');
        } catch (\Exception $e) {
            $data['quick_nav'] = [];
        }
        $data['quick_nav_product'] = $this->product->getProduct();

        return $data;
    }
}
