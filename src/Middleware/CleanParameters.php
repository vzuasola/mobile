<?php

namespace App\MobileEntry\Middleware;

use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use App\Plugins\Middleware\ResponseMiddlewareInterface;


/**
 *
 */
class CleanParameters implements ResponseMiddlewareInterface
{
    /**
     * {@inheritdoc}
     */
    public function handleResponse(RequestInterface &$request, ResponseInterface &$response)
    {
        try {
            $redirect = false;
            $params = $request->getQueryParams();

            if (isset($params['credentials'])) {
                $redirect = true;
                unset($params['credentials']);
            }

            if (isset($params['token'])) {
                $redirect = true;
                unset($params['token']);
            }

            if (isset($params['playerID'])) {
                $redirect = true;
                unset($params['playerID']);
            }

            if ($redirect) {
                $uri = $request->getUri()->withQuery(http_build_query($params));
                $path = strtolower($uri->getPath());
                $uri = $uri->withPath($path);

                $response = $response->withRedirect($uri);
            }
        } catch (\Exception $e) {
            // Do nothing
        }
    }
}
