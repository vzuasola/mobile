<?php

namespace App\MobileEntry\Middleware;

use Interop\Container\ContainerInterface;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;

use Slim\Http\Body;
use App\Plugins\Middleware\ResponseMiddlewareInterface;
use App\Drupal\Config;

/**
 *
 */
class SiteMaintenance implements ResponseMiddlewareInterface
{
    const PRODUCTS = [
        'mobile-exchange',
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
        $this->handler = $container->get('handler');
        $this->playerSession = $container->get('player_session');
        $this->product = $container->get('product_resolver')->getProduct();
        $this->configFetcher = $container->get('config_fetcher')->withProduct($this->product);

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
                $stream = fopen('php://memory', 'r+');
                fwrite($stream, '');
                $response = $response->withBody(new Body($stream));
                // Call event
                $event = $this->handler->getEvent('site_maintenance');
                $response = $event($request, $response);
                // $this->ucp = $this->configFetcher->getConfig('webcomposer_config.page_not_found');
                // if (
                //     $response->getStatusCode() === 200 && // Override only if the supposed response is 200
                //     $this->playerSession->isLogin() &&
                //     $this->ucp['currency_mapping'] &&
                //     isset($this->route['components']['main']) &&
                //     $this->route['components']['main'] === 'lobby'
                // ) {
                //     $currencyMap = explode("\r\n", $this->ucp['currency_mapping']);
                //     $currency = $this->playerSession->getDetails()['currency'] ?? null;
                //     if (in_array($currency, $currencyMap)) {
                //         // Remove processed body stream that came from controller
                //         $stream = fopen('php://memory', 'r+');
                //         fwrite($stream, '');
                //         $response = $response->withBody(new Body($stream));
                //         // Call event
                //         $event = $this->handler->getEvent('site_maintenance');
                //         $response = $event($request, $response);
                //     }
                // }
            }
        } catch (\Exception $e) {
            // Do nothing
        }
    }
}
