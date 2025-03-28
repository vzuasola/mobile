<?php

namespace App\MobileEntry\Component\Main\Lobby\SodaCasinoLobby;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\MobileEntry\Services\Product\Products;

/**
 *
 */
class SodaCasinoLobbyComponentScripts implements ComponentAttachmentInterface
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
            $config = $this->configs->getConfig('games_search.search_configuration');
            $sodaCasinoGeneralConfig = $this->configs->getConfig('soda_casino.soda_casino_configuration');
        } catch (\Exception $e) {
            $config = [];
        }

        return [
            'authenticated' => $this->playerSession->isLogin(),
            'search_blurb' => $config['search_blurb'] ?? "",
            'search_no_result_msg' => $config['search_no_result_msg'] ?? "",
            'filter_no_result_msg' => $config['filter_no_result_msg'] ?? "",
            'msg_recommended_available' => $config['msg_recommended_available'] ?? "",
            'msg_no_recommended' => $config['msg_no_recommended'] ?? "",
            'title_weight' => $config['title_weight'] ?? 0,
            'keywords_weight' => $config['keywords_weight'] ?? 0,
            'soda_configs' => $sodaCasinoGeneralConfig ?? [],
            'product' => $this->getProductIntegration(),
            'infinite_scroll' => $sodaCasinoGeneralConfig['soda_casino_lobby_infinite_scroll'] ?? true,
            'maintenance' => $sodaCasinoGeneralConfig['soda_casino_maintenance'] ?? false
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
