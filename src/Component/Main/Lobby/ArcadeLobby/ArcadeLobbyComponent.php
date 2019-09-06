<?php

namespace App\MobileEntry\Component\Main\Lobby\ArcadeLobby;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class ArcadeLobbyComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Fetcher\Drupal\ViewsFetcher
     */
    private $views;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    private $product;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('views_fetcher'),
            $container->get('config_fetcher'),
            $container->get('product_resolver')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $views, $configs, $product)
    {
        $this->playerSession = $playerSession;
        $this->views = $views;
        $this->product = $product;
        $this->configs = $configs->withProduct($product->getProduct());
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Main/Lobby/ArcadeLobby/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        try {
            $arCadeconfigs = $this->configs->getConfig('arcade.arcade_configuration');
        } catch (\Exception $e) {
            $arCadeconfigs = [];
        }

        return [
            'authenticated' => $this->playerSession->isLogin(),
            'search_tab' => $arCadeconfigs['search_tab_title'] ?? 'Search',
            'provider_tab' => $arCadeconfigs['provider_tab_title'] ?? 'Providers',
            'transfer_title' => $arCadeconfigs['transfer_title'] ?? '',
            'transfer_url' => $arCadeconfigs['transfer_link'] ?? '',
        ];
    }
}
