<?php

namespace App\MobileEntry\Component\Main\Lobby\VirtualsLobby;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\MobileEntry\Services\Product\Products;

/**
 *
 */
class VirtualsLobbyComponentScripts implements ComponentAttachmentInterface
{
    private $configs;
    private $playerSession;
    private $product;
    private $views;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('config_fetcher'),
            $container->get('product_resolver'),
            $container->get('views_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $configs, $product, $views)
    {
        $this->playerSession = $playerSession;
        $this->product = $product;
        $this->configs = $configs->withProduct($product->getProduct());
        $this->views = $views;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        try {
            $virtualsGeneralConfig = $this->configs->getConfig('virtuals.virtuals_configuration');
        } catch (\Exception $e) {
            $virtualsGeneralConfig = [];
        }

        try {
            $tabs = $this->views->withProduct($this->product->getProduct())->getViewById('lobby_tabs');
        } catch (\Exception $e) {
            $tabs = [];
        }

        return [
            'authenticated' => $this->playerSession->isLogin(),
            'product' => $this->getProductIntegration(),
            'tabs' => $tabs,
            'configs' => $virtualsGeneralConfig ?? [],
        ];
    }

    private function getProductIntegration()
    {
        try {
            $result = [];
            $products = $this->views->getViewById('products');

            foreach ($products as $product) {
                $instanceId = $product['field_product_instance_id'][0]['value'];

                if (array_key_exists($instanceId, Products::PRODUCT_MAPPING) &&
                    $this->product->getProduct() === Products::PRODUCT_MAPPING[$instanceId]
                ) {
                    $result[] = [
                        'instanceId' => $instanceId,
                        'login_via' => $product['field_product_login_via'][0]['value'] ?? '',
                        'reg_via' => $product['field_registration_url'][0]['value'] ?? '',
                    ];
                }
            }
        } catch (\Exception $e) {
            $result = [];
        }

        return $result;
    }
}
