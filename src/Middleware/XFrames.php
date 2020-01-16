<?php

namespace App\MobileEntry\Middleware;

use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Interop\Container\ContainerInterface;

use App\Plugins\Middleware\ResponseMiddlewareInterface;

class XFrames implements ResponseMiddlewareInterface
{
    const PRODUCTS = [
        'mobile-soda-casino'
    ];

    /**
     * Public constructor
     *
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container)
    {
        $this->request = $container->get('router_request');
        $this->router = $container->get('route_manager');
        $this->product = $container->get('product_resolver')->getProduct();

        // route configuration
        $this->route = $this->router->getRouteConfiguration($this->request);
    }

    /**
     * {@inheritdoc}
     */
    public function handleResponse(RequestInterface &$request, ResponseInterface &$response)
    {
        try {
            if (in_array($this->product, self::PRODUCTS)) {
                $response = $response->withHeader('X-Frame-Options', 'Deny');
            }
        } catch (\Exception $e) {
            // Do nothing
        }
    }
}
