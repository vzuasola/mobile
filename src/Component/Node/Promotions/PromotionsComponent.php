<?php

namespace App\MobileEntry\Component\Node\Promotions;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use Slim\Exception\NotFoundException;
use App\MobileEntry\Services\Product\Products;

class PromotionsComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $config;

    /**
     * @var App\Fetcher\AsyncDrupal\ViewsFetcher
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

            $product = $data['node']['field_banner_game_launch'][0]['field_product'][0]['value'];
            $data['launch_via_iframe'] = $this->getIframeToggle($product);
            $data['uglConfig'] = $this->getUglConfig($product);
        }
        $data['is_login'] = $this->playerSession->isLogin();
        return $data;
    }

    private function getIframeToggle($product)
    {
        if (!array_key_exists($product, Products::IFRAME_TOGGLE)) {
            return false;
        }
        $dataToggle = false;
        $configParam = Products::IFRAME_TOGGLE[$product];

        if ($product === 'mobile-ptplus') {
            $pageContents = $this->views->withProduct($product)->getViewById($configParam);
            foreach ($pageContents as $value) {
                $key =  $value['field_page_content_key'][0]['value'];
                if ('launch_via_iframe' === $key) {
                    $dataToggle = $value['name'][0]['value'] === "1" ? true : false;
                    break;
                }
            }
        } else {
            $iframeConfigs = $this->config->withProduct($product)->getConfig($configParam);
            $dataToggle =$iframeConfigs['launch_via_iframe'] === 1 ? true : false;
        }

        return $dataToggle;
    }

    private function getUglConfig($product)
    {
        $uglConfig = false;

        try {
            $perProduct = $this->config->withProduct($product);
            $uglConfig = $perProduct->getConfig('webcomposer_config.games_playtech_provider')['ugl_switch'];
        } catch (\Exception $e) {
            $uglConfig = false;
        }

        return $uglConfig;
    }
}
