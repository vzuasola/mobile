<?php

namespace App\MobileEntry\Component\Main\Lobby\GamesLobby;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\MobileEntry\Services\Product\Products;

/**
 *
 */
class GamesLobbyComponentScripts implements ComponentAttachmentInterface
{
    const PRODUCT = 'games';
    private $configs;
    private $playerSession;
    private $product;
    private $views;
    private $request;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('config_fetcher'),
            $container->get('product_resolver'),
            $container->get('views_fetcher'),
            $container->get('request')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $configs, $product, $views, $request)
    {
        $this->playerSession = $playerSession;
        $this->product = $product;
        $this->configs = $configs->withProduct($product->getProduct());
        $this->views = $views->withProduct($product->getProduct());
        $this->request = $request;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        try {
            $config = $this->configs->getConfig('games_search.search_configuration');
            $gtsGeneralConfig = $this->configs->getConfig('gts.gts_configuration');
            $pager = $this->views->getViewById('games_list', ['pager' => 1]);
        } catch (\Exception $e) {
            $config = [];
        }

        try {
            $graphyteConfigs = $this->configs->getConfig('webcomposer_graphyte.integration_config');
            $gtsGeneralConfig['graphyte'] = [
                'enabled' => (boolean) $graphyteConfigs['enable'],
                'apiKey' => $graphyteConfigs['api_key'],
                'brandKey' => $graphyteConfigs['brand_key'],
                'clickStream' => [
                    'asset' => $graphyteConfigs['click_stream_asset'],
                ],
                'recommend' => [
                    'api' => $graphyteConfigs['recommend_api_domain'],
                    'categories' => $this->getCategories($graphyteConfigs),
                ],
            ];

        } catch (\Exception $e) {
            $gtsGeneralConfig['graphyte'] = [];
        }

        $user = [
            'playerId' =>  $this->playerSession->getDetails()['playerId'] ?? '',
            'currency' =>  $this->playerSession->getDetails()['currency'] ?? '',
            'country' => $this->request->getHeader('X-Custom-LB-GeoIP-Country')[0] ?? '',
        ];

        return [
            'authenticated' => $this->playerSession->isLogin(),
            'user' => $user,
            'search_blurb' => $config['search_blurb'] ?? "",
            'search_no_result_msg' => $config['search_no_result_msg'] ?? "",
            'filter_no_result_msg' => $config['filter_no_result_msg'] ?? "",
            'msg_recommended_available' => $config['msg_recommended_available'] ?? "",
            'msg_no_recommended' => $config['msg_no_recommended'] ?? "",
            'title_weight' => $config['title_weight'] ?? 0,
            'keywords_weight' => $config['keywords_weight'] ?? 0,
            'product' => $this->getProductIntegration(),
            'configs' => $gtsGeneralConfig ?? [],
            'pagerConfig' => $pager ?? [],
            'infinite_scroll' => $gtsGeneralConfig['gts_lobby_infinite_scroll'] ?? true
        ];
    }

    private function getCategories($config)
    {
        $categoryData = [];
        $categories = array_map('trim', explode(PHP_EOL, $config[self::PRODUCT . '_category_list'] ?? ''));
        foreach ($categories as $category) {
            $categoryKey = strtolower($category);
            $categoryKey = str_replace(' ', '', $categoryKey);
            $categoryData[] = [
                'placementKey' => $config[self::PRODUCT . '_' . $categoryKey . '_placement_key'] ?? '',
                'categoryId' => $config[self::PRODUCT . '_' . $categoryKey . '_category_id'] ?? '',
            ];
        }

        return $categoryData;
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
