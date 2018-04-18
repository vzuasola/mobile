<?php

namespace App\Web\Middleware\Request;

use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Interop\Container\ContainerInterface;

use App\Plugins\Middleware\RequestMiddlewareInterface;

class Headers implements RequestMiddlewareInterface
{
    /**
     * Public constructor
     *
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container)
    {
        $this->accessDenied = $container->get('notFoundHandler');
    }

    /**
     * @{inheritdoc}
     */
    public function boot(RequestInterface &$request)
    {
    }

    /**
     * @{inheritdoc}
     */
    public function handleRequest(RequestInterface &$request, ResponseInterface &$response)
    {
        $response = $response->withHeader('X-Frame-Options', 'Deny');
    }
}
