<?php

namespace App\MobileEntry\Component\Menu;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class MenuComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $menus;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    /**
     * @var App\Fetcher\Drupal\ViewsFetcher
     */
    private $views;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $config;

    /**
     * @var App\Fetcher\Drupal\PaymentFetcher
     */
    private $paymentAccount;

    private $idDomain;

    private $product;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('views_fetcher'),
            $container->get('menu_fetcher'),
            $container->get('config_fetcher'),
            $container->get('accounts_service'),
            $container->get('id_domain'),
            $container->get('product_resolver')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $views, $menus, $config, $paymentAccount, $idDomain, $product)
    {
        $this->playerSession = $playerSession;
        $this->views = $views;
        $this->menus = $menus;
        $this->config = $config;
        $this->paymentAccount = $paymentAccount;
        $this->idDomain = $idDomain;
        $this->product = $product;
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Menu/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $data = [];

        try {
            $data['product_menu'] = $this->getEntity();
        } catch (\Exception $e) {
            $data['product_menu'] = [];
        }

        try {
            $data['quicklinks'] = $this->menus->getMultilingualMenu('quicklinks');
        } catch (\Exception $e) {
            $data['quicklinks'] = [];
        }

        $this->cleanQuickLinks($data['quicklinks']);

        try {
            $data['otherlinks'] = $this->menus->getMultilingualMenu('secondary-menu');
        } catch (\Exception $e) {
            $data['otherlinks'] = [];
        }

        try {
            $headerConfigs = $this->config->getConfig('webcomposer_config.header_configuration');
        } catch (\Exception $e) {
            $headerConfigs = [];
        }

        $data['config_new_text'] = $headerConfigs['product_menu_new_tag'] ?? 'New';
        $data['config_links_text'] = $headerConfigs['links_title'] ?? 'Links';

        $isLogin = $this->playerSession->isLogin();

        try {
            $data['top_menu'] = $this->menus->getMultilingualMenu('mobile-pre-login');
        } catch (\Exception $e) {
            $data['top_menu'] = [];
        }

        $data['is_login'] = $isLogin;

        if ($isLogin) {
            $data['username'] = $this->playerSession->getUsername();

            $data['total_balance_label'] = $headerConfigs['total_balance_label'] ?? 'Total';
            $data['config_logout_text'] = $headerConfigs['profile_logout_text'] ?? 'Logout';

            try {
                $data['top_menu'] = $this->menus->getMultilingualMenu('mobile-post-login');
            } catch (\Exception $e) {
                $data['top_menu'] = [];
            }

            try {
                $data['is_provisioned'] = $this->paymentAccount->hasAccount('casino-gold');
            } catch (\Exception $e) {
                $data['is_provisioned'] = false;
            }
        }

        try {
            $data['secondary_menu'] = $this->menus->getMultilingualMenu('secondary-menu');
        } catch (\Exception $e) {
            $data['secondary_menu'] = [];
        }

        return $data;
    }

    private function getEntity()
    {
        $result = [];
        $tiles = $this->views->getViewById('mobile_product_menu');

        foreach ($tiles as $key => $tile) {
            if (isset($tile['field_product_menu_url_post_log'][0]['uri'])) {
                $encode = base64_encode($tile['field_product_menu_url_post_log'][0]['uri']);
                $tile['field_post_login_url_encoded'] = $encode;
            }

            $result[$key] = $tile;
        }

        return $result;
    }

    private function cleanQuickLinks(&$quicklinks)
    {
        if ($quicklinks) {
            foreach ($quicklinks as $key => $link) {
                if ($this->idDomain->isLangSelectorHidden() ||
                    $this->product->getProduct() == 'mobile-casino-gold' &&
                    strpos($link['attributes']['class'], 'language-trigger') !== false
                ) {
                    unset($quicklinks[$key]);
                }
            }
        }
    }
}
