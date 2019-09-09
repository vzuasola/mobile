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
class UnsupportedCurrency implements ResponseMiddlewareInterface
{
    const PRODUCTS = [
        'mobile-exchange'
    ];

    /**
     * Public constructor
     *
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container)
    {
        $this->handler = $container->get('handler');
        $this->playerSession = $container->get('player_session');
        $this->product = $container->get('product_resolver')->getProduct();
        $this->configFetcher = $container->get('config_fetcher')->withProduct($this->product);
    }

    /**
     * {@inheritdoc}
     */
    public function handleResponse(RequestInterface &$request, ResponseInterface &$response)
    {
        try {
            if (in_array($this->product, self::PRODUCTS)) {
                $this->ucp = $this->configFetcher->getGeneralConfigById('page_not_found');
                if ($response->getStatusCode() === 200 && // Override only if the supposed response is 200
                    $this->playerSession->isLogin() &&
                    $this->ucp['currency_mapping']
                ) {
                    $currencyMap = explode("\r\n", $this->ucp['currency_mapping']);
                    $currency = $this->playerSession->getDetails()['currency'] ?? null;
                    if (in_array($currency, $currencyMap)) {
                        // Remove processed body stream that came from controller
                        $stream = fopen('php://memory', 'r+');
                        fwrite($stream, '');
                        $response = $response->withBody(new Body($stream));

                        // Call event
                        $event = $this->handler->getEvent('unsupported_currency');
                        $response = $event($request, $response);
                    }
                }
            }
        } catch (\Exception $e) {
            // Do nothing
        }
    }
}
