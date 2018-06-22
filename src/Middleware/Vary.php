<?php

namespace App\MobileEntry\Middleware;

use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Interop\Container\ContainerInterface;

use App\Plugins\Middleware\ResponseMiddlewareInterface;

/**
 *
 */
class Vary implements ResponseMiddlewareInterface
{
    const HEADER = 'X-Is-Authenticated';

    /**
     * Public constructor
     *
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container)
    {
        $this->playerSession = $container->get('player_session');
    }

    /**
     *
     */
    public function handleResponse(RequestInterface &$request, ResponseInterface &$response)
    {
        $response = $response->withHeader('Vary', self::HEADER);

        if ($this->playerSession->isLogin()) {
            $response = $response->withHeader(self::HEADER, 1);
        } else {
            $response = $response->withHeader(self::HEADER, 0);
        }
    }
}
