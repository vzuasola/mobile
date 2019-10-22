<?php

namespace App\MobileEntry\Component\Main\Lobby\ArcadeLobby;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\MobileEntry\Services\Product\Products;

/**
 *
 */
class ArcadeLobbyComponentScripts implements ComponentAttachmentInterface
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
        $this->views = $views->withProduct($product->getProduct());
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        try {
            $arcadeConfigs = $this->configs->getConfig('arcade.arcade_configuration');
        } catch (\Exception $e) {
            $arcadeConfigs = [];
        }

        try {
            $searchConfig = $this->configs->getConfig('games_search.search_configuration');
        } catch (\Exception $e) {
            $searchConfig = [];
        }

        try {
            $pager = $this->views->getViewById('games_list', ['pager' => 1]);
        } catch (\Exception $e) {
            $pager = [];
        }

        return [
            'authenticated' => $this->playerSession->isLogin(),
            'product' => $this->getProductIntegration(),
            'pagerConfig' => $pager ?? [],
            'configs' => $arcadeConfigs,
            'search_blurb' => $searchConfig['search_blurb'] ?? "",
            'search_no_result_msg' => $searchConfig['search_no_result_msg'] ?? "",
            'filter_no_result_msg' => $searchConfig['filter_no_result_msg'] ?? "",
            'msg_recommended_available' => $searchConfig['msg_recommended_available'] ?? "",
            'msg_no_recommended' => $searchConfig['msg_no_recommended'] ?? "",
            'title_weight' => $searchConfig['title_weight'] ?? 0,
            'keywords_weight' => $searchConfig['keywords_weight'] ?? 0,

        ];
    }

    private function getProductIntegration()
    {
        try {
            $result = [];
            $products = $this->views->withProduct('mobile-entrypage')->getViewById('products');

            foreach ($products as $product) {
                $instanceId = $product['field_product_instance_id'][0]['value'];

                if (array_key_exists($instanceId, Products::PRODUCT_MAPPING) &&
                    $this->product->getProduct() === Products::PRODUCT_MAPPING[$instanceId]
                ) {
                    $result[] = [
                        'login_via' => $product['field_product_login_via'][0]['value'],
                        'reg_via' => $product['field_registration_url'][0]['value'],
                    ];
                }
            }
        } catch (\Exception $e) {
            $result = [];
        }

        return $result;
    }
}
