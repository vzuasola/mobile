<?php

namespace App\MobileEntry\Middleware;

use Interop\Container\ContainerInterface;

use App\Middleware\Cache\ResponseCache as Base;

class ResponseCache extends Base
{
    /**
     * Public constructor
     */
    public function __construct(ContainerInterface $container)
    {
        parent::__construct($container);

        $this->request = $container->get('request');
    }

    /**
     * Gets the cache key
     */
    protected function getCacheKey($request)
    {
        $uri = $this->request->getUri();

        $base = $uri->getBaseUrl();
        $path = $uri->getPath();

        $url = trim($base . $path, '/');

        $params = [
            'component-data-widget' => $this->request->getQueryParam('component-data-widget'),
            'page' => $this->request->getQueryParam('page'),
            'pvw' => $this->request->getQueryParam('pvw')
        ];

        $url = "$url?" . http_build_query($params);

        return md5($url);
    }
}
