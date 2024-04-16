<?php

namespace App\MobileEntry\Component\Main\Lobby\CasinoLobby;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\MobileEntry\Services\Product\Products;

/**
 *
 */
class CasinoLobbyComponentScripts implements ComponentAttachmentInterface
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
            $config = $this->configs->getConfig('games_search.search_configuration');
            $casinoGeneralConfig = $this->configs->getConfig('casino.casino_configuration');
            $uglConfig = $this->configs->getConfig('webcomposer_config.games_playtech_provider');
        } catch (\Exception $e) {
            $config = [];
        }

        try {
            $pager = $this->views->getViewById('games_list', ['pager' => 1]);
        } catch (\Exception $e) {
            $pager = [];
        }

        return [
            'uglConfig' => $uglConfig['ugl_switch'] ?? false,
            'authenticated' => $this->playerSession->isLogin(),
            'search_blurb' => $config['search_blurb'] ?? "",
            'pagerConfig' => $pager ?? [],
            'search_no_result_msg' => $config['search_no_result_msg'] ?? "",
            'filter_no_result_msg' => $config['filter_no_result_msg'] ?? "",
            'msg_recommended_available' => $config['msg_recommended_available'] ?? "",
            'msg_no_recommended' => $config['msg_no_recommended'] ?? "",
            'title_weight' => $config['title_weight'] ?? 0,
            'keywords_weight' => $config['keywords_weight'] ?? 0,
            'product' => $this->getProductIntegration(),
            'infinite_scroll' => $casinoGeneralConfig['lobby_infinite_scroll'] ?? true,
            'launch_via_iframe' => $casinoGeneralConfig['launch_via_iframe'] ?? false
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
