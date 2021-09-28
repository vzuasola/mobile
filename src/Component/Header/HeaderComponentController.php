<?php

namespace App\MobileEntry\Component\Header;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Services\Product\Products;

class HeaderComponentController
{
    /**
     * @var App\Fetcher\Drupal\MenuFetcher
     */
    private $rest;

    private $product;

    private $configs;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('config_fetcher'),
            $container->get('product_resolver')
        );
    }

    /**
     *
     */
    public function __construct(
        $rest,
        $configs,
        $product
    ) {
        $this->rest = $rest;
        $this->configs = $configs;
        $this->product = $product;
    }
}
