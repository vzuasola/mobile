<?php

namespace App\MobileEntry\Middleware;

use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Interop\Container\ContainerInterface;
use App\MobileEntry\Services\Product\Products;

use App\Plugins\Middleware\ResponseMiddlewareInterface;

class XFrames implements ResponseMiddlewareInterface
{
    /**
     * {@inheritdoc}
     */
    public function handleResponse(RequestInterface &$request, ResponseInterface &$response)
    {
        try {
            $path = $request->getUri()->getPath();

            if (in_array(explode('/', $path)[1], Products::PRODUCT_ALIAS['soda-casino'])) {
                $response = $response->withHeader('X-Frame-Options', 'Deny');
            }
        } catch (\Exception $e) {
            // Do nothing
        }
    }
}
