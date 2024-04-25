<?php

namespace App\MobileEntry\Component\Main\Lobby\Slider;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\MobileEntry\Services\Product\Products;

/**
 *
 */
class SliderComponentScripts implements ComponentAttachmentInterface
{
    private $playerSession;

    private $views;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('views_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        \App\Player\PlayerSession $playerSession,
        \App\Fetcher\Drupal\ViewsFetcher $views
    ) {
        $this->playerSession = $playerSession;
        $this->views = $views;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        return [
            'authenticated' => $this->playerSession->isLogin(),
            'products' => $this->getProducts(),
        ];
    }

    private function getProducts()
    {
        try {
            $result = [];
            $products = $this->views->getViewById('products');

            foreach ($products as $product) {
                $instanceId = $product['field_product_instance_id'][0]['value'];
                if (array_key_exists($instanceId, Products::PRODUCT_MAPPING)) {
                    $result[Products::PRODUCT_MAPPING[$instanceId]] = [
                        'login_via' => $product['field_product_login_via'][0]['value'] ?? '',
                    ];
                }
            }
        } catch (\Exception $e) {
            $result = [];
        }

        return $result;
    }
}
