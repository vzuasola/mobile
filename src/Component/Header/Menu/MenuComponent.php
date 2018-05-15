<?php

namespace App\MobileEntry\Component\Header\Menu;

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
            $container->get('payment_account_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $views, $menus, $config, $paymentAccount)
    {
        $this->playerSession = $playerSession;
        $this->views = $views;
        $this->menus = $menus;
        $this->config = $config;
        $this->paymentAccount = $paymentAccount;
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Header/Menu/template.html.twig';
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
            $data['product_menu'] = $this->views->getViewById('mobile_product_menu');
        } catch (\Exception $e) {
            $data['product_menu'] = [];
        }

        try {
            $data['quicklinks'] = $this->menus->getMultilingualMenu('quicklinks');
        } catch (\Exception $e) {
            $data['quicklinks'] = [];
        }

        try {
            $data['otherlinks'] = $this->menus->getMultilingualMenu('secondary-menu');
        } catch (\Exception $e) {
            $data['otherlinks'] = [];
        }

        try {
            $data['config_new_text'] = $this->config
                ->getConfig('webcomposer_config.header_configuration')['product_menu_new_tag'];
        } catch (\Exception $e) {
            $data['config_new_text'] = [];
        }


        // post login specific data

        $isLogin = $this->playerSession->isLogin();

        try {
            $data['top_menu'] = $this->menus->getMultilingualMenu('mobile-pre-login');
        } catch (\Exception $e) {
            $data['top_menu'] = [];
        }

        $data['is_login'] = $isLogin;

        if ($isLogin) {
            $data['username'] = $this->playerSession->getUsername();
            try {
                $data['total_balance_label'] = $this->config
                    ->getConfig('webcomposer_config.header_configuration')['total_balance_label'];
                $data['top_menu'] = $this->menus->getMultilingualMenu('mobile-post-login');
            } catch (\Exception $e) {
                $data['top_menu'] = [];
                $data['total_balance_label'] = '';
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
}
