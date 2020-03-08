<?php

namespace App\MobileEntry\Services\Product;

/**
 * Class to check for accounts
 */
class ProductAlias
{
    private $request;

    /**
     * Container resolver
     */
    public static function create($container)
    {
        return new static(
            $container->get('router_request')
        );
    }

    /**
     *
     */
    public function __construct($request)
    {
        $this->request = $request;
    }

    /**
     *
     */
    public function getAlias()
    {
        $path = $this->request->getUri()->getPath();
        return explode('/', $path)[1];
    }
}
