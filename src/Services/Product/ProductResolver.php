<?php

namespace App\MobileEntry\Services\Product;

/**
 * Class to check for accounts
 */
class ProductResolver
{
    private $routeManager;
    private $request;

    /**
     * Container resolver
     */
    public static function create($container)
    {
        return new static(
            $container->get('route_manager'),
            $container->get('router_request')
        );
    }

    /**
     *
     */
    public function __construct($routeManager, $request)
    {
        $this->routeManager = $routeManager;
        $this->request = $request;
    }

    /**
     *
     */
    public function getProduct()
    {
        return $this->routeManager->getAttribute('product', $this->request) ?? "mobile-entrypage";
    }
}
