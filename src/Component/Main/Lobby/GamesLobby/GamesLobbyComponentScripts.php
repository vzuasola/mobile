<?php

namespace App\MobileEntry\Component\Main\Lobby\GamesLobby;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class GamesLobbyComponentScripts implements ComponentAttachmentInterface
{
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    private $playerSession;

    private $product;

    private $tokenParser;

    private $views;

    const PRODUCT_MAPPING = [
        'games' => 'mobile-games'
    ];
    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('config_fetcher'),
            $container->get('product_resolver'),
            $container->get('token_parser'),
            $container->get('views_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $configs, $product, $tokenParser, $views)
    {
        $this->playerSession = $playerSession;
        $this->product = $product;
        $this->configs = $configs->withProduct($product->getProduct());
        $this->tokenParser = $tokenParser;
        $this->views = $views;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        try {
            $config = $this->configs->getConfig('games_search.search_configuration');
        } catch (\Exception $e) {
            $config = [];
        }

        return [
            'authenticated' => $this->playerSession->isLogin(),
            'search_blurb' => $config['search_blurb'] ?? "",
            'no_result_msg' => $config['no_result_msg'] ?? "",
            'title_weight' => $config['title_weight'] ?? 0,
            'keywords_weight' => $config['keywords_weight'] ?? 0,
            'product' => $this->getProductIntegration()
        ];
    }

    private function getProductIntegration()
    {
        try {
            $result = [];
            $products = $this->views->getViewById('products');

            foreach ($products as $product) {
                $instanceId = $product['field_product_instance_id'][0]['value'];
                if (array_key_exists($instanceId, $this::PRODUCT_MAPPING)
                    && $this->product->getProduct() === $this::PRODUCT_MAPPING[$instanceId]) {
                    $result[] = [
                        'login_via' => $product['field_product_login_via'][0]['value'],
                        'reg_via' => $this->tokenParser->processTokens($product['field_registration_url'][0]['value'])
                    ];
                }
            }
        } catch (\Exception $e) {
            $result = [];
        }

        return $result;
    }
}
