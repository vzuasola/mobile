<?php

namespace App\MobileEntry\Middleware;

use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use App\Plugins\Middleware\ResponseMiddlewareInterface;

/**
 *
 */
class PlayerMatrix implements ResponseMiddlewareInterface
{

    public function __construct($container)
    {
        $this->playerSession = $container->get('player_session');
    }

    /**
     * {@inheritdoc}
     */
    public function handleResponse(RequestInterface &$request, ResponseInterface &$response)
    {
        try {
            $path = $request->getUri()->getPath();
            $params = $request->getQueryParams();
            if ($this->playerSession->getDetails()['isPlayerCreatedByAgent'] &&
                $path !== '/sports-df' &&
                !isset($params['component-data-widget']) &&
                strpos($path, '/api') !== 0
            ) {
                $response = $response->withRedirect('/sports-df');
            }
        } catch (\Exception $e) {
            // Do nothing
        }
    }
}
