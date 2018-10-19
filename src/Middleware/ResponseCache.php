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

        $widget = $this->request->getQueryParam('component-data-widget');

        if ($widget) {
            $url = "$url?component-data-widget=$widget";
        }

        return md5($url);
    }
}
