<?php

namespace App\MobileEntry\Middleware;

use App\MobileEntry\Services\Accounts\Accounts;
use App\Player\PlayerSession;
use Interop\Container\ContainerInterface;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;

use Slim\Http\Body;
use App\Plugins\Middleware\ResponseMiddlewareInterface;
use App\Plugins\Middleware\RequestMiddlewareInterface;
use App\MobileEntry\Services\Product\Products;

/**
 *
 */
class SiteMaintenance implements RequestMiddlewareInterface, ResponseMiddlewareInterface
{
    const PRODUCTS = [
        'mobile-games',
        'mobile-casino',
        'mobile-casino-gold',
        'mobile-live-dealer',
        'mobile-lottery',
        'mobile-exchange',
        'mobile-arcade',
        'mobile-soda-casino',
        'mobile-sports',
        'mobile-sports-df'
    ];

    /**
     * @var $product string
     */
    private $product;

    /**
     * @var $playerSession PlayerSession
     */
    private $playerSession;

    /**
     * @var $paymentAccount Accounts
     */
    private $paymentAccount;

    /**
     * Public constructor
     *
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container)
    {
        $this->handler = $container->get('handler');
        $this->configs = $container->get('config_fetcher')->getGeneralConfigById('webcomposer_site_maintenance');
        $this->playerSession = $container->get('player_session');
        $this->paymentAccount = $container->get('accounts_service');
    }

    public function boot(RequestInterface &$request)
    {
        // placeholder
    }

    /**
     * {@inheritdoc}
     */
    public function handleRequest(RequestInterface &$request, ResponseInterface &$response)
    {
        try {
            $this->getProduct($request);
            if (in_array($this->product, self::PRODUCTS)) {
                $products = explode("\r\n", $this->configs['product_list']);

                $dates = [
                    'field_publish_date' => $this->configs['maintenance_publish_date_' . $this->product] ?? '',
                    'field_unpublish_date' => $this->configs['maintenance_unpublish_date_' . $this->product] ?? '',
                ];
                // If the player tried to access casino-gold
                if ($this->product === "mobile-casino-gold") {
                    //do nothing, if no active session, let the pre-login process of casino gold take place
                    if (!$this->playerSession->isLogin()) {
                        return;
                    }

                    //do nothing, if the player is NON casino-gold account
                    if (!$this->paymentAccount->hasAccount('casino-gold')) {
                        return;
                    }

                    // else, proceed with the maintenance process
                }

                if (in_array($this->product, $products) && $this->isPublished($dates)) {
                    $request = $request->withAttribute('is_maintenance', true);
                }
            }
        } catch (\Exception $e) {
            // Do nothing
        }
    }

    /**
     * {@inheritdoc}
     */
    public function handleResponse(RequestInterface &$request, ResponseInterface &$response)
    {
        try {
            if ($response->getStatusCode() === 200 && $request->getAttribute('is_maintenance', false) === true) {
                $request = $request->withAttribute('is_maintenance', true);

                // Remove processed body stream that came from controller
                $stream = fopen('php://memory', 'r+');
                fwrite($stream, '');
                $response = $response->withBody(new Body($stream));
                // Call event
                $event = $this->handler->getEvent('site_maintenance');
                $response = $event($request, $response);
            }
        } catch (\Exception $e) {
            // Do nothing
        }
    }

    private function getProduct($request)
    {
        $currentProduct = "mobile-entrypage";
        $path = $request->getUri()->getPath();
        $path = explode('/', $path);

        $productAliases = Products::PRODUCT_ALIAS;
        if (isset($path[2])) {
            array_walk($productAliases, function ($aliases, $product) use (&$currentProduct, $path) {
                if (in_array(strtolower($path[2]), $aliases)) {
                    $currentProduct = Products::PRODUCTCODE_MAPPING[$product];
                }
            });
        }

        $this->product = str_replace(' ', '', strtolower($currentProduct));
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
