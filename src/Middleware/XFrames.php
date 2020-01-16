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
        $this->product = $container->get('product_resolver')->getProduct();
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
