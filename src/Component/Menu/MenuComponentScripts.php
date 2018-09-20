<?php

namespace App\MobileEntry\Component\Menu;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class MenuComponentScripts implements ComponentAttachmentInterface
{
    private $tokenParser;

    private $views;

    private $products;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('views_fetcher'),
            $container->get('token_parser'),
            $container->get('products')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $views, $tokenParser, $products)
    {
        $this->playerSession = $playerSession;
        $this->views = $views;
        $this->tokenParser = $tokenParser;
        $this->products = $products;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        return [
            'authenticated' => $this->playerSession->isLogin(),
            'products' => $this->getProducts()
        ];
    }

    private function getProducts()
    {
        try {
            $result = [];
            $products = $this->views->getViewById('products');

            foreach ($products as $product) {
                $instanceId = $product['field_product_instance_id'][0]['value'];
                if (array_key_exists($instanceId, $this->products::PRODUCT_MAPPING)) {
                    $result[$this->products::PRODUCT_MAPPING[$instanceId]] = [
                        'login_via' => $product['field_product_login_via'][0]['value'],
                        'reg_via' => $this->tokenParser->processTokens($product['field_registration_url'][0]['value']),
                    ];
                }
            }
        } catch (\Exception $e) {
            $result = [];
        }

        return $result;
    }
}
