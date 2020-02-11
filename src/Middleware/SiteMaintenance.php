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
        'mobile-games',
        'mobile-casino',
        'mobile-casino-gold',
        'mobile-live-dealer',
        'mobile-lottery',
        'mobile-exchange',
        'mobile-arcade',
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
        $this->configs = $container->get('config_fetcher')->getGeneralConfigById('webcomposer_site_maintenance');

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
                $products = explode("\r\n", $this->configs['product_list']);
                $product = $this->product;
                $product_key = strtolower($product);
                $product_key = str_replace(' ', '', $product_key);

                $dates = [
                    'field_publish_date' => $this->configs['maintenance_publish_date_' . $product_key],
                    'field_unpublish_date' => $this->configs['maintenance_unpublish_date_' . $product_key],
                ];
                if (
                    in_array($product, $products) &&
                    $this->isPublished($dates)
                ) {
                    // Remove processed body stream that came from controller
                    $stream = fopen('php://memory', 'r+');
                    fwrite($stream, '');
                    $response = $response->withBody(new Body($stream));
                    // Call event
                    $event = $this->handler->getEvent('site_maintenance');
                    $response = $event($request, $response);
                }
            }
        } catch (\Exception $e) {
            // Do nothing
        }
    }

    private function isPublished($data)
    {
        if (empty($data['field_publish_date']) && empty($data['field_unpublish_date'])) {
            return false;
        } elseif ($data['field_unpublish_date']) {
            return $data['field_publish_date'] <= strtotime(date('m/d/Y H:i:s')) &&
                $data['field_unpublish_date'] >= strtotime(date('m/d/Y H:i:s'));
        } else {
            return $data['field_publish_date'] <= strtotime(date('m/d/Y H:i:s'));
        }
    }
}
