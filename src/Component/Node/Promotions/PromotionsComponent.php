<?php

namespace App\MobileEntry\Component\Node\Promotions;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use Slim\Exception\NotFoundException;
use App\MobileEntry\Services\Product\Products;

class PromotionsComponent implements ComponentWidgetInterface
{
    /**
     * @var \App\Player\PlayerSession
     */
    private $playerSession;
    /**
     * @var \App\Fetcher\Drupal\ConfigFetcher
     */
    private $config;

    /**
     * @var \App\Fetcher\AsyncDrupal\ViewsFetcher
     */
    private $views;

    private $provisioned;
    private $preference;
    private $product;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('config_fetcher'),
            $container->get('views_fetcher'),
            $container->get('accounts_service'),
            $container->get('preferences_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $config, $views, $provisioned, $preference)
    {
        $this->playerSession = $playerSession;
        $this->config = $config;
        $this->views = $views;
        $this->provisioned = $provisioned;
        $this->preference = $preference;
    }

    /**
     * {@inheritdoc}
     */
    public function getTemplate($options = [])
    {
        return '@component/Node/Promotions/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData($options = [])
    {
        try {
            $data['node'] = $options['node'];
        } catch (\Exception $e) {
            $data['node'] = [];
        }

        if (!empty($data['node']['field_banner_game_launch']) || count($data['node']['field_games_list'])) {
            try {
                $providers = [];
                $gameProviders = $this->views->getViewById('games_providers');
                foreach ($gameProviders as $gameProvider) {
                    $providers[$gameProvider['tid']] = $gameProvider['field_provider_code'];
                }
            } catch (\Exception $e) {
                $providers = [];
            }

            try {
                $gameSubproviders = $this->views->getViewById('games_subproviders');
                $subProviders = [];
                foreach ($gameSubproviders as $subProvider) {
                    $subProviders[$subProvider['tid']] = $subProvider['name'];
                }
            } catch (\Exception $e) {
                $subProviders = [];
            }

            // check if player is casino gold provisioned
            try {
                $isProvisioned = false;
                if ($this->playerSession->isLogin()) {
                    $isProvisioned = $this->provisioned->hasAccount('casino-gold', $this->playerSession->getUsername());
                }
            } catch (\Exception $e) {
                $isProvisioned = false;
            }

            $data['casino_preferred'] = 'mobile-casino';
            if ($isProvisioned) {
                $preferredCasino = $this->preference->getPreferences($this->playerSession->getUsername());
                $data['casino_preferred'] = ($preferredCasino['casino.preferred'] == 'casino_gold')
                    ? 'mobile-casino-gold' : 'mobile-casino';
            }

            $data['game_provider'] = $providers;
            $data['game_subprovider'] = $subProviders;

            $product = $data['node']['field_banner_game_launch'][0]['field_product'][0]['value'] ?? false;
            $gamesList = $data['node']['field_games_list'] ?? false;

            // Fetch UGL configs for unique products
            if ($gamesList || $product) {
                $data['uglConfigs'] = $this->getUglConfig($this->getUniqueProducts($data, $product));
            }
        }
        $data['is_login'] = $this->playerSession->isLogin();
        // Standardise content between pre and post login
        if ($data['is_login']) {
            // Banner
            $data['node_banner_link'] = $data['node']['field_post_banner_link'];
            $data['node_banner_image'] = $data['node']['field_post_banner_image'];
            $data['node_body'] = $data['node']['field_post_body'];

            // Sticky
            $data['node_enable_sticky'] = $data['node']['field_field_enable_sticky_post'];
            $data['node_sticky_url'] = $data['node']['field_sticky_url_post'];
            $data['node_sticky_link_target'] = $data['node']['field_sticky_link_target_post'];
            $data['node_sticky_background'] = $data['node']['field_sticky_background_post'];
            $data['node_sticky_text_color'] = $data['node']['field_sticky_text_color_post'];
            $data['node_enable_sticky2'] = $data['node']['field_field_enable_sticky_post2'];
            $data['node_sticky_url2'] = $data['node']['field_sticky_url_post2'];
            $data['node_sticky_link_target2'] = $data['node']['field_sticky_link_target_post2'];
            $data['node_sticky_background2'] = $data['node']['field_sticky_background_post2'];
            $data['node_sticky_text_color2'] = $data['node']['field_sticky_text_color_post2'];

            $data['chickpea_enabled'] = $data['node']['field_chickpea_enabled_post'][0]['value'] ?? false;
        } else {
            // Banner
            $data['node_banner_link'] = $data['node']['field_banner_link'];
            $data['node_banner_image'] = $data['node']['field_banner_image'];
            $data['node_body'] = $data['node']['body'];

            // Sticky
            $data['node_enable_sticky'] = $data['node']['field_field_enable_sticky_pre'];
            $data['node_sticky_url'] = $data['node']['field_sticky_url_pre'];
            $data['node_sticky_link_target'] = $data['node']['field_sticky_link_target_pre'];
            $data['node_sticky_background'] = $data['node']['field_sticky_background_pre'];
            $data['node_sticky_text_color'] = $data['node']['field_sticky_text_color_pre'];
            $data['node_enable_sticky2'] = $data['node']['field_field_enable_sticky_pre2'];
            $data['node_sticky_url2'] = $data['node']['field_sticky_url_pre2'];
            $data['node_sticky_link_target2'] = $data['node']['field_sticky_link_target_pre2'];
            $data['node_sticky_background2'] = $data['node']['field_sticky_background_pre2'];
            $data['node_sticky_text_color2'] = $data['node']['field_sticky_text_color_pre2'];

            $data['chickpea_enabled'] = $data['node']['field_chickpea_enabled_pre'][0]['value'] ?? false;
        }
        $playerDetails = $this->playerSession->getDetails();
        $firstName = ($playerDetails['firstName'] ?? '');
        $lastName = ($playerDetails['lastName'] ?? '');
        $vip = ($playerDetails['vipLevel'] ?? '');
        $data['user_details'] = [
            'firstName' => $firstName,
            'lastName' => $lastName,
            'vip' => $vip,
        ];


        return $data;
    }

    private function getUglConfig($products)
    {
        $uglData = [];
        foreach ($products as $product) {
            try {
                $perProduct = $this->config->withProduct($product);
                $uglConfig = $perProduct->getConfig('webcomposer_config.games_playtech_provider');
                $uglData[$product] = $uglConfig['ugl_switch'] ?? false;
            } catch (\Exception $e) {
                $uglData = [];
            }
        }

        return $uglData;
    }

    private function getUniqueProducts($data, $bannerProduct)
    {
        $products = [];
        foreach ($data['node']['field_games_list'] as $gameItem) {
            $val = $gameItem['field_product'][0]['value'];
            $products[] = $val;
        }

        if ($bannerProduct) {
            $products[] = $bannerProduct;
        }

        return array_unique($products);
    }
}
