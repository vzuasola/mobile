<?php

namespace App\MobileEntry\Middleware;

use Interop\Container\ContainerInterface;

use App\Middleware\Cache\ResponseCache as Base;

class ResponseCache extends Base
{

    /**
     * @var \Slim\Http\Request
     */
    private $request;

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
        $params = [];

        $base = $uri->getBaseUrl();
        $path = $uri->getPath();

        $url = trim($base . $path, '/');
        $widget = $this->request->getQueryParam('component-data-widget');
        $page = $this->request->getQueryParam('page');
        $pvw = $this->request->getQueryParam('pvw');
        $lobbyProduct = $this->request->getQueryParam('lobbyProduct');
        $isMaintenance = $request->getAttribute('is_maintenance', false);
        $isFlutter = $this->request->getQueryParam('flutter');
        if ($isMaintenance) {
            $params['maintenance'] = true;
        }
        $language = $this->request->getQueryParam('language');

        if ($widget) {
            $params['component-data-widget'] = $widget;
        }

        if ($page) {
            $params['page'] = $page;
        }

        if ($pvw) {
            $params['pvw'] = $pvw;
        }

        if ($lobbyProduct) {
            $params['lobbyProduct'] = $lobbyProduct;
        }

        if ($language) {
            $params['language'] = $language;
        }

        if ($isFlutter === "1") {
            $params['flutter'] = $isFlutter;
        }

        if (count($params)) {
            $url = "$url?" . http_build_query($params);
        }

        return md5($url);
    }
}
