<?php

namespace App\MobileEntry\Services\Product;

/**
 * Class to check for accounts
 */
class ProductResolver
{
    private $routeManager;

    /**
     * Container resolver
     */
    public static function create($container)
    {
        return new static(
            $container->get('route_manager')
        );
    }

    /**
     *
     */
    public function __construct($routeManager)
    {
        $this->routeManager = $routeManager;
    }

    /**
     *
     */
    public function getProduct()
    {
        return $this->routeManager->getAttribute('product') ?? 0;
    }
}
