<?php

namespace App\MobileEntry\Component\Menu;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class MenuComponentScripts implements ComponentAttachmentInterface
{
    private $productResolver;

    private $views;

    const PRODUCT_MAPPING = [
        'mobile-games' => 'games'
    ];

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('views_fetcher'),
            $container->get('product_resolver')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $views, $productResolver)
    {
        $this->playerSession = $playerSession;
        $this->views = $views;
        $this->productResolver = $productResolver;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        return [
            'authenticated' => $this->playerSession->isLogin(),
            'products' => $this->getProduct($this->productResolver->getProduct())
        ];
    }

    private function getProduct($productParam)
    {
        $result = [];
        $products = $this->views->getViewById('products');

        foreach ($products as $product) {
            if (array_key_exists($productParam, $this::PRODUCT_MAPPING)
                 && $this::PRODUCT_MAPPING[$productParam] === $product['field_product_instance_id'][0]['value']) {
                $result[$productParam] = $product;
            }
        }

        return $result;
    }
}
